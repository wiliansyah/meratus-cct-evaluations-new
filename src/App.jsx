import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Upload, Award, BookOpen, Building2,
  Eye, EyeOff, Search, X, RefreshCw, Download, Save,
  FileSpreadsheet, CheckCircle2, AlertCircle, Filter,
  Users, BarChart3, Lock, Layers, TableProperties,
  Printer, Check, ChevronDown, Sun, Moon,
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = 'new-cct-meratus';

const DEFAULT_TSV = `NO\tTraining Topic\tGroup SBU/SFU\tHead of SBU/SFU\tSME\tManager HRBP\tMeratus Academy\tAssessment Timeline\tUpdate CCT Module Timeline\tComprehensiveness of Theoretical Content HRBP\tComprehensiveness of Theoretical Content SME\tComprehensiveness of Theoretical Content ACADEMY\tComprehensiveness of Theoretical Content Average\tContent Accuracy & Validity HRBP\tContent Accuracy & Validity SME\tContent Accuracy & Validity ACADEMY\tContent Accuracy & Validity Average\tBusiness Relevance HRBP\tBusiness Relevance SME\tBusiness Relevance ACADEMY\tBusiness Relevance Average\tPractical Applicability HRBP\tPractical Applicability SME\tPractical Applicability ACADEMY\tPractical Applicability Average\tVisual & Slide Design HRBP\tVisual & Slide Design SME\tVisual & Slide Design ACADEMY\tVisual & Slide Design Average\tAlignment of Learning Evaluation HRBP\tAlignment of Learning Evaluation SME\tAlignment of Learning Evaluation ACADEMY\tAlignment of Learning Evaluation Average\tQuestions & Answer Options Quality HRBP\tQuestions & Answer Options Quality SME\tQuestions & Answer Options Quality ACADEMY\tQuestions & Answer Options Quality Average\tTotal Score\tFeedback for Improvement\tNew Participant Socre`;

const TOPIC_LINKS_RAW = { 'to be filled': '' };

const parseNum = (val) => {
  if (!val || val === '#DIV/0!' || val === '#N/A') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
};

const resolveLink = (topic) => {
  if (!topic) return null;
  if (TOPIC_LINKS_RAW[topic]) return TOPIC_LINKS_RAW[topic];
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nt = norm(topic);
  for (let k in TOPIC_LINKS_RAW) {
    const nk = norm(k);
    if (nk === nt || nt.includes(nk) || nk.includes(nt)) return TOPIC_LINKS_RAW[k];
  }
  return null;
};

const getHrbp = (row) => {
  if (!row) return '';
  if (row['Manager HRBP']) return row['Manager HRBP'];
  if (row['HRBP']) return row['HRBP'];
  const k = Object.keys(row).find(k =>
    k.toUpperCase().includes('HRBP') &&
    !['COMPREHENSIVENESS','ACCURACY','RELEVANCE','PRACTICAL','VISUAL','ALIGNMENT','QUESTIONS']
      .some(w => k.toUpperCase().includes(w))
  );
  return k ? row[k] : '';
};

const checkEvaluated = (row, role) =>
  Object.keys(row).filter(k =>
    k.toUpperCase().includes(role) &&
    !k.toUpperCase().includes('AVERAGE') &&
    ['Comprehensiveness','Accuracy','Relevance','Practical','Visual','Alignment','Questions']
      .some(w => k.includes(w))
  ).some(k => parseNum(row[k]) !== null);

/* ─── Theme helper ──────────────────────────────────────────────────────── */
const mkTheme = (dark) => ({
  // Root
  root:           dark ? 'bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-900',
  // Nav
  nav:            dark ? 'bg-[#0F172A] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900',
  navTitle:       dark ? 'text-white' : 'text-slate-900',
  navSync:        dark ? 'text-slate-400' : 'text-slate-500',
  navSyncDot:     (err) => err ? 'bg-rose-500' : dark ? 'bg-emerald-400' : 'bg-emerald-500',
  navThemeBtn:    dark ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700',
  // Tab bar
  tabBar:         dark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200',
  tabActive:      'bg-blue-600 text-white shadow-md',
  tabInactive:    dark ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-white',
  // Global filters bar
  filtersBar:     dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  filterLabel:    dark ? 'text-slate-300' : 'text-slate-600',
  filterBtn:      (active) => active
    ? (dark ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800 shadow-inner' : 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-inner')
    : (dark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'),
  filterBtnAllScored: (active) => active
    ? (dark ? 'bg-violet-900/50 text-violet-400 border-violet-800 shadow-inner' : 'bg-violet-50 text-violet-700 border-violet-300 shadow-inner')
    : (dark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'),
  filterBtnIcon:  (active) => active ? (dark ? 'text-emerald-400' : 'text-emerald-600') : (dark ? 'text-slate-500' : 'text-slate-400'),
  filterBtnIconViolet: (active) => active ? (dark ? 'text-violet-400' : 'text-violet-600') : (dark ? 'text-slate-500' : 'text-slate-400'),
  allScoredBadge: (active) => active ? (dark ? 'bg-violet-800/60 text-violet-200' : 'bg-violet-100 text-violet-700') : (dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'),
  clearBtn:       dark ? 'text-rose-400 hover:text-rose-100 bg-rose-950/30 hover:bg-rose-900 border-rose-900/50' : 'text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200',
  // Cards / section wrappers
  card:           dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  cardSubBg:      dark ? 'bg-slate-950/30' : 'bg-slate-50',
  sectionTitle:   dark ? 'text-slate-300' : 'text-slate-600',
  divider:        dark ? 'border-slate-800' : 'border-slate-200',
  metricLabel:    dark ? 'text-slate-500' : 'text-slate-500',
  // Table
  tableSection:   dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  tableHead:      dark ? 'bg-slate-800 text-slate-400 ring-slate-700' : 'bg-slate-100 text-slate-500 ring-slate-200',
  tableRowAlt:    dark ? 'bg-slate-800/30' : 'bg-slate-50',
  tableRowHover:  dark ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50',
  tableCellMuted: dark ? 'text-slate-500' : 'text-slate-400',
  tableCellMain:  dark ? 'text-slate-200' : 'text-slate-800',
  tableBorder:    dark ? 'border-slate-800' : 'border-slate-200',
  tableTabActive: (v) => v === 'scored'
    ? (dark ? 'border-blue-500 text-blue-400 bg-slate-800/50' : 'border-blue-500 text-blue-600 bg-blue-50/50')
    : (dark ? 'border-amber-500 text-amber-400 bg-slate-800/50' : 'border-amber-500 text-amber-600 bg-amber-50/50'),
  tableTabInactive: dark ? 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-700',
  // Controls in table header
  detailToggle:   (on) => on
    ? (dark ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-800 hover:bg-indigo-900' : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100')
    : (dark ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'),
  // Inputs (used via CSS mostly but kept for reference)
  inputBase:      dark ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400',
  selectBase:     dark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700',
  // Source tab
  sourceCard:     dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  sourceHeader:   dark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200',
  sourceLabel:    dark ? 'text-slate-200' : 'text-slate-800',
  sourceSub:      dark ? 'text-slate-400' : 'text-slate-500',
  textareaBase:   dark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800',
  // Lock screen
  lockBg:         dark ? 'bg-slate-900/50' : 'bg-white',
  lockIcon:       dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200',
  lockTitle:      dark ? 'text-slate-100' : 'text-slate-900',
  lockSub:        dark ? 'text-slate-400' : 'text-slate-500',
  lockInput:      dark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800',
  lockEyeBtn:     dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600',
  // Sub-score cell
  subScoreNormal: dark ? 'bg-slate-800/30 text-slate-400' : 'bg-slate-50 text-slate-500',
  subScoreLow:    'bg-red-950/30 text-red-400 font-bold border-x border-red-900/50',
  // SBU cards
  sbuCardBg:      dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  sbuOtherBg:     dark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700',
  sbuOtherDivider:dark ? 'bg-slate-700' : 'bg-slate-300',
  sbuPendingWrap: dark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200',
  sbuPendingChip: dark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-500 bg-white border-slate-200',
  sbuPendingNum:  dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600',
  // Category panel
  catPanel:       dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  catBarBg:       dark ? 'bg-slate-800' : 'bg-slate-200',
  // SBU header
  sbuHeaderWrap:  dark ? 'bg-blue-900/30 border-blue-800/50' : 'bg-blue-50 border-blue-200',
  sbuHeaderIcon:  dark ? 'text-blue-400' : 'text-blue-600',
  sbuHeaderTitle: dark ? 'text-slate-200' : 'text-slate-700',
  sbuCountBadge:  dark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500',
  // No-data state
  noDataIcon:     dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200',
  noDataTitle:    dark ? 'text-slate-300' : 'text-slate-600',
  noDataSub:      dark ? 'text-slate-500' : 'text-slate-400',
  // Pending badge in table
  pendingBadge:   dark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200',
  // Dropdown select in table control bar
  ddSelectCls:    dark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600',
  // MultiSelectDropdown
  ddBtn:          dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
  ddBtnVal:       dark ? 'text-slate-100' : 'text-slate-800',
  ddPanel:        dark ? 'bg-slate-900 border-slate-700 ring-black/50' : 'bg-white border-slate-200 shadow-lg ring-black/5',
  ddPanelLabel:   dark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-100',
  ddItem:         dark ? 'hover:bg-slate-800' : 'hover:bg-slate-50',
  ddItemText:     (sel) => sel ? 'text-blue-400' : (dark ? 'text-slate-300' : 'text-slate-600'),
  ddCheckBox:     (sel) => sel ? 'bg-blue-600 border-blue-600' : (dark ? 'border-slate-600 group-hover:border-blue-500' : 'border-slate-300 group-hover:border-blue-400'),
  // GlobalSuggestionInput
  gsiInput:       dark ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400',
  gsiDropdown:    dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-lg',
  gsiItem:        dark ? 'hover:bg-slate-800 text-slate-200 border-slate-800' : 'hover:bg-slate-50 text-slate-700 border-slate-100',
  gsiClearBtn:    dark ? 'hover:bg-slate-800' : 'hover:bg-slate-100',
  gsiNoMatch:     dark ? 'text-slate-500' : 'text-slate-400',
  // Loading
  loadingText:    dark ? 'text-slate-500' : 'text-slate-400',
  // CTA buttons (neutral ones)
  exportBtn:      'text-white bg-blue-600 hover:bg-blue-700',
  pdfBtn:         'text-white bg-blue-600 hover:bg-blue-700',
  saveBtn:        'text-white bg-blue-600 hover:bg-blue-700',
});

/* ─── MultiSelectDropdown ─────────────────────────────────────────────── */
const MultiSelectDropdown = ({ label, options, selectedValues, onToggle, tc }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative inline-block text-left" ref={ref} style={{ zIndex: isOpen ? 100 : 50 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${tc.ddBtn} text-[10px] font-bold uppercase rounded-lg px-3 py-2 flex items-center gap-2 transition-all shadow-sm border`}
      >
        <span className="opacity-60">{label}:</span>
        <span className={tc.ddBtnVal}>
          {selectedValues.length === 0 || selectedValues.includes('all') ? 'All' : `${selectedValues.length} Active`}
        </span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className={`absolute left-0 mt-2 w-56 ${tc.ddPanel} border rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-100 ring-4`}>
          <div className={`px-3 py-1 mb-1 border-b ${tc.ddPanelLabel}`}>
            <span className="text-[9px] font-black uppercase tracking-widest">Select Filters</span>
          </div>
          {options.map((opt) => (
            <label key={opt.id} className={`flex items-center px-4 py-2.5 ${tc.ddItem} cursor-pointer group transition-colors`}>
              <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${tc.ddCheckBox(selectedValues.includes(opt.id))}`}>
                {selectedValues.includes(opt.id) && <Check size={10} className="text-white stroke-[4px]" />}
              </div>
              <input type="checkbox" className="hidden" checked={selectedValues.includes(opt.id)} onChange={() => onToggle(opt.id)} />
              <span className={`ml-3 text-[10px] font-bold uppercase tracking-wider ${tc.ddItemText(selectedValues.includes(opt.id))}`}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── GlobalSuggestionInput ───────────────────────────────────────────── */
const GlobalSuggestionInput = ({ value, setValue, placeholder, list, icon: Icon, tc }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', h);
    document.addEventListener('touchstart', h);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('touchstart', h); };
  }, []);
  return (
    <div className="relative w-full sm:w-56 flex-shrink-0" ref={ref}>
      <div className="relative flex items-center group">
        <Icon className="absolute left-3.5 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder={placeholder}
          className={`w-full pl-10 pr-8 py-2 border shadow-sm rounded-full text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${tc.gsiInput}`}
          value={value}
          onChange={(e) => { setValue(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
        />
        {value && (
          <button type="button" onClick={() => setValue('')} className={`absolute right-2 p-1 ${tc.gsiClearBtn} rounded-full transition-colors z-10`}>
            <X size={12} className="text-slate-400" />
          </button>
        )}
      </div>
      {isOpen && (
        <div className={`absolute z-50 left-0 right-0 mt-2 ${tc.gsiDropdown} border rounded-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2`}>
          {list.filter(i => i.toLowerCase().includes(value.toLowerCase())).slice(0, 30).map((item, i) => (
            <button key={i} type="button"
              className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors border-b last:border-0 ${tc.gsiItem}`}
              onClick={(e) => { e.preventDefault(); setValue(item); setIsOpen(false); }}
            >
              {item}
            </button>
          ))}
          {list.filter(i => i.toLowerCase().includes(value.toLowerCase())).length === 0 && (
            <div className={`px-4 py-3 text-xs font-medium italic text-center ${tc.gsiNoMatch}`}>No match found</div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── App ─────────────────────────────────────────────────────────────── */
export default function App() {
  const [activeTab,        setActiveTab]        = useState('simplifikasi');
  const [tableView,        setTableView]        = useState('scored');
  const [showDetails,      setShowDetails]      = useState(false);
  const [scoreFilters,     setScoreFilters]     = useState(['all']);
  const [evaluatorFilters, setEvaluatorFilters] = useState(['all']);
  const [sortOrder,        setSortOrder]        = useState('none');
  const [rawData,          setRawData]          = useState(DEFAULT_TSV);
  const [isDownloading,    setIsDownloading]    = useState(false);
  const [isAuthorized,     setIsAuthorized]     = useState(false);
  const [passwordInput,    setPasswordInput]    = useState('');
  const [showPassword,     setShowPassword]     = useState(false);
  const [user,             setUser]             = useState(null);
  const [isLoadingData,    setIsLoadingData]    = useState(true);
  const [isSaving,         setIsSaving]         = useState(false);
  const [syncError,        setSyncError]        = useState(null);
  const [isDarkMode,       setIsDarkMode]       = useState(true);
  const [allScoredFilter,  setAllScoredFilter]  = useState(false);

  const [topicFilter, setTopicFilter] = useState('');
  const [sbuFilter,   setSbuFilter]   = useState('');
  const [hrbpFilter,  setHrbpFilter]  = useState('');
  const [completeSbuOnly, setCompleteSbuOnly] = useState(false);

  // Build theme object whenever dark mode changes
  const tc = useMemo(() => mkTheme(isDarkMode), [isDarkMode]);

  /* ── Firebase auth ────────────────────────────────────────────────── */
  useEffect(() => {
    const init = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token)
          await signInWithCustomToken(auth, __initial_auth_token);
        else
          await signInAnonymously(auth);
      } catch { setSyncError('Auth Fail'); setIsLoadingData(false); }
    };
    init();
    const unsub = onAuthStateChanged(auth, u => { setUser(u); if (!u) setIsLoadingData(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'artifacts', APP_ID, 'public', 'data', 'dashboard', 'tsv_data');
    const unsub = onSnapshot(ref,
      snap => { if (snap.exists() && snap.data().tsvData) setRawData(snap.data().tsvData); setIsLoadingData(false); setSyncError(null); },
      ()    => { setSyncError('Sync Fail'); setIsLoadingData(false); }
    );
    return () => unsub();
  }, [user]);

  /* ── Parse TSV ────────────────────────────────────────────────────── */
  const parsedData = useMemo(() => {
    if (!rawData?.trim()) return [];
    const lines = rawData.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split('\t').map(h => h.trim());
    return lines.slice(1).map(line => {
      const vals = line.split('\t');
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i]?.trim() ?? ''; });
      obj._TotalScore  = parseNum(obj['Total Score']);
      obj._Theory      = parseNum(obj['Comprehensiveness of Theoretical Content Average']);
      obj._Accuracy    = parseNum(obj['Content Accuracy & Validity Average']);
      obj._Relevance   = parseNum(obj['Business Relevance Average']);
      obj._Practical   = parseNum(obj['Practical Applicability Average']);
      obj._Visual      = parseNum(obj['Visual & Slide Design Average']);
      obj._Eval        = parseNum(obj['Alignment of Learning Evaluation Average']);
      obj._QA          = parseNum(obj['Questions & Answer Options Quality Average']);
      obj._hasHRBP     = checkEvaluated(obj, 'HRBP');
      obj._hasSME      = checkEvaluated(obj, 'SME');
      obj._hasAcademy  = checkEvaluated(obj, 'ACADEMY');
      return obj;
    });
  }, [rawData]);

  const sbuStats = useMemo(() => {
    const s = {};
    parsedData.forEach(d => {
      const sbu = d['Group SBU/SFU'] || 'Unknown';
      if (!s[sbu]) s[sbu] = { total: 0, evaluated: 0 };
      s[sbu].total++;
      if (d._TotalScore !== null) s[sbu].evaluated++;
    });
    return s;
  }, [parsedData]);

  const suggestions = useMemo(() => ({
    topics: [...new Set(parsedData.map(d => d['Training Topic']).filter(Boolean))].sort(),
    sbus:   [...new Set(parsedData.map(d => d['Group SBU/SFU']).filter(Boolean))].sort(),
    hrbps:  [...new Set(parsedData.map(d => getHrbp(d)).filter(h => h && h !== '-'))].sort(),
  }), [parsedData]);

  const globallyFilteredData = useMemo(() => {
    let data = parsedData;
    if (completeSbuOnly)
      data = data.filter(d => { const s = sbuStats[d['Group SBU/SFU']||'Unknown']; return s?.total > 0 && s.total === s.evaluated; });
    if (allScoredFilter)
      data = data.filter(d => d._hasHRBP && d._hasSME && d._hasAcademy);
    if (topicFilter)
      data = data.filter(d => (d['Training Topic']||'').toLowerCase().includes(topicFilter.toLowerCase()));
    if (sbuFilter)
      data = data.filter(d => (d['Group SBU/SFU']||'').toLowerCase().includes(sbuFilter.toLowerCase()));
    if (hrbpFilter)
      data = data.filter(d => getHrbp(d).toLowerCase().includes(hrbpFilter.toLowerCase()));
    return data;
  }, [parsedData, topicFilter, sbuFilter, hrbpFilter, completeSbuOnly, allScoredFilter, sbuStats]);

  const metrics = useMemo(() => {
    const data = globallyFilteredData;
    let scores = [], sbuMap = {};
    const cat = { theory:[], accuracy:[], relevance:[], practical:[], visual:[], eval:[], qa:[] };
    let pass=0, refine=0, pending=0, hrbp=0, sme=0, acd=0;
    data.forEach(d => {
      const sbu = d['Group SBU/SFU'] || 'Unknown';
      if (!sbuMap[sbu]) sbuMap[sbu] = { name:sbu, sum:0, valid:0, total:0 };
      sbuMap[sbu].total++;
      if (d._TotalScore !== null) {
        scores.push({ topic: d['Training Topic'], score: d._TotalScore });
        sbuMap[sbu].sum += d._TotalScore;
        sbuMap[sbu].valid++;
        if (d._TotalScore >= 8) pass++; else refine++;
      } else pending++;
      if (d._Theory)    cat.theory.push(d._Theory);
      if (d._Accuracy)  cat.accuracy.push(d._Accuracy);
      if (d._Relevance) cat.relevance.push(d._Relevance);
      if (d._Practical) cat.practical.push(d._Practical);
      if (d._Visual)    cat.visual.push(d._Visual);
      if (d._Eval)      cat.eval.push(d._Eval);
      if (d._QA)        cat.qa.push(d._QA);
      if (d._hasHRBP)   hrbp++;
      if (d._hasSME)    sme++;
      if (d._hasAcademy) acd++;
    });
    const avg = arr => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2) : '0';
    const sbuSummary = Object.values(sbuMap)
      .map(s => ({ ...s, avg: s.valid>0?parseFloat((s.sum/s.valid).toFixed(2)):0, completeness: s.total>0?((s.valid/s.total)*100).toFixed(1):'0' }))
      .sort((a,b) => b.avg-a.avg);
    scores.sort((a,b) => a.score-b.score);
    return {
      total: data.length, scored: scores.length, pending, pass, refine,
      hrbpEvalCount: hrbp, smeEvalCount: sme, academyEvalCount: acd,
      completeness: data.length ? ((scores.length/data.length)*100).toFixed(1) : '0',
      avg: avg(scores.map(v=>v.score)),
      highest: scores[scores.length-1],
      lowest: scores[0],
      sbuSummary,
      categories: [
        { name:'THEORY',     val: avg(cat.theory)    },
        { name:'ACCURACY',   val: avg(cat.accuracy)  },
        { name:'RELEVANCE',  val: avg(cat.relevance) },
        { name:'PRACTICAL',  val: avg(cat.practical) },
        { name:'VISUAL',     val: avg(cat.visual)    },
        { name:'EVALUATION', val: avg(cat.eval)      },
        { name:'Q&A',        val: avg(cat.qa)        },
      ],
    };
  }, [globallyFilteredData]);

  const activeSBUs = metrics.sbuSummary.filter(s => s.valid > 0);
  const top5SBUs   = activeSBUs.slice(0,5);
  const otherSBUs  = activeSBUs.slice(5);
  const zeroSBUs   = metrics.sbuSummary.filter(s => s.valid===0 && s.total>0);

  const tableData = useMemo(() => {
    let d = globallyFilteredData;
    if (tableView==='scored') d = d.filter(r => r._TotalScore!==null);
    else d = d.filter(r => r._TotalScore===null);
    if (!scoreFilters.includes('all')) {
      d = d.filter(r => {
        let m=false;
        if (scoreFilters.includes('pass')   && r._TotalScore>=8)                    m=true;
        if (scoreFilters.includes('refine') && r._TotalScore!==null && r._TotalScore<8) m=true;
        return m;
      });
    }
    if (!evaluatorFilters.includes('all')) {
      d = d.filter(r => evaluatorFilters.every(f => {
        if (f==='hrbp')          return r._hasHRBP;
        if (f==='sme')           return r._hasSME;
        if (f==='academy')       return r._hasAcademy;
        if (f==='all_completed') return r._hasHRBP && r._hasSME && r._hasAcademy;
        return true;
      }));
    }
    if (sortOrder==='highest') d=[...d].sort((a,b)=>(b._TotalScore||0)-(a._TotalScore||0));
    if (sortOrder==='lowest')  d=[...d].sort((a,b)=>(a._TotalScore||100)-(b._TotalScore||100));
    return d;
  }, [globallyFilteredData, tableView, scoreFilters, evaluatorFilters, sortOrder]);

  const handleToggleFilter = (id, current, setter) => {
    if (id==='all') { setter(['all']); return; }
    let next = current.filter(i=>i!=='all');
    if (next.includes(id)) { next=next.filter(i=>i!==id); if(!next.length) next=['all']; }
    else next.push(id);
    setter(next);
  };

  const handleSaveToCloud = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db,'artifacts',APP_ID,'public','data','dashboard','tsv_data'),
        { tsvData:rawData, updatedAt:new Date().toISOString(), updatedBy:user.uid });
      setActiveTab('simplifikasi');
    } catch { setSyncError('Save Failed'); }
    finally { setIsSaving(false); }
  };

  const handleExportTable = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rawData],{type:'text/tsv'}));
    a.download = 'Meratus_CCT_Export.tsv';
    a.click();
  };

  const handleDownloadPDF = async () => {
    const el = document.getElementById('pdf-one-pager');
    if (!el) return;
    setIsDownloading(true);
    const orig = el.style.cssText;
    el.style.cssText = 'width:1120px;min-width:1120px;max-width:1120px;margin:0 auto;';
    const bg = isDarkMode ? '#020617' : '#f1f5f9';
    const opt = {
      margin:0.2, filename:'Meratus_CCT_OnePager.pdf',
      image:{type:'jpeg',quality:1},
      html2canvas:{scale:2,useCORS:true,logging:false,windowWidth:1120,x:0,y:0,backgroundColor:bg},
      jsPDF:{unit:'in',format:'a4',orientation:'landscape'},
    };
    const done = () => { el.style.cssText=orig; setIsDownloading(false); };
    if (!window.html2pdf) {
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      s.onload=()=>window.html2pdf().set(opt).from(el).save().then(done).catch(done);
      document.head.appendChild(s);
    } else window.html2pdf().set(opt).from(el).save().then(done).catch(done);
  };

  const isAnyFilterActive = !!(topicFilter||sbuFilter||hrbpFilter||completeSbuOnly||allScoredFilter);
  const clearAllFilters = () => { setTopicFilter(''); setSbuFilter(''); setHrbpFilter(''); setCompleteSbuOnly(false); setAllScoredFilter(false); };
  const allScoredCount = useMemo(() => parsedData.filter(d=>d._hasHRBP&&d._hasSME&&d._hasAcademy).length, [parsedData]);

  const getSubScoreStyle = score => {
    if (!score||score==='-') return tc.subScoreNormal;
    return parseFloat(score)<8 ? tc.subScoreLow : tc.subScoreNormal;
  };

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className={`min-h-screen font-sans selection:bg-blue-900 selection:text-blue-100 ${tc.root}`}>

      {/* NAV */}
      <nav className={`shadow-lg sticky top-0 z-50 border-b print:hidden transition-colors duration-200 ${tc.nav}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 md:py-0 md:h-[72px]">

            {/* Brand */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-900/30">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className={`font-bold text-sm tracking-wide uppercase leading-tight ${tc.navTitle}`}>
                  Meratus Academy: NEW CCT Evaluations
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${tc.navSyncDot(syncError)} ${!syncError?'animate-pulse':''}`}/>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${tc.navSync}`}>
                    {syncError || 'Cloud Sync Active'}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Theme toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className={`p-2 rounded-lg border transition-colors flex-shrink-0 ${tc.navThemeBtn}`}
              >
                {isDarkMode ? <Sun size={16} className="text-amber-400"/> : <Moon size={16} className="text-indigo-500"/>}
              </button>

              {/* Tab bar */}
              <div className={`flex p-1.5 rounded-xl shadow-inner border backdrop-blur-sm overflow-x-auto ${tc.tabBar}`}>
                {[
                  { id:'simplifikasi', Icon:LayoutDashboard, label:'Simplified View' },
                  { id:'detail',       Icon:TableProperties,  label:'Detail View'     },
                  { id:'source',       Icon:Upload,            label:'Source Data'     },
                ].map(({ id, Icon, label }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${activeTab===id ? tc.tabActive : tc.tabInactive}`}
                  >
                    <Icon size={14}/> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* GLOBAL FILTERS BAR */}
      {(activeTab==='simplifikasi'||activeTab==='detail') && (
        <div className={`border-b shadow-sm sticky top-[72px] z-40 print:hidden transition-colors duration-200 ${tc.filtersBar}`}>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 mr-1">
              <Filter size={14} className="text-blue-500"/>
              <span className={`text-[11px] font-bold uppercase tracking-widest ${tc.filterLabel}`}>Global Filter:</span>
            </div>

            <GlobalSuggestionInput value={topicFilter} setValue={setTopicFilter} placeholder="Search Training Topic..." list={suggestions.topics} icon={Search} tc={tc}/>
            <GlobalSuggestionInput value={sbuFilter}   setValue={setSbuFilter}   placeholder="Filter SBU/SFU..."       list={suggestions.sbus}   icon={Building2} tc={tc}/>
            <GlobalSuggestionInput value={hrbpFilter}  setValue={setHrbpFilter}  placeholder="Filter HRBP..."          list={suggestions.hrbps}  icon={Users} tc={tc}/>

            {/* 100% Complete SBU */}
            <button onClick={() => setCompleteSbuOnly(!completeSbuOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border ${tc.filterBtn(completeSbuOnly)}`}
            >
              <CheckCircle2 size={12} className={tc.filterBtnIcon(completeSbuOnly)}/>
              100% Complete SBU
            </button>

            {/* All 3 Scored */}
            <button onClick={() => setAllScoredFilter(!allScoredFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border ${tc.filterBtnAllScored(allScoredFilter)}`}
            >
              <Users size={12} className={tc.filterBtnIconViolet(allScoredFilter)}/>
              All 3 Scored
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${tc.allScoredBadge(allScoredFilter)}`}>
                {allScoredCount}
              </span>
            </button>

            {isAnyFilterActive && (
              <button onClick={clearAllFilters} className={`text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-widest transition-colors border shadow-sm ${tc.clearBtn}`}>
                <X size={12}/> Clear
              </button>
            )}

            {activeTab==='simplifikasi' && (
              <button onClick={handleDownloadPDF} disabled={isDownloading}
                className={`ml-auto text-[11px] font-bold px-4 py-2 rounded-full flex items-center gap-2 uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 ${tc.pdfBtn}`}
              >
                {isDownloading ? <RefreshCw size={14} className="animate-spin"/> : <Printer size={14}/>}
                {isDownloading ? 'Processing...' : 'Download PDF'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">

        {/* Loading */}
        {isLoadingData ? (
          <div className="h-[70vh] flex flex-col items-center justify-center animate-in fade-in duration-500 print:hidden">
            <RefreshCw className="h-10 w-10 animate-spin mb-4 text-blue-500"/>
            <p className={`font-semibold text-xs tracking-widest uppercase animate-pulse ${tc.loadingText}`}>Loading Data...</p>
          </div>

        /* ─── SIMPLIFIED VIEW ─────────────────────────────────────── */
        ) : activeTab==='simplifikasi' ? (
          <div id="pdf-one-pager" className={`flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-900'}`}>

            {/* Row 1 – 4 metric cards */}
            <div className="grid grid-cols-4 gap-3">
              {/* Completeness */}
              <div className={`p-3.5 rounded-xl border shadow-sm flex flex-col justify-between relative overflow-hidden h-[100px] ${tc.card}`}>
                <div className={`absolute top-3 right-3 bg-opacity-50 rounded-full p-1.5 border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                  <CheckCircle2 size={24} className={isDarkMode?'text-slate-600':'text-slate-300'}/>
                </div>
                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"/> 1. COMPLETENESS
                </p>
                <h3 className={`text-3xl font-black tracking-tighter relative z-10 ${isDarkMode?'text-slate-100':'text-slate-800'}`}>{metrics.completeness}%</h3>
                <div className={`w-2/3 h-1.5 rounded-full overflow-hidden relative z-10 mt-auto ${tc.catBarBg}`}>
                  <div className="bg-blue-500 h-full" style={{width:metrics.completeness+'%'}}/>
                </div>
              </div>

              {/* Global avg */}
              <div className={`p-3.5 rounded-xl border shadow-sm flex flex-col justify-between relative overflow-hidden h-[100px] ${tc.card}`}>
                <div className={`absolute top-3 right-3 rounded-lg p-1.5 border ${isDarkMode?'bg-slate-800/50 border-slate-700':'bg-slate-100 border-slate-200'}`}>
                  <BarChart3 size={24} className={isDarkMode?'text-slate-600':'text-slate-300'}/>
                </div>
                <p className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${parseFloat(metrics.avg)<8?'text-red-400':'text-emerald-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${parseFloat(metrics.avg)<8?'bg-red-500':'bg-emerald-500'}`}/> 2. GLOBAL AVERAGE
                </p>
                <h3 className={`text-3xl font-black tracking-tighter relative z-10 ${parseFloat(metrics.avg)<8?'text-red-400':'text-emerald-400'}`}>{metrics.avg}</h3>
                <p className={`text-[8px] font-bold uppercase tracking-widest relative z-10 border-t pt-1.5 mt-auto ${tc.metricLabel} ${tc.divider}`}>AVERAGE MODULE SCORE</p>
              </div>

              {/* Highest */}
              <div className={`p-3.5 rounded-xl border shadow-sm flex flex-col justify-between h-[100px] ${tc.card}`}>
                <div className="flex justify-between items-start">
                  <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"/> 3. HIGHEST SCORE
                  </p>
                  <span className={`text-xl font-black px-2.5 py-0.5 rounded border ${isDarkMode?'text-slate-100 bg-blue-900/30 border-blue-800/50':'text-blue-700 bg-blue-50 border-blue-200'}`}>
                    {metrics.highest?.score||'-'}
                  </span>
                </div>
                <div className={`mt-2 border-t pt-2 flex-1 flex items-end ${tc.divider}`}>
                  <p className={`text-[10px] font-bold leading-tight line-clamp-2 ${isDarkMode?'text-slate-300':'text-slate-700'}`} title={metrics.highest?.topic}>{metrics.highest?.topic||'-'}</p>
                </div>
              </div>

              {/* Lowest */}
              <div className={`p-3.5 rounded-xl border shadow-sm flex flex-col justify-between h-[100px] ${metrics.lowest?.score<8?(isDarkMode?'border-red-900/50 bg-red-950/20':'border-red-200 bg-red-50/50'):tc.card}`}>
                <div className="flex justify-between items-start">
                  <p className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${metrics.lowest?.score<8?'text-red-400':'text-rose-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${metrics.lowest?.score<8?'bg-red-500':'bg-rose-500'}`}/> 4. LOWEST SCORE
                  </p>
                  <span className={`text-xl font-black px-2.5 py-0.5 rounded border ${metrics.lowest?.score<8?'text-white bg-red-600/80 border-red-500':(isDarkMode?'text-slate-200 bg-rose-900/30 border-rose-800/50':'text-rose-700 bg-rose-50 border-rose-200')}`}>
                    {metrics.lowest?.score||'-'}
                  </span>
                </div>
                <div className={`mt-2 border-t pt-2 flex-1 flex items-end ${metrics.lowest?.score<8?(isDarkMode?'border-red-900/50':'border-red-200'):tc.divider}`}>
                  <p className={`text-[10px] font-bold leading-tight line-clamp-2 ${isDarkMode?'text-slate-300':'text-slate-700'}`} title={metrics.lowest?.topic}>{metrics.lowest?.topic||'-'}</p>
                </div>
              </div>
            </div>

            {/* Row 2 – 4 stat pills */}
            <div className="grid grid-cols-4 gap-3">
              <div className={`border px-4 py-2 rounded-xl flex items-center justify-between shadow-sm h-[64px] ${isDarkMode?'bg-emerald-950/30 border-emerald-900/50':'bg-emerald-50 border-emerald-200'}`}>
                <div><span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block leading-none">5. PASS MODULE</span><span className="text-[8px] font-bold text-emerald-500/80 uppercase mt-1.5 block leading-none">SCORE &ge; 8.0</span></div>
                <span className="text-xl font-black text-emerald-500 leading-none">{metrics.pass}</span>
              </div>
              <div className={`border px-4 py-2 rounded-xl flex items-center justify-between shadow-sm h-[64px] ${isDarkMode?'bg-red-950/30 border-red-900/50':'bg-red-50 border-red-200'}`}>
                <div><span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block leading-none">6. REFINED MODULE</span><span className="text-[8px] font-bold text-red-500/80 uppercase mt-1.5 block leading-none">SCORE &lt; 8.0</span></div>
                <span className="text-xl font-black text-red-500 leading-none">{metrics.refine}</span>
              </div>
              <div className={`border px-4 py-2 rounded-xl flex items-center justify-between shadow-sm h-[64px] ${isDarkMode?'bg-amber-950/30 border-amber-900/50':'bg-amber-50 border-amber-200'}`}>
                <div><span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block leading-none">7. PENDING REVIEW</span><span className="text-[8px] font-bold text-amber-500/80 uppercase mt-1.5 block leading-none">NOT YET EVALUATED</span></div>
                <span className="text-xl font-black text-amber-500 leading-none">{metrics.pending}</span>
              </div>
              <div className={`border px-4 py-2 rounded-xl flex flex-col justify-center shadow-sm h-[64px] gap-1 ${isDarkMode?'bg-blue-950/30 border-blue-900/50':'bg-blue-50 border-blue-200'}`}>
                <div className="flex justify-between items-center w-full">
                  <div><span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block leading-none">8. TOTAL EVALUATED</span><span className="text-[8px] font-bold text-blue-500/80 uppercase mt-1 block leading-none">FROM {metrics.total} MODULES</span></div>
                  <span className="text-xl font-black text-blue-500 leading-none">{metrics.scored}</span>
                </div>
                <div className={`flex justify-between items-center text-[8px] font-bold text-blue-400 px-2 py-0.5 rounded mt-0.5 border ${isDarkMode?'bg-blue-900/40 border-blue-800/50':'bg-blue-100 border-blue-200'}`}>
                  <span className="flex items-center gap-1">HRBP <span className={isDarkMode?'text-blue-200':'text-blue-600'}>{metrics.hrbpEvalCount}</span></span>
                  <span className="flex items-center gap-1">SME  <span className={isDarkMode?'text-blue-200':'text-blue-600'}>{metrics.smeEvalCount}</span></span>
                  <span className="flex items-center gap-1">ACD  <span className={isDarkMode?'text-blue-200':'text-blue-600'}>{metrics.academyEvalCount}</span></span>
                </div>
              </div>
            </div>

            {/* Row 3 – Category + SBU */}
            <div className="grid grid-cols-12 gap-3 items-stretch flex-1">
              {/* Category panel */}
              <div className={`col-span-12 lg:col-span-3 rounded-xl p-4 shadow-md flex flex-col border h-full ${tc.catPanel}`}>
                <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${tc.divider}`}>
                  <BookOpen size={14} className={tc.sectionTitle}/>
                  <h3 className={`text-[10px] font-bold tracking-widest uppercase ${tc.sectionTitle}`}>9. CATEGORY PERFORMANCE</h3>
                </div>
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  {metrics.categories.map((cat,i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-1">
                        <span className={`text-[9px] font-bold uppercase tracking-widest leading-none ${isDarkMode?'text-slate-400':'text-slate-500'}`}>{cat.name}</span>
                        <span className={`text-[10px] font-black leading-none ${parseFloat(cat.val)<8?'text-red-400':'text-amber-500'}`}>{cat.val}</span>
                      </div>
                      <div className={`w-full h-1 rounded-full overflow-hidden ${tc.catBarBg}`}>
                        <div className={`h-full rounded-full ${parseFloat(cat.val)<8?'bg-red-500':'bg-amber-400'}`} style={{width:parseFloat(cat.val)*10+'%'}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SBU panel */}
              <div className={`col-span-12 lg:col-span-9 rounded-xl border shadow-sm flex flex-col h-full ${tc.card}`}>
                <div className={`px-4 py-2.5 border-b flex items-center justify-between ${tc.divider}`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${tc.sbuHeaderWrap}`}><Building2 className={`h-3.5 w-3.5 ${tc.sbuHeaderIcon}`}/></div>
                    <h2 className={`text-[10px] font-bold uppercase tracking-widest ${tc.sbuHeaderTitle}`}>10. PERFORMANCE & PROGRESS PER SBU/SFU UNIT</h2>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tc.sbuCountBadge}`}>{metrics.sbuSummary.length} Total Units</span>
                </div>
                <div className={`p-3 flex-1 flex flex-col rounded-b-xl ${tc.cardSubBg}`}>
                  {/* Top 5 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                    {top5SBUs.map((s,i) => (
                      <div key={i} className={`border rounded-lg p-2.5 pl-3 flex flex-col relative overflow-hidden shadow-sm h-[60px] justify-between ${s.avg<8?(isDarkMode?'border-red-900/50 bg-slate-900':'border-red-200 bg-white'):tc.sbuCardBg}`}>
                        <div className={`absolute top-0 left-0 w-1 h-full ${s.avg>=8?'bg-emerald-500':'bg-red-500'}`}/>
                        <div className="flex justify-between items-start w-full gap-1">
                          <span className={`text-[9px] font-bold uppercase leading-none truncate flex-1 ${isDarkMode?'text-slate-300':'text-slate-600'}`} title={s.name}>{s.name}</span>
                          <span className={`text-[8px] font-bold leading-none ${isDarkMode?'text-slate-500':'text-slate-400'}`}>{s.completeness}%</span>
                        </div>
                        <div className="flex items-end justify-between mt-auto w-full">
                          <span className={`text-base font-black leading-none ${s.avg>=8?'text-emerald-500':'text-red-500'}`}>{s.avg}</span>
                          <div className={`w-10 h-1 rounded-full overflow-hidden mb-0.5 ${tc.catBarBg}`}>
                            <div className="bg-blue-500 h-full" style={{width:s.completeness+'%'}}/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Others */}
                  {otherSBUs.length>0 && (
                    <div className={`mb-3 border-b pb-3 ${tc.divider}`}>
                      <div className="flex items-center gap-1.5 mb-1.5"><BarChart3 className={tc.metricLabel} size={12}/><span className={`text-[9px] font-bold uppercase tracking-wider ${isDarkMode?'text-slate-400':'text-slate-500'}`}>OTHER UNITS</span></div>
                      <div className="flex flex-wrap gap-1.5">
                        {otherSBUs.map((s,i) => (
                          <div key={i} className={`text-[9px] font-bold px-2 py-1 rounded border flex items-center gap-1.5 shadow-sm ${s.avg<8?(isDarkMode?'border-red-900/50 bg-red-950/30':'border-red-200 bg-red-50'):tc.sbuOtherBg}`}>
                            <span className={`max-w-[120px] truncate ${s.avg<8?'text-red-400':tc.sbuOtherBg.split(' ').find(c=>c.startsWith('text-'))}`} title={s.name}>{s.name}</span>
                            <div className={`h-3 w-px mx-0.5 ${tc.sbuOtherDivider}`}/>
                            <span className={`font-black ${s.avg>=8?'text-emerald-500':'text-red-500'}`}>{s.avg}</span>
                            <span className={isDarkMode?'text-slate-500':'text-slate-400'}>({s.completeness}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Pending */}
                  {zeroSBUs.length>0 && (
                    <div className={`mt-auto border border-dashed rounded-lg p-2 ${tc.sbuPendingWrap}`}>
                      <div className="flex items-center gap-1.5 mb-1.5"><Layers className={isDarkMode?'text-slate-500':'text-slate-400'} size={12}/><span className={`text-[9px] font-bold uppercase tracking-wider ${isDarkMode?'text-slate-400':'text-slate-500'}`}>NO EVALUATION YET (PENDING)</span></div>
                      <div className="flex flex-wrap gap-1.5">
                        {zeroSBUs.map((s,i) => (
                          <div key={i} className={`text-[8px] font-bold px-1.5 py-1 rounded border flex items-center gap-1 shadow-sm ${tc.sbuPendingChip}`}>
                            {s.name} <span className={`px-1 py-0.5 rounded-sm ${tc.sbuPendingNum}`}>{s.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        /* ─── DETAIL VIEW ──────────────────────────────────────────── */
        ) : activeTab==='detail' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className={`rounded-[2rem] border shadow-sm flex flex-col mb-10 overflow-visible ${tc.tableSection}`}>

              {/* Table header controls */}
              <div className={`flex flex-col md:flex-row border-b rounded-t-[2rem] overflow-visible ${tc.divider} ${isDarkMode?'bg-slate-900':'bg-white'}`}>
                <div className="flex overflow-x-auto no-scrollbar flex-1">
                  <button onClick={() => setTableView('scored')}
                    className={`px-8 py-5 text-xs font-bold uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${tableView==='scored' ? tc.tableTabActive('scored') : tc.tableTabInactive}`}>
                    Evaluated ({metrics.scored})
                  </button>
                  <button onClick={() => setTableView('unscored')}
                    className={`px-8 py-5 text-xs font-bold uppercase tracking-widest transition-all border-b-4 whitespace-nowrap ${tableView==='unscored' ? tc.tableTabActive('unscored') : tc.tableTabInactive}`}>
                    Pending Review ({metrics.pending})
                  </button>
                </div>

                <div className={`flex flex-wrap items-center px-4 py-3 md:py-0 border-t md:border-t-0 gap-3 z-10 w-full md:w-auto overflow-visible rounded-tr-[2rem] ${tc.divider} ${isDarkMode?'bg-slate-900':'bg-white'}`}>
                  <div className={`flex items-center gap-2 mr-2 border-r pr-4 overflow-visible ${tc.divider}`}>
                    <MultiSelectDropdown label="Score" tc={tc}
                      options={[{id:'all',label:'All Score'},{id:'pass',label:'Score ≥ 8'},{id:'refine',label:'Score < 8'}]}
                      selectedValues={scoreFilters} onToggle={id=>handleToggleFilter(id,scoreFilters,setScoreFilters)}/>
                    <MultiSelectDropdown label="Evaluator" tc={tc}
                      options={[{id:'all',label:'All Evaluators'},{id:'hrbp',label:'Has HRBP Score'},{id:'sme',label:'Has SME Score'},{id:'academy',label:'Has Academy Score'},{id:'all_completed',label:'All Roles Completed'}]}
                      selectedValues={evaluatorFilters} onToggle={id=>handleToggleFilter(id,evaluatorFilters,setEvaluatorFilters)}/>
                    <select value={sortOrder} onChange={e=>setSortOrder(e.target.value)}
                      className={`border text-[10px] font-bold uppercase rounded-lg px-2 py-2 outline-none focus:ring-2 focus:ring-blue-500 h-[34px] ${tc.ddSelectCls}`}>
                      <option value="none">Sort: Default</option>
                      <option value="highest">Highest Score</option>
                      <option value="lowest">Lowest Score</option>
                    </select>
                  </div>
                  <button onClick={()=>setShowDetails(!showDetails)} className={`text-[11px] font-bold flex items-center gap-2 uppercase tracking-widest transition-all px-4 py-2 rounded-xl ${tc.detailToggle(showDetails)}`}>
                    {showDetails?<EyeOff size={14}/>:<Eye size={14}/>} {showDetails?'Compact View':'Detail View'}
                  </button>
                  <button onClick={handleExportTable} className={`text-[11px] font-bold flex items-center gap-2 uppercase tracking-widest transition-all px-4 py-2 rounded-xl shadow-sm ${tc.exportBtn}`}>
                    <Download size={14}/> Export Data
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className={`overflow-x-auto overflow-y-auto w-full custom-scrollbar max-h-[65vh] relative rounded-b-[2rem] ${isDarkMode?'bg-slate-900':'bg-white'}`} style={{zIndex:1}}>
                <table className="w-full text-left border-collapse">
                  <thead className={`sticky top-0 z-20 shadow-sm ring-1 backdrop-blur-sm ${tc.tableHead}`}>
                    <tr className="text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-4 whitespace-nowrap">No</th>
                      <th className="px-6 py-4 min-w-[250px] w-1/3">Training Topic</th>
                      <th className="px-6 py-4 whitespace-nowrap">Group SBU</th>
                      <th className="px-6 py-4 whitespace-nowrap">HRBP Name</th>
                      <th className={`px-4 py-4 whitespace-nowrap text-center text-blue-500 ${isDarkMode?'bg-blue-900/20':'bg-blue-50'}`}>HRBP</th>
                      <th className={`px-4 py-4 whitespace-nowrap text-center text-blue-500 ${isDarkMode?'bg-blue-900/20':'bg-blue-50'}`}>SME</th>
                      <th className={`px-4 py-4 whitespace-nowrap text-center text-blue-500 border-r ${isDarkMode?'bg-blue-900/20 border-slate-800':'bg-blue-50 border-slate-200'}`}>ACD</th>
                      <th className={`px-6 py-4 whitespace-nowrap text-center ${isDarkMode?'bg-slate-800/50':'bg-slate-200/50'}`}>Score</th>
                      {showDetails && (<>
                        <th className={`px-4 py-4 whitespace-nowrap text-center border-l ${tc.tableBorder}`}>Theory</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Accuracy</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Relevance</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Practical</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Visual</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Evaluation</th>
                        <th className="px-4 py-4 whitespace-nowrap text-center">Q&A</th>
                      </>)}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${tc.tableBorder}`}>
                    {tableData.map((row,idx) => {
                      const link = resolveLink(row['Training Topic']);
                      return (
                        <tr key={idx} className={`transition-colors group ${idx%2===1?tc.tableRowAlt:''} ${tc.tableRowHover}`}>
                          <td className={`px-6 py-4 text-xs font-semibold whitespace-nowrap ${tc.tableCellMuted}`}>{row['NO']||'-'}</td>
                          <td className="px-6 py-4">
                            {link
                              ? <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline line-clamp-2 transition-colors" title={row['Training Topic']}>{row['Training Topic']||'-'}</a>
                              : <div className={`text-xs font-bold line-clamp-2 ${tc.tableCellMain}`} title={row['Training Topic']}>{row['Training Topic']||'-'}</div>
                            }
                          </td>
                          <td className={`px-6 py-4 text-xs font-semibold whitespace-nowrap ${tc.tableCellMuted}`}>{row['Group SBU/SFU']||'-'}</td>
                          <td className={`px-6 py-4 text-xs font-semibold whitespace-nowrap ${tc.tableCellMuted}`}>{getHrbp(row)||'-'}</td>
                          <td className="px-4 py-4 text-center">{row._hasHRBP?<CheckCircle2 size={16} className="text-blue-500 mx-auto"/>:<span className={tc.tableCellMuted}>-</span>}</td>
                          <td className="px-4 py-4 text-center">{row._hasSME?<CheckCircle2 size={16} className="text-blue-500 mx-auto"/>:<span className={tc.tableCellMuted}>-</span>}</td>
                          <td className={`px-4 py-4 text-center border-r ${tc.tableBorder}`}>{row._hasAcademy?<CheckCircle2 size={16} className="text-blue-500 mx-auto"/>:<span className={tc.tableCellMuted}>-</span>}</td>
                          <td className="px-6 py-4 text-center">
                            {row._TotalScore!==null
                              ? <span className={`inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm border ${row._TotalScore>=8?'bg-emerald-900/50 text-emerald-400 border-emerald-800':'bg-red-600 text-white border-red-700'}`}>{row._TotalScore}</span>
                              : <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border ${tc.pendingBadge}`}>Pending</span>
                            }
                          </td>
                          {showDetails && (<>
                            <td className={`px-4 py-4 text-xs text-center font-bold border-l ${tc.tableBorder} ${getSubScoreStyle(row._Theory)}`}>{row._Theory||'-'}</td>
                            <td className={`px-4 py-4 text-xs text-center font-bold ${getSubScoreStyle(row._Accuracy)}`}>{row._Accuracy||'-'}</td>
                            <td className={`px-4 py-4 text-xs text-center font-bold ${getSubScoreStyle(row._Relevance)}`}>{row._Relevance||'-'}</td>
                            <td className={`px-4 py-4 text-xs text-center font-bold ${getSubScoreStyle(row._Practical)}`}>{row._Practical||'-'}</td>
                            <td className={`px-4 py-4 text-xs text-center font-bold ${getSubScoreStyle(row._Visual)}`}>{row._Visual||'-'}</td>
                            <td className={`px-4 py-4 text-xs text-center font-bold ${getSubScoreStyle(row._Eval)}`}>{row._Eval||'-'}</td>
                            <td className={`px-4 py-4 text-xs text-center font-bold ${getSubScoreStyle(row._QA)}`}>{row._QA||'-'}</td>
                          </>)}
                        </tr>
                      );
                    })}
                    {tableData.length===0 && (
                      <tr><td colSpan={showDetails?15:8} className={`px-6 py-20 text-center ${isDarkMode?'bg-slate-900/50':'bg-white'}`}>
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className={`p-4 rounded-full shadow-sm border ${tc.noDataIcon}`}><AlertCircle size={32} className={tc.metricLabel}/></div>
                          <div>
                            <p className={`text-sm font-bold ${tc.noDataTitle}`}>No data found</p>
                            <p className={`text-xs font-semibold mt-1 ${tc.noDataSub}`}>Adjust the filter keywords above.</p>
                          </div>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

        /* ─── SOURCE DATA ──────────────────────────────────────────── */
        ) : (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`rounded-[2rem] border shadow-sm overflow-hidden ${tc.sourceCard}`}>
              {!isAuthorized ? (
                <div className={`p-12 flex flex-col items-center justify-center text-center py-24 ${tc.lockBg}`}>
                  <div className={`p-5 rounded-full mb-6 border shadow-inner ${tc.lockIcon}`}><Lock size={36} className={tc.metricLabel}/></div>
                  <h2 className={`text-xl font-black mb-2 tracking-tight ${tc.lockTitle}`}>Access Locked</h2>
                  <p className={`text-sm font-semibold mb-8 max-w-sm ${tc.lockSub}`}>Enter administration password to update raw data (TSV).</p>
                  <div className="flex w-full max-w-sm gap-3">
                    <div className="relative flex-1">
                      <input
                        type={showPassword?'text':'password'} value={passwordInput}
                        onChange={e=>setPasswordInput(e.target.value)}
                        onKeyDown={e=>{ if(e.key==='Enter'){ if(passwordInput==='MeratusAcademy') setIsAuthorized(true); else alert('Incorrect Password!'); }}}
                        placeholder="Enter Password..."
                        className={`w-full border px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10 shadow-sm ${tc.lockInput}`}
                      />
                      <button onClick={()=>setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${tc.lockEyeBtn}`}>
                        {showPassword?<EyeOff size={16}/>:<Eye size={16}/>}
                      </button>
                    </div>
                    <button onClick={()=>{ if(passwordInput==='MeratusAcademy') setIsAuthorized(true); else alert('Incorrect Password!'); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95">Unlock</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`px-8 py-6 border-b flex items-center justify-between ${tc.sourceHeader} ${tc.divider}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isDarkMode?'bg-indigo-900/50 text-indigo-400':'bg-indigo-50 text-indigo-600'}`}><FileSpreadsheet size={20}/></div>
                      <div>
                        <h2 className={`text-base font-bold ${tc.sourceLabel}`}>Data Source (TSV)</h2>
                        <p className={`text-xs font-semibold mt-0.5 ${tc.sourceSub}`}>Paste raw TSV data from spreadsheet here</p>
                      </div>
                    </div>
                    <button onClick={handleSaveToCloud} disabled={isSaving}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-70 active:scale-95 ${tc.saveBtn}`}>
                      {isSaving?<RefreshCw className="animate-spin" size={18}/>:<Save size={18}/>}
                      {isSaving?'Saving...':'Save & Update'}
                    </button>
                  </div>
                  <div className={`p-6 ${isDarkMode?'bg-slate-900':'bg-white'}`}>
                    <textarea value={rawData} onChange={e=>setRawData(e.target.value)}
                      className={`w-full h-[60vh] border shadow-inner rounded-xl p-4 text-[11px] font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none custom-scrollbar whitespace-pre ${tc.textareaBase}`}
                      spellCheck="false"/>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}} />
    </div>
  );
}