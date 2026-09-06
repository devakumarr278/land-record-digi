import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, CheckCircle2, AlertTriangle, BarChart3,
  GitCompare, FileSpreadsheet, Settings as SettingsIcon, LogOut,
  MapPin, Search, Bell, ChevronDown, ChevronRight, X, Download,
  Clock3, ShieldCheck, Flame, ExternalLink, Filter, ArrowUpRight,
  TrendingUp, TrendingDown, Users, Check, RefreshCw, Calendar,
  Building2, Eye, ShieldAlert, ArrowRight, Layers, FileCheck, CheckCircle,
  Sparkles
} from 'lucide-react';
import logoImg from '../../assets/logo.jpg';
import ConflictGraphView from '../Conflict/ConflictGraphView';
import ParcelVerificationCard from '../Parcel/ParcelVerificationCard';
import DiscrepancyIntelligenceView from '../DiscrepancyIntelligence/DiscrepancyIntelligenceView';
import '../DiscrepancyIntelligence/DiscrepancyIntelligence.css';

/* =========================================================================
   MOCK DATA (Matching disadmin.png & District Admin Ecosystem)
   ========================================================================= */

const DISTRICTS = [
  'Coimbatore District',
  'Tiruppur District',
  'Erode District',
  'Salem District',
  'Nilgiris District'
];

const INITIAL_ESCALATIONS = [
  {
    id: 'LND-2341',
    displayId: '#LND-2341',
    survey: '212/4',
    village: 'Mannarkkad',
    taluk: 'Mannarkkad',
    district: 'Coimbatore',
    conflict: 'Area Mismatch (2.10 Ac vs 1.85 Ac)',
    priority: 'High',
    status: 'Escalated',
    owner: 'K. Sundaram',
    date: '03 Sep 2026',
    time: '10:24 AM',
    tahsildar: 'S. Subramaniam',
    tahsildarNote: 'AI-extracted plot area (2.10 Ac) conflicts with the 1998 mutation record (1.85 Ac). Tahsildar recommends ground verification or district-level adjudication.',
    evidenceFile: 'mutation_register_1998.pdf',
    confidenceScore: 48
  },
  {
    id: 'LND-2339',
    displayId: '#LND-2339',
    survey: '88/1',
    village: 'Chittur',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    conflict: 'Ownership Dispute (Dual Registered Deeds)',
    priority: 'High',
    status: 'Escalated',
    owner: 'Lakshmi Devi / R. Murugan',
    date: '02 Sep 2026',
    time: '04:15 PM',
    tahsildar: 'M. Anand',
    tahsildarNote: 'Two competing claimants present registered sale deeds for the same khata number. Requires district-level legal review.',
    evidenceFile: 'deed_conflict_88_1.pdf',
    confidenceScore: 42
  },
  {
    id: 'LND-2335',
    displayId: '#LND-2335',
    survey: '118/3',
    village: 'Anaimalai',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    conflict: 'Duplicate Khasra Subdivision',
    priority: 'Normal',
    status: 'Escalated',
    owner: 'Ravi Kumar',
    date: '01 Sep 2026',
    time: '11:30 AM',
    tahsildar: 'K. Prakash',
    tahsildarNote: 'Same survey subdivision appears under two village revenue sheets following digital ingestion.',
    evidenceFile: 'cadastral_sheet_118_3.jpg',
    confidenceScore: 71
  },
  {
    id: 'LND-2331',
    displayId: '#LND-2331',
    survey: '54/2',
    village: 'Sulur',
    taluk: 'Sulur',
    district: 'Coimbatore',
    conflict: 'Boundary Overlap (0.30 Ac Variance)',
    priority: 'Normal',
    status: 'Escalated',
    owner: 'Meena R',
    date: '31 Aug 2026',
    time: '02:40 PM',
    tahsildar: 'S. Subramaniam',
    tahsildarNote: 'GIS Cadastral vector overlay indicates a 0.30 Acre polygon encroachment into adjacent village common pathway.',
    evidenceFile: 'fmb_sketch_54_2.pdf',
    confidenceScore: 66
  }
];

const INITIAL_RESOLVED = [
  {
    id: 'LND-2338',
    displayId: '#LND-2338',
    survey: '103/2',
    village: 'Pollachi',
    taluk: 'Pollachi',
    conflict: 'Area Variance Resolved',
    resolution: 'Corrected via GPS field re-survey · Plot confirmed at 1.75 Acres.',
    dateResolved: '03 Sep 2026',
    time: '09:41 AM',
    decidedBy: 'District Administrator',
    status: 'Resolved'
  },
  {
    id: 'LND-2320',
    displayId: '#LND-2320',
    survey: '45/1',
    village: 'Madukkarai',
    taluk: 'Sulur',
    conflict: 'Ownership Title Chain Verified',
    resolution: 'Approved sale deed mutation following Aadhaar biometric linkage.',
    dateResolved: '01 Sep 2026',
    time: '05:10 PM',
    decidedBy: 'District Administrator',
    status: 'Resolved'
  },
  {
    id: 'LND-2315',
    displayId: '#LND-2315',
    survey: '12/4',
    village: 'Kinathukadavu',
    taluk: 'Pollachi',
    conflict: 'Subdivision Split Finalized',
    resolution: 'Subdivided into 12/4A and 12/4B with sealed digital certificate.',
    dateResolved: '29 Aug 2026',
    time: '03:22 PM',
    decidedBy: 'District Administrator',
    status: 'Resolved'
  }
];

const TEHSIL_METRICS = [
  { name: 'Pollachi', processed: 4520, total: 5200, errorRate: 3.2, completion: 86, pending: 2, status: 'On Track' },
  { name: 'Sulur', processed: 3840, total: 4900, errorRate: 4.1, completion: 78, pending: 1, status: 'On Track' },
  { name: 'Mannarkkad', processed: 2150, total: 3800, errorRate: 7.8, completion: 56, pending: 1, status: 'Attention Needed' },
  { name: 'Anaimalai', processed: 1980, total: 2900, errorRate: 3.9, completion: 68, pending: 0, status: 'On Track' },
  { name: 'Coimbatore North', processed: 6120, total: 7200, errorRate: 2.8, completion: 85, pending: 0, status: 'On Track' },
  { name: 'Coimbatore South', processed: 5400, total: 6800, errorRate: 3.4, completion: 79, pending: 0, status: 'On Track' },
];

const CASE_TREND_DATA = [
  { month: 'Jan', escalated: 5, resolved: 4 },
  { month: 'Feb', escalated: 7, resolved: 3 },
  { month: 'Mar', escalated: 8, resolved: 6 },
  { month: 'Apr', escalated: 11, resolved: 8 },
  { month: 'May', escalated: 10, resolved: 13 },
  { month: 'Jun', escalated: 7, resolved: 10 },
  { month: 'Jul', escalated: 6, resolved: 5 },
  { month: 'Aug', escalated: 8, resolved: 6 },
  { month: 'Sep', escalated: 7, resolved: 5 },
];

const RECENT_ACTIVITIES = [
  { id: 1, text: 'Case #LND-2341 escalated', time: '10:24 AM', type: 'escalated', color: '#f87171' },
  { id: 2, text: 'Case #LND-2338 resolved', time: '09:41 AM', type: 'resolved', color: '#34d399' },
  { id: 3, text: 'New discrepancy detected', time: '08:15 AM', type: 'discrepancy', color: '#fbbf24' },
  { id: 4, text: 'Report generated', time: '07:50 AM', type: 'report', color: '#60a5fa' },
];

/* =========================================================================
   MAIN COMPONENT: DistrictAdministratorDashboard
   ========================================================================= */

export default function DistrictAdministratorDashboard({
  userName = 'District Administrator',
  onLogout = () => {},
  addToast = () => {},
  initialParcelId = null
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedParcelId, setSelectedParcelId] = useState(initialParcelId);
  const [selectedDistrict, setSelectedDistrict] = useState('Coimbatore District');
  const [districtMenuOpen, setDistrictMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [escalations, setEscalations] = useState(INITIAL_ESCALATIONS);
  const [resolved, setResolved] = useState(INITIAL_RESOLVED);
  const [reviewCase, setReviewCase] = useState(null);
  const [adjudicateNote, setAdjudicateNote] = useState('');

  // Load Google Fonts
  useEffect(() => {
    if (document.getElementById('dis-dash-fonts')) return;
    const link = document.createElement('link');
    link.id = 'dis-dash-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  // Action Handlers
  function handleResolveCase(decisionType) {
    if (!reviewCase) return;
    const caseId = reviewCase.id;

    if (decisionType === 'approve') {
      const newResolvedItem = {
        id: reviewCase.id,
        displayId: reviewCase.displayId,
        survey: reviewCase.survey,
        village: reviewCase.village,
        taluk: reviewCase.taluk,
        conflict: reviewCase.conflict,
        resolution: adjudicateNote || 'Approved and overwritten in master state digital land ledger.',
        dateResolved: '03 Sep 2026',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        decidedBy: userName,
        status: 'Resolved'
      };
      setResolved([newResolvedItem, ...resolved]);
      setEscalations(escalations.filter(e => e.id !== caseId));
      addToast(`Case ${caseId} approved and committed to master ledger.`, 'success');
    } else if (decisionType === 'court') {
      setEscalations(escalations.filter(e => e.id !== caseId));
      addToast(`Case ${caseId} referred to District Revenue Adjudication Tribunal.`, 'info');
    } else if (decisionType === 'sendback') {
      setEscalations(escalations.filter(e => e.id !== caseId));
      addToast(`Case ${caseId} returned to Tahsildar with instructions.`, 'error');
    }

    setReviewCase(null);
    setAdjudicateNote('');
  }

  function handleExportReport(period = 'September 2026') {
    const rows = [
      ['District Administration Compliance Report', period],
      ['Platform', 'NilOra Cadastral Registry'],
      ['District', selectedDistrict],
      ['Generated By', userName],
      ['Date', new Date().toLocaleString('en-IN')],
      [],
      ['Case ID', 'Survey', 'Village', 'Taluk', 'Conflict Type', 'Priority', 'Status'],
      ...escalations.map(e => [e.displayId, e.survey, e.village, e.taluk, e.conflict, e.priority, e.status]),
      ...resolved.map(r => [r.displayId, r.survey, r.village, r.taluk, r.conflict, 'Resolved', r.resolution]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nilora-district-report-${selectedDistrict.replace(/\s+/g, '-').toLowerCase()}-${period.replace(/\s+/g, '-').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Exported monthly report for ${selectedDistrict}.`, 'success');
  }

  // Filtered escalations if searching
  const filteredEscalations = escalations.filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.displayId.toLowerCase().includes(q) ||
      e.survey.toLowerCase().includes(q) ||
      e.village.toLowerCase().includes(q) ||
      e.owner.toLowerCase().includes(q) ||
      e.conflict.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dis-root">
      <style>{DISTRICT_ADMIN_STYLES}</style>

      {/* =====================================================================
          SIDEBAR NAVIGATION (Exact match to disadmin.png)
          ===================================================================== */}
      <aside className="dis-sidebar">
        <div className="dis-sidebar-top">
          {/* Brand Logo & Header */}
          <div className="dis-brand" onClick={() => setActiveTab('dashboard')}>
            <div className="dis-brand-logo-wrap">
              <img src={logoImg} alt="NilOra" className="dis-logo-img" />
            </div>
            <div className="dis-brand-text-col">
              <span className="dis-brand-title">NilOra</span>
              <span className="dis-brand-sub">LAND RECORDS AT ORIGIN</span>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="dis-nav">
            {/* MAIN */}
            <div className="dis-nav-group">
              <span className="dis-nav-label">MAIN</span>
              <button
                className={`dis-nav-item ${activeTab === 'dashboard' && !selectedParcelId ? 'active' : ''}`}
                onClick={() => { setActiveTab('dashboard'); setSelectedParcelId(null); }}
              >
                <LayoutDashboard size={17} />
                <span>Dashboard</span>
              </button>
              <button
                className={`dis-nav-item ${activeTab === 'discrepancy_intelligence' && !selectedParcelId ? 'active' : ''}`}
                onClick={() => { setActiveTab('discrepancy_intelligence'); setSelectedParcelId(null); }}
              >
                <Sparkles size={17} className="text-emerald" />
                <span>Discrepancy Intelligence</span>
                <span className="dis-item-badge green font-bold">AI</span>
              </button>
              <button
                className={`dis-nav-item ${activeTab === 'conflicts' && !selectedParcelId ? 'active' : ''}`}
                onClick={() => { setActiveTab('conflicts'); setSelectedParcelId(null); }}
              >
                <AlertTriangle size={17} />
                <span>Conflict Graph</span>
                <span className="dis-item-badge red">3</span>
              </button>
            </div>

            {/* CASES */}
            <div className="dis-nav-group">
              <span className="dis-nav-label">CASES</span>
              <button
                className={`dis-nav-item ${activeTab === 'escalated' && !selectedParcelId ? 'active' : ''}`}
                onClick={() => { setActiveTab('escalated'); setSelectedParcelId(null); }}
              >
                <FileText size={17} />
                <span>Escalated to Me</span>
                {escalations.length > 0 && <span className="dis-item-badge red">{escalations.length}</span>}
              </button>
              <button
                className={`dis-nav-item ${activeTab === 'resolved' && !selectedParcelId ? 'active' : ''}`}
                onClick={() => { setActiveTab('resolved'); setSelectedParcelId(null); }}
              >
                <CheckCircle2 size={17} />
                <span>Resolved Disputes</span>
                <span className="dis-item-badge green">{resolved.length}</span>
              </button>
              <button
                className={`dis-nav-item ${activeTab === 'highpriority' && !selectedParcelId ? 'active' : ''}`}
                onClick={() => { setActiveTab('highpriority'); setSelectedParcelId(null); }}
              >
                <AlertTriangle size={17} />
                <span>High-Priority</span>
                <span className="dis-item-badge amber">2</span>
              </button>
            </div>

            {/* ANALYTICS */}
            <div className="dis-nav-group">
              <span className="dis-nav-label">ANALYTICS</span>
              <button
                className={`dis-nav-item ${activeTab === 'progress' && !selectedParcelId ? 'active' : ''}`}
                onClick={() => { setActiveTab('progress'); setSelectedParcelId(null); }}
              >
                <BarChart3 size={17} />
                <span>District Progress</span>
              </button>
              <button
                className={`dis-nav-item ${activeTab === 'comparison' && !selectedParcelId ? 'active' : ''}`}
                onClick={() => { setActiveTab('comparison'); setSelectedParcelId(null); }}
              >
                <GitCompare size={17} />
                <span>Tehsil Comparison</span>
              </button>
              <button
                className={`dis-nav-item ${activeTab === 'errors' && !selectedParcelId ? 'active' : ''}`}
                onClick={() => { setActiveTab('errors'); setSelectedParcelId(null); }}
              >
                <Clock3 size={17} />
                <span>Error Stats</span>
              </button>
            </div>

            {/* REPORTS */}
            <div className="dis-nav-group">
              <span className="dis-nav-label">REPORTS</span>
              <button
                className={`dis-nav-item ${activeTab === 'reports' && !selectedParcelId ? 'active' : ''}`}
                onClick={() => { setActiveTab('reports'); setSelectedParcelId(null); }}
              >
                <FileSpreadsheet size={17} />
                <span>Generate Reports</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Bottom Links */}
        <div className="dis-sidebar-bottom">
          <button
            className={`dis-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={17} />
            <span>Settings</span>
          </button>
          <button className="dis-nav-item" onClick={onLogout}>
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =====================================================================
          MAIN BODY STAGE
          ===================================================================== */}
      <div className="dis-main-wrapper">
        {/* Top Header Bar */}
        <header className="dis-header">
          {/* Breadcrumbs / Jurisdiction Switcher */}
          <div className="dis-breadcrumb-wrap">
            <span className="dis-bc-root">
              <MapPin size={14} className="text-emerald" /> District Admin
            </span>
            <span className="dis-bc-sep">›</span>
            <div className="dis-dist-selector">
              <button
                className="dis-dist-btn"
                onClick={() => setDistrictMenuOpen(!districtMenuOpen)}
              >
                <MapPin size={14} className="text-emerald" />
                <b>{selectedDistrict}</b>
                <ChevronDown size={14} />
              </button>

              {districtMenuOpen && (
                <div className="dis-dist-dropdown">
                  {DISTRICTS.map(d => (
                    <button
                      key={d}
                      className={`dis-dist-item ${selectedDistrict === d ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedDistrict(d);
                        setDistrictMenuOpen(false);
                        addToast(`Switched view to ${d}`, 'info');
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: Search, Notifications, Profile */}
          <div className="dis-header-right">
            {/* Search Pill */}
            <div className="dis-search-pill">
              <Search size={15} className="text-muted" />
              <input
                type="text"
                placeholder="Search cases, survey number, tehsils..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Notification Bell */}
            <div className="dis-notif-wrap">
              <button
                className="dis-icon-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                title="Notifications"
              >
                <Bell size={18} />
                <span className="dis-bell-dot" />
              </button>

              {notifOpen && (
                <div className="dis-dropdown dis-notif-dd">
                  <div className="dis-dd-head">
                    <b>District Notifications</b>
                    <span className="dis-pill-sm">2 New</span>
                  </div>
                  <div className="dis-notif-list">
                    <div className="dis-notif-item">
                      <div className="notif-t">Case #LND-2341 Escalated</div>
                      <div className="notif-s">Area mismatch in Mannarkkad awaiting district review.</div>
                      <div className="notif-tm">10:24 AM</div>
                    </div>
                    <div className="dis-notif-item">
                      <div className="notif-t">Monthly Digitization Target</div>
                      <div className="notif-s">Coimbatore District reached 65% Q4 completion.</div>
                      <div className="notif-tm">08:15 AM</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="dis-profile-wrap">
              <button
                className="dis-user-pill"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="dis-avatar">D</div>
                <span className="dis-user-name">{userName}</span>
                <ChevronDown size={14} className="text-muted" />
              </button>

              {profileOpen && (
                <div className="dis-dropdown dis-profile-dd">
                  <div className="dis-dd-user">
                    <b>{userName}</b>
                    <span>District Collectorate · Revenue</span>
                  </div>
                  <div className="dis-dd-divider" />
                  <button className="dis-dd-item" onClick={() => { setActiveTab('progress'); setProfileOpen(false); }}>
                    <BarChart3 size={14} /> District Progress
                  </button>
                  <button className="dis-dd-item" onClick={() => { setActiveTab('reports'); setProfileOpen(false); }}>
                    <FileSpreadsheet size={14} /> Statutory Reports
                  </button>
                  <button className="dis-dd-item" onClick={() => { setActiveTab('settings'); setProfileOpen(false); }}>
                    <SettingsIcon size={14} /> District Settings
                  </button>
                  <div className="dis-dd-divider" />
                  <button className="dis-dd-item danger" onClick={onLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ===================================================================
            PARCEL INVESTIGATION WORKSPACE (STEPS 2 - 5)
            =================================================================== */}
        {selectedParcelId && (
          <main className="dis-content-stage">
            <ParcelVerificationCard
              parcelId={selectedParcelId}
              onBack={() => setSelectedParcelId(null)}
              addToast={addToast}
            />
          </main>
        )}

        {/* ===================================================================
            DISCREPANCY INTELLIGENCE ENGINE SUITE
            =================================================================== */}
        {!selectedParcelId && activeTab === 'discrepancy_intelligence' && (
          <main className="dis-content-stage">
            <DiscrepancyIntelligenceView
              onNavigateToParcel={(id) => setSelectedParcelId(id)}
              addToast={addToast}
            />
          </main>
        )}

        {/* ===================================================================
            CONFLICT GRAPH & REAL MAP VIEW
            =================================================================== */}
        {!selectedParcelId && activeTab === 'conflicts' && (
          <main className="dis-content-stage">
            <ConflictGraphView onSelectParcel={(id) => setSelectedParcelId(id)} />
          </main>
        )}

        {/* ===================================================================
            TAB 1: MAIN DASHBOARD VIEW (EXACT ORIGINAL DASHBOARD)
            =================================================================== */}
        {!selectedParcelId && activeTab === 'dashboard' && (
          <main className="dis-content-stage">
            {/* Hero Row: Welcome Back + Date Card */}
            <div className="dis-hero-row">
              <div className="dis-hero-left">
                <h1 className="dis-title">
                  Welcome Back,<br />
                  <span className="dis-title-name">District Administrator</span> <span className="dis-sun-icon">☀️</span>
                </h1>
                <p className="dis-subtitle">
                  Here's today's district digitization and dispute activity.
                </p>
              </div>

              {/* Date Box on Right */}
              <div className="dis-date-card">
                <div className="dis-calendar-icon">
                  <Calendar size={22} className="text-emerald" />
                </div>
                <div className="dis-date-text">
                  <span className="dis-day">Wednesday</span>
                  <b className="dis-date-num">03 Sep 2026</b>
                </div>
              </div>
            </div>

            {/* 5 KPI Cards Row */}
            <div className="dis-kpi-grid">
              {/* 1. Pending Escalations */}
              <div className="dis-kpi-card" onClick={() => setActiveTab('escalated')}>
                <div className="kpi-top-row">
                  <div className="kpi-icon-box bg-mint">
                    <FileText size={20} className="text-emerald" />
                  </div>
                  <div className="kpi-trend-tag tag-peach">
                    <span>↑ 33%</span>
                  </div>
                </div>
                <div className="kpi-body">
                  <div className="kpi-metric-num">{escalations.length}</div>
                  <div className="kpi-metric-title">Pending Escalations</div>
                  <div className="kpi-metric-sub">Cases awaiting action</div>
                </div>
                <div className="kpi-wave-tint peach-tint" />
              </div>

              {/* 2. Avg. Resolution Time */}
              <div className="dis-kpi-card">
                <div className="kpi-top-row">
                  <div className="kpi-icon-box bg-sky">
                    <Clock3 size={20} className="text-sky" />
                  </div>
                  <div className="kpi-trend-tag tag-green">
                    <span>↓ 18%</span>
                  </div>
                </div>
                <div className="kpi-body">
                  <div className="kpi-metric-num">2.4 days</div>
                  <div className="kpi-metric-title">Avg. Resolution Time</div>
                  <div className="kpi-metric-sub">Faster than last month</div>
                </div>
                <div className="kpi-wave-tint sky-tint" />
              </div>

              {/* 3. High-Priority Cases */}
              <div className="dis-kpi-card" onClick={() => setActiveTab('highpriority')}>
                <div className="kpi-top-row">
                  <div className="kpi-icon-box bg-amber">
                    <AlertTriangle size={20} className="text-amber" />
                  </div>
                  <div className="kpi-trend-tag tag-gray">
                    <span>→ 0%</span>
                  </div>
                </div>
                <div className="kpi-body">
                  <div className="kpi-metric-num">2</div>
                  <div className="kpi-metric-title">High-Priority Cases</div>
                  <div className="kpi-metric-sub">Requires immediate attention</div>
                </div>
                <div className="kpi-wave-tint amber-tint" />
              </div>

              {/* 4. Overall Accuracy */}
              <div className="dis-kpi-card">
                <div className="kpi-top-row">
                  <div className="kpi-icon-box bg-mint">
                    <CheckCircle2 size={20} className="text-emerald" />
                  </div>
                  <div className="kpi-trend-tag tag-green">
                    <span>↑ 5%</span>
                  </div>
                </div>
                <div className="kpi-body">
                  <div className="kpi-metric-num">94%</div>
                  <div className="kpi-metric-title">Overall Accuracy</div>
                  <div className="kpi-metric-sub">Digitization accuracy rate</div>
                </div>
                <div className="kpi-wave-tint mint-tint" />
              </div>

              {/* 5. District Completion */}
              <div className="dis-kpi-card" onClick={() => setActiveTab('progress')}>
                <div className="kpi-top-row">
                  <div className="kpi-icon-box bg-purple">
                    <BarChart3 size={20} className="text-purple" />
                  </div>
                  <div className="kpi-trend-tag tag-green">
                    <span>↑ 12%</span>
                  </div>
                </div>
                <div className="kpi-body">
                  <div className="kpi-metric-num">65%</div>
                  <div className="kpi-metric-title">District Completion</div>
                  <div className="kpi-progress-bar">
                    <div className="kpi-progress-fill" style={{ width: '65%' }} />
                  </div>
                  <div className="kpi-metric-sub">On track for Q4 target</div>
                </div>
              </div>
            </div>


            {/* Middle Section: Escalation Pipeline & Quick Actions */}
            <div className="dis-middle-grid">
              {/* 1. Escalation Pipeline */}
              <div className="dis-card dis-pipeline-card">
                <div className="dis-card-head">
                  <div className="dis-card-head-left">
                    <Building2 size={20} className="text-emerald" />
                    <div>
                      <h3 className="dis-card-title">Escalation Pipeline</h3>
                      <p className="dis-card-subtitle">Live status of cases in your district</p>
                    </div>
                  </div>
                  <button className="dis-link-action" onClick={() => setActiveTab('escalated')}>
                    View All Cases <ChevronRight size={15} />
                  </button>
                </div>

                <div className="dis-pipeline-flow">
                  {/* Step 1: Escalated */}
                  <div className="pipe-box pipe-red" onClick={() => setActiveTab('escalated')}>
                    <FileText size={22} className="pipe-icon text-red" />
                    <div className="pipe-val">{escalations.length}</div>
                    <div className="pipe-lbl">ESCALATED</div>
                  </div>

                  <ChevronRight size={18} className="pipe-arrow" />

                  {/* Step 2: Under Review */}
                  <div className="pipe-box pipe-blue">
                    <Clock3 size={22} className="pipe-icon text-blue" />
                    <div className="pipe-val">0</div>
                    <div className="pipe-lbl">UNDER REVIEW</div>
                  </div>

                  <ChevronRight size={18} className="pipe-arrow" />

                  {/* Step 3: High-Priority */}
                  <div className="pipe-box pipe-amber" onClick={() => setActiveTab('highpriority')}>
                    <AlertTriangle size={22} className="pipe-icon text-amber" />
                    <div className="pipe-val">2</div>
                    <div className="pipe-lbl">HIGH-PRIORITY</div>
                  </div>

                  <ChevronRight size={18} className="pipe-arrow" />

                  {/* Step 4: Resolved */}
                  <div className="pipe-box pipe-green" onClick={() => setActiveTab('resolved')}>
                    <CheckCircle2 size={22} className="pipe-icon text-emerald" />
                    <div className="pipe-val">{resolved.length}</div>
                    <div className="pipe-lbl">RESOLVED</div>
                  </div>
                </div>
              </div>

              {/* 2. Quick Actions */}
              <div className="dis-card dis-actions-card">
                <div className="dis-card-head">
                  <div className="dis-card-head-left">
                    <Users size={20} className="text-emerald" />
                    <div>
                      <h3 className="dis-card-title">Quick Actions</h3>
                      <p className="dis-card-subtitle">Common tasks for district administration</p>
                    </div>
                  </div>
                </div>

                <div className="dis-actions-list">
                  <div
                    className="dis-action-row"
                    onClick={() => {
                      if (escalations[0]) setReviewCase(escalations[0]);
                      else addToast('No pending escalations right now.', 'info');
                    }}
                  >
                    <div className="action-row-left">
                      <FileCheck size={18} className="text-emerald" />
                      <span>Review Next Escalation</span>
                    </div>
                    <ChevronRight size={16} className="text-muted" />
                  </div>

                  <div className="dis-action-row" onClick={() => setActiveTab('progress')}>
                    <div className="action-row-left">
                      <BarChart3 size={18} className="text-emerald" />
                      <span>View District Analytics</span>
                    </div>
                    <ChevronRight size={16} className="text-muted" />
                  </div>

                  <div className="dis-action-row" onClick={() => handleExportReport('September 2026')}>
                    <div className="action-row-left">
                      <Download size={18} className="text-emerald" />
                      <span>Export Monthly Report</span>
                    </div>
                    <ChevronRight size={16} className="text-muted" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Grid: Case Trend + Distribution Donut + Recent Activity */}
            <div className="dis-bottom-grid">
              {/* 1. Case Trend (Bar Chart) */}
              <div className="dis-card dis-trend-card">
                <div className="dis-card-head">
                  <div className="dis-card-head-left">
                    <BarChart3 size={18} className="text-emerald" />
                    <div>
                      <h3 className="dis-card-title">Case Trend</h3>
                      <p className="dis-card-subtitle">Monthly escalation vs. resolution trend</p>
                    </div>
                  </div>
                  <div className="dis-chart-legend">
                    <span className="legend-dot dot-coral" /> <span>Escalated</span>
                    <span className="legend-dot dot-teal" /> <span>Resolved</span>
                  </div>
                </div>

                {/* SVG Trend Chart */}
                <div className="dis-chart-container">
                  <div className="chart-y-axis">
                    <span>15</span>
                    <span>10</span>
                    <span>5</span>
                    <span>0</span>
                  </div>
                  <div className="chart-bars-wrap">
                    {CASE_TREND_DATA.map(d => (
                      <div key={d.month} className="chart-col">
                        <div className="bars-pair">
                          <div
                            className="bar bar-coral"
                            style={{ height: `${(d.escalated / 15) * 100}%` }}
                            title={`${d.month} Escalated: ${d.escalated}`}
                          />
                          <div
                            className="bar bar-teal"
                            style={{ height: `${(d.resolved / 15) * 100}%` }}
                            title={`${d.month} Resolved: ${d.resolved}`}
                          />
                        </div>
                        <span className="col-month">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Case Status Distribution (Donut Chart) */}
              <div className="dis-card dis-donut-card">
                <div className="dis-card-head">
                  <div className="dis-card-head-left">
                    <Clock3 size={18} className="text-emerald" />
                    <div>
                      <h3 className="dis-card-title">Case Status Distribution</h3>
                    </div>
                  </div>
                </div>

                <div className="dis-donut-layout">
                  {/* SVG Donut */}
                  <div className="donut-wrap">
                    <svg viewBox="0 0 120 120" className="donut-svg">
                      {/* Circumference = 2 * PI * 40 = 251.3 */}
                      {/* Resolved 34% (stroke-dasharray: 85.4 251.3) */}
                      <circle cx="60" cy="60" r="40" fill="transparent" stroke="#34d399" strokeWidth="18" strokeDasharray="85.4 251.3" strokeDashoffset="0" />
                      {/* High-Priority 22% (stroke-dasharray: 55.3 251.3) */}
                      <circle cx="60" cy="60" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="18" strokeDasharray="55.3 251.3" strokeDashoffset="-85.4" />
                      {/* Escalated 44% (stroke-dasharray: 110.6 251.3) */}
                      <circle cx="60" cy="60" r="40" fill="transparent" stroke="#f87171" strokeWidth="18" strokeDasharray="110.6 251.3" strokeDashoffset="-140.7" />
                    </svg>
                    <div className="donut-center-text">
                      <b className="donut-total">9</b>
                      <span className="donut-sub">Total Cases</span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="donut-legend-list">
                    <div className="donut-row">
                      <div className="d-left"><span className="legend-dot dot-coral" /> Escalated</div>
                      <div className="d-right"><b>4</b> <span>44%</span></div>
                    </div>
                    <div className="donut-row">
                      <div className="d-left"><span className="legend-dot dot-sky" /> Under Review</div>
                      <div className="d-right"><b>0</b> <span>0%</span></div>
                    </div>
                    <div className="donut-row">
                      <div className="d-left"><span className="legend-dot dot-amber" /> High-Priority</div>
                      <div className="d-right"><b>2</b> <span>22%</span></div>
                    </div>
                    <div className="donut-row">
                      <div className="d-left"><span className="legend-dot dot-teal" /> Resolved</div>
                      <div className="d-right"><b>3</b> <span>34%</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Recent Activity */}
              <div className="dis-card dis-recent-card">
                <div className="dis-card-head">
                  <div className="dis-card-head-left">
                    <Clock3 size={18} className="text-emerald" />
                    <div>
                      <h3 className="dis-card-title">Recent Activity</h3>
                    </div>
                  </div>
                  <button className="dis-link-action" onClick={() => setActiveTab('escalated')}>
                    View All <ChevronRight size={15} />
                  </button>
                </div>

                <div className="dis-recent-list">
                  {RECENT_ACTIVITIES.map(act => (
                    <div key={act.id} className="dis-recent-row">
                      <div className="recent-left">
                        <span className="recent-dot" style={{ backgroundColor: act.color }} />
                        <span className="recent-text">{act.text}</span>
                      </div>
                      <span className="recent-time">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ===================================================================
            SUB-VIEW: ESCALATED TO ME / HIGH-PRIORITY
            =================================================================== */}
        {(activeTab === 'escalated' || activeTab === 'highpriority') && (
          <main className="dis-content-stage">
            <div className="dis-card" style={{ padding: '24px' }}>
              <div className="dis-card-head" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 className="dis-card-title" style={{ fontSize: '20px' }}>
                    {activeTab === 'highpriority' ? 'High-Priority Escalation Cases' : 'Escalated Cases Awaiting District Adjudication'}
                  </h2>
                  <p className="dis-card-subtitle">
                    Legal and spatial discrepancies forwarded by Tahsildars for District Collectorate resolution.
                  </p>
                </div>
                <button className="dis-btn-back" onClick={() => setActiveTab('dashboard')}>
                  ← Back to Dashboard
                </button>
              </div>

              <div className="dis-table-wrap">
                <table className="dis-table">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Survey No.</th>
                      <th>Village & Taluk</th>
                      <th>Conflict Type</th>
                      <th>Registered Owner</th>
                      <th>Priority</th>
                      <th>Forwarded By</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === 'highpriority' ? escalations.filter(e => e.priority === 'High') : filteredEscalations).map(c => (
                      <tr key={c.id}>
                        <td><b className="dis-mono-tag">{c.displayId}</b></td>
                        <td><b>{c.survey}</b></td>
                        <td>{c.village}, {c.taluk}</td>
                        <td><span className="dis-conflict-tag">{c.conflict}</span></td>
                        <td>{c.owner}</td>
                        <td>
                          <span className={`dis-prio-badge ${c.priority.toLowerCase()}`}>
                            {c.priority}
                          </span>
                        </td>
                        <td>Tahsildar ({c.tahsildar})</td>
                        <td>
                          <button className="dis-btn-sm-primary" onClick={() => setReviewCase(c)}>
                            <Eye size={13} /> Review Case
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* ===================================================================
            SUB-VIEW: RESOLVED DISPUTES
            =================================================================== */}
        {activeTab === 'resolved' && (
          <main className="dis-content-stage">
            <div className="dis-card" style={{ padding: '24px' }}>
              <div className="dis-card-head" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 className="dis-card-title" style={{ fontSize: '20px' }}>Resolved Dispute Archive</h2>
                  <p className="dis-card-subtitle">Completed adjudications with digital seals and legally certified orders.</p>
                </div>
                <button className="dis-btn-back" onClick={() => setActiveTab('dashboard')}>
                  ← Back to Dashboard
                </button>
              </div>

              <div className="dis-table-wrap">
                <table className="dis-table">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Survey No.</th>
                      <th>Village & Taluk</th>
                      <th>Conflict Resolved</th>
                      <th>Resolution Order</th>
                      <th>Resolved Date</th>
                      <th>Adjudicator</th>
                      <th>Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolved.map(r => (
                      <tr key={r.id}>
                        <td><b className="dis-mono-tag">{r.displayId}</b></td>
                        <td><b>{r.survey}</b></td>
                        <td>{r.village}, {r.taluk}</td>
                        <td><span className="dis-conflict-tag">{r.conflict}</span></td>
                        <td><span style={{ fontSize: 12.5, color: '#065f46' }}>{r.resolution}</span></td>
                        <td>{r.dateResolved}</td>
                        <td><b>{r.decidedBy}</b></td>
                        <td>
                          <button className="dis-btn-sm-outline" onClick={() => addToast(`Downloaded legal order for ${r.displayId}`, 'success')}>
                            <Download size={13} /> Order PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* ===================================================================
            SUB-VIEW: DISTRICT PROGRESS & TEHSIL COMPARISON
            =================================================================== */}
        {(activeTab === 'progress' || activeTab === 'comparison') && (
          <main className="dis-content-stage">
            <div className="dis-card" style={{ padding: '24px' }}>
              <div className="dis-card-head" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 className="dis-card-title" style={{ fontSize: '20px' }}>
                    {selectedDistrict} · Tehsil Progress & Throughput Matrix
                  </h2>
                  <p className="dis-card-subtitle">Cadastral digitization velocity, field verification accuracy, and error rates by Tehsil.</p>
                </div>
                <button className="dis-btn-back" onClick={() => setActiveTab('dashboard')}>
                  ← Back to Dashboard
                </button>
              </div>

              <div className="dis-tehsil-grid">
                {TEHSIL_METRICS.map(t => (
                  <div key={t.name} className="dis-tehsil-card">
                    <div className="tehsil-head">
                      <b>{t.name} Taluk</b>
                      <span className={`tehsil-status-pill ${t.completion > 70 ? 'good' : 'warn'}`}>{t.status}</span>
                    </div>
                    <div className="tehsil-nums">
                      <div className="t-num-box">
                        <span className="t-lbl">Digitized Records</span>
                        <b className="t-val">{t.processed.toLocaleString('en-IN')} / {t.total.toLocaleString('en-IN')}</b>
                      </div>
                      <div className="t-num-box">
                        <span className="t-lbl">Error Rate</span>
                        <b className={`t-val ${t.errorRate > 5 ? 'text-red' : 'text-emerald'}`}>{t.errorRate}%</b>
                      </div>
                    </div>
                    <div className="tehsil-bar-wrap">
                      <div className="t-bar-label">
                        <span>Completion Rate</span>
                        <b>{t.completion}%</b>
                      </div>
                      <div className="t-track">
                        <div className="t-fill" style={{ width: `${t.completion}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* ===================================================================
            SUB-VIEW: ERROR STATS
            =================================================================== */}
        {activeTab === 'errors' && (
          <main className="dis-content-stage">
            <div className="dis-card" style={{ padding: '24px' }}>
              <div className="dis-card-head" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 className="dis-card-title" style={{ fontSize: '20px' }}>AI Discrepancy & Validation Error Analytics</h2>
                  <p className="dis-card-subtitle">Categorized breakdown of optical character recognition and boundary reconciliation flags.</p>
                </div>
                <button className="dis-btn-back" onClick={() => setActiveTab('dashboard')}>
                  ← Back to Dashboard
                </button>
              </div>

              <div className="dis-errors-grid">
                {[
                  { category: 'Area Extent Variance', count: 18, pct: '38%', tone: 'red', desc: 'Conflict between historical Tamil revenue chitta and current survey table.' },
                  { category: 'Competing Ownership Deeds', count: 9, pct: '19%', tone: 'amber', desc: 'Multiple claimants with unregistered or conflicting sale deeds.' },
                  { category: 'Duplicate Khasra / Survey Subdivisions', count: 8, pct: '17%', tone: 'blue', desc: 'Survey numbering overlap during partition subdivision split.' },
                  { category: 'Village Boundary Polygon Encroachment', count: 7, pct: '15%', tone: 'purple', desc: 'Vector parcel vertices intersect adjoining village common pathways.' },
                  { category: 'Degraded / Illegible Historic Scans', count: 5, pct: '11%', tone: 'gray', desc: 'Old 1980s paper scans requiring manual high-resolution re-scanning.' },
                ].map(err => (
                  <div key={err.category} className="dis-error-card">
                    <div className="err-head">
                      <b>{err.category}</b>
                      <span className={`err-badge badge-${err.tone}`}>{err.count} Cases ({err.pct})</span>
                    </div>
                    <p className="err-desc">{err.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* ===================================================================
            SUB-VIEW: GENERATE REPORTS
            =================================================================== */}
        {activeTab === 'reports' && (
          <main className="dis-content-stage">
            <div className="dis-card" style={{ padding: '24px' }}>
              <div className="dis-card-head" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 className="dis-card-title" style={{ fontSize: '20px' }}>District Statutory Compliance Reports</h2>
                  <p className="dis-card-subtitle">Export official certified reports for State Nodal Agency & Ministry statutory review.</p>
                </div>
                <button className="dis-btn-back" onClick={() => setActiveTab('dashboard')}>
                  ← Back to Dashboard
                </button>
              </div>

              <div className="dis-reports-list">
                {[
                  { title: 'September 2026 Monthly Digitization & Dispute Resolution Report', period: 'September 2026', size: '2.8 MB', cases: 9, status: 'Ready' },
                  { title: 'August 2026 Monthly Digitization & Dispute Resolution Report', period: 'August 2026', size: '3.4 MB', cases: 14, status: 'Ready' },
                  { title: 'Q2 2026 Comprehensive District Land Modernization Audit', period: 'Q2 2026', size: '5.1 MB', cases: 38, status: 'Ready' },
                  { title: 'Q1 2026 Comprehensive District Land Modernization Audit', period: 'Q1 2026', size: '4.8 MB', cases: 41, status: 'Ready' },
                ].map(rep => (
                  <div key={rep.title} className="dis-report-row">
                    <div className="rep-left">
                      <FileSpreadsheet size={24} className="text-emerald" />
                      <div>
                        <b>{rep.title}</b>
                        <div className="rep-meta">Period: {rep.period} · {rep.cases} Cases Logged · Size: {rep.size}</div>
                      </div>
                    </div>
                    <button className="dis-btn-sm-primary" onClick={() => handleExportReport(rep.period)}>
                      <Download size={14} /> Download CSV
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* ===================================================================
            SUB-VIEW: SETTINGS
            =================================================================== */}
        {activeTab === 'settings' && (
          <main className="dis-content-stage">
            <div className="dis-card" style={{ padding: '24px', maxWidth: '720px' }}>
              <div className="dis-card-head" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 className="dis-card-title" style={{ fontSize: '20px' }}>District Administrator Preferences</h2>
                  <p className="dis-card-subtitle">Authority profile and automated escalation threshold settings.</p>
                </div>
                <button className="dis-btn-back" onClick={() => setActiveTab('dashboard')}>
                  ← Back to Dashboard
                </button>
              </div>

              <div className="dis-form">
                <div className="form-group">
                  <label>Official Name</label>
                  <input type="text" defaultValue={userName} />
                </div>
                <div className="form-group">
                  <label>Primary Jurisdiction</label>
                  <input type="text" defaultValue="Coimbatore District Collectorate, Tamil Nadu" disabled />
                </div>
                <div className="form-group">
                  <label>AI Variance Auto-Escalation Threshold</label>
                  <select defaultValue="0.25">
                    <option value="0.10">Area Variance &gt; 0.10 Acres</option>
                    <option value="0.25">Area Variance &gt; 0.25 Acres (Standard)</option>
                    <option value="0.50">Area Variance &gt; 0.50 Acres</option>
                  </select>
                </div>
                <button className="dis-btn-primary" onClick={() => addToast('Settings saved successfully.', 'success')}>
                  Save Preferences
                </button>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* =====================================================================
          CASE REVIEW & ADJUDICATION MODAL
          ===================================================================== */}
      {reviewCase && (
        <div className="dis-modal-overlay" onClick={() => setReviewCase(null)}>
          <div className="dis-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="dis-modal-head">
              <div>
                <span className="dis-modal-tag">DISTRICT REVENUE ADJUDICATION</span>
                <h3 className="dis-modal-title">Review Case {reviewCase.displayId} · Survey {reviewCase.survey}</h3>
                <p className="dis-modal-subtitle">{reviewCase.village}, {reviewCase.taluk} ({reviewCase.district})</p>
              </div>
              <button className="dis-modal-close" onClick={() => setReviewCase(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="dis-modal-body">
              {/* Conflict Detail Box */}
              <div className="dis-modal-box">
                <div className="box-title text-red">
                  <AlertTriangle size={16} /> Discrepancy Description
                </div>
                <div className="dis-kv-grid">
                  <div><b>Registered Owner:</b> {reviewCase.owner}</div>
                  <div><b>Survey Number:</b> {reviewCase.survey}</div>
                  <div><b>Priority Level:</b> <span className={`dis-prio-badge ${reviewCase.priority.toLowerCase()}`}>{reviewCase.priority}</span></div>
                  <div><b>Forwarded Date:</b> {reviewCase.date} ({reviewCase.time})</div>
                </div>
                <div className="box-note-alert">
                  <b>Conflict Summary:</b> {reviewCase.conflict}
                </div>
              </div>

              {/* Tahsildar Report */}
              <div className="dis-modal-box">
                <div className="box-title text-emerald">
                  <ShieldCheck size={16} /> Tahsildar Field Report
                </div>
                <p className="tahsildar-report-text">
                  "{reviewCase.tahsildarNote}"
                </p>
                <div className="tahsildar-sign">
                  <b>Reporting Officer:</b> Tahsildar {reviewCase.tahsildar} · Verified on {reviewCase.date}
                </div>
              </div>

              {/* Collector Order Input */}
              <div className="dis-modal-box">
                <label className="box-title">
                  <b>Adjudication Order & Statutory Remarks:</b>
                </label>
                <textarea
                  className="dis-modal-textarea"
                  rows={3}
                  placeholder="Enter official revenue order remarks..."
                  value={adjudicateNote}
                  onChange={e => setAdjudicateNote(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="dis-modal-footer">
              <button
                className="dis-btn-danger"
                onClick={() => handleResolveCase('sendback')}
              >
                Send Back to Tahsildar
              </button>
              <button
                className="dis-btn-warning"
                onClick={() => handleResolveCase('court')}
              >
                Refer to Civil Tribunal
              </button>
              <button
                className="dis-btn-success"
                onClick={() => handleResolveCase('approve')}
              >
                <Check size={15} /> Approve &amp; Seal Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   STYLES: Exact Pixel-Perfect Match to disadmin.png
   ========================================================================= */

const DISTRICT_ADMIN_STYLES = `
.dis-root {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  background: #f0f7f3;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #0c281a;
  overflow-x: hidden;
}

.dis-root * {
  box-sizing: border-box;
}

/* =========================================================================
   SIDEBAR (Rich Mint Green Background with Crisp Border)
   ========================================================================= */
.dis-sidebar {
  width: 236px;
  background: #c5ebd7;
  background: linear-gradient(180deg, #c5ebd7 0%, #b2dfc8 100%);
  border-right: 1.5px solid #7bc69e;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 22px 14px 24px;
  flex: none;
  z-index: 20;
  box-shadow: 4px 0 16px rgba(5, 150, 105, 0.08);
}

.dis-sidebar-top {
  display: flex;
  flex-direction: column;
}

.dis-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 24px;
  cursor: pointer;
  user-select: none;
}

.dis-brand-logo-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #ffffff;
  border: 1.5px solid #7bc69e;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.15);
}

.dis-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.dis-brand-text-col {
  display: flex;
  flex-direction: column;
}

.dis-brand-title {
  font-size: 20px;
  font-weight: 800;
  color: #0c281a;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.dis-brand-sub {
  font-size: 8.5px;
  font-weight: 800;
  color: #059669;
  letter-spacing: 0.08em;
  margin-top: 2px;
}

/* Nav Groups */
.dis-nav {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dis-nav-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dis-nav-label {
  font-size: 10.5px;
  font-weight: 800;
  color: #20563b;
  letter-spacing: 0.06em;
  padding: 0 12px 4px;
}

.dis-nav-item {
  width: 100%;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 14px;
  border-radius: 9999px;
  border: 1px solid transparent;
  background: transparent;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: #1b452f;
  cursor: pointer;
  transition: all 0.16s ease;
  text-align: left;
}

.dis-nav-item:hover {
  background: rgba(255, 255, 255, 0.75);
  color: #047857;
}

.dis-nav-item.active {
  background: #094e32;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(9, 78, 50, 0.32);
}

.dis-item-badge {
  margin-left: auto;
  font-size: 11px;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 99px;
}

.dis-item-badge.red { background: #fee2e2; color: #dc2626; }
.dis-item-badge.green { background: #d1fae5; color: #047857; }
.dis-item-badge.amber { background: #fef3c7; color: #b45309; }

.dis-sidebar-bottom {
  border-top: 1px solid #7bc69e;
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* =========================================================================
   HEADER & TOP BAR
   ========================================================================= */
.dis-main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
}

.dis-header {
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(163, 222, 192, 0.4);
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1000 !important;
}

.dis-breadcrumb-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
}

.dis-bc-root {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4b5563;
  font-weight: 600;
}

.dis-bc-sep {
  color: #9ca3af;
}

.dis-dist-selector {
  position: relative;
}

.dis-dist-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 13.5px;
  color: #0c281a;
  padding: 4px 6px;
  border-radius: 6px;
}

.dis-dist-btn:hover {
  background: #f0fdf4;
}

.dis-dist-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 200px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 6px;
  z-index: 50000 !important;
}

.dis-dist-item {
  width: 100%;
  padding: 8px 10px;
  text-align: left;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
}

.dis-dist-item:hover, .dis-dist-item.active {
  background: #f0fdf4;
  color: #059669;
}

.dis-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dis-search-pill {
  width: 320px;
  height: 38px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
}

.dis-search-pill input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 12.5px;
  font-family: inherit;
  width: 100%;
  color: #111827;
}

.dis-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  cursor: pointer;
  position: relative;
}

.dis-bell-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  border: 1.5px solid #ffffff;
}

.dis-user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
}

.dis-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0c5838;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dis-user-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #111827;
}

.dis-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  padding: 12px;
  z-index: 50000 !important;
}

.dis-profile-dd { width: 220px; }
.dis-notif-dd { width: 300px; }

.dis-dd-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 10px;
}

.dis-pill-sm {
  font-size: 11px;
  font-weight: 700;
  background: #fee2e2;
  color: #dc2626;
  padding: 2px 6px;
  border-radius: 4px;
}

.dis-notif-item {
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.notif-t { font-size: 12.5px; font-weight: 700; color: #111827; }
.notif-s { font-size: 11.5px; color: #4b6354; margin: 2px 0; }
.notif-tm { font-size: 10.5px; color: #9ca3af; }

.dis-dd-user { display: flex; flex-direction: column; padding: 4px; }
.dis-dd-user b { font-size: 13.5px; color: #111827; }
.dis-dd-user span { font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px; }
.dis-dd-divider { height: 1px; background: #f3f4f6; margin: 8px 0; }

.dis-dd-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
}

.dis-dd-item:hover { background: #f0fdf4; color: #059669; }
.dis-dd-item.danger:hover { background: #fef2f2; color: #dc2626; }

/* =========================================================================
   STAGE CONTENT
   ========================================================================= */
.dis-content-stage {
  padding: 28px 36px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Hero Title Row */
.dis-hero-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.dis-title {
  font-size: 26px;
  font-weight: 800;
  color: #0c281a;
  margin: 0;
  line-height: 1.25;
}

.dis-title-name {
  color: #0c5838;
}

.dis-sun-icon {
  font-size: 24px;
}

.dis-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: #4b6354;
  margin: 4px 0 0;
}

.dis-date-card {
  background: #ffffff;
  border: 1px solid rgba(163, 222, 192, 0.6);
  padding: 8px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.dis-date-text {
  display: flex;
  flex-direction: column;
}

.dis-day {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.dis-date-num {
  font-size: 13.5px;
  color: #0c281a;
  font-weight: 800;
}

/* =========================================================================
   5 KPI CARDS GRID
   ========================================================================= */
.dis-kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.dis-kpi-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(163, 222, 192, 0.45);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.18s ease;
}

.dis-kpi-card:hover {
  transform: translateY(-2px);
  border-color: #059669;
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.08);
}

.kpi-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.kpi-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-mint { background: #dcfce7; }
.bg-sky { background: #e0f2fe; }
.bg-amber { background: #fef3c7; }
.bg-purple { background: #f3e8ff; }

.text-emerald { color: #059669; }
.text-sky { color: #0284c7; }
.text-amber { color: #d97706; }
.text-purple { color: #7e22ce; }
.text-red { color: #dc2626; }
.text-blue { color: #0284c7; }
.text-muted { color: #6b7280; }

.kpi-trend-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 99px;
}

.tag-peach { background: #ffe4e6; color: #e11d48; }
.tag-green { background: #dcfce7; color: #166534; }
.tag-gray { background: #f3f4f6; color: #4b5563; }

.kpi-body {
  display: flex;
  flex-direction: column;
}

.kpi-metric-num {
  font-size: 26px;
  font-weight: 800;
  color: #0c281a;
  line-height: 1.1;
}

.kpi-metric-title {
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
  margin-top: 4px;
}

.kpi-metric-sub {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

.kpi-progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 99px;
  margin: 6px 0 2px;
  overflow: hidden;
}

.kpi-progress-fill {
  height: 100%;
  background: #0c5838;
  border-radius: 99px;
}

/* Background Wave Tints */
.kpi-wave-tint {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 24px;
  pointer-events: none;
  opacity: 0.6;
}

.peach-tint { background: radial-gradient(circle at 90% 100%, #ffe4e6 0%, transparent 70%); }
.sky-tint { background: radial-gradient(circle at 90% 100%, #e0f2fe 0%, transparent 70%); }
.amber-tint { background: radial-gradient(circle at 90% 100%, #fef3c7 0%, transparent 70%); }
.mint-tint { background: radial-gradient(circle at 90% 100%, #dcfce7 0%, transparent 70%); }

/* =========================================================================
   MIDDLE SECTION
   ========================================================================= */
.dis-middle-grid {
  display: grid;
  grid-template-columns: 1.7fr 1.3fr;
  gap: 18px;
}

.dis-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(163, 222, 192, 0.45);
  padding: 20px 22px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
}

.dis-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.dis-card-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dis-card-title {
  font-size: 15.5px;
  font-weight: 800;
  color: #0c281a;
  margin: 0;
}

.dis-card-subtitle {
  font-size: 11.5px;
  color: #6b7280;
  margin: 2px 0 0;
}

.dis-link-action {
  background: transparent;
  border: none;
  color: #059669;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dis-link-action:hover {
  text-decoration: underline;
}

/* Escalation Pipeline Flow */
.dis-pipeline-flow {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pipe-box {
  flex: 1;
  border-radius: 12px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.18s ease;
  border: 1.5px solid transparent;
}

.pipe-box:hover {
  transform: translateY(-2px);
}

.pipe-red { background: #fff1f2; border-color: #fecdd3; }
.pipe-blue { background: #f0f9ff; border-color: #bae6fd; }
.pipe-amber { background: #fffbeb; border-color: #fde68a; }
.pipe-green { background: #f0fdf4; border-color: #bbf7d0; }

.pipe-val {
  font-size: 22px;
  font-weight: 800;
  color: #0c281a;
  margin: 6px 0 2px;
}

.pipe-lbl {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #4b6354;
}

.pipe-arrow {
  color: #9ca3af;
  flex: none;
}

/* Quick Actions */
.dis-actions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dis-action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dis-action-row:hover {
  background: #f0fdf4;
  border-color: #a3dec0;
}

.action-row-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  font-weight: 700;
  color: #1f2937;
}

/* =========================================================================
   BOTTOM GRID: 3 VISUAL ANALYTICS CARDS
   ========================================================================= */
.dis-bottom-grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr 1fr;
  gap: 18px;
}

/* Chart Card */
.dis-chart-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11.5px;
  color: #6b7280;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot-coral { background: #f87171; }
.dot-teal { background: #34d399; }
.dot-sky { background: #38bdf8; }
.dot-amber { background: #fbbf24; }

.dis-chart-container {
  display: flex;
  gap: 12px;
  height: 150px;
  padding-top: 10px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 10.5px;
  color: #9ca3af;
  font-family: 'IBM Plex Mono', monospace;
  padding-bottom: 20px;
}

.chart-bars-wrap {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 4px;
}

.chart-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: 100%;
  justify-content: flex-end;
}

.bars-pair {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 120px;
}

.bar {
  width: 8px;
  border-radius: 3px 3px 0 0;
  transition: height 0.4s ease;
}

.bar-coral { background: #f87171; }
.bar-teal { background: #34d399; }

.col-month {
  font-size: 10.5px;
  color: #6b7280;
  font-weight: 600;
}

/* Donut Layout */
.dis-donut-layout {
  display: flex;
  align-items: center;
  gap: 18px;
}

.donut-wrap {
  position: relative;
  width: 110px;
  height: 110px;
  flex: none;
}

.donut-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-center-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-total {
  font-size: 18px;
  color: #0c281a;
  line-height: 1;
}

.donut-sub {
  font-size: 9.5px;
  color: #6b7280;
  margin-top: 2px;
}

.donut-legend-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.donut-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.d-left {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4b5563;
}

.d-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.d-right b { color: #111827; }
.d-right span { color: #9ca3af; font-size: 11px; }

/* Recent Activity */
.dis-recent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dis-recent-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 12.5px;
}

.dis-recent-row:last-child {
  border-bottom: none;
}

.recent-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1f2937;
  font-weight: 600;
}

.recent-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

.recent-time {
  font-size: 11px;
  color: #9ca3af;
  font-family: 'IBM Plex Mono', monospace;
}

/* =========================================================================
   TABLES & SUB-VIEWS
   ========================================================================= */
.dis-table-wrap {
  overflow-x: auto;
}

.dis-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.dis-table th {
  text-align: left;
  padding: 10px 12px;
  background: #f8faf9;
  border-bottom: 2px solid #e5e7eb;
  font-size: 11.5px;
  font-weight: 800;
  color: #4b6354;
  text-transform: uppercase;
}

.dis-table td {
  padding: 12px 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #1f2937;
}

.dis-mono-tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  background: #f0fdf4;
  color: #047857;
  padding: 2px 6px;
  border-radius: 4px;
}

.dis-conflict-tag {
  font-size: 12px;
  font-weight: 600;
  color: #b45309;
  background: #fef3c7;
  padding: 2px 8px;
  border-radius: 4px;
}

.dis-prio-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 99px;
}

.dis-prio-badge.high { background: #fee2e2; color: #dc2626; }
.dis-prio-badge.normal { background: #f3f4f6; color: #4b5563; }

.dis-btn-sm-primary {
  background: #0c5838;
  color: #ffffff;
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.dis-btn-sm-primary:hover {
  background: #047857;
}

.dis-btn-sm-outline {
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.dis-btn-back {
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
}

/* Tehsil Cards */
.dis-tehsil-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.dis-tehsil-card {
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}

.tehsil-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tehsil-status-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 99px;
}

.tehsil-status-pill.good { background: #dcfce7; color: #166534; }
.tehsil-status-pill.warn { background: #fee2e2; color: #991b1b; }

.tehsil-nums {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.t-lbl { font-size: 11px; color: #6b7280; display: block; }
.t-val { font-size: 14px; font-weight: 800; color: #111827; }

.t-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #4b6354;
  margin-bottom: 4px;
}

.t-track {
  height: 6px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}

.t-fill {
  height: 100%;
  background: #0c5838;
  border-radius: 99px;
}

/* Error Stats Grid */
.dis-errors-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.dis-error-card {
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}

.err-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.err-badge {
  font-size: 11.5px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
}

.badge-red { background: #fee2e2; color: #dc2626; }
.badge-amber { background: #fef3c7; color: #b45309; }
.badge-blue { background: #e0f2fe; color: #0284c7; }
.badge-purple { background: #f3e8ff; color: #7e22ce; }
.badge-gray { background: #f3f4f6; color: #4b5563; }

.err-desc {
  font-size: 12px;
  color: #4b6354;
  margin: 0;
  line-height: 1.4;
}

/* Reports */
.dis-reports-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dis-report-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.rep-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.rep-meta {
  font-size: 12px;
  color: #6b7280;
  margin-top: 3px;
}

/* Form Settings */
.dis-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12.5px;
  font-weight: 700;
  color: #374151;
}

.form-group input, .form-group select {
  padding: 9px 12px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 13.5px;
  outline: none;
}

.dis-btn-primary {
  background: #0c5838;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-start;
}

/* =========================================================================
   CASE REVIEW MODAL
   ========================================================================= */
.dis-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 24, 13, 0.75);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000 !important;
  padding: 20px;
}

.dis-modal-dialog {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}

.dis-modal-head {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #f8faf9;
  border-bottom: 1px solid #f3f4f6;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.dis-modal-tag {
  font-size: 11px;
  font-weight: 800;
  color: #059669;
  letter-spacing: 0.06em;
}

.dis-modal-title {
  font-size: 18px;
  font-weight: 800;
  color: #0c281a;
  margin: 3px 0 0;
}

.dis-modal-subtitle {
  font-size: 12.5px;
  color: #4b6354;
  margin: 3px 0 0;
}

.dis-modal-close {
  background: #f3f4f6;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.dis-modal-body {
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dis-modal-box {
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
}

.box-title {
  font-size: 12.5px;
  font-weight: 800;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dis-kv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 10px;
}

.box-note-alert {
  background: #fee2e2;
  border: 1px solid #fecdd3;
  color: #991b1b;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.tahsildar-report-text {
  font-size: 13px;
  color: #1f2937;
  font-style: italic;
  margin: 0 0 8px;
  line-height: 1.45;
}

.tahsildar-sign {
  font-size: 11.5px;
  color: #4b6354;
}

.dis-modal-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  resize: vertical;
}

.dis-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
  background: #f8faf9;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
}

.dis-btn-danger {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecdd3;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.dis-btn-warning {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.dis-btn-success {
  background: #0c5838;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .dis-kpi-grid { grid-template-columns: repeat(3, 1fr); }
  .dis-bottom-grid { grid-template-columns: 1fr; }
  .dis-middle-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .dis-root { flex-direction: column; }
  .dis-sidebar { width: 100%; }
  .dis-kpi-grid { grid-template-columns: 1fr; }
}
`;
