import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Flame, CheckCircle2, AlertTriangle, BarChart3, GitCompare,
  FileWarning, FileBarChart2, Settings as SettingsIcon, LogOut, ChevronsLeft, ChevronsRight,
  ChevronRight, Scale, Download, MapPin, Search, X, Send, Clock3
} from 'lucide-react';

/* =========================================================================
   MOCK DATA
   ========================================================================= */

const INITIAL_ESCALATIONS = [
  { id: 'ESC-2041', tehsil: 'Mannarkkad', conflict: 'Area Mismatch', dateEscalated: '28 Aug 2026', priority: 'high', status: 'pending', owner: 'K. Sundaram', survey: '212/4', notes: 'AI-extracted plot area (2.10 Ac) conflicts with the 1998 mutation record (1.85 Ac). Tehsildar could not resolve without ground verification.' },
  { id: 'ESC-2039', tehsil: 'Chittur', conflict: 'Ownership Dispute', dateEscalated: '27 Aug 2026', priority: 'high', status: 'pending', owner: 'Lakshmi Devi', survey: '88/1', notes: 'Two claimants present registered sale deeds for the same khata. Requires district-level adjudication.' },
  { id: 'ESC-2035', tehsil: 'Palakkad', conflict: 'Duplicate Khasra No.', dateEscalated: '25 Aug 2026', priority: 'normal', status: 'pending', owner: 'Ravi Kumar', survey: '118/3', notes: 'Same khasra number appears under two villages due to a legacy register merge error.' },
  { id: 'ESC-2031', tehsil: 'Alathur', conflict: 'Boundary Overlap', dateEscalated: '23 Aug 2026', priority: 'normal', status: 'pending', owner: 'Meena R', survey: '54/2', notes: 'GIS overlay shows a 0.3 Ac overlap with the adjoining survey plot.' },
];

const INITIAL_RESOLVED = [
  { id: 'ESC-2018', tehsil: 'Ottapalam', conflict: 'Area Mismatch', dateResolved: '19 Aug 2026', resolution: 'Corrected via re-survey' },
  { id: 'ESC-2011', tehsil: 'Palakkad', conflict: 'Ownership Dispute', dateResolved: '14 Aug 2026', resolution: 'Referred to civil court' },
  { id: 'ESC-2004', tehsil: 'Chittur', conflict: 'Duplicate Khasra No.', dateResolved: '09 Aug 2026', resolution: 'Merged records, duplicate archived' },
];

const TEHSIL_STATS = [
  { name: 'Palakkad', processed: 1240, errorRate: 4, completion: 82 },
  { name: 'Chittur', processed: 980, errorRate: 6, completion: 61 },
  { name: 'Ottapalam', processed: 860, errorRate: 3, completion: 74 },
  { name: 'Mannarkkad', processed: 640, errorRate: 9, completion: 48 },
  { name: 'Alathur', processed: 720, errorRate: 5, completion: 58 },
];

const ERROR_STATS = [
  { category: 'Area mismatch', count: 18, tone: 'rust' },
  { category: 'Ownership conflict', count: 9, tone: 'rust' },
  { category: 'Duplicate khasra no.', count: 6, tone: 'ink' },
  { category: 'Boundary overlap', count: 5, tone: 'ink' },
  { category: 'Illegible scan', count: 11, tone: 'ink' },
];

const INITIAL_ACTIVITY = [
  { t: '9:10 AM', text: 'Resolved ESC-2018 — corrected via re-survey' },
  { t: '10:32 AM', text: 'Escalation ESC-2041 received from Mannarkkad Tehsildar' },
  { t: '11:05 AM', text: 'Generated monthly digitization report for July' },
];

const NAV = [
  { group: 'Main', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { group: 'Cases', items: [
    { id: 'escalated', label: 'Escalated to Me', icon: Flame },
    { id: 'resolved', label: 'Resolved Disputes', icon: CheckCircle2 },
    { id: 'highpriority', label: 'High-Priority', icon: AlertTriangle },
  ] },
  { group: 'Analytics', items: [
    { id: 'progress', label: 'District Progress', icon: BarChart3 },
    { id: 'comparison', label: 'Tehsil Comparison', icon: GitCompare },
    { id: 'errors', label: 'Error Stats', icon: FileWarning },
  ] },
  { group: 'Reports', items: [{ id: 'reports', label: 'Generate Reports', icon: FileBarChart2 }] },
];

const STATUS_META = {
  pending: { label: 'Pending', tone: 'rust' },
  review: { label: 'In Review', tone: 'ink' },
  resolved: { label: 'Resolved', tone: 'green' },
  high: { label: 'High', tone: 'rust' },
  normal: { label: 'Normal', tone: 'ink' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, tone: 'ink' };
  return <span className={`badge badge-${meta.tone}`}>{meta.label}</span>;
}

function nowTime() {
  const d = new Date();
  let h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

/* =========================================================================
   ROOT COMPONENT
   ========================================================================= */

export default function DistrictAdministratorDashboard({ userName = 'District Admin', onLogout = () => {}, addToast = () => {} }) {
  useEffect(() => {
    if (document.getElementById('op-dash-fonts')) return;
    const link = document.createElement('link');
    link.id = 'op-dash-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [escalations, setEscalations] = useState(INITIAL_ESCALATIONS);
  const [resolved, setResolved] = useState(INITIAL_RESOLVED);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [reviewCase, setReviewCase] = useState(null);
  const [reportType, setReportType] = useState('Monthly Digitization Summary');
  const [reportRange, setReportRange] = useState('This Month');

  function pushActivity(text) {
    setActivity(a => [...a, { t: nowTime(), text }]);
  }

  function toCSV(rows) {
    return rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  function downloadCSV(filename, rows) {
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleGenerateReport() {
    let rows;
    let filename;

    if (reportType === 'Monthly Digitization Summary') {
      filename = 'district-digitization-summary.csv';
      rows = [
        ['Tehsil', 'Records Processed', 'Error Rate (%)', 'Completion (%)'],
        ...TEHSIL_STATS.map(t => [t.name, t.processed, t.errorRate, t.completion]),
      ];
    } else if (reportType === 'Escalation Resolution Log') {
      filename = 'escalation-resolution-log.csv';
      rows = [
        ['Case ID', 'Tehsil', 'Conflict Type', 'Date Resolved', 'Resolution'],
        ...resolved.map(r => [r.id, r.tehsil, r.conflict, r.dateResolved, r.resolution]),
      ];
    } else if (reportType === 'Tehsil Performance Comparison') {
      filename = 'tehsil-performance-comparison.csv';
      rows = [
        ['Tehsil', 'Records Processed', 'Error Rate (%)', 'Completion (%)'],
        ...TEHSIL_STATS.map(t => [t.name, t.processed, t.errorRate, t.completion]),
      ];
    } else {
      filename = 'error-rate-breakdown.csv';
      rows = [
        ['Issue Category', 'Occurrences'],
        ...ERROR_STATS.map(e => [e.category, e.count]),
      ];
    }

    downloadCSV(filename, rows);
    pushActivity(`Generated and downloaded ${reportType} (${reportRange})`);
    addToast('Report downloaded.', 'success');
  }

  function decideCase(decision) {
    const c = reviewCase;
    if (decision === 'resolve') {
      setEscalations(es => es.filter(e => e.id !== c.id));
      setResolved(rs => [{ id: c.id, tehsil: c.tehsil, conflict: c.conflict, dateResolved: 'Today', resolution: 'Resolved by District Admin' }, ...rs]);
      pushActivity(`Resolved ${c.id} — closed at district level`);
      addToast(`${c.id} marked resolved.`, 'success');
    } else if (decision === 'sendback') {
      setEscalations(es => es.map(e => e.id === c.id ? { ...e, status: 'review' } : e));
      pushActivity(`Sent ${c.id} back to Tehsildar for re-verification`);
      addToast(`${c.id} sent back to Tehsildar.`);
    } else if (decision === 'escalate') {
      setEscalations(es => es.filter(e => e.id !== c.id));
      pushActivity(`Escalated ${c.id} to State Nodal Officer`);
      addToast(`${c.id} escalated to State Nodal Officer.`);
    }
    setReviewCase(null);
  }

  const counts = {
    pending: escalations.filter(e => e.status === 'pending').length,
    highPriority: escalations.filter(e => e.priority === 'high').length,
    resolved: resolved.length,
  };
  const avgResolutionDays = '2.4';
  const overallAccuracy = 94;
  const districtCompletion = Math.round(TEHSIL_STATS.reduce((s, t) => s + t.completion, 0) / TEHSIL_STATS.length);

  /* ---------------------------------------------------------------------
     PAGE RENDERERS
     --------------------------------------------------------------------- */

  function renderDashboard() {
    return (
      <>
        <PageHead title={`Good Morning, ${userName} 👋`} sub="Here's today's district digitization and dispute activity." />
        <div className="kpi-grid">
          <KPI label="Pending Escalations" val={counts.pending} icon={Flame} tone="rust" />
          <KPI label="Avg. Resolution Time" val={avgResolutionDays + ' d'} icon={Clock3} />
          <KPI label="High-Priority Cases" val={counts.highPriority} icon={AlertTriangle} tone="rust" />
          <KPI label="Overall Accuracy" val={overallAccuracy + '%'} icon={CheckCircle2} tone="green" />
          <KPI label="District Completion" val={districtCompletion + '%'} icon={BarChart3} progress={districtCompletion} />
        </div>
        <div className="grid-2">
          <div className="panel">
            <div className="panel-head"><h3>ESCALATION PIPELINE</h3></div>
            <div className="panel-body">
              <div className="stage-row">
                <Stage n={counts.pending} label="Escalated" />
                <StageArrow />
                <Stage n={escalations.filter(e => e.status === 'review').length} label="Under Review" />
                <StageArrow />
                <Stage n={counts.highPriority} label="High-Priority" />
                <StageArrow />
                <Stage n={counts.resolved} label="Resolved" />
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head"><h3>QUICK ACTIONS</h3></div>
            <div className="panel-body quick-actions">
              <button className="qa-btn" onClick={() => setActiveTab('escalated')}><Scale size={17} /> Review Next Escalation</button>
              <button className="qa-btn" onClick={() => setActiveTab('progress')}><BarChart3 size={17} /> View District Analytics</button>
              <button className="qa-btn" onClick={() => setActiveTab('reports')}><Download size={17} /> Export Monthly Report</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  function escalationTable(list) {
    return (
      <table>
        <thead><tr><th>Case ID</th><th>Tehsil</th><th>Conflict Type</th><th>Escalated</th><th>Priority</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {list.map(c => (
            <tr key={c.id}>
              <td className="mono"><b>{c.id}</b></td>
              <td>{c.tehsil}</td>
              <td>{c.conflict}</td>
              <td>{c.dateEscalated}</td>
              <td><StatusBadge status={c.priority} /></td>
              <td><StatusBadge status={c.status} /></td>
              <td><button className="btn btn-ghost btn-sm" onClick={() => setReviewCase(c)}>Review →</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function renderEscalated() {
    if (escalations.length === 0) return <><PageHead title="Escalated to Me" sub="Cases forwarded to you by Tehsildars." /><EmptyState icon={CheckCircle2} title="Queue is clear" sub="No escalations waiting on your review." /></>;
    return (
      <>
        <PageHead title="Escalated to Me" sub="Cases forwarded to you by Tehsildars for district-level decision." />
        <div className="panel"><div className="panel-body">{escalationTable(escalations)}</div></div>
      </>
    );
  }

  function renderHighPriority() {
    const list = escalations.filter(e => e.priority === 'high');
    if (list.length === 0) return <><PageHead title="High-Priority" sub="Cases flagged for urgent attention." /><EmptyState icon={CheckCircle2} title="Nothing urgent" sub="No high-priority cases at the moment." /></>;
    return (
      <>
        <PageHead title="High-Priority" sub="Cases flagged for urgent attention." />
        <div className="panel"><div className="panel-body">{escalationTable(list)}</div></div>
      </>
    );
  }

  function renderResolved() {
    return (
      <>
        <PageHead title="Resolved Disputes" sub="Escalations you've closed at the district level." />
        <div className="panel"><div className="panel-body">
          <table>
            <thead><tr><th>Case ID</th><th>Tehsil</th><th>Conflict Type</th><th>Resolved</th><th>Resolution</th></tr></thead>
            <tbody>
              {resolved.map(r => (
                <tr key={r.id}>
                  <td className="mono"><b>{r.id}</b></td>
                  <td>{r.tehsil}</td>
                  <td>{r.conflict}</td>
                  <td>{r.dateResolved}</td>
                  <td>{r.resolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      </>
    );
  }

  function renderProgress() {
    return (
      <>
        <PageHead title="District Progress" sub="Digitization completion by Tehsil." />
        <div className="panel">
          <div className="panel-head"><h3>TEHSIL PROGRESS</h3></div>
          <div className="panel-body">
            <div className="checklist" style={{ gap: 16 }}>
              {TEHSIL_STATS.map(t => (
                <div key={t.name} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13.5 }}>
                    <span>{t.name}</span><b>{t.completion}%</b>
                  </div>
                  <div className="kpi-progress"><div style={{ width: `${t.completion}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderComparison() {
    return (
      <>
        <PageHead title="Tehsil Comparison" sub="Records processed and error rate by Tehsil." />
        <div className="panel"><div className="panel-body">
          <table>
            <thead><tr><th>Tehsil</th><th>Records Processed</th><th>Error Rate</th><th>Completion</th></tr></thead>
            <tbody>
              {TEHSIL_STATS.map(t => (
                <tr key={t.name}>
                  <td><b>{t.name}</b></td>
                  <td className="mono">{t.processed}</td>
                  <td><span className={`conf ${t.errorRate >= 8 ? 'low' : t.errorRate >= 5 ? 'mid' : 'high'}`}>{t.errorRate}%</span></td>
                  <td className="mono">{t.completion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      </>
    );
  }

  function renderErrorStats() {
    return (
      <>
        <PageHead title="Error Stats" sub="Most common validation issues across the district this month." />
        <div className="panel"><div className="panel-body">
          <table>
            <thead><tr><th>Issue Category</th><th>Occurrences</th></tr></thead>
            <tbody>
              {ERROR_STATS.map(e => (
                <tr key={e.category}>
                  <td>{e.category}</td>
                  <td><span className={`badge badge-${e.tone}`}>{e.count}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      </>
    );
  }

  function renderReports() {
    return (
      <>
        <PageHead title="Generate Reports" sub="Export district digitization and dispute-resolution reports." />
        <div className="panel"><div className="panel-body">
          <div className="field-row">
            <div className="field"><label>Report Type</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)}>
                <option>Monthly Digitization Summary</option>
                <option>Escalation Resolution Log</option>
                <option>Tehsil Performance Comparison</option>
                <option>Error Rate Breakdown</option>
              </select>
            </div>
            <div className="field"><label>Date Range</label>
              <select value={reportRange} onChange={e => setReportRange(e.target.value)}>
                <option>This Month</option><option>Last Quarter</option><option>Year to Date</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleGenerateReport}>
            <Download size={16} /> Generate & Download Report
          </button>
        </div></div>

        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-head"><h3>RECENT ACTIVITY</h3></div>
          <div className="panel-body timeline">
            {[...activity].reverse().map((a, i) => (
              <div key={i} className="tl-item"><div className="tl-dot" /><div><b>{a.text}</b><span>{a.t}</span></div></div>
            ))}
          </div>
        </div>
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <PageHead title="Settings" sub="Your account preferences." />
        <div className="panel"><div className="panel-body">
          <div className="field"><label>Name</label><input type="text" defaultValue={userName} /></div>
          <div className="field"><label>Role</label><input type="text" defaultValue="District Administrator" disabled /></div>
          <button className="btn btn-primary" onClick={() => addToast('Settings saved.', 'success')}>Save Changes</button>
        </div></div>
      </>
    );
  }

  function renderContent() {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'escalated': return renderEscalated();
      case 'resolved': return renderResolved();
      case 'highpriority': return renderHighPriority();
      case 'progress': return renderProgress();
      case 'comparison': return renderComparison();
      case 'errors': return renderErrorStats();
      case 'reports': return renderReports();
      case 'settings': return renderSettings();
      default: return null;
    }
  }

  /* ---------------------------------------------------------------------
     LAYOUT
     --------------------------------------------------------------------- */

  return (
    <div className="op-dash">
      <style>{CSS}</style>

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} no-print`}>
        <div className="sb-top">
          <div className="brand">
            <div className="brand-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 20V10L12 4L20 10V20" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9 20V14H15V20" stroke="white" strokeWidth="1.8" />
              </svg>
            </div>
            {!collapsed && <span className="brand-name">Land<em>Intel</em></span>}
          </div>
          <button className="sb-toggle" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        <nav className="sb-nav">
          {NAV.map(g => (
            <div key={g.group} className="sb-group">
              {!collapsed && <div className="sb-group-label">{g.group}</div>}
              {g.items.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button key={item.id} className={`sb-item ${active ? 'active' : ''}`} onClick={() => setActiveTab(item.id)} title={collapsed ? item.label : undefined}>
                    <Icon size={17} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sb-bottom">
          <button className={`sb-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} title={collapsed ? 'Settings' : undefined}>
            <SettingsIcon size={17} />{!collapsed && <span>Settings</span>}
          </button>
          <button className="sb-item" onClick={onLogout} title={collapsed ? 'Logout' : undefined}>
            <LogOut size={17} />{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar no-print">
          <div className="tb-left">
            <span className="tb-title">LandIntel</span>
            <span className="tb-chip">District Admin</span>
          </div>
          <div className="tb-right">
            <div className="tb-search"><Search size={14} /><input placeholder="Search cases, tehsils…" /></div>
            <div className="tb-user"><MapPin size={13} /> {userName}</div>
          </div>
        </header>
        <div className="page">{renderContent()}</div>
      </div>

      {reviewCase && (
        <div className="modal-overlay" onClick={() => setReviewCase(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div><h3>Review Escalation · {reviewCase.id}</h3><p>Forwarded from {reviewCase.tehsil} Tehsildar</p></div>
              <button className="modal-close" onClick={() => setReviewCase(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ padding: 22 }}>
              <div className="extract-row"><span className="k">Conflict Type</span><span className="v">{reviewCase.conflict}</span></div>
              <div className="extract-row"><span className="k">Owner</span><span className="v">{reviewCase.owner}</span></div>
              <div className="extract-row"><span className="k">Survey No.</span><span className="v mono">{reviewCase.survey}</span></div>
              <div className="extract-row"><span className="k">Priority</span><span className="v"><StatusBadge status={reviewCase.priority} /></span></div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 14, lineHeight: 1.6 }}>{reviewCase.notes}</p>
              <div className="rf-actions" style={{ marginTop: 18, flexWrap: 'wrap' }}>
                <button className="btn btn-outline btn-sm" onClick={() => decideCase('sendback')}>Send Back to Tehsildar</button>
                <button className="btn btn-outline btn-sm" onClick={() => decideCase('escalate')}>Escalate to State Nodal</button>
                <button className="btn btn-primary btn-sm" onClick={() => decideCase('resolve')}><Send size={14} /> Resolve & Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   SMALL SHARED PIECES (identical to Operator dashboard)
   ========================================================================= */

function PageHead({ title, sub, rightBtn }) {
  return (
    <div className="page-head">
      <div><h2>{title}</h2><p>{sub}</p></div>
      {rightBtn}
    </div>
  );
}

function KPI({ label, val, icon: Icon, tone = 'ink', progress }) {
  return (
    <div className="kpi">
      <div className={`kpi-ic tone-${tone}`}><Icon size={16} /></div>
      <div className="kpi-val">{val}</div>
      <div className="kpi-label">{label}</div>
      {progress != null && <div className="kpi-progress"><div style={{ width: `${progress}%` }} /></div>}
    </div>
  );
}

function Stage({ n, label }) { return <div className="stage"><b>{n}</b><span>{label}</span></div>; }
function StageArrow() { return <div className="stage-arrow"><ChevronRight size={16} /></div>; }

function EmptyState({ icon: Icon, title, sub }) {
  return <div className="empty-state"><Icon size={28} /><b>{title}</b><span>{sub}</span></div>;
}

/* =========================================================================
   CSS — copied verbatim from the Operator dashboard so tokens/colors match
   ========================================================================= */

const CSS = `
:root{
  --ink:#1B2A41; --ink-soft:#3B4A63; --ink-faint:#7C879B;
  --paper:#F6F5F0; --paper-raised:#FFFFFF; --line:#DCD9CE; --line-strong:#C7C3B5;
  --rust:#C1502E; --rust-soft:#F4E3DC;
  --green:#2F4A3D; --green-soft:#E4EAE3;
  --navy-soft:#E2E7EF;
}
.op-dash{ display:flex; min-height:100vh; background:var(--paper); color:var(--ink);
  font-family:'IBM Plex Sans', system-ui, sans-serif; font-size:14px; line-height:1.5; }
.op-dash *{ box-sizing:border-box; }
.op-dash h1,.op-dash h2,.op-dash h3,.op-dash h4{ font-family:'Source Serif 4', Georgia, serif; margin:0; color:var(--ink); }
.op-dash .mono{ font-family:'IBM Plex Mono', monospace; }
.op-dash button{ font-family:inherit; cursor:pointer; }
.op-dash input,.op-dash select{ font-family:inherit; }

/* Sidebar */
.sidebar{ width:240px; background:var(--ink); color:#C9D2DE; display:flex; flex-direction:column; flex:none; transition:width .18s ease; }
.sidebar.collapsed{ width:72px; }
.sb-top{ display:flex; align-items:center; justify-content:space-between; padding:18px 16px; border-bottom:1px solid rgba(255,255,255,0.1); }
.brand{ display:flex; align-items:center; gap:10px; overflow:hidden; }
.brand-mark{ width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; flex:none; }
.brand-name{ font-family:'Source Serif 4', serif; font-size:16px; font-weight:600; color:#fff; white-space:nowrap; }
.brand-name em{ font-style:normal; color:var(--rust); }
.sb-toggle{ background:transparent; border:1px solid rgba(255,255,255,0.15); color:#C9D2DE; border-radius:4px; width:26px; height:26px; display:flex; align-items:center; justify-content:center; flex:none; }
.sb-toggle:hover{ background:rgba(255,255,255,0.08); }
.sb-nav{ flex:1; overflow-y:auto; padding:14px 10px; }
.sb-group{ margin-bottom:16px; }
.sb-group-label{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#7C879B; padding:0 10px; margin-bottom:6px; }
.sb-item{ display:flex; align-items:center; gap:11px; width:100%; padding:9px 10px; border:none; background:transparent; color:#C9D2DE; border-radius:4px; font-size:13.5px; font-weight:500; text-align:left; white-space:nowrap; overflow:hidden; }
.sb-item span{ overflow:hidden; text-overflow:ellipsis; }
.sb-item:hover{ background:rgba(255,255,255,0.06); color:#fff; }
.sb-item.active{ background:rgba(193,80,46,0.18); color:#fff; box-shadow:inset 2px 0 0 var(--rust); }
.sb-bottom{ padding:12px 10px 16px; border-top:1px solid rgba(255,255,255,0.1); display:flex; flex-direction:column; gap:2px; }

/* Main / topbar */
.main{ flex:1; display:flex; flex-direction:column; min-width:0; }
.topbar{ height:60px; background:var(--paper-raised); border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; padding:0 26px; flex:none; }
.tb-left{ display:flex; align-items:center; gap:12px; }
.tb-title{ font-family:'Source Serif 4', serif; font-weight:600; font-size:16px; }
.tb-chip{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:0.06em; text-transform:uppercase; background:var(--rust-soft); color:var(--rust); padding:3px 9px; border-radius:2px; }
.tb-right{ display:flex; align-items:center; gap:18px; }
.tb-search{ display:flex; align-items:center; gap:8px; background:var(--paper); border:1px solid var(--line); border-radius:4px; padding:7px 12px; color:var(--ink-faint); }
.tb-search input{ border:none; background:transparent; outline:none; font-size:13px; width:170px; color:var(--ink); }
.tb-user{ display:flex; align-items:center; gap:6px; font-size:13px; color:var(--ink-soft); font-weight:500; }

.page{ padding:30px 32px 60px; overflow-y:auto; }
.page-head{ display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px; }
.page-head h2{ font-size:24px; font-weight:600; }
.page-head p{ margin:6px 0 0; color:var(--ink-soft); font-size:13.5px; }

/* KPI */
.kpi-grid{ display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:24px; }
.kpi{ background:var(--paper-raised); border:1px solid var(--line); padding:18px; position:relative; }
.kpi-ic{ width:30px; height:30px; border-radius:6px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
.tone-ink{ background:var(--navy-soft); color:var(--ink); }
.tone-rust{ background:var(--rust-soft); color:var(--rust); }
.tone-green{ background:var(--green-soft); color:var(--green); }
.kpi-val{ font-family:'Source Serif 4', serif; font-size:26px; font-weight:600; }
.kpi-label{ font-size:12px; color:var(--ink-faint); margin-top:2px; }
.kpi-progress{ height:4px; background:var(--line); margin-top:12px; border-radius:2px; overflow:hidden; }
.kpi-progress div{ height:100%; background:var(--rust); }

/* Panels */
.grid-2{ display:grid; grid-template-columns:1.3fr 1fr; gap:16px; }
.panel{ background:var(--paper-raised); border:1px solid var(--line); }
.panel-head{ display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:1px solid var(--line); }
.panel-head h3{ font-family:'IBM Plex Mono', monospace; font-size:11.5px; letter-spacing:0.08em; color:var(--ink-faint); font-weight:500; }
.panel-body{ padding:20px; }
.muted{ color:var(--ink-faint); font-size:13px; }

.stage-row{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.stage{ text-align:center; padding:14px 18px; background:var(--paper); border:1px solid var(--line); min-width:90px; }
.stage b{ display:block; font-family:'Source Serif 4', serif; font-size:20px; }
.stage span{ font-size:11px; color:var(--ink-faint); }
.stage-arrow{ color:var(--line-strong); flex:none; }

.quick-actions{ display:flex; flex-direction:column; gap:10px; }
.qa-btn{ display:flex; align-items:center; gap:10px; padding:12px 14px; border:1px solid var(--line); background:var(--paper); border-radius:2px; font-size:13.5px; font-weight:500; color:var(--ink); }
.qa-btn:hover{ border-color:var(--rust); color:var(--rust); }

/* Buttons / forms */
.btn{ display:inline-flex; align-items:center; gap:7px; font-size:13.5px; font-weight:600; padding:10px 18px; border-radius:2px; border:1px solid var(--ink); background:transparent; }
.btn-primary{ background:var(--ink); color:#fff; border-color:var(--ink); }
.btn-primary:hover{ background:var(--ink-soft); }
.btn-outline{ color:var(--ink); border-color:var(--line-strong); }
.btn-outline:hover{ border-color:var(--ink); }
.btn-ghost{ border-color:transparent; color:var(--rust); padding:6px 10px; }
.btn-sm{ padding:8px 14px; font-size:12.5px; }
.btn-block{ width:100%; justify-content:center; }

.field{ margin-bottom:14px; }
.field label{ display:block; font-size:11.5px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:var(--ink-faint); margin-bottom:6px; }
.field input,.field select{ width:100%; padding:9px 11px; border:1px solid var(--line-strong); background:#fff; border-radius:2px; font-size:13.5px; color:var(--ink); }
.field-row{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }

/* Table */
table{ width:100%; border-collapse:collapse; font-size:13.5px; }
th{ text-align:left; font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-faint); padding:8px 10px; border-bottom:1px solid var(--line); }
td{ padding:11px 10px; border-bottom:1px solid var(--line); }
.conf{ font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:12.5px; }
.conf.high{ color:var(--green); } .conf.mid{ color:#8A6D1E; } .conf.low{ color:var(--rust); }

.badge{ font-family:'IBM Plex Mono', monospace; font-size:11px; font-weight:600; padding:3px 9px; border-radius:2px; letter-spacing:0.03em; }
.badge-ink{ background:var(--navy-soft); color:var(--ink); }
.badge-rust{ background:var(--rust-soft); color:var(--rust); }
.badge-green{ background:var(--green-soft); color:var(--green); }
.badge-navy{ background:var(--ink); color:#fff; }

.checklist{ display:flex; flex-direction:column; gap:8px; }

.empty-state{ display:flex; flex-direction:column; align-items:center; gap:8px; padding:50px 20px; color:var(--ink-faint); text-align:center; }
.empty-state b{ color:var(--ink); font-size:14.5px; }

.timeline{ display:flex; flex-direction:column; gap:16px; }
.tl-item{ display:flex; gap:12px; }
.tl-dot{ width:8px; height:8px; border-radius:50%; background:var(--rust); margin-top:6px; flex:none; }
.tl-item b{ display:block; font-size:13.5px; font-weight:500; }
.tl-item span{ font-size:11.5px; color:var(--ink-faint); }

/* Modal */
.modal-overlay{ position:fixed; inset:0; background:rgba(27,42,65,0.5); display:flex; align-items:center; justify-content:center; z-index:100; padding:20px; }
.modal{ background:#fff; width:100%; max-width:560px; max-height:88vh; overflow:auto; border-radius:2px; }
.modal-head{ display:flex; justify-content:space-between; align-items:flex-start; padding:20px 24px; border-bottom:1px solid var(--line); }
.modal-head h3{ font-size:17px; font-weight:600; }
.modal-head p{ margin:4px 0 0; font-size:12.5px; color:var(--ink-faint); }
.modal-close{ background:transparent; border:none; color:var(--ink-faint); }
.rf-actions{ display:flex; gap:8px; }

.extract-row{ display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:13.5px; }
.extract-row .k{ color:var(--ink-faint); }
.extract-row .v{ font-family:'IBM Plex Mono', monospace; font-weight:500; }

@media print{
  .no-print{ display:none !important; }
  .op-dash{ display:block; background:#fff; }
  .page{ padding:0; }
}

@media (max-width:1100px){
  .kpi-grid{ grid-template-columns:repeat(3,1fr); }
  .grid-2{ grid-template-columns:1fr; }
}
`;
