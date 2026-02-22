import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { nanoid } from 'nanoid';
import Navbar from '../components/Navbar';

/* ─── Language badge config ─── */
const LANG_META = {
  python: { label: 'Python', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  java: { label: 'Java', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  javascript: { label: 'JS', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  cpp: { label: 'C++', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  other: { label: 'Text', color: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
};

const getLangMeta = (lang) => LANG_META[lang] || LANG_META.other;

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

/* ─── Skeleton card ─── */
const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-5 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-9 h-9 rounded-xl bg-white/8" />
      <div className="w-14 h-5 rounded-full bg-white/8" />
    </div>
    <div className="h-4 bg-white/8 rounded w-2/3 mb-2" />
    <div className="h-3 bg-white/6 rounded w-1/3 mb-6" />
    <div className="flex gap-2">
      <div className="flex-1 h-8 bg-white/8 rounded-lg" />
      <div className="w-8 h-8 bg-white/8 rounded-lg" />
      <div className="w-8 h-8 bg-white/8 rounded-lg" />
    </div>
  </div>
);

/* ─── Empty state ─── */
const EmptyState = ({ onCreate }) => (
  <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
    <div className="w-20 h-20 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-6">
      <svg className="w-9 h-9 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">No files yet</h3>
    <p className="text-gray-500 text-sm mb-8 max-w-xs">Create your first document and start coding. It'll appear here automatically.</p>
    <button
      onClick={onCreate}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
      New File
    </button>
  </div>
);

/* ─── Confirm delete modal ─── */
const DeleteModal = ({ fileName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-[#0d1a0f] border border-white/10 rounded-2xl p-7 w-full max-w-sm shadow-2xl">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <h3 className="text-white font-bold text-lg text-center mb-1">Delete file?</h3>
      <p className="text-gray-400 text-sm text-center mb-6">
        <span className="text-white font-medium">"{fileName || 'Untitled'}"</span> will be permanently deleted.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 text-sm font-medium transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors">Delete</button>
      </div>
    </div>
  </div>
);

const UserFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFiles(data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleCreateNew = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const shortId = nanoid(6);
    const { data, error } = await supabase
      .from('documents')
      .insert({ id: shortId, content: '', user_id: user.id })
      .select().single();
    if (!error && data) navigate(`/editor/${shortId}`);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase.from('documents').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      setFiles(prev => prev.filter(f => f.id !== deleteTarget.id));
      toast.success('File deleted');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/editor/${id}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Link copied!'))
      .catch(() => toast.error('Failed to copy'));
  };

  const filtered = files.filter(f =>
    (f.file_name || 'Untitled').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Toaster position="top-center" />
      <Navbar />

      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-24 pb-16">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <Link to="/" className="hover:text-gray-400 transition-colors">Home</Link>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-400">My Files</span>
            </div>
            <h1 className="text-3xl font-bold text-white">My Files</h1>
            {!loading && (
              <p className="text-gray-600 text-sm mt-1">
                {files.length} {files.length === 1 ? 'file' : 'files'}
              </p>
            )}
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white pl-4 pr-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/35 hover:-translate-y-0.5 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New File
          </button>
        </div>

        {/* ── Search bar ── */}
        {(files.length > 0 || search) && (
          <div className="relative mb-8 max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search files…"
              className="w-full bg-white/[0.03] border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.03] transition-all"
            />
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 && search ? (
          <div className="text-center py-24">
            <p className="text-gray-500">No files match "<span className="text-gray-300">{search}</span>"</p>
            <button onClick={() => setSearch('')} className="mt-3 text-emerald-400 text-sm hover:underline">Clear search</button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onCreate={handleCreateNew} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((file) => {
              const lang = getLangMeta(file.language);
              const name = file.file_name || 'Untitled';
              return (
                <div
                  key={file.id}
                  className="group relative bg-white/[0.03] border border-white/6 rounded-2xl p-5 hover:bg-emerald-500/[0.04] hover:border-emerald-500/15 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center flex-shrink-0">
                      <svg className="w-[18px] h-[18px] text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${lang.color}`}>
                      {lang.label}
                    </span>
                  </div>

                  {/* File name */}
                  <h2 className="text-sm font-semibold text-white mb-1 truncate" title={name}>{name}</h2>

                  {/* Time */}
                  <p className="text-xs text-gray-600 mb-4">{timeAgo(file.created_at)}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto">
                    <button
                      onClick={() => navigate(`/editor/${file.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-emerald-600/90 hover:bg-emerald-600 text-white py-2 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Open
                    </button>
                    <button
                      onClick={() => handleShare(file.id)}
                      title="Copy link"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/8 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: file.id, name })}
                      title="Delete"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/8 text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/8 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <DeleteModal
          fileName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default UserFiles;