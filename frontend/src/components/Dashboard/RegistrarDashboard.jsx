import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, FolderOpen, AlertTriangle, History, ScrollText,
  BarChart3, Settings as SettingsIcon, LogOut, Search, Bell, ChevronRight,
  ChevronDown, CheckCircle2, Eye, MapPin, X, ZoomIn, ZoomOut, Crosshair,
  Calendar, Check, XCircle, Download, FileCheck, Layers, ArrowRight,
  ShieldCheck, Shield, Clock, ExternalLink, User
} from 'lucide-react';
import auditbg from '../../assets/auditbg.png';
import satelliteMap from '../../assets/satellite_parcel_map.jpg';
import logoImg from '../../assets/logo.jpg';
import RealCadastralMap from '../Common/RealCadastralMap';

/* =========================================================================
   MOCK DATA FOR REGISTRAR / TAHSILDAR
   ========================================================================= */

const INITIAL_RECORDS = [
  { id: 'LR-1021', survey: '125/2', village: 'Kinathukadavu', taluk: 'Pollachi', district: 'Coimbatore', score: '43%', scoreNum: 43, issue: 'Flagged', owner: 'Ravi Kumar', area: '2.50 Acres', operator: 'Anand P', scanFile: '/cadastral_map_125_2.jpg' },
  { id: 'LR-1014', survey: '118/3', village: 'Anaimalai', taluk: 'Pollachi', district: 'Coimbatore', score: '98%', scoreNum: 98, issue: 'Clear', owner: 'Meena R', area: '1.20 Acres', operator: 'Deepa N', scanFile: '/cadastral_map_118_3.jpg' },
  { id: 'LR-1009', survey: '54/2', village: 'Sulur', taluk: 'Sulur', district: 'Coimbatore', score: '99%', scoreNum: 99, issue: 'Clear', owner: 'Deepa N', area: '3.10 Acres', operator: 'Anand P', scanFile: '/cadastral_map_125_2.jpg' },
  { id: 'LR-1017', survey: '77/1', village: 'Madukkarai', taluk: 'Sulur', district: 'Coimbatore', score: '94%', scoreNum: 94, issue: 'Flagged', owner: 'Karthik S', area: '0.80 Acres', operator: 'Deepa N', scanFile: '/cadastral_map_118_3.jpg' },
  { id: 'LR-1033', survey: '92/4', village: 'Kinathukadavu', taluk: 'Pollachi', district: 'Coimbatore', score: '91%', scoreNum: 91, issue: 'Clear', owner: 'Sundaram K', area: '1.75 Acres', operator: 'Anand P', scanFile: '/cadastral_map_125_2.jpg' },
];

const RECENT_ACTIVITIES = [
  { t: '10:42 AM', action: 'Area change approved', doc: 'LR-1021', tone: 'green' },
  { t: '10:18 AM', action: 'New scan uploaded', doc: 'LR-1014', tone: 'blue' },
  { t: '09:54 AM', action: 'Case reassigned', doc: 'LR-1009', tone: 'green' },
  { t: '09:22 AM', action: 'Ownership transfer rejected', doc: 'LR-1017', tone: 'red' },
];

const DISCREPANCIES = [
  { id: 'DC-204', survey: '125/2', text: 'Recorded area in Survey table conflicts with 2008 mutation record (2.50 vs 2.10 Acres).', level: 'High', record: 'LR-1021' },
  { id: 'DC-205', survey: '77/1', text: 'Owner name spelling differs from state Aadhaar-linked revenue record.', level: 'Medium', record: 'LR-1017' },
  { id: 'DC-206', survey: '31/6', text: 'Village boundary classification code mismatch.', level: 'Low', record: 'LR-1002' },
];

/* =========================================================================
   REGISTRAR / TAHSILDAR DASHBOARD COMPONENT
   ========================================================================= */

export default function RegistrarDashboard({ userName = 'Tahsildar', onLogout = () => {}, addToast = () => {} }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [activities, setActivities] = useState(RECENT_ACTIVITIES);
  const [discrepanciesList, setDiscrepanciesList] = useState(DISCREPANCIES);
  const [reviewDoc, setReviewDoc] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [approvedCount, setApprovedCount] = useState(6);

  // Load fonts
  useEffect(() => {
    if (document.getElementById('reg-dash-fonts')) return;
    const link = document.createElement('link');
    link.id = 'reg-dash-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  // Handlers
  function handleApprove(doc) {
    setRecords(records.filter(r => r.id !== doc.id));
    setApprovedCount(c => c + 1);
    const newAct = {
      t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: `Approved record ${doc.id} (Survey ${doc.survey})`,
      doc: doc.id,
      tone: 'green'
    };
    setActivities([newAct, ...activities]);
    setReviewDoc(null);
    addToast(`${doc.id} approved and entered into the master land ledger.`, 'success');
  }

  function handleRejectSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const reason = fd.get('reason') || 'Returned for boundary verification';
    if (!rejectDialog) return;

    setRecords(records.filter(r => r.id !== rejectDialog.id));
    const newAct = {
      t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: `Returned ${rejectDialog.id} to operator (${reason})`,
      doc: rejectDialog.id,
      tone: 'red'
    };
    setActivities([newAct, ...activities]);
    setRejectDialog(null);
    setReviewDoc(null);
    addToast(`${rejectDialog.id} returned to operator with feedback.`, 'error');
  }

  function handleResolveDiscrepancy(id) {
    setDiscrepanciesList(discrepanciesList.filter(d => d.id !== id));
    addToast(`Discrepancy ${id} marked resolved.`, 'success');
  }

  return (
    <div className="reg-root">
      <style>{REGISTRAR_STYLES}</style>

      {/* =====================================================================
          SIDEBAR NAVIGATION
          ===================================================================== */}
      <aside className="reg-sidebar">
        <div className="reg-sidebar-top">
          {/* Brand Logo */}
          <div className="reg-brand" onClick={() => setActiveTab('dashboard')}>
            <div className="reg-brand-mark">
              <img src={logoImg} alt="NilOra" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
            <span className="reg-brand-text">NilOra</span>
          </div>

          {/* Navigation Items */}
          <nav className="reg-nav-list">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'pending', label: 'Pending', icon: FileText },
              { id: 'records', label: 'Land Records', icon: FolderOpen },
              { id: 'discrepancy', label: 'Discrepancy', icon: AlertTriangle },
              { id: 'history', label: 'History', icon: History },
              { id: 'audit', label: 'Audit', icon: ScrollText },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`reg-nav-item ${active ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Tagline & Footer */}
        <div className="reg-sidebar-bottom">
          <div className="reg-stat-pill">
            <span className="stat-dot" />
            <span>Ledger Sync: 100% Intact</span>
          </div>
          <div className="reg-user-badge">
            <b>{userName}</b>
            <span>Tahsildar / Sub-Registrar</span>
          </div>
          <div className="reg-copyright">
            © 2026 NilOra<br />
            Government of Tamil Nadu
          </div>
        </div>
      </aside>

      {/* =====================================================================
          MAIN LAYOUT
          ===================================================================== */}
      <div className="reg-main">
        {/* Top Header */}
        <header className="reg-header">
          <div className="reg-header-title">
            Tehsildar / Sub-Registrar
          </div>

          <form className="reg-search-bar" onSubmit={e => { e.preventDefault(); setActiveTab('records'); }}>
            <Search size={16} className="reg-search-icon" />
            <input
              type="text"
              placeholder="Search records, survey no., owner name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="reg-header-right">
            {/* Notification Bell */}
            <button
              className="reg-icon-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              title="Notifications"
            >
              <Bell size={18} />
              <span className="reg-notif-dot" />
            </button>

            {/* Profile Dropdown */}
            <div className="reg-profile-wrap">
              <button className="reg-user-pill" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="reg-avatar">T</div>
                <span className="reg-username">{userName}</span>
                <ChevronDown size={14} className="reg-chevron" />
              </button>

              {profileOpen && (
                <div className="reg-profile-dropdown">
                  <div className="reg-dd-user">
                    <b>{userName}</b>
                    <span>Authorized Registration Officer</span>
                  </div>
                  <div className="reg-dd-divider" />
                  <button className="reg-dd-item" onClick={() => { setActiveTab('records'); setProfileOpen(false); }}>
                    <FolderOpen size={14} /> Land Registry
                  </button>
                  <button className="reg-dd-item" onClick={() => { setActiveTab('audit'); setProfileOpen(false); }}>
                    <ScrollText size={14} /> Audit Trail
                  </button>
                  <button className="reg-dd-item" onClick={() => { setActiveTab('settings'); setProfileOpen(false); }}>
                    <SettingsIcon size={14} /> Settings
                  </button>
                  <div className="reg-dd-divider" />
                  <button className="reg-dd-item danger" onClick={onLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="reg-content">
            {/* Hero Title & Date Row */}
            <div className="reg-hero-row">
              <div className="reg-greeting">
                <h1 className="reg-title">Welcome Back, {userName}</h1>
                <p className="reg-subtitle">Records awaiting your verification.</p>
              </div>

              <div className="reg-date-box">
                <div className="date-pill">
                  <Calendar size={15} className="text-emerald" />
                  <b>Tue, 03 Sep 2026</b>
                </div>
                <span className="date-sub">Keep records accurate. Build trust.</span>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="reg-kpi-grid">
              {/* 1. Pending */}
              <div className="reg-kpi-card" onClick={() => setActiveTab('pending')}>
                <div className="kpi-icon-wrap bg-green-soft">
                  <FileText size={22} className="text-green" />
                </div>
                <div className="kpi-center">
                  <div className="kpi-value">{records.length}</div>
                  <div className="kpi-label">Pending</div>
                </div>
                <ChevronRight size={18} className="kpi-chevron text-green" />
              </div>

              {/* 2. Reviewed This Week */}
              <div className="reg-kpi-card" onClick={() => setActiveTab('records')}>
                <div className="kpi-icon-wrap bg-blue-soft">
                  <Eye size={22} className="text-blue" />
                </div>
                <div className="kpi-center">
                  <div className="kpi-value">18</div>
                  <div className="kpi-label">Reviewed This Week</div>
                </div>
                <ChevronRight size={18} className="kpi-chevron text-blue" />
              </div>

              {/* 3. Approved (All Time) */}
              <div className="reg-kpi-card" onClick={() => setActiveTab('records')}>
                <div className="kpi-icon-wrap bg-emerald-soft">
                  <CheckCircle2 size={22} className="text-emerald" />
                </div>
                <div className="kpi-center">
                  <div className="kpi-value">{approvedCount}</div>
                  <div className="kpi-label">Approved (All Time)</div>
                </div>
                <ChevronRight size={18} className="kpi-chevron text-emerald" />
              </div>

              {/* 4. Flagged Issues */}
              <div className="reg-kpi-card" onClick={() => setActiveTab('discrepancy')}>
                <div className="kpi-icon-wrap bg-red-soft">
                  <AlertTriangle size={22} className="text-red" />
                </div>
                <div className="kpi-center">
                  <div className="kpi-value">{discrepanciesList.length}</div>
                  <div className="kpi-label">Flagged Issues</div>
                </div>
                <ChevronRight size={18} className="kpi-chevron text-red" />
              </div>
            </div>

            {/* Middle Section: Recent Records vs. Land Parcel View */}
            <div className="reg-middle-grid">
              {/* Recent Records Table Card */}
              <div className="reg-card">
                <div className="reg-card-header">
                  <h3 className="reg-card-title">Recent Records</h3>
                  <button className="reg-link-btn" onClick={() => setActiveTab('pending')}>
                    View All →
                  </button>
                </div>

                <div className="reg-table-wrap">
                  <table className="reg-table">
                    <thead>
                      <tr>
                        <th>Record</th>
                        <th>Survey</th>
                        <th>Village</th>
                        <th>AI Score</th>
                        <th>Issue</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.slice(0, 4).map(r => (
                        <tr key={r.id}>
                          <td><b>{r.id}</b></td>
                          <td className="mono">{r.survey}</td>
                          <td>{r.village}</td>
                          <td>
                            <span className={`ai-score ${r.scoreNum < 70 ? 'low' : 'high'}`}>
                              {r.score}
                            </span>
                          </td>
                          <td>
                            <span className={`issue-pill ${r.issue.toLowerCase()}`}>
                              {r.issue}
                            </span>
                          </td>
                          <td>
                            <button className="btn-review" onClick={() => setReviewDoc(r)}>
                              Review →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Land Parcel View (Real Interactive Satellite Cadastral Map) */}
              <div className="reg-card reg-map-card-wrapper" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="reg-card-header" style={{ padding: '16px 18px 12px 18px' }}>
                  <h3 className="reg-card-title">Land Parcel View</h3>
                  <button className="reg-link-btn" onClick={() => {
                    setReviewDoc(records[0]);
                  }}>
                    View Details →
                  </button>
                </div>

                <div className="reg-map-viewport" style={{ flex: 1, minHeight: 250, position: 'relative' }}>
                  <RealCadastralMap
                    selectedId={records[0]?.id || 'LR-1021'}
                    onSelectParcel={(id) => {
                      const rec = records.find(r => r.id === id) || INITIAL_RECORDS.find(r => r.id === id);
                      if (rec) setReviewDoc(rec);
                    }}
                    height="100%"
                  />
                </div>
              </div>

            </div>

            {/* Bottom Section: Recent Activity */}
            <div className="reg-card">
              <div className="reg-card-header">
                <h3 className="reg-card-title">Recent Activity</h3>
                <button className="reg-link-btn" onClick={() => setActiveTab('audit')}>
                  View All →
                </button>
              </div>

              <div className="reg-timeline-list">
                {activities.slice(0, 4).map((a, i) => (
                  <div key={i} className="reg-timeline-row">
                    <div className="timeline-dot-wrap">
                      <span className={`timeline-dot dot-${a.tone}`} />
                      {i < 3 && <div className="timeline-connector" />}
                    </div>
                    <span className="timeline-time">{a.t}</span>
                    <span className="timeline-action">{a.action}</span>
                    <button className="timeline-doc" onClick={() => {
                      const found = INITIAL_RECORDS.find(r => r.id === a.doc);
                      if (found) setReviewDoc(found);
                    }}>
                      {a.doc}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sub-Views */}
        {activeTab === 'pending' && (
          <div className="reg-panel-page">
            <div className="reg-card">
              <div className="reg-card-header">
                <div>
                  <h2 className="panel-title">Pending Verification Queue ({records.length})</h2>
                  <p className="panel-sub">Records submitted by operators awaiting authority signature.</p>
                </div>
                <button className="reg-btn-back" onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</button>
              </div>

              <div className="reg-table-wrap">
                <table className="reg-table">
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>Survey No.</th>
                      <th>Village & Taluk</th>
                      <th>Registered Owner</th>
                      <th>Area Extent</th>
                      <th>AI Confidence</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={r.id}>
                        <td><b>{r.id}</b></td>
                        <td className="mono">{r.survey}</td>
                        <td>{r.village}, {r.taluk}</td>
                        <td>{r.owner}</td>
                        <td>{r.area}</td>
                        <td><span className={`ai-score ${r.scoreNum < 70 ? 'low' : 'high'}`}>{r.score}</span></td>
                        <td><span className={`issue-pill ${r.issue.toLowerCase()}`}>{r.issue}</span></td>
                        <td>
                          <button className="btn-review" onClick={() => setReviewDoc(r)}>Review →</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="reg-panel-page">
            <div className="reg-card">
              <div className="reg-card-header">
                <div>
                  <h2 className="panel-title">Approved Land Records</h2>
                  <p className="panel-sub">Digitally sealed and registered in the state cadastral database.</p>
                </div>
                <button className="reg-btn-back" onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</button>
              </div>

              <div className="reg-table-wrap">
                <table className="reg-table">
                  <thead>
                    <tr>
                      <th>Survey No.</th>
                      <th>Village</th>
                      <th>Owner Name</th>
                      <th>Area Extent</th>
                      <th>Registration Status</th>
                      <th>Verified Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="mono">125/1</td><td>Kinathukadavu</td><td>Subramaniam K</td><td>2.10 Acres</td><td><span className="status-approved">✓ Approved</span></td><td>18 Aug 2026</td></tr>
                    <tr><td className="mono">99/2</td><td>Sulur</td><td>Gopalakrishnan R</td><td>1.40 Acres</td><td><span className="status-approved">✓ Approved</span></td><td>15 Aug 2026</td></tr>
                    <tr><td className="mono">31/6</td><td>Anaimalai</td><td>Meenakshi S</td><td>3.80 Acres</td><td><span className="status-approved">✓ Approved</span></td><td>10 Aug 2026</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'discrepancy' && (
          <div className="reg-panel-page">
            <div className="reg-card">
              <div className="reg-card-header">
                <div>
                  <h2 className="panel-title">Discrepancy Review Queue</h2>
                  <p className="panel-sub">Land records flagged with area, boundary, or name conflicts.</p>
                </div>
                <button className="reg-btn-back" onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</button>
              </div>

              <div className="disc-list">
                {discrepanciesList.map(d => (
                  <div key={d.id} className="disc-item">
                    <div className="disc-info">
                      <div className="disc-head">
                        <b>{d.id} · Survey {d.survey}</b>
                        <span className={`disc-tag ${d.level.toLowerCase()}`}>{d.level} Severity</span>
                      </div>
                      <p className="disc-desc">{d.text}</p>
                    </div>
                    <div className="disc-actions">
                      <button className="reg-btn-primary btn-sm" onClick={() => handleResolveDiscrepancy(d.id)}>
                        <Check size={14} /> Resolve Case
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="reg-panel-page">
            <div className="reg-card">
              <div className="reg-card-header">
                <div>
                  <h2 className="panel-title">Decadal Ownership Timeline</h2>
                  <p className="panel-sub">Historical chain of title for Survey 125/2.</p>
                </div>
                <button className="reg-btn-back" onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</button>
              </div>

              <div className="timeline-view">
                {[
                  { yr: '2026', title: 'Current Digital Cadastral Registry Record' },
                  { yr: '2015', title: 'Agricultural Revenue Tax Assessment Updated' },
                  { yr: '2008', title: 'Sale Deed & Title Transfer Registration' },
                  { yr: '1998', title: 'Mutation Recorded (Subdivision Part)' },
                  { yr: '1985', title: 'Original Settlement Survey' },
                ].map((item, i) => (
                  <div key={i} className="timeline-entry">
                    <div className="timeline-yr-col"><b>{item.yr}</b></div>
                    <div className="timeline-dot-col"><div className="dot" /><div className="line" /></div>
                    <div className="timeline-text-col"><b>{item.title}</b></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="reg-panel-page">
            <div className="reg-card">
              <div className="reg-card-header">
                <div>
                  <h2 className="panel-title">Statutory Audit Log</h2>
                  <p className="panel-sub">Immutable registry events signed by Tahsildar.</p>
                </div>
                <button className="reg-btn-back" onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</button>
              </div>

              <div className="audit-feed">
                {activities.map((a, i) => (
                  <div key={i} className="audit-feed-row">
                    <span className="mono time">{a.t}</span>
                    <span className="action">{a.action}</span>
                    <span className="doc mono">{a.doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="reg-panel-page">
            <div className="reg-card">
              <div className="reg-card-header">
                <div>
                  <h2 className="panel-title">Registration Throughput & AI Quality</h2>
                  <p className="panel-sub">Weekly processing rates and OCR confidence statistics.</p>
                </div>
                <button className="reg-btn-back" onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</button>
              </div>

              <div className="analytics-grid">
                <div className="analytics-box">
                  <h4>Records Processed This Week</h4>
                  <div className="bar-list">
                    {[
                      { d: 'Mon', v: 18 },
                      { d: 'Tue', v: 26 },
                      { d: 'Wed', v: 14 },
                      { d: 'Thu', v: 30 },
                      { d: 'Fri', v: 22 },
                    ].map(b => (
                      <div key={b.d} className="bar-row">
                        <span>{b.d}</span>
                        <div className="bar-track"><div className="bar-fill" style={{ width: `${b.v * 3}%` }} /></div>
                        <b>{b.v}</b>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-box">
                  <h4>AI Extraction Confidence</h4>
                  <div className="bar-list">
                    <div className="bar-row"><span>High (&gt;90%)</span><div className="bar-track"><div className="bar-fill bg-green" style={{ width: '78%' }} /></div><b>78%</b></div>
                    <div className="bar-row"><span>Medium (75-90%)</span><div className="bar-track"><div className="bar-fill bg-yellow" style={{ width: '15%' }} /></div><b>15%</b></div>
                    <div className="bar-row"><span>Low (&lt;75%)</span><div className="bar-track"><div className="bar-fill bg-red" style={{ width: '7%' }} /></div><b>7%</b></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="reg-panel-page">
            <div className="reg-card">
              <div className="reg-card-header">
                <div>
                  <h2 className="panel-title">Account Settings</h2>
                  <p className="panel-sub">Tahsildar / Sub-Registrar station preferences.</p>
                </div>
                <button className="reg-btn-back" onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</button>
              </div>

              <div className="settings-form">
                <div className="form-field">
                  <label>Official Name</label>
                  <input type="text" defaultValue={userName} />
                </div>
                <div className="form-field">
                  <label>Assigned Jurisdiction</label>
                  <input type="text" defaultValue="Pollachi Taluk, Coimbatore District" disabled />
                </div>
                <button className="reg-btn-primary" onClick={() => addToast('Settings updated.', 'success')}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          3-PANEL REVIEW MODAL
          ===================================================================== */}
      {reviewDoc && (
        <div className="reg-modal-overlay" onClick={() => setReviewDoc(null)}>
          <div className="reg-modal-dialog modal-xl" onClick={e => e.stopPropagation()}>
            <div className="reg-modal-head">
              <div>
                <h3 className="modal-title">Record Review · {reviewDoc.id}</h3>
                <p className="modal-sub">Submitted by {reviewDoc.operator} · Survey {reviewDoc.survey}, {reviewDoc.village}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setReviewDoc(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="reg-modal-body no-pad">
              <div className="review-split-3">
                {/* 1. Original Document Preview */}
                <div className="review-col doc-scan-view">
                  <div className="col-header">Original Cadastral Scan</div>
                  <div className="scan-image-wrap">
                    <img src={reviewDoc.scanFile || '/cadastral_map_125_2.jpg'} alt="Cadastral FMB" className="scan-img" />
                  </div>
                  <span className="scan-caption">Field Measurement Book · Survey {reviewDoc.survey}</span>
                </div>

                {/* 2. Extracted Data Form */}
                <div className="review-col extracted-form">
                  <div className="col-header">Extracted Record Data</div>
                  <div className="form-field">
                    <label>Owner Name</label>
                    <input type="text" defaultValue={reviewDoc.owner} />
                  </div>
                  <div className="form-field">
                    <label>Survey Number</label>
                    <input type="text" defaultValue={reviewDoc.survey} />
                  </div>
                  <div className="form-field">
                    <label>Area Extent</label>
                    <input type="text" defaultValue={reviewDoc.area} />
                  </div>
                  <div className="form-field">
                    <label>Village & Taluk</label>
                    <input type="text" defaultValue={`${reviewDoc.village}, ${reviewDoc.taluk}`} />
                  </div>
                  <button type="button" className="reg-btn-outline btn-sm" onClick={() => addToast('Form corrections saved.', 'success')}>
                    Save Corrections
                  </button>
                </div>

                {/* 3. AI Validation & Actions */}
                <div className="review-col validation-actions">
                  <div className="col-header">AI Validation Check</div>
                  
                  <div className="val-checklist">
                    <div className="val-item">
                      <span>Survey valid:</span>
                      <b className="text-green">✓ Matched</b>
                    </div>
                    <div className="val-item">
                      <span>Village boundary:</span>
                      <b className="text-green">✓ Matched</b>
                    </div>
                    <div className="val-item">
                      <span>Area check:</span>
                      <b className={reviewDoc.issue === 'Flagged' ? 'text-red' : 'text-green'}>
                        {reviewDoc.issue === 'Flagged' ? '⚠ Variance Flag' : '✓ Verified'}
                      </b>
                    </div>
                  </div>

                  <div className="val-score-box">
                    <span className="val-score-lbl">AI Confidence Score</span>
                    <div className={`val-score-num ${reviewDoc.scoreNum < 70 ? 'low' : 'high'}`}>
                      {reviewDoc.score}
                    </div>
                  </div>

                  <div className="val-buttons">
                    <button className="btn-approve" onClick={() => handleApprove(reviewDoc)}>
                      <CheckCircle2 size={16} /> Approve Record
                    </button>
                    <button className="btn-reject" onClick={() => setRejectDialog(reviewDoc)}>
                      <XCircle size={16} /> Reject / Return
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          REJECT / RETURN MODAL
          ===================================================================== */}
      {rejectDialog && (
        <div className="reg-modal-overlay" onClick={() => setRejectDialog(null)}>
          <div className="reg-modal-dialog modal-sm" onClick={e => e.stopPropagation()}>
            <div className="reg-modal-head">
              <div>
                <h3 className="modal-title">Return {rejectDialog.id}</h3>
                <p className="modal-sub">Send record back to {rejectDialog.operator} for correction.</p>
              </div>
              <button className="modal-close-btn" onClick={() => setRejectDialog(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit}>
              <div className="reg-modal-body">
                <div className="form-field">
                  <label>Reason for Rejection / Return</label>
                  <textarea
                    name="reason"
                    rows={4}
                    required
                    placeholder="Specify boundary mismatch, blurred scan text, or missing supporting deed..."
                  />
                </div>
              </div>

              <div className="reg-modal-footer">
                <button type="button" className="reg-btn-outline" onClick={() => setRejectDialog(null)}>Cancel</button>
                <button type="submit" className="btn-reject">Return to Operator</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   REGISTRAR DASHBOARD STYLES
   ========================================================================= */

const REGISTRAR_STYLES = `
.reg-root {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  background: #ebf5ee url('${auditbg}') no-repeat right top / cover;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #0c2317;
  overflow-x: hidden;
}

.reg-root * { box-sizing: border-box; }

/* Sidebar */
.reg-sidebar {
  width: 220px;
  background: #c5ebd7;
  background: linear-gradient(180deg, #c5ebd7 0%, #b2dfc8 100%);
  border-right: 1.5px solid #7bc69e;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 16px 28px;
  flex: none;
  z-index: 20;
  box-shadow: 4px 0 16px rgba(5, 150, 105, 0.08);
}

.reg-sidebar-top { display: flex; flex-direction: column; }

.reg-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px 24px;
  cursor: pointer;
}

.reg-brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #ffffff;
  border: 1.5px solid #7bc69e;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.2);
  overflow: hidden;
}

.reg-brand-text {
  font-size: 20px;
  font-weight: 800;
  color: #0c2317;
  letter-spacing: -0.02em;
}

.reg-nav-list { display: flex; flex-direction: column; gap: 5px; }

.reg-nav-item {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  border-radius: 9999px;
  border: 1px solid transparent;
  background: transparent;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: #1b452f;
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: left;
}

.reg-nav-item:hover {
  background: rgba(255, 255, 255, 0.75);
  color: #047857;
  border-color: #7bc69e;
}

.reg-nav-item.active {
  background: #094e32;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(9, 78, 50, 0.32);
  border-color: #094e32;
}

.reg-sidebar-bottom {
  padding: 12px 10px;
  border-top: 1px solid #7bc69e;
}

.reg-side-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.banner-leaf-icon { font-size: 16px; }

.banner-text {
  font-size: 11.5px;
  font-weight: 700;
  color: #1b452f;
  line-height: 1.35;
}

.reg-copyright {
  font-size: 11px;
  color: #375344;
  line-height: 1.4;
}

/* Main Layout */
.reg-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 16px 36px 36px 20px;
}

.reg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.reg-header-title {
  font-size: 14.5px;
  font-weight: 700;
  color: #0c2317;
}

.reg-search-bar {
  width: 380px;
  height: 42px;
  background: #ffffff;
  border: 1.5px solid rgba(16, 185, 129, 0.25);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.reg-search-icon { color: #6b7280; flex: none; }

.reg-search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  outline: none;
}

.reg-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.reg-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid rgba(200, 220, 210, 0.8);
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.reg-notif-dot {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  border: 1.5px solid #ffffff;
}

.reg-profile-wrap { position: relative; }

.reg-user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
}

.reg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #064e3b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reg-username { font-size: 13.5px; font-weight: 700; color: #111827; }
.reg-chevron { color: #4b5563; }

.reg-header {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(163, 222, 192, 0.4);
  position: relative;
  z-index: 1000 !important;
}

.reg-profile-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  padding: 12px;
  z-index: 50000 !important;
}

.reg-dd-user { display: flex; flex-direction: column; padding: 4px; }
.reg-dd-user b { font-size: 13.5px; color: #111827; }
.reg-dd-user span { font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px; }
.reg-dd-divider { height: 1px; background: #f3f4f6; margin: 8px 0; }

.reg-dd-item {
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

.reg-dd-item:hover { background: #f0fdf4; color: #059669; }
.reg-dd-item.danger:hover { background: #fef2f2; color: #dc2626; }

/* Dashboard Content */
.reg-content { display: flex; flex-direction: column; gap: 18px; }

.reg-hero-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.reg-title { font-size: 26px; font-weight: 800; color: #0c2317; margin: 0; }
.reg-subtitle { font-size: 14px; font-weight: 500; color: #374151; margin: 4px 0 0; }

.reg-date-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.date-pill {
  background: #ffffff;
  border: 1px solid rgba(200, 220, 210, 0.8);
  padding: 5px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #0c2317;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.date-sub { font-size: 11.5px; color: #4b6354; font-weight: 500; }

/* KPI Grid */
.reg-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.reg-kpi-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 14px;
  border: 1px solid rgba(200, 225, 210, 0.7);
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.18s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.reg-kpi-card:hover {
  transform: translateY(-2px);
  border-color: #059669;
}

.kpi-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-green-soft { background: #dcfce7; }
.bg-blue-soft { background: #e0f2fe; }
.bg-emerald-soft { background: #d1fae5; }
.bg-red-soft { background: #fee2e2; }

.text-green { color: #059669; }
.text-blue { color: #0284c7; }
.text-emerald { color: #047857; }
.text-red { color: #dc2626; }

.kpi-center {
  flex: 1;
  margin-left: 14px;
}

.kpi-value { font-size: 24px; font-weight: 800; color: #0c2317; line-height: 1.1; }
.kpi-label { font-size: 12.5px; color: #4b6354; font-weight: 600; margin-top: 2px; }

/* Middle Grid */
.reg-middle-grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 16px;
}

.reg-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 14px;
  border: 1px solid rgba(200, 225, 210, 0.7);
  padding: 18px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.reg-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.reg-card-title { font-size: 16px; font-weight: 800; color: #0c2317; margin: 0; }

.reg-link-btn {
  background: transparent;
  border: none;
  color: #059669;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.reg-link-btn:hover { text-decoration: underline; }

/* Tables */
.reg-table-wrap { overflow-x: auto; }

.reg-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.reg-table th {
  text-align: left;
  padding: 8px 10px;
  font-size: 11.5px;
  color: #4b6354;
  font-weight: 700;
  border-bottom: 1px solid #e5e7eb;
}

.reg-table td {
  padding: 10px 10px;
  border-bottom: 1px solid #f3f4f6;
  color: #1f2937;
}

.ai-score.high { color: #059669; font-weight: 800; }
.ai-score.low { color: #dc2626; font-weight: 800; }

.issue-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.issue-pill.flagged { background: #fee2e2; color: #991b1b; }
.issue-pill.clear { background: #dcfce7; color: #166534; }

.btn-review {
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-review:hover {
  border-color: #059669;
  color: #059669;
  background: #f0fdf4;
}

/* Satellite Map Card */
.reg-map-card-wrapper {
  display: flex;
  flex-direction: column;
}

.reg-map-viewport {
  flex: 1;
  min-height: 200px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  border: 1.5px solid rgba(16, 185, 129, 0.35);
}

.reg-satellite-texture {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative;
}

.reg-map-svg {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

.reg-highlighted-parcel {
  fill: #10b981;
  fill-opacity: 0.72;
  stroke: #22c55e;
  stroke-width: 2.2;
  cursor: pointer;
  filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.6));
  transition: fill-opacity 0.2s;
}

.reg-highlighted-parcel:hover {
  fill-opacity: 0.85;
}

.reg-map-pin {
  position: absolute;
  top: 52%;
  left: 55%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.pin-pill {
  background: #ffffff;
  color: #0c2317;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 12px;
  font-family: 'IBM Plex Mono', monospace;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border: 1px solid #10b981;
}

.pin-target-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #10b981;
  border: 2px solid #ffffff;
  margin-top: 3px;
  box-shadow: 0 0 8px #10b981;
}

.reg-map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  background: #ffffff;
  border-radius: 6px;
  padding: 3px;
}

.map-ctrl-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  cursor: pointer;
}

/* Timeline */
.reg-timeline-list {
  display: flex;
  flex-direction: column;
}

.reg-timeline-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  position: relative;
}

.timeline-dot-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 14px;
}

.timeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

.timeline-connector {
  position: absolute;
  top: 8px;
  width: 1.5px;
  height: 24px;
  background: #d1d5db;
}

.dot-green { background: #10b981; }
.dot-blue { background: #0284c7; }
.dot-red { background: #ef4444; }

.timeline-time {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: #6b7280;
  width: 90px;
}

.timeline-action {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.timeline-doc {
  background: transparent;
  border: none;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
  font-weight: 800;
  color: #059669;
  cursor: pointer;
  padding: 2px 6px;
}

.timeline-doc:hover { text-decoration: underline; }

/* Sub Panels */
.reg-panel-page { padding: 4px 0 20px; }
.panel-title { font-size: 20px; font-weight: 800; margin: 0; }
.panel-sub { font-size: 13px; color: #4b6354; margin: 3px 0 0; }

.reg-btn-back {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #059669;
  padding: 6px 12px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
}

/* 3-Panel Review Modal */
.reg-modal-overlay {
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

.reg-modal-dialog {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}

.reg-modal-dialog.modal-xl { max-width: 980px; }
.reg-modal-dialog.modal-sm { max-width: 480px; }

.reg-modal-head {
  padding: 18px 22px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #f8faf9;
  border-bottom: 1px solid #f3f4f6;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.modal-title { font-size: 18px; font-weight: 800; margin: 0; }
.modal-sub { font-size: 12.5px; color: #4b6354; margin: 3px 0 0; }

.modal-close-btn {
  background: #f3f4f6;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.reg-modal-body { padding: 20px; }
.reg-modal-body.no-pad { padding: 0; }

.review-split-3 {
  display: grid;
  grid-template-columns: 1.1fr 1fr 0.9fr;
}

.review-col {
  padding: 20px;
  border-right: 1px solid #e5e7eb;
}

.review-col:last-child { border-right: none; }

.col-header {
  font-size: 12px;
  font-weight: 800;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 14px;
}

.scan-image-wrap {
  width: 100%;
  height: 240px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d1d5db;
  background: #f3f4f6;
}

.scan-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.scan-caption {
  font-size: 11px;
  color: #6b7280;
  margin-top: 6px;
  display: block;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.form-field label {
  font-size: 11.5px;
  font-weight: 700;
  color: #4b5563;
}

.form-field input, .form-field textarea {
  padding: 7px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
}

.form-field input:focus, .form-field textarea:focus {
  border-color: #059669;
}

.val-checklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 16px;
}

.val-item {
  display: flex;
  justify-content: space-between;
}

.val-score-box {
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  margin-bottom: 18px;
}

.val-score-lbl { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; }
.val-score-num { font-size: 24px; font-weight: 800; margin-top: 2px; }

.val-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-approve {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-reject {
  background: #dc2626;
  color: #ffffff;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.reg-modal-footer {
  padding: 14px 20px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.reg-btn-primary {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

.reg-btn-outline {
  background: #ffffff;
  border: 1.5px solid #d1d5db;
  color: #374151;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

/* Discrepancies */
.disc-list { display: flex; flex-direction: column; gap: 12px; }
.disc-item {
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.disc-head { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.disc-tag { font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
.disc-tag.high { background: #fee2e2; color: #991b1b; }
.disc-tag.medium { background: #fef3c7; color: #92400e; }
.disc-tag.low { background: #dcfce7; color: #166534; }
.disc-desc { font-size: 12.5px; color: #4b6354; margin: 0; }

/* Timeline subview */
.timeline-view { display: flex; flex-direction: column; gap: 12px; }
.timeline-entry { display: flex; gap: 16px; align-items: center; }
.timeline-yr-col { width: 60px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #059669; }
.timeline-dot-col { display: flex; flex-direction: column; align-items: center; }
.timeline-dot-col .dot { width: 10px; height: 10px; border-radius: 50%; background: #059669; }
.timeline-dot-col .line { width: 1.5px; height: 20px; background: #d1fae5; }
.timeline-text-col { font-size: 13.5px; color: #111827; }

/* Analytics */
.analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.analytics-box { background: #f8faf9; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px; }
.analytics-box h4 { margin: 0 0 14px; font-size: 14px; }
.bar-list { display: flex; flex-direction: column; gap: 10px; }
.bar-row { display: flex; align-items: center; gap: 12px; font-size: 12.5px; }
.bar-row span { width: 100px; font-weight: 600; color: #4b6354; }
.bar-track { flex: 1; height: 8px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
.bar-fill { height: 100%; background: #059669; border-radius: 99px; }
.bar-fill.bg-green { background: #059669; }
.bar-fill.bg-yellow { background: #d97706; }
.bar-fill.bg-red { background: #dc2626; }

@media (max-width: 1024px) {
  .reg-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .reg-middle-grid { grid-template-columns: 1fr; }
  .review-split-3 { grid-template-columns: 1fr; }
  .analytics-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .reg-root { flex-direction: column; }
  .reg-sidebar { width: 100%; }
  .reg-main { padding: 14px; }
  .reg-hero-row { flex-direction: column; align-items: flex-start; gap: 10px; }
}
`;
