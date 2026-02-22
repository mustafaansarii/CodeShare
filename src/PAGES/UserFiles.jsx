import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { nanoid } from 'nanoid';
import Navbar from '../components/Navbar';

/* ─── Language config ─── */
const LANG_META = {
  python: { label: 'Python', dot: 'bg-blue-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '🐍' },
  java: { label: 'Java', dot: 'bg-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: '☕' },
  javascript: { label: 'JS', dot: 'bg-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: 'JS' },
  cpp: { label: 'C++', dot: 'bg-purple-400', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: '⚙' },
  other: { label: 'Text', dot: 'bg-gray-500', badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: '📄' },
};
const getLang = (l) => LANG_META[l] || LANG_META.other;

const fmt = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* ─── Stat card ─── */
const Stat = ({ icon, label, value, sub }) => (
  <div className="flex items-center gap-3.5 bg-white/[0.025] border border-white/[0.06] rounded-xl px-5 py-4">
    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center flex-shrink-0 text-emerald-400">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-600 leading-none mb-1">{label}</p>
      <p className="text-base font-bold text-white leading-none">{value}</p>
      {sub && <p className="text-[11px] text-gray-700 mt-1 truncate">{sub}</p>}
    </div>
  </div>
);

/* ─── Skeleton ─── */
const Skel = ({ view }) => view === 'list' ? (
  <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.04] animate-pulse bg-white/[0.015]">
    <div className="w-2 h-2 rounded-full bg-white/10 flex-shrink-0" />
    <div className="flex-1">
      <div className="h-3.5 bg-white/8 rounded w-2/5 mb-1.5" />
      <div className="h-3 bg-white/5 rounded w-1/4" />
    </div>
    <div className="w-16 h-5 rounded-full bg-white/8" />
    <div className="w-14 h-7 rounded-lg bg-white/8" />
  </div>
) : (
  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-8 h-8 rounded-lg bg-white/8" />
      <div className="w-12 h-5 rounded-full bg-white/8" />
    </div>
    <div className="h-4 bg-white/8 rounded w-3/5 mb-1.5" />
    <div className="h-3 bg-white/5 rounded w-1/3 mb-8" />
    <div className="flex gap-2">
      <div className="flex-1 h-8 bg-white/8 rounded-lg" />
      <div className="w-8 h-8 bg-white/8 rounded-lg" />
      <div className="w-8 h-8 bg-white/8 rounded-lg" />
    </div>
  </div>
);

/* ─── Checkbox ─── */
const Checkbox = ({ checked }) => (
  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-white/25 bg-white/5'
    }`}>
    {checked && (
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    )}
  </div>
);

/* ─── Empty state ─── */
const Empty = ({ isSearch, onCreate, onClear, query }) => isSearch ? (
  <div className="text-center py-24">
    <div className="inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/8 mb-5">
      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <h3 className="text-sm font-semibold text-white mb-1">No results for "{query}"</h3>
    <p className="text-xs text-gray-600 mb-5">Try a different search term</p>
    <button onClick={onClear} className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors">Clear search</button>
  </div>
) : (
  <div className="text-center py-28">
    <div className="inline-flex w-20 h-20 items-center justify-center rounded-3xl bg-emerald-500/5 border border-emerald-500/10 mb-6">
      <svg className="w-9 h-9 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">Start your first file</h3>
    <p className="text-sm text-gray-600 mb-8 max-w-xs mx-auto">Write, run, and share code. Your files appear here automatically.</p>
    <button onClick={onCreate} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
      New File
    </button>
  </div>
);

/* ─── Bulk delete confirm modal ─── */
const BulkDelModal = ({ count, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onCancel} />
    <div className="relative z-10 bg-[#111118] border border-white/10 rounded-2xl p-7 w-full max-w-sm shadow-2xl shadow-black/60">
      <div className="flex justify-center mb-5">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/15 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      </div>
      <h3 className="text-white font-semibold text-center mb-1">Delete {count} {count === 1 ? 'file' : 'files'}?</h3>
      <p className="text-gray-500 text-sm text-center mb-6">
        This will permanently remove {count === 1 ? 'this file' : `all ${count} files`} and cannot be undone.
      </p>
      <div className="flex gap-2.5">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/8 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all shadow-lg shadow-red-600/20">Delete</button>
      </div>
    </div>
  </div>
);

/* ─── Single delete confirm modal ─── */
const DelModal = ({ name, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onCancel} />
    <div className="relative z-10 bg-[#111118] border border-white/10 rounded-2xl p-7 w-full max-w-sm shadow-2xl shadow-black/60">
      <div className="flex justify-center mb-5">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/15 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      </div>
      <h3 className="text-white font-semibold text-center mb-1">Delete file?</h3>
      <p className="text-gray-500 text-sm text-center mb-6">
        <span className="text-gray-300 font-medium">"{name}"</span> will be permanently removed.
      </p>
      <div className="flex gap-2.5">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/8 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all shadow-lg shadow-red-600/20">Delete</button>
      </div>
    </div>
  </div>
);

/* ─── Grid card ─── */
const Card = ({ file, onOpen, onShare, onDelete, selectMode, selected, onToggle }) => {
  const lang = getLang(file.language);
  const name = file.file_name || 'Untitled';

  const handleClick = () => {
    if (selectMode) { onToggle(); return; }
    onOpen();
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col bg-white/[0.02] border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${selected
          ? 'border-emerald-500/50 bg-emerald-500/[0.06] shadow-lg shadow-emerald-500/10'
          : 'border-white/[0.055] hover:bg-white/[0.038] hover:border-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/5'
        }`}
    >
      {/* Top accent */}
      <div className={`h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

      <div className="flex flex-col flex-1 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold border ${lang.badge}`}>
            {lang.icon}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-gray-600">{fmt(file.created_at)}</span>
            {/* Selection checkbox: always visible in select mode, hover in normal */}
            <div
              className={`transition-opacity duration-150 ${selectMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              onClick={e => { e.stopPropagation(); onToggle(); }}
            >
              <Checkbox checked={selected} />
            </div>
          </div>
        </div>

        {/* Name */}
        <h2 className="text-sm font-semibold text-white truncate mb-0.5" title={name}>{name}</h2>
        <div className="flex-1 mb-4" />

        {/* Footer */}
        <div
          className="flex items-center gap-2 pt-3 border-t border-white/[0.05]"
          onClick={e => e.stopPropagation()}
        >
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border mr-auto ${lang.badge}`}>
            {lang.label}
          </span>
          {!selectMode && (
            <>
              <button onClick={onShare} title="Copy link" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-700 hover:text-emerald-400 hover:bg-emerald-500/8 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button onClick={onDelete} title="Delete" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/8 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── List row ─── */
const Row = ({ file, onOpen, onShare, onDelete, selectMode, selected, onToggle }) => {
  const lang = getLang(file.language);
  const name = file.file_name || 'Untitled';

  return (
    <div
      onClick={() => selectMode ? onToggle() : onOpen()}
      className={`group flex items-center gap-4 px-5 py-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${selected
          ? 'bg-emerald-500/[0.06] border-emerald-500/40'
          : 'border-white/[0.04] bg-white/[0.018] hover:bg-white/[0.035] hover:border-emerald-500/15'
        }`}
    >
      {/* Checkbox or dot */}
      {selectMode ? (
        <div onClick={e => { e.stopPropagation(); onToggle(); }}>
          <Checkbox checked={selected} />
        </div>
      ) : (
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${lang.dot}`} />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate group-hover:text-emerald-100 transition-colors">{name}</p>
        <p className="text-xs text-gray-700 mt-0.5">{fmt(file.created_at)}</p>
      </div>

      <span className={`hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${lang.badge}`}>
        {lang.label}
      </span>

      {!selectMode && (
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={onShare} title="Copy link" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-700 hover:text-emerald-400 hover:bg-emerald-500/8 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button onClick={onDelete} title="Delete" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/8 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={onOpen}
            className="ml-1 flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white transition-colors"
          >
            Open
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

/* ════════════════ Page ════════════════ */
const UserFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);  // single delete
  const [showBulkDel, setShowBulkDel] = useState(false);   // bulk delete
  const navigate = useNavigate();

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data, error } = await supabase
        .from('documents').select('*').eq('user_id', user.id);
      if (error) throw error;
      setFiles(data || []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  /* ─ Exit select mode and clear selection ─ */
  const exitSelect = () => { setSelectMode(false); setSelected(new Set()); };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(f => f.id)));
    }
  };

  const handleCreate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const id = nanoid(6);
    const { data, error } = await supabase.from('documents')
      .insert({ id, content: '', user_id: user.id }).select().single();
    if (!error && data) navigate(`/editor/${id}`);
  };

  /* ─ Single delete ─ */
  const confirmSingleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase.from('documents').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      setFiles(p => p.filter(f => f.id !== deleteTarget.id));
      toast.success('File deleted');
    } catch (e) { toast.error(e.message); }
    finally { setDeleteTarget(null); }
  };

  /* ─ Bulk delete ─ */
  const confirmBulkDelete = async () => {
    const ids = [...selected];
    try {
      const { error } = await supabase.from('documents').delete().in('id', ids);
      if (error) throw error;
      setFiles(p => p.filter(f => !ids.includes(f.id)));
      toast.success(`${ids.length} ${ids.length === 1 ? 'file' : 'files'} deleted`);
      exitSelect();
    } catch (e) { toast.error(e.message); }
    finally { setShowBulkDel(false); }
  };

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/editor/${id}`)
      .then(() => toast.success('Link copied!')).catch(() => toast.error('Failed'));
  };

  /* ─── Stats ─── */
  const totalFiles = files.length;
  const recentFile = [...files].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  const langCounts = files.reduce((a, f) => { const k = f.language || 'other'; a[k] = (a[k] || 0) + 1; return a; }, {});
  const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0];
  const usedLangs = Object.keys(langCounts);

  /* ─── Filtered + sorted ─── */
  const filtered = useMemo(() => {
    let list = files.filter(f => {
      const matchSearch = (f.file_name || 'Untitled').toLowerCase().includes(search.toLowerCase());
      const matchLang = langFilter === 'all' || (f.language || 'other') === langFilter;
      return matchSearch && matchLang;
    });
    if (sort === 'newest') list = list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sort === 'oldest') list = list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (sort === 'name') list = list.sort((a, b) => (a.file_name || 'Untitled').localeCompare(b.file_name || 'Untitled'));
    return list;
  }, [files, search, langFilter, sort]);

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Toaster position="top-center" toastOptions={{ style: { background: '#111118', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', fontSize: '13px' } }} />
      <Navbar />

      <div className="max-w-6xl mx-auto px-5 lg:px-8 pt-24 pb-32">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-700 mb-3">
              <Link to="/" className="hover:text-gray-500 transition-colors">Home</Link>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-gray-500">My Files</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Files</h1>
            <p className="text-sm text-gray-600 mt-0.5">Your personal code workspace</p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 self-start flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New File
          </button>
        </div>

        {/* ── Stats strip ── */}
        {!loading && totalFiles > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <Stat
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              label="Total Files" value={totalFiles} sub={`${usedLangs.length} language${usedLangs.length !== 1 ? 's' : ''}`}
            />
            <Stat
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              label="Last Created" value={recentFile ? fmt(recentFile.created_at) : '—'} sub={recentFile?.file_name || 'Untitled'}
            />
            <Stat
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
              label="Top Language" value={topLang ? getLang(topLang[0]).label : '—'} sub={topLang ? `${topLang[1]} file${topLang[1] !== 1 ? 's' : ''}` : ''}
            />
          </div>
        )}

        {/* ── Toolbar ── */}
        {(totalFiles > 0 || search) && (
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full bg-white/[0.03] border border-white/[0.07] rounded-lg py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/35 focus:bg-emerald-500/[0.02] transition-all"
                style={{ paddingLeft: '2.25rem', paddingRight: search ? '2rem' : '0.75rem' }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>

            {/* Lang filter pills */}
            {usedLangs.length > 1 && !selectMode && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {['all', ...usedLangs].map(k => {
                  const meta = k === 'all' ? null : getLang(k);
                  const active = langFilter === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setLangFilter(k)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${active
                          ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-white/[0.025] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/10'
                        }`}
                    >
                      {k === 'all' ? 'All' : meta.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="ml-auto flex items-center gap-2">
              {/* Sort */}
              {!selectMode && (
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-gray-400 focus:outline-none focus:border-emerald-500/30 appearance-none cursor-pointer"
                  style={{ paddingRight: '1.75rem', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="name">Name A–Z</option>
                </select>
              )}

              {/* Select mode toggle */}
              {!selectMode ? (
                <button
                  onClick={() => setSelectMode(true)}
                  className="text-xs font-medium px-3 py-2 rounded-lg border border-white/[0.07] bg-white/[0.03] text-gray-400 hover:text-white hover:border-white/15 transition-all"
                >
                  Select
                </button>
              ) : (
                <button
                  onClick={exitSelect}
                  className="text-xs font-medium px-3 py-2 rounded-lg border border-white/[0.07] bg-white/[0.03] text-gray-400 hover:text-white hover:border-white/15 transition-all"
                >
                  Cancel
                </button>
              )}

              {/* Grid / List toggle */}
              <div className="flex items-center bg-white/[0.03] border border-white/[0.07] rounded-lg p-0.5">
                {[['grid', 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'],
                ['list', 'M4 6h16M4 10h16M4 14h16M4 18h16']].map(([v, d]) => (
                  <button key={v} onClick={() => setView(v)} className={`p-1.5 rounded-md transition-all ${view === v ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} /></svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Select mode sub-bar ── */}
        {selectMode && filtered.length > 0 && (
          <div className="flex items-center gap-3 mb-5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
            <button
              onClick={selectAll}
              className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
            >
              <Checkbox checked={allSelected} />
              {allSelected ? 'Deselect all' : `Select all (${filtered.length})`}
            </button>
            {selected.size > 0 && (
              <span className="text-xs text-gray-600 ml-1">{selected.size} selected</span>
            )}
          </div>
        )}

        {/* ── Result count ── */}
        {!loading && (search || langFilter !== 'all') && filtered.length > 0 && (
          <p className="text-xs text-gray-700 mb-4">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
        )}

        {/* ── Content ── */}
        {loading ? (
          view === 'list'
            ? <div className="space-y-2">{[...Array(6)].map((_, i) => <Skel key={i} view="list" />)}</div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Skel key={i} view="grid" />)}</div>
        ) : filtered.length === 0 ? (
          <Empty isSearch={!!(search || langFilter !== 'all')} onCreate={handleCreate} onClear={() => { setSearch(''); setLangFilter('all'); }} query={search} />
        ) : view === 'list' ? (
          <div className="space-y-1.5">
            {filtered.map(f => (
              <Row key={f.id} file={f}
                selectMode={selectMode}
                selected={selected.has(f.id)}
                onToggle={() => toggleSelect(f.id)}
                onOpen={() => navigate(`/editor/${f.id}`)}
                onShare={() => copyLink(f.id)}
                onDelete={() => setDeleteTarget({ id: f.id, name: f.file_name || 'Untitled' })}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(f => (
              <Card key={f.id} file={f}
                selectMode={selectMode}
                selected={selected.has(f.id)}
                onToggle={() => toggleSelect(f.id)}
                onOpen={() => navigate(`/editor/${f.id}`)}
                onShare={() => copyLink(f.id)}
                onDelete={() => setDeleteTarget({ id: f.id, name: f.file_name || 'Untitled' })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Floating selection bar ── */}
      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#111118] border border-white/12 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <span className="text-sm font-medium text-white">
            {selected.size} {selected.size === 1 ? 'file' : 'files'} selected
          </span>
          <div className="w-px h-4 bg-white/10" />
          <button
            onClick={exitSelect}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowBulkDel(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/25"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete {selected.size}
          </button>
        </div>
      )}

      {/* ── Modals ── */}
      {deleteTarget && <DelModal name={deleteTarget.name} onConfirm={confirmSingleDelete} onCancel={() => setDeleteTarget(null)} />}
      {showBulkDel && <BulkDelModal count={selected.size} onConfirm={confirmBulkDelete} onCancel={() => setShowBulkDel(false)} />}
    </div>
  );
};

export default UserFiles;