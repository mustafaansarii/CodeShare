import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/java/java.contribution.js';
import 'monaco-editor/min/vs/editor/editor.main.css';
import Editor from "@monaco-editor/react";
import config from '../config';
import {
  AppBar, Toolbar, Select, MenuItem, Button, Link, Box, Typography,
  Popover, TextField, IconButton, List, ListItem, ListItemText, Divider, Chip
} from '@mui/material';
import { Code, ArrowBack, Share, FilePresent, Edit, Delete, ContentCopy, PersonAdd, Lock, LockOpen, ChevronRight, ChevronLeft } from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../supabaseClient';

const TextEditors = () => {
  const { id } = useParams();
  const [content, setContent] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [language, setLanguage] = useState(null);
  const [leftWidth, setLeftWidth] = useState('50%');
  const [isRunning, setIsRunning] = useState(false);
  const dividerRef = useRef(null);
  const editorRef = useRef(null);
  const [file_name, setFileName] = useState('');
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const lastSavedContentRef = useRef(null);
  const languageContentRef = useRef({});  // always up-to-date, no DB fetch needed
  const saveTimerRef = useRef(null);       // debounce timer
  const [showIOPanel, setShowIOPanel] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Share popover state
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const shareOpen = Boolean(shareAnchorEl);
  const [sharedEmails, setSharedEmails] = useState([]);
  const [newShareEmail, setNewShareEmail] = useState('');
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [removingEmail, setRemovingEmail] = useState(null);

  // Derived: can the current user edit?
  const canEdit = isOwner || isCollaborator;

  useEffect(() => {
    const fetchDocument = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        const selectedLanguage = data.language || 'python';
        setLanguage(selectedLanguage);

        let contentForLanguage = data.language_content?.[selectedLanguage];
        if (!contentForLanguage) {
          if (selectedLanguage === 'java') {
            contentForLanguage = `import java.util.*;
import java.io.*;
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from java!");
    }
}
`;
          } else if (selectedLanguage === 'python') {
            contentForLanguage = 'print("hello world")';
          } else if (selectedLanguage === 'other') {
            contentForLanguage = '';
          }
        }

        setContent(contentForLanguage);
        languageContentRef.current = data.language_content || {};
        lastSavedContentRef.current = contentForLanguage;

        const ownerStatus = data.user_id === session?.user?.id;
        setIsOwner(ownerStatus);

        // Check if current user is a collaborator (in shared_emails)
        const emails = data.shared_emails || [];
        setSharedEmails(emails);
        const userEmail = session?.user?.email;
        setIsCollaborator(!ownerStatus && userEmail && emails.includes(userEmail));

        setFileName(data.file_name);
      }
    };

    fetchDocument();
  }, [id]);

  useEffect(() => {
    const channel = supabase
      .channel(`document-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "documents",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          if (!payload.new.language_content) return;

          const lang = payload.new.language;
          const incomingContent = payload.new.language_content?.[lang];

          if (incomingContent === lastSavedContentRef.current) return;

          if (payload.new.shared_emails) {
            setSharedEmails(payload.new.shared_emails);
          }

          if (lang) setLanguage(lang);
          if (incomingContent !== undefined) setContent(incomingContent);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleChange = (value) => {
    if (!language) {
      toast.error('Please select a language first.');
      return;
    }

    // Update UI immediately
    setContent(value);

    // Keep the in-memory cache in sync so saves always use the latest value
    languageContentRef.current = {
      ...languageContentRef.current,
      [language]: value,
    };

    // Debounce: clear any pending save and schedule a new one
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const snapshot = { ...languageContentRef.current };
      lastSavedContentRef.current = value;
      setIsSaving(true);
      try {
        const { error } = await supabase
          .from('documents')
          .update({ language_content: snapshot, language })
          .eq('id', id);
        if (error) toast.error('Save failed: ' + error.message);
      } catch (e) {
        toast.error('Save failed: ' + e.message);
      } finally {
        setIsSaving(false);
      }
    }, 300); // wait 800ms after last keystroke before writing to DB
  };


  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleLanguageChange = async (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);

    const { data: currentDocument } = await supabase
      .from('documents')
      .select('language_content')
      .eq('id', id)
      .single();

    let contentForLanguage = currentDocument.language_content?.[selectedLanguage];

    if (!contentForLanguage) {
      if (selectedLanguage === 'java') {
        contentForLanguage = `import java.util.*;
import java.io.*;
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from java!");
    }
}
`;
      } else if (selectedLanguage === 'python') {
        contentForLanguage = 'print("hello world")';
      } else if (selectedLanguage === 'other') {
        contentForLanguage = '';
      }
    }

    setContent(contentForLanguage);

    if (canEdit) {
      try {
        const { error } = await supabase
          .from('documents')
          .update({ language: selectedLanguage })
          .eq('id', id);
        if (error) {
          toast.error('Failed to save language: ' + error.message);
        }
      } catch (error) {
        toast.error('Failed to save language: ' + error.message);
      }
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const container = dividerRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setLeftWidth(`${Math.min(Math.max(newLeftWidth, 20), 80)}%`);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const apiEndpoint = language === 'java' ? config.javaApi : language === 'python' ? config.pythonApi : null;
      if (!apiEndpoint) {
        setOutput("Language not supported");
        return;
      }
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: content,
          input: input
        })
      });
      const data = await response.json();
      if (data.error) {
        setOutput(data.error);
      } else {
        setOutput(
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">Time:</span>
              <span>{data.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">Memory:</span>
              <span>{data.memory}</span>
            </div>
            <div className="mt-4">
              {data.output}
            </div>
          </div>
        );
      }
    } catch (error) {
      setOutput('Error: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    const domNode = editor.getDomNode();
    if (domNode) {
      domNode.addEventListener('keydown', (e) => {
        if (!language) {
          console.log('Please select a language before writing code.');
        } else if (!canEdit) {
          console.log('You are in read-only mode. Cannot edit.');
        }
      });
    }
  };

  const handleShareClick = (e) => {
    setShareAnchorEl(e.currentTarget);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Link copied!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleAddEmail = async () => {
    const email = newShareEmail.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (sharedEmails.includes(email)) {
      toast.error('This email already has access.');
      return;
    }

    setIsAddingEmail(true);
    const updatedEmails = [...sharedEmails, email];

    const { error } = await supabase
      .from('documents')
      .update({ shared_emails: updatedEmails })
      .eq('id', id);

    if (error) {
      toast.error('Failed to add collaborator: ' + error.message);
    } else {
      setSharedEmails(updatedEmails);
      setNewShareEmail('');
      toast.success(`${email} can now edit this file.`);
    }
    setIsAddingEmail(false);
  };

  const handleRemoveEmail = async (emailToRemove) => {
    setRemovingEmail(emailToRemove);
    const updatedEmails = sharedEmails.filter(e => e !== emailToRemove);

    const { error } = await supabase
      .from('documents')
      .update({ shared_emails: updatedEmails })
      .eq('id', id);

    if (error) {
      toast.error('Failed to remove collaborator: ' + error.message);
    } else {
      setSharedEmails(updatedEmails);
      toast.success(`${emailToRemove} access removed.`);
    }
    setRemovingEmail(null);
  };

  const handleFileNameChange = (e) => {
    setNewFileName(e.target.value);
  };

  const handleSaveFileName = async () => {
    if (!isOwner) {
      toast.error('Only the owner can rename this file.');
      return;
    }

    try {
      const { error } = await supabase
        .from('documents')
        .update({ file_name: newFileName })
        .eq('id', id);

      if (error) {
        toast.error('Failed to update file name: ' + error.message);
      } else {
        setFileName(newFileName);
        setIsEditingFileName(false);
        toast.success('File name updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update file name: ' + error.message);
    }
  };

  const LANG_COLORS = {
    python: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    java: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    other: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  };

  const runDisabled = isRunning || !language || language === 'other';

  return (
    <div className="h-screen flex flex-col bg-[#0d0d0d] overflow-hidden">
      <Toaster position="top-center" />

      {/* ─── Share popover (keep MUI for now, already themed dark) ─── */}
      <Popover
        open={shareOpen}
        anchorEl={shareAnchorEl}
        onClose={() => setShareAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            backgroundColor: '#111827',
            color: 'white',
            borderRadius: '12px',
            border: '1px solid #1F2937',
            width: '380px',
            mt: 0.5,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #1F2937', px: 2.5, py: 2 }}>
          <Share fontSize="small" sx={{ color: '#3B82F6' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>Share Document</Typography>
        </Box>

        <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <TextField
              value={window.location.href}
              size="small"
              fullWidth
              InputProps={{ readOnly: true, sx: { color: '#9CA3AF', fontSize: '0.8rem', backgroundColor: '#1F2937' } }}
              sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' } }}
            />
            <Button
              onClick={handleCopyLink}
              variant="outlined"
              startIcon={<ContentCopy fontSize="small" />}
              sx={{ whiteSpace: 'nowrap', borderColor: '#374151', color: '#9CA3AF', '&:hover': { borderColor: '#3B82F6', color: 'white' } }}
            >
              Copy
            </Button>
          </Box>

          <Divider sx={{ borderColor: '#1F2937', mb: 3 }} />

          <Typography variant="subtitle2" sx={{ color: '#9CA3AF', mb: 1.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            People with edit access
          </Typography>

          {sharedEmails.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2, color: '#4B5563' }}>
              <Lock fontSize="small" />
              <Typography variant="body2" sx={{ color: '#4B5563', fontSize: '0.875rem' }}>
                Only you can edit this file
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding sx={{ mb: 2 }}>
              {sharedEmails.map((email) => (
                <ListItem
                  key={email}
                  disablePadding
                  sx={{ py: 0.75, px: 1.5, mb: 0.5, backgroundColor: '#1F2937', borderRadius: '8px', border: '1px solid #374151' }}
                  secondaryAction={
                    isOwner && (
                      <IconButton
                        edge="end" size="small"
                        onClick={() => handleRemoveEmail(email)}
                        disabled={removingEmail === email}
                        sx={{ color: '#EF4444', '&:hover': { backgroundColor: 'rgba(239,68,68,0.1)' } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText primary={email} primaryTypographyProps={{ fontSize: '0.875rem', color: 'white' }} />
                  <Chip
                    label="Editor"
                    size="small"
                    icon={<LockOpen sx={{ fontSize: '12px !important' }} />}
                    sx={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)', fontSize: '0.7rem', mr: isOwner ? 4 : 0 }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          {isOwner && (
            <>
              <Divider sx={{ borderColor: '#1F2937', mb: 2.5 }} />
              <Typography variant="subtitle2" sx={{ color: '#9CA3AF', mb: 1.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Add collaborator
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  value={newShareEmail}
                  onChange={(e) => setNewShareEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                  placeholder="Enter email address..."
                  size="small"
                  fullWidth
                  type="email"
                  InputProps={{ sx: { color: 'white', fontSize: '0.875rem', backgroundColor: '#1F2937' } }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' }, '& .MuiInputBase-input::placeholder': { color: '#4B5563' } }}
                />
                <Button
                  onClick={handleAddEmail}
                  disabled={isAddingEmail || !newShareEmail.trim()}
                  variant="contained"
                  startIcon={<PersonAdd fontSize="small" />}
                  sx={{ whiteSpace: 'nowrap', backgroundColor: '#2563EB', '&:hover': { backgroundColor: '#1D4ED8' }, '&:disabled': { backgroundColor: '#374151' } }}
                >
                  {isAddingEmail ? 'Adding...' : 'Add'}
                </Button>
              </Box>
            </>
          )}
        </Box>

        <Box sx={{ borderTop: '1px solid #1F2937', px: 2.5, py: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => setShareAnchorEl(null)} sx={{ color: '#9CA3AF', '&:hover': { color: 'white' }, fontSize: '0.8rem' }}>
            Close
          </Button>
        </Box>
      </Popover>

      {/* ─── Editor top bar ─── */}
      <header className="flex items-center h-11 px-3 gap-2 bg-[#161616] border-b border-white/[0.06] flex-shrink-0">

        {/* Back */}
        <a
          href="/"
          title="Go home"
          className="flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:text-white hover:bg-white/8 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </a>

        <div className="w-px h-4 bg-white/8 flex-shrink-0" />

        {/* Language selector */}
        <div className="relative flex-shrink-0">
          <select
            value={language || ''}
            onChange={handleLanguageChange}
            className={`appearance-none text-xs font-medium px-2.5 py-1 pr-6 rounded-md border cursor-pointer transition-colors focus:outline-none ${LANG_COLORS[language] || LANG_COLORS.other} bg-opacity-80`}
            style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          >
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="other">Other</option>
          </select>
          <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="w-px h-4 bg-white/8 flex-shrink-0" />

        {/* File name */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          {isEditingFileName ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                type="text"
                value={newFileName}
                onChange={handleFileNameChange}
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
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Read-only badge */}
        {!canEdit && (
          <span className="text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
            Read-only
          </span>
        )}

        {/* Run button */}
        <button
          onClick={handleRunCode}
          disabled={runDisabled}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-md transition-all flex-shrink-0 ${runDisabled
            ? 'bg-white/4 text-gray-600 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
            }`}
        >
          {isRunning ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Running…
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              Run
            </>
          )}
        </button>

        <div className="w-px h-4 bg-white/8 flex-shrink-0" />

        {/* My files */}
        <a
          href="/files"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/6 transition-all flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="hidden sm:inline">My Files</span>
        </a>

        {/* Share */}
        <button
          onClick={handleShareClick}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/6 transition-all flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="hidden sm:inline">Share</span>
          {sharedEmails.length > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0 leading-4 min-w-[16px] text-center">
              {sharedEmails.length}
            </span>
          )}
        </button>
      </header>

      {/* ─── Editor + I/O panel ─── */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">

        {/* Monaco editor pane */}
        <div
          className="w-full md:w-auto"
          style={{ width: showIOPanel ? leftWidth : '100%', minWidth: '20%', height: '100%', transition: 'width 0.25s ease' }}
        >
          <Editor
            height="100%"
            width="100%"
            language={language || ''}
            value={content}
            onChange={canEdit ? handleChange : undefined}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            options={{
              readOnly: !canEdit || !language,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              wrappingStrategy: 'advanced',
              wrappingIndent: 'indent',
              lineNumbers: 'on',
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontLigatures: true,
              renderLineHighlight: 'line',
              scrollbar: { vertical: 'auto', horizontal: 'auto' },
              automaticLayout: true,
              glyphMargin: false,
              folding: true,
              showFoldingControls: 'mouseover',
              codeLens: false,
              renderValidationDecorations: 'off',
              suggest: { enabled: true, showWords: true, showSnippets: true, showFunctions: true, showVariables: true },
              quickSuggestions: true,
              parameterHints: { enabled: true },
              padding: { top: 12 },
            }}
          />
        </div>

        {/* Resizable divider */}
        <div
          ref={dividerRef}
          className="hidden md:flex flex-col items-center justify-center flex-shrink-0"
          style={{
            width: '14px',
            backgroundColor: '#111',
            cursor: showIOPanel ? 'col-resize' : 'default',
            borderLeft: '1px solid rgba(255,255,255,0.04)',
            borderRight: '1px solid rgba(255,255,255,0.04)',
          }}
          onMouseDown={showIOPanel ? handleMouseDown : undefined}
        >
          <button
            onClick={() => setShowIOPanel(prev => !prev)}
            title={showIOPanel ? 'Hide I/O panel' : 'Show I/O panel'}
            className="w-4 h-8 rounded bg-white/8 hover:bg-blue-600 text-gray-500 hover:text-white flex items-center justify-center transition-all"
          >
            {showIOPanel ? <ChevronRight style={{ fontSize: 14 }} /> : <ChevronLeft style={{ fontSize: 14 }} />}
          </button>
        </div>

        {/* I/O panel */}
        {showIOPanel && (
          <div className="flex-1 flex flex-col bg-[#111] md:max-w-[50%] border-l border-white/[0.04] overflow-hidden">

            {/* Input section */}
            <div className="flex flex-col border-b border-white/[0.06]" style={{ flex: '0 0 auto', minHeight: '180px' }}>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#141414] border-b border-white/[0.05]">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">stdin</span>
              </div>
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Enter program input here…"
                className="flex-1 resize-none bg-transparent text-sm text-gray-300 font-mono px-4 py-3 focus:outline-none placeholder-gray-700 leading-relaxed"
                style={{ minHeight: '130px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
              />
            </div>

            {/* Output section */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#141414] border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">stdout</span>
                </div>
                {output && (
                  <button
                    onClick={() => setOutput('')}
                    className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-auto px-4 py-3">
                {output ? (
                  <div
                    className="text-sm font-mono leading-relaxed text-gray-300 whitespace-pre-wrap"
                    style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
                  >
                    {output}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                    <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-xs text-gray-700">Run your code to see output here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextEditors;
