import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/java/java.contribution.js';
import 'monaco-editor/min/vs/editor/editor.main.css';
import Editor from "@monaco-editor/react";
import config from '../config';
import { Select, MenuItem } from '@mui/material';
import { ChevronRight as ChevronRightIcon, ChevronLeft as ChevronLeftIcon } from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../supabaseClient';


/* ─── helpers ─── */
const DEFAULT_CODE = {
  python: 'print("hello world")',
  java: `import java.util.*;\nimport java.io.*;\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from java!");\n    }\n}\n`,
  c: `#include <stdio.h>\nint main() {\n    printf("Hello from C\\n");\n    return 0;\n}`,
  cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello from C++" << endl;\n    return 0;\n}`,
  javascript: 'console.log("Hello from JavaScript");',
  other: '',
};

const TextEditors = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [language, setLanguage] = useState(null);
  const [leftWidth, setLeftWidth] = useState('50%');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showIOPanel, setShowIOPanel] = useState(true);
  const [file_name, setFileName] = useState('');
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  // Privacy & sharing
  const [isPrivate, setIsPrivate] = useState(false);
  const [sharedUsers, setSharedUsers] = useState([]); // [{email, role}]
  const [myRole, setMyRole] = useState(null); // 'editor'|'viewer'|null (null = anonymous)

  // Share panel state
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const shareOpen = Boolean(shareAnchorEl);
  const [newShareEmail, setNewShareEmail] = useState('');
  const [newShareRole, setNewShareRole] = useState('editor');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [removingEmail, setRemovingEmail] = useState(null);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  const dividerRef = useRef(null);
  const editorRef = useRef(null);
  const lastSavedContentRef = useRef(null);
  const languageContentRef = useRef({});
  const saveTimerRef = useRef(null);

  // Derived permissions
  const canEdit = isOwner || myRole === 'editor';

  /* ── Fetch document ── */
  useEffect(() => {
    const fetchDocument = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || null;
      const userId = session?.user?.id || null;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast.error('File not found.');
        navigate('/');
        return;
      }

      // ── Access control ──
      const ownerStatus = data.user_id === userId;
      const users = data.shared_users || [];

      // Fallback: support legacy shared_emails array
      const normalizedUsers = users.length > 0
        ? users
        : (data.shared_emails || []).map(e => ({ email: e, role: 'editor' }));

      const matchedUser = normalizedUsers.find(u => u.email === userEmail);
      const fileIsPrivate = data.is_private ?? false;

      if (fileIsPrivate && !ownerStatus && !matchedUser) {
        toast.error('This file is private.', { icon: '🔒' });
        navigate('/');
        return;
      }

      setIsOwner(ownerStatus);
      setIsPrivate(fileIsPrivate);
      setSharedUsers(normalizedUsers);
      setMyRole(ownerStatus ? 'editor' : (matchedUser?.role || null));

      // ── Load content ──
      const selectedLanguage = data.language || 'python';
      setLanguage(selectedLanguage);

      const contentForLanguage =
        data.language_content?.[selectedLanguage] ?? DEFAULT_CODE[selectedLanguage] ?? '';

      setContent(contentForLanguage);
      languageContentRef.current = data.language_content || {};
      lastSavedContentRef.current = contentForLanguage;
      setFileName(data.file_name);
    };

    fetchDocument();
  }, [id, navigate]);

  /* ── Realtime sync ── */
  useEffect(() => {
    const channel = supabase
      .channel(`document-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'documents', filter: `id=eq.${id}`,
      }, (payload) => {
        const p = payload.new;
        if (p.shared_users) setSharedUsers(p.shared_users);
        if (typeof p.is_private === 'boolean') setIsPrivate(p.is_private);
        if (!p.language_content) return;
        const lang = p.language;
        const incoming = p.language_content?.[lang];
        if (incoming === lastSavedContentRef.current) return;
        if (lang) setLanguage(lang);
        if (incoming !== undefined) setContent(incoming);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id]);

  /* ── Debounced save ── */
  const handleChange = (value) => {
    if (!language) { toast.error('Please select a language first.'); return; }
    setContent(value);
    languageContentRef.current = { ...languageContentRef.current, [language]: value };
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const snapshot = { ...languageContentRef.current };
      lastSavedContentRef.current = value;
      setIsSaving(true);
      try {
        const { error } = await supabase.from('documents')
          .update({ language_content: snapshot, language }).eq('id', id);
        if (error) toast.error('Save failed: ' + error.message);
      } catch (e) { toast.error('Save failed: ' + e.message); }
      finally { setIsSaving(false); }
    }, 300);
  };

  /* ── Language change ── */
  const handleLanguageChange = async (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    const { data: doc } = await supabase.from('documents').select('language_content').eq('id', id).single();
    const code = doc?.language_content?.[lang] ?? DEFAULT_CODE[lang] ?? '';
    setContent(code);
    if (canEdit) {
      await supabase.from('documents').update({ language: lang }).eq('id', id);
    }
  };

  /* ── Run code ── */
  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const supported = ['python', 'java', 'c', 'cpp', 'javascript'];
      if (!supported.includes(language)) { setOutput('Language not supported for execution'); return; }
      const res = await fetch(config.compilerRunUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code: content, input, timeLimit: 150000, memoryLimit: 256000 }),
      });
      const data = await res.json();
      const ok = data.status === 'OK' && (data.exitCode === 0 || data.exitCode == null);
      if (!ok) { setOutput(data.stderr?.trim() || data.error || `Exit code: ${data.exitCode}`); return; }
      const timeStr = data.executionTimeMs != null ? `${data.executionTimeMs} ms` : '—';
      const memStr = data.memoryUsed != null ? `${data.memoryUsed} MB` : '—';
      setOutput(
        <div className="space-y-2">
          <div className="flex gap-2"><span className="text-blue-400">Time:</span> {timeStr}</div>
          <div className="flex gap-2"><span className="text-blue-400">Memory:</span> {memStr}</div>
          {(data.stderr || data.stdout) && (
            <div className="mt-4">
              {data.stderr && <div className="text-red-400/90 whitespace-pre-wrap mb-2">{data.stderr}</div>}
              {data.stdout && <div className="whitespace-pre-wrap">{data.stdout.trimEnd()}</div>}
            </div>
          )}
        </div>
      );
    } catch (err) { setOutput('Error: ' + err.message); }
    finally { setIsRunning(false); }
  };

  /* ── Resize divider ── */
  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = (e) => {
    const rect = dividerRef.current.parentElement.getBoundingClientRect();
    setLeftWidth(`${Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 20), 80)}%`);
  };
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  /* ── File rename ── */
  const handleSaveFileName = async () => {
    if (!isOwner) { toast.error('Only the owner can rename this file.'); return; }
    const { error } = await supabase.from('documents').update({ file_name: newFileName }).eq('id', id);
    if (error) toast.error('Failed to rename: ' + error.message);
    else { setFileName(newFileName); setIsEditingFileName(false); toast.success('File renamed.'); }
  };

  /* ── Copy link ── */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Link copied!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  /* ── Privacy toggle ── */
  const handleTogglePrivacy = async () => {
    setPrivacyLoading(true);
    const next = !isPrivate;
    const { error } = await supabase.from('documents').update({ is_private: next }).eq('id', id);
    if (error) toast.error('Failed to update privacy: ' + error.message);
    else {
      setIsPrivate(next);
      toast.success(next ? '🔒 File is now private' : '🌍 File is now public');
    }
    setPrivacyLoading(false);
  };

  /* ── Add collaborator ── */
  const handleAddUser = async () => {
    const email = newShareEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.'); return;
    }
    if (sharedUsers.find(u => u.email === email)) {
      toast.error('This email already has access.'); return;
    }
    setIsAddingUser(true);
    const updated = [...sharedUsers, { email, role: newShareRole }];
    const { error } = await supabase.from('documents').update({ shared_users: updated }).eq('id', id);
    if (error) toast.error('Failed to add: ' + error.message);
    else {
      setSharedUsers(updated);
      setNewShareEmail('');
      toast.success(`${email} added as ${newShareRole}.`);
    }
    setIsAddingUser(false);
  };

  /* ── Remove collaborator ── */
  const handleRemoveUser = async (email) => {
    setRemovingEmail(email);
    const updated = sharedUsers.filter(u => u.email !== email);
    const { error } = await supabase.from('documents').update({ shared_users: updated }).eq('id', id);
    if (error) toast.error('Failed to remove: ' + error.message);
    else { setSharedUsers(updated); toast.success(`${email} removed.`); }
    setRemovingEmail(null);
  };

  /* ── Change role ── */
  const handleChangeRole = async (email, role) => {
    const updated = sharedUsers.map(u => u.email === email ? { ...u, role } : u);
    const { error } = await supabase.from('documents').update({ shared_users: updated }).eq('id', id);
    if (error) toast.error('Failed to update role: ' + error.message);
    else { setSharedUsers(updated); toast.success(`${email} is now ${role}.`); }
  };

  const runDisabled = isRunning || !language || language === 'other';

  /* ════ RENDER ════ */
  return (
    <div className="h-screen flex flex-col bg-[#0d0d0d] overflow-hidden">
      <Toaster position="top-center" />

      {/* ═══ SHARE MODAL ═══ */}
      {shareOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShareAnchorEl(null)} />

          <div className="fixed z-50 inset-x-0 bottom-0 sm:inset-auto sm:top-14 sm:right-4 sm:w-[360px]">
            <div className="bg-[#111118] border border-white/[0.08] rounded-t-2xl sm:rounded-xl shadow-2xl shadow-black/70 overflow-hidden">

              {/* Drag handle — mobile only */}
              <div className="flex justify-center pt-2.5 sm:hidden">
                <div className="w-8 h-1 bg-white/15 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-sm font-semibold text-white">Share</h2>
                  <p className="text-[11px] text-gray-600 mt-0.5 truncate max-w-[220px]">{file_name || id}</p>
                </div>
                <button
                  onClick={() => setShareAnchorEl(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-4 py-3 space-y-3">

                {/* Privacy toggle */}
                {isOwner && (
                  <div className="flex items-center justify-between py-1">
                    <span className={`text-sm font-medium ${isPrivate ? 'text-red-400' : 'text-gray-300'}`}>
                      {isPrivate ? '🔒 Private' : '🌍 Public'}
                    </span>
                    <button
                      onClick={handleTogglePrivacy}
                      disabled={privacyLoading}
                      className={`relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0 focus:outline-none ${isPrivate ? 'bg-red-500' : 'bg-emerald-500'} ${privacyLoading ? 'opacity-50 cursor-wait' : ''}`}
                      aria-label="Toggle privacy"
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${isPrivate ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                )}

                {/* Copy link */}
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-xs text-gray-600 font-mono truncate bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                    {window.location.href}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>

                <div className="border-t border-white/[0.05]" />

                {/* People */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                    People with access
                    {sharedUsers.length > 0 && <span className="ml-1.5 text-blue-400 normal-case tracking-normal font-semibold">({sharedUsers.length})</span>}
                  </p>

                  {sharedUsers.length === 0 ? (
                    <p className="text-xs text-gray-600 py-1">No one else has access yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {sharedUsers.map((u) => (
                        <div key={u.email} className="group flex items-center gap-2.5 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] rounded-xl transition-all">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.email[0].toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-300 truncate flex-1 min-w-0">{u.email}</span>
                          {isOwner ? (
                            <select
                              value={u.role}
                              onChange={e => handleChangeRole(u.email, e.target.value)}
                              className={`text-[11px] font-semibold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none transition-all appearance-none ${u.role === 'editor' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}
                            >
                              <option value="editor" style={{ background: '#1f2937', color: '#fff' }}>Editor</option>
                              <option value="viewer" style={{ background: '#1f2937', color: '#fff' }}>Viewer</option>
                            </select>
                          ) : (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${u.role === 'editor' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-purple-400 bg-purple-500/10 border-purple-500/20'}`}>
                              {u.role === 'editor' ? 'Editor' : 'Viewer'}
                            </span>
                          )}
                          {isOwner && (
                            <button
                              onClick={() => handleRemoveUser(u.email)}
                              disabled={removingEmail === u.email}
                              className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                            >
                              {removingEmail === u.email ? (
                                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                              ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invite — owner only */}
                {isOwner && (
                  <>
                    <div className="border-t border-white/[0.05]" />
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={newShareEmail}
                        onChange={e => setNewShareEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddUser()}
                        placeholder="Invite by email…"
                        className="w-full bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.12] focus:border-blue-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
                      />
                      <div className="flex gap-2">
                        <div className="flex bg-white/[0.04] border border-white/[0.07] rounded-xl p-0.5 gap-0.5">
                          {['editor', 'viewer'].map(role => (
                            <button
                              key={role}
                              onClick={() => setNewShareRole(role)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-[10px] transition-all capitalize ${newShareRole === role
                                ? role === 'editor'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/25'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/25'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={handleAddUser}
                          disabled={isAddingUser || !newShareEmail.trim()}
                          className="flex-1 flex items-center justify-center text-xs font-bold py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all"
                        >
                          {isAddingUser ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                          ) : 'Invite'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}



      {/* ═══ TOP BAR ═══ */}

      <header className="flex items-center h-12 px-4 gap-3 bg-[#141414] border-b border-white/[0.07] flex-shrink-0 shadow-[0_1px_0_0_rgba(0,0,0,0.3)]">

        {/* Back */}
        <a href="/" title="Go home" className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </a>
        <div className="w-px h-5 bg-white/[0.08] rounded-full flex-shrink-0" />

        {/* Language selector */}
        <Select
          value={language || 'python'}
          onChange={handleLanguageChange}
          size="small" displayEmpty variant="outlined"
          IconComponent={(props) => (
            <svg {...props} className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: props.style?.transform, color: 'rgba(255,255,255,0.5)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          sx={{
            width: 120, height: 32, fontSize: '0.8125rem', fontWeight: 600,
            color: 'rgba(255,255,255,0.95)', backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
            '& fieldset': { display: 'none' },
            '& .MuiSelect-select': { py: 1, pl: 1.5, pr: 2, boxSizing: 'border-box' },
            '& .MuiSelect-icon': { right: 10, width: 18, height: 18 },
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.09)', borderColor: 'rgba(255,255,255,0.18)' },
          }}
          MenuProps={{
            disableScrollLock: true,
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            transformOrigin: { vertical: 'top', horizontal: 'left' },
            PaperProps: {
              sx: {
                mt: 1.25, minWidth: 120, bgcolor: '#1c1c1e',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
              }
            },
            MenuListProps: {
              sx: {
                py: 0.5,
                '& .MuiMenuItem-root': {
                  fontSize: '0.8125rem', fontWeight: 500, minHeight: 36, py: 0, px: 1.5,
                  color: 'rgba(255,255,255,0.9)', borderRadius: '4px', mx: 0.5,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                  '&.Mui-selected': { bgcolor: 'rgba(59,130,246,0.22)', color: '#93c5fd', '&:hover': { bgcolor: 'rgba(59,130,246,0.3)' } },
                },
              }
            }
          }}
        >
          <MenuItem value="python">Python</MenuItem>
          <MenuItem value="java">Java</MenuItem>
          <MenuItem value="c">C</MenuItem>
          <MenuItem value="cpp">C++</MenuItem>
          <MenuItem value="javascript">JavaScript</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>

        <div className="w-px h-5 bg-white/[0.08] rounded-full flex-shrink-0" />

        {/* File name */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Privacy badge */}
          <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isPrivate ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15'}`}>
            {isPrivate ? (
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            ) : (
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            )}
            <span className="hidden sm:inline">{isPrivate ? 'Private' : 'Public'}</span>
          </span>

          <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>

          {isEditingFileName ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus type="text" value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveFileName(); if (e.key === 'Escape') setIsEditingFileName(false); }}
                className="bg-white/6 border border-white/12 text-white text-xs px-2 py-0.5 rounded-md focus:outline-none focus:border-blue-500/60 w-36"
              />
              <button onClick={handleSaveFileName} className="text-xs text-blue-400 hover:text-blue-300 font-medium">Save</button>
              <button onClick={() => setIsEditingFileName(false)} className="text-xs text-gray-500 hover:text-gray-300">✕</button>
            </div>
          ) : (
            <div className="flex items-center gap-1 group min-w-0">
              <span className="text-xs text-gray-400 truncate">{file_name || id}</span>
              {isOwner && (
                <button
                  onClick={() => { setNewFileName(file_name || id); setIsEditingFileName(true); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 text-gray-600 hover:text-gray-300"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Read-only / Viewer badge */}
        {!canEdit && (
          <span className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg flex-shrink-0 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {myRole === 'viewer' ? 'Viewer' : 'Read-only'}
          </span>
        )}

        {/* Auto-save indicator */}
        {isSaving && (
          <span className="text-xs text-gray-600 flex items-center gap-1.5 flex-shrink-0">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            Saving…
          </span>
        )}

        {/* Run */}
        <button
          onClick={handleRunCode} disabled={runDisabled}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex-shrink-0 ${runDisabled ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10' : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/30 shadow-md shadow-emerald-900/30'}`}
        >
          {isRunning ? (
            <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Running…</>
          ) : (
            <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z" /></svg>Run</>
          )}
        </button>

        <div className="w-px h-5 bg-white/[0.08] rounded-full flex-shrink-0" />

        {/* My Files */}
        <a href="/files" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/[0.06] transition-all flex-shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          <span className="hidden sm:inline">My Files</span>
        </a>

        {/* Share */}
        <button
          onClick={e => setShareAnchorEl(e.currentTarget)}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/[0.06] transition-all flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          <span className="hidden sm:inline">Share</span>
          {sharedUsers.length > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0 leading-4 min-w-[16px] text-center">
              {sharedUsers.length}
            </span>
          )}
        </button>
      </header>

      {/* ═══ EDITOR + I/O ═══ */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">

        {/* Monaco pane */}
        <div
          className="w-full md:w-auto"
          style={{ width: showIOPanel ? leftWidth : '100%', minWidth: '20%', height: '100%', transition: 'width 0.25s ease' }}
        >
          <Editor
            height="100%" width="100%"
            language={language || ''} value={content}
            onChange={canEdit ? handleChange : undefined}
            theme="vs-dark"
            onMount={editor => { editorRef.current = editor; }}
            options={{
              readOnly: !canEdit || !language,
              minimap: { enabled: false }, scrollBeyondLastLine: false,
              wordWrap: 'on', wrappingStrategy: 'advanced', wrappingIndent: 'indent',
              lineNumbers: 'on', fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontLigatures: true, renderLineHighlight: 'line',
              scrollbar: { vertical: 'auto', horizontal: 'auto' },
              automaticLayout: true, glyphMargin: false, folding: true,
              showFoldingControls: 'mouseover', codeLens: false,
              renderValidationDecorations: 'off',
              suggest: { enabled: true, showWords: true, showSnippets: true, showFunctions: true, showVariables: true },
              quickSuggestions: true, parameterHints: { enabled: true }, padding: { top: 12 },
            }}
          />
        </div>

        {/* Resizable divider */}
        <div
          ref={dividerRef}
          className="hidden md:flex flex-col items-center justify-center flex-shrink-0"
          style={{ width: 14, backgroundColor: '#111', cursor: showIOPanel ? 'col-resize' : 'default', borderLeft: '1px solid rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.04)' }}
          onMouseDown={showIOPanel ? handleMouseDown : undefined}
        >
          <button
            onClick={() => setShowIOPanel(p => !p)}
            title={showIOPanel ? 'Hide I/O panel' : 'Show I/O panel'}
            className="w-4 h-8 rounded bg-white/8 hover:bg-blue-600 text-gray-500 hover:text-white flex items-center justify-center transition-all"
          >
            {showIOPanel ? <ChevronRightIcon style={{ fontSize: 14 }} /> : <ChevronLeftIcon style={{ fontSize: 14 }} />}
          </button>
        </div>

        {/* I/O panel */}
        {showIOPanel && (
          <div className="flex-1 flex flex-col bg-[#111] md:max-w-[50%] border-l border-white/[0.04] overflow-hidden">
            {/* stdin */}
            <div className="flex flex-col border-b border-white/[0.06]" style={{ flex: '0 0 auto', minHeight: 180 }}>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#141414] border-b border-white/[0.05]">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">stdin</span>
              </div>
              <textarea
                value={input} onChange={e => setInput(e.target.value)}
                placeholder="Enter program input here…"
                className="flex-1 resize-none bg-transparent text-sm text-gray-300 font-mono px-4 py-3 focus:outline-none placeholder-gray-700 leading-relaxed"
                style={{ minHeight: 130, fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
              />
            </div>
            {/* stdout */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#141414] border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">stdout</span>
                </div>
                {output && <button onClick={() => setOutput('')} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Clear</button>}
              </div>
              <div className="flex-1 overflow-auto px-4 py-3">
                {output ? (
                  <div className="text-sm font-mono leading-relaxed text-gray-300 whitespace-pre-wrap" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
                    {output}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2">
                    <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <p className="text-xs text-gray-700">Run your code to see output here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default TextEditors;
