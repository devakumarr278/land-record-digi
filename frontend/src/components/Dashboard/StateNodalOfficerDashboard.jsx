import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Trophy, TrendingUp, Radio, Map as MapIcon, RefreshCw,
  ShieldCheck, SlidersHorizontal, Settings as SettingsIcon, LogOut,
  ChevronsLeft, ChevronsRight, CheckCircle2, Circle, AlertTriangle,
  Search, X, MapPin, Key, Megaphone, ChevronRight, Wifi, WifiOff,
  Database, Activity, ArrowUpRight, ArrowDownRight, Send
} from 'lucide-react';

/* =========================================================================
   MOCK DATA
   ========================================================================= */

const DISTRICTS = [
  { name: 'Chennai',       progress: 92, digitized: 184300, discrepancy: 3.1, trend: 2.4 },
  { name: 'Kanchipuram',   progress: 82, digitized: 121800, discrepancy: 4.6, trend: 1.8 },
  { name: 'Coimbatore',    progress: 78, digitized: 158900, discrepancy: 5.2, trend: 3.1 },
  { name: 'Tiruchirapalli',progress: 71, digitized:  97400, discrepancy: 6.0, trend: 0.9 },
  { name: 'Erode',         progress: 60, digitized:  64200, discrepancy: 7.4, trend: -1.2 },
  { name: 'Dindigul',      progress: 58, digitized:  51700, discrepancy: 8.1, trend: 0.4 },
  { name: 'Madurai',       progress: 65, digitized:  88300, discrepancy: 6.7, trend: 2.0 },
  { name: 'Salem',         progress: 54, digitized:  60100, discrepancy: 9.3, trend: -0.6 },
  { name: 'Vellore',       progress: 44, digitized:  39800, discrepancy: 10.8, trend: 0.7 },
  { name: 'Tirunelveli',   progress: 48, digitized:  42600, discrepancy: 9.9, trend: 1.1 },
  { name: 'Thanjavur',     progress: 39, digitized:  31200, discrepancy: 11.6, trend: -0.3 },
  { name: 'Cuddalore',     progress: 36, digitized:  27900, discrepancy: 12.4, trend: 0.2 },
];

const INTEGRATIONS = [
  {
    id: 'lrms', name: 'LRMS API', full: 'Land Records Management System',
    desc: 'Central sync of ownership, mutation and khata records across all districts.',
    status: 'connected', uptime: 99.8, lastSync: '2 mins ago', latency: '184ms', endpoint: 'lrms.tn.gov.in/api/v3',
  },
  {
    id: 'gis', name: 'State GIS API', full: 'Cadastral Mapping Service',
    desc: 'Plot boundary geometry, survey polygons and satellite overlay data.',
    status: 'syncing', uptime: 97.2, lastSync: 'Syncing now', latency: '412ms', endpoint: 'gis.tn.gov.in/cadastral/v2',
  },
  {
    id: 'legacy', name: 'Legacy DB', full: 'Pre-2010 Registration Archive',
    desc: 'Read-only archive of handwritten register volumes prior to digitization.',
    status: 'connected', uptime: 99.9, lastSync: '5 mins ago', latency: '96ms', endpoint: 'archive-db.tn.gov.in',
  },
];

const POLICIES = [
  { id: 'p1', label: 'Auto-validate records above confidence threshold', desc: 'Skip manual review when every extracted field clears the AI confidence bar.', enabled: true },
  { id: 'p2', label: 'Require dual verification for mutation records', desc: 'Mutation-type documents need sign-off from both Tehsildar and District Admin.', enabled: true },
  { id: 'p3', label: 'Allow Field Officers to bulk upload', desc: 'Officers can queue more than 20 documents in a single upload batch.', enabled: false },
  { id: 'p4', label: 'Enable citizen grievance auto-routing', desc: 'Route incoming grievances to the relevant Tehsildar by village code.', enabled: true },
  { id: 'p5', label: 'Lock records after Auditor sign-off', desc: 'Prevent further edits once a record clears the audit trail review.', enabled: false },
];

const THRESHOLDS = [
  { id: 't1', label: 'Auto-validate confidence threshold', desc: 'Fields at or above this score skip manual review entirely.', value: 95, unit: '%' },
  { id: 't2', label: 'Review-required flag threshold', desc: 'Fields below this score are flagged for operator review.', value: 75, unit: '%' },
  { id: 't3', label: 'Duplicate record sensitivity', desc: 'How aggressively the system flags possible duplicate survey entries.', value: 60, unit: '%' },
  { id: 't4', label: 'Minimum OCR quality score', desc: 'Scans below this score are sent back for re-capture.', value: 55, unit: '%' },
];

const ACTIVITY = [
  { t: '9:41 AM', text: 'State GIS API entered syncing state — re-indexing Erode district polygons' },
  { t: '9:10 AM', text: 'Statewide digitization crossed 1.2M records' },
  { t: '8:55 AM', text: 'Cuddalore flagged — digitization progress below 40% threshold' },
  { t: '8:20 AM', text: 'Confidence threshold updated: Auto-validate raised to 95%' },
];

const NAV = [
  { group: 'Main', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { group: 'State View', items: [
    { id: 'leaderboard', label: 'District Leaderboard', icon: Trophy },
    { id: 'progress', label: 'Statewide Progress', icon: TrendingUp },
  ] },
  { group: 'Integrations', items: [
    { id: 'lrms', label: 'LRMS Status', icon: Radio },
    { id: 'gis', label: 'GIS Status', icon: MapIcon },
    { id: 'sync', label: 'Database Sync', icon: Database },
  ] },
  { group: 'Configuration', items: [
    { id: 'policies', label: 'System Policies', icon: ShieldCheck },
    { id: 'thresholds', label: 'Thresholds', icon: SlidersHorizontal },
  ] },
];

/* =========================================================================
   HELPERS
   ========================================================================= */

function fmtNum(n) { return n.toLocaleString('en-IN'); }

function progressTone(p) {
  if (p >= 70) return 'green';
  if (p >= 50) return 'ink';
  return 'rust';
}

const STATUS_META = {
  connected: { label: 'Connected', tone: 'green', dot: '#2F4A3D' },
  syncing:   { label: 'Syncing',   tone: 'ink',   dot: '#8A6D1E' },
  offline:   { label: 'Offline',   tone: 'rust',  dot: '#C1502E' },
};

function IntegrationBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.offline;
  return <span className={`badge badge-${meta.tone}`}><span className="status-dot" style={{ background: meta.dot }} />{meta.label}</span>;
}

/* =========================================================================
   ROOT COMPONENT
   ========================================================================= */

export default function StateNodalOfficerDashboard({ userName = 'State Nodal Officer', onLogout = () => {}, addToast = () => {} }) {
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
  const [policies, setPolicies] = useState(POLICIES);
  const [thresholds, setThresholds] = useState(THRESHOLDS);
  const [activity, setActivity] = useState(ACTIVITY);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [keysOpen, setKeysOpen] = useState(false);

  function pushActivity(text) {
    const d = new Date();
    let h = d.getHours(), m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    setActivity(a => [{ t: `${h}:${String(m).padStart(2, '0')} ${ampm}`, text }, ...a]);
  }

  function togglePolicy(id) {
    setPolicies(ps => ps.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    const p = policies.find(p => p.id === id);
    addToast(`${p.label} ${p.enabled ? 'disabled' : 'enabled'}.`, 'success');
    pushActivity(`Policy "${p.label}" ${p.enabled ? 'disabled' : 'enabled'} statewide`);
  }

  function updateThreshold(id, value) {
    setThresholds(ts => ts.map(t => t.id === id ? { ...t, value } : t));
  }

  function saveThresholds() {
    addToast('Thresholds updated statewide.', 'success');
    pushActivity('AI thresholds reconfigured by State Nodal Officer');
  }

  function sendBroadcast() {
    if (!broadcastMsg.trim()) { addToast('Write a message before broadcasting.'); return; }
    addToast('Message broadcast to all districts.', 'success');
    pushActivity(`Broadcast sent to all districts: "${broadcastMsg.slice(0, 60)}${broadcastMsg.length > 60 ? '…' : ''}"`);
    setBroadcastMsg('');
    setBroadcastOpen(false);
  }

  const totalDigitized = DISTRICTS.reduce((s, d) => s + d.digitized, 0);
  const avgProgress = Math.round(DISTRICTS.reduce((s, d) => s + d.progress, 0) / DISTRICTS.length);
  const avgDiscrepancy = (DISTRICTS.reduce((s, d) => s + d.discrepancy, 0) / DISTRICTS.length).toFixed(1);
  const onlineCount = INTEGRATIONS.filter(i => i.status === 'connected').length;
  const rankedDistricts = [...DISTRICTS].sort((a, b) => b.progress - a.progress);

  /* ---------------------------------------------------------------------
     PAGE RENDERERS
     --------------------------------------------------------------------- */

  function renderDashboard() {
    return (
      <>
        <PageHead title={`Good Morning, ${userName} 👋`} sub="Statewide digitization status across Tamil Nadu." />
        <div className="kpi-grid">
          <KPI label="Total Digitized (State)" val={`${(totalDigitized / 1e6).toFixed(1)}M`} icon={Database} />
          <KPI label="Active Integrations" val={`${onlineCount} / ${INTEGRATIONS.length} Online`} icon={Wifi} tone={onlineCount === INTEGRATIONS.length ? 'green' : 'rust'} />
          <KPI label="AI Discrepancy Rate" val={`${avgDiscrepancy}%`} icon={AlertTriangle} tone="rust" />
          <KPI label="Statewide Target" val={`${avgProgress}%`} icon={TrendingUp} progress={avgProgress} />
        </div>

        <div className="grid-2">
          <div className="panel">
            <div className="panel-head"><h3>DISTRICT PROGRESS</h3><button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('progress')}>Full view →</button></div>
            <div className="panel-body">
              <div className="heatbar-list">
                {rankedDistricts.slice(0, 8).map(d => (
                  <div key={d.name} className="heatbar-row">
                    <span className="hb-name">{d.name}</span>
                    <div className="hb-track"><div className={`hb-fill tone-${progressTone(d.progress)}`} style={{ width: `${d.progress}%` }} /></div>
                    <span className="hb-val mono">{d.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h3>INTEGRATION HEALTH</h3></div>
            <div className="panel-body">
              <div className="integration-list">
                {INTEGRATIONS.map(i => (
                  <div key={i.id} className="integration-row" onClick={() => setActiveTab(i.id)}>
                    <div>
                      <b>{i.name}</b>
                      <span className="int-sub">{i.lastSync}</span>
                    </div>
                    <IntegrationBadge status={i.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-head"><h3>QUICK ACTIONS</h3></div>
          <div className="panel-body quick-actions quick-actions-row">
            <button className="qa-btn" onClick={() => setActiveTab('progress')}><MapIcon size={17} /> View State Heatmap</button>
            <button className="qa-btn" onClick={() => setKeysOpen(true)}><Key size={17} /> Manage Integration Keys</button>
            <button className="qa-btn" onClick={() => setBroadcastOpen(true)}><Megaphone size={17} /> Broadcast Message to Districts</button>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-head"><h3>RECENT STATE ACTIVITY</h3></div>
          <div className="panel-body timeline">
            {activity.slice(0, 4).map((a, i) => (
              <div key={i} className="tl-item"><div className="tl-dot" /><div><b>{a.text}</b><span>{a.t}</span></div></div>
            ))}
          </div>
        </div>
      </>
    );
  }

  function renderLeaderboard() {
    return (
      <>
        <PageHead title="District Leaderboard" sub="Districts ranked by digitization progress." />
        <div className="panel">
          <div className="panel-body">
            <table>
              <thead><tr><th>Rank</th><th>District</th><th>Records Digitized</th><th>Progress</th><th>Discrepancy Rate</th><th>Trend (7d)</th></tr></thead>
              <tbody>
                {rankedDistricts.map((d, i) => (
                  <tr key={d.name}>
                    <td className="mono">#{i + 1}</td>
                    <td><b>{d.name}</b></td>
                    <td className="mono">{fmtNum(d.digitized)}</td>
                    <td>
                      <div className="hb-track" style={{ maxWidth: 120, display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }}>
                        <div className={`hb-fill tone-${progressTone(d.progress)}`} style={{ width: `${d.progress}%` }} />
                      </div>
                      <span className="mono">{d.progress}%</span>
                    </td>
                    <td className={`conf ${d.discrepancy > 8 ? 'low' : d.discrepancy > 5 ? 'mid' : 'high'}`}>{d.discrepancy}%</td>
                    <td>
                      <span className={`trend ${d.trend >= 0 ? 'up' : 'down'}`}>
                        {d.trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {Math.abs(d.trend)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  function renderProgress() {
    return (
      <>
        <PageHead title="Statewide Progress" sub="Digitization progress across every district in Tamil Nadu."
                  rightBtn={<button className="btn btn-primary" onClick={() => setBroadcastOpen(true)}><Megaphone size={15} /> Broadcast Update</button>} />
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <KPI label="Statewide Average" val={`${avgProgress}%`} icon={TrendingUp} progress={avgProgress} />
          <KPI label="Districts Above 70%" val={DISTRICTS.filter(d => d.progress >= 70).length} icon={CheckCircle2} tone="green" />
          <KPI label="Districts Below 40%" val={DISTRICTS.filter(d => d.progress < 40).length} icon={AlertTriangle} tone="rust" />
          <KPI label="Total Records" val={fmtNum(totalDigitized)} icon={Database} />
        </div>
        <div className="panel">
          <div className="panel-head"><h3>STATE HEATMAP — DIGITIZATION PROGRESS</h3></div>
          <div className="panel-body">
            <div className="heatbar-list">
              {rankedDistricts.map(d => (
                <div key={d.name} className="heatbar-row">
                  <span className="hb-name">{d.name}</span>
                  <div className="hb-track"><div className={`hb-fill tone-${progressTone(d.progress)}`} style={{ width: `${d.progress}%` }} /></div>
                  <span className="hb-val mono">{d.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderIntegrationDetail(id) {
    const i = INTEGRATIONS.find(x => x.id === id);
    if (!i) return null;
    return (
      <>
        <PageHead title={i.name} sub={i.full} />
        <div className="grid-2">
          <div className="panel">
            <div className="panel-head"><h3>CONNECTION STATUS</h3><IntegrationBadge status={i.status} /></div>
            <div className="panel-body">
              <p className="muted" style={{ marginBottom: 18 }}>{i.desc}</p>
              <div className="extract-row"><span className="k">Endpoint</span><span className="v mono">{i.endpoint}</span></div>
              <div className="extract-row"><span className="k">Uptime (30d)</span><span className="v mono">{i.uptime}%</span></div>
              <div className="extract-row"><span className="k">Latency</span><span className="v mono">{i.latency}</span></div>
              <div className="extract-row"><span className="k">Last Sync</span><span className="v mono">{i.lastSync}</span></div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }}
                      onClick={() => { addToast(`${i.name} sync triggered.`, 'success'); pushActivity(`Manual sync triggered for ${i.name}`); }}>
                <RefreshCw size={14} /> Trigger Manual Sync
              </button>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head"><h3>ALL INTEGRATIONS</h3></div>
            <div className="panel-body">
              <div className="integration-list">
                {INTEGRATIONS.map(x => (
                  <div key={x.id} className={`integration-row ${x.id === id ? 'active-row' : ''}`} onClick={() => setActiveTab(x.id)}>
                    <div><b>{x.name}</b><span className="int-sub">{x.lastSync}</span></div>
                    <IntegrationBadge status={x.status} />
                  </div>
                ))}
              </div>
              <button className="btn btn-outline btn-block" style={{ marginTop: 16 }} onClick={() => setKeysOpen(true)}>
                <Key size={15} /> Manage Integration Keys
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderPolicies() {
    return (
      <>
        <PageHead title="System Policies" sub="Statewide rules that govern how digitization and verification work." />
        <div className="panel">
          <div className="panel-body">
            <div className="policy-list">
              {policies.map(p => (
                <div key={p.id} className="policy-row">
                  <div>
                    <b>{p.label}</b>
                    <span className="int-sub">{p.desc}</span>
                  </div>
                  <button className={`toggle ${p.enabled ? 'on' : ''}`} onClick={() => togglePolicy(p.id)}>
                    <span className="toggle-knob" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderThresholds() {
    return (
      <>
        <PageHead title="Thresholds" sub="Tune the AI confidence bands used across every district."
                  rightBtn={<button className="btn btn-primary" onClick={saveThresholds}><CheckCircle2 size={15} /> Save Changes</button>} />
        <div className="panel">
          <div className="panel-body">
            <div className="threshold-list">
              {thresholds.map(t => (
                <div key={t.id} className="threshold-row">
                  <div className="th-top">
                    <div>
                      <b>{t.label}</b>
                      <span className="int-sub">{t.desc}</span>
                    </div>
                    <span className="th-val mono">{t.value}{t.unit}</span>
                  </div>
                  <input type="range" min="0" max="100" value={t.value}
                         onChange={e => updateThreshold(t.id, Number(e.target.value))}
                         className="th-slider" />
                </div>
              ))}
            </div>
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
          <div className="field"><label>Role</label><input type="text" defaultValue="State Nodal Officer" disabled /></div>
          <button className="btn btn-primary" onClick={() => addToast('Settings saved.', 'success')}>Save Changes</button>
        </div></div>
      </>
    );
  }

  function renderContent() {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'leaderboard': return renderLeaderboard();
      case 'progress': return renderProgress();
      case 'lrms': return renderIntegrationDetail('lrms');
      case 'gis': return renderIntegrationDetail('gis');
      case 'sync': return renderIntegrationDetail('legacy');
      case 'policies': return renderPolicies();
      case 'thresholds': return renderThresholds();
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
            <span className="tb-chip">State Nodal Officer</span>
          </div>
          <div className="tb-right">
            <div className="tb-search"><Search size={14} /><input placeholder="Search districts, integrations…" /></div>
            <div className="tb-user"><MapPin size={13} /> {userName}</div>
          </div>
        </header>
        <div className="page">{renderContent()}</div>
      </div>

      {broadcastOpen && (
        <div className="modal-overlay" onClick={() => setBroadcastOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div><h3>Broadcast Message</h3><p>Sent to every district's admin and verification team.</p></div>
              <button className="modal-close" onClick={() => setBroadcastOpen(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label>Message</label>
                <textarea rows={5} value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
                          placeholder="e.g. All districts must complete Q3 backlog digitization by the 15th."
                          style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--line-strong)', borderRadius: 2, fontFamily: 'inherit', fontSize: '13.5px', resize: 'vertical' }} />
              </div>
              <button className="btn btn-primary btn-block" onClick={sendBroadcast}><Send size={15} /> Send to All Districts</button>
            </div>
          </div>
        </div>
      )}

      {keysOpen && (
        <div className="modal-overlay" onClick={() => setKeysOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div><h3>Manage Integration Keys</h3><p>API credentials used to connect to external government systems.</p></div>
              <button className="modal-close" onClick={() => setKeysOpen(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="policy-list">
                {INTEGRATIONS.map(i => (
                  <div key={i.id} className="policy-row">
                    <div>
                      <b>{i.name}</b>
                      <span className="int-sub mono">•••• •••• •••• {i.id.slice(0, 4).toUpperCase()}</span>
                    </div>
                    <button className="btn btn-outline btn-sm"
                            onClick={() => { addToast(`${i.name} key rotated.`, 'success'); pushActivity(`API key rotated for ${i.name}`); }}>
                      Rotate Key
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   SMALL SHARED PIECES
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

/* =========================================================================
   CSS — same design tokens as the Operator dashboard, extended for
   heatmaps, integration cards, toggles and threshold sliders
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
.op-dash input,.op-dash select,.op-dash textarea{ font-family:inherit; }

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
.tb-search input{ border:none; background:transparent; outline:none; font-size:13px; width:200px; color:var(--ink); }
.tb-user{ display:flex; align-items:center; gap:6px; font-size:13px; color:var(--ink-soft); font-weight:500; }

.page{ padding:30px 32px 60px; overflow-y:auto; }
.page-head{ display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px; }
.page-head h2{ font-size:24px; font-weight:600; }
.page-head p{ margin:6px 0 0; color:var(--ink-soft); font-size:13.5px; }

/* KPI */
.kpi-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
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

.quick-actions{ display:flex; flex-direction:column; gap:10px; }
.quick-actions-row{ flex-direction:row; flex-wrap:wrap; }
.qa-btn{ display:flex; align-items:center; gap:10px; padding:12px 14px; border:1px solid var(--line); background:var(--paper); border-radius:2px; font-size:13.5px; font-weight:500; color:var(--ink); flex:1; min-width:220px; }
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

/* Table */
table{ width:100%; border-collapse:collapse; font-size:13.5px; }
th{ text-align:left; font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-faint); padding:8px 10px; border-bottom:1px solid var(--line); }
td{ padding:11px 10px; border-bottom:1px solid var(--line); }
.conf{ font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:12.5px; }
.conf.high{ color:var(--green); } .conf.mid{ color:#8A6D1E; } .conf.low{ color:var(--rust); }

.badge{ font-family:'IBM Plex Mono', monospace; font-size:11px; font-weight:600; padding:3px 9px; border-radius:2px; letter-spacing:0.03em; display:inline-flex; align-items:center; gap:6px; }
.badge-ink{ background:var(--navy-soft); color:var(--ink); }
.badge-rust{ background:var(--rust-soft); color:var(--rust); }
.badge-green{ background:var(--green-soft); color:var(--green); }
.status-dot{ width:6px; height:6px; border-radius:50%; display:inline-block; }

.trend{ display:inline-flex; align-items:center; gap:2px; font-family:'IBM Plex Mono', monospace; font-size:12.5px; font-weight:600; }
.trend.up{ color:var(--green); }
.trend.down{ color:var(--rust); }

/* Heatmap / progress bars */
.heatbar-list{ display:flex; flex-direction:column; gap:12px; }
.heatbar-row{ display:grid; grid-template-columns:120px 1fr 44px; gap:12px; align-items:center; }
.hb-name{ font-size:13px; font-weight:500; }
.hb-track{ height:8px; background:var(--paper); border:1px solid var(--line); border-radius:2px; overflow:hidden; }
.hb-fill{ height:100%; }
.hb-fill.tone-green{ background:var(--green); }
.hb-fill.tone-ink{ background:var(--ink); }
.hb-fill.tone-rust{ background:var(--rust); }
.hb-val{ text-align:right; font-size:12.5px; color:var(--ink-soft); }

/* Integrations */
.integration-list{ display:flex; flex-direction:column; }
.integration-row{ display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--line); cursor:pointer; }
.integration-row:last-child{ border-bottom:none; }
.integration-row:hover{ opacity:0.8; }
.integration-row.active-row{ background:var(--paper); margin:0 -20px; padding:12px 20px; }
.integration-row b{ display:block; font-size:13.5px; }
.int-sub{ display:block; font-size:11.5px; color:var(--ink-faint); margin-top:2px; }

/* Policies (toggles) */
.policy-list{ display:flex; flex-direction:column; }
.policy-row{ display:flex; justify-content:space-between; align-items:center; gap:16px; padding:15px 0; border-bottom:1px solid var(--line); }
.policy-row:last-child{ border-bottom:none; }
.policy-row b{ display:block; font-size:13.5px; font-weight:600; }
.toggle{ width:40px; height:22px; border-radius:11px; background:var(--line-strong); border:none; position:relative; flex:none; transition:background .15s; }
.toggle.on{ background:var(--green); }
.toggle-knob{ position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; background:#fff; transition:left .15s; box-shadow:0 1px 2px rgba(0,0,0,0.25); }
.toggle.on .toggle-knob{ left:20px; }

/* Thresholds */
.threshold-list{ display:flex; flex-direction:column; gap:22px; }
.threshold-row{ }
.th-top{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
.th-top b{ font-size:13.5px; }
.th-val{ font-size:15px; font-weight:600; color:var(--rust); flex:none; }
.th-slider{ width:100%; accent-color:var(--rust); }

/* Timeline */
.timeline{ display:flex; flex-direction:column; gap:16px; }
.tl-item{ display:flex; gap:12px; }
.tl-dot{ width:8px; height:8px; border-radius:50%; background:var(--rust); margin-top:6px; flex:none; }
.tl-item b{ display:block; font-size:13.5px; font-weight:500; }
.tl-item span{ font-size:11.5px; color:var(--ink-faint); }

/* Extract-row (reused for integration detail) */
.extract-row{ display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:13.5px; }
.extract-row .k{ color:var(--ink-faint); }
.extract-row .v{ font-family:'IBM Plex Mono', monospace; font-weight:500; }

/* Modal */
.modal-overlay{ position:fixed; inset:0; background:rgba(27,42,65,0.5); display:flex; align-items:center; justify-content:center; z-index:100; padding:20px; }
.modal{ background:#fff; width:100%; max-width:560px; max-height:88vh; overflow:auto; border-radius:2px; }
.modal-head{ display:flex; justify-content:space-between; align-items:flex-start; padding:20px 24px; border-bottom:1px solid var(--line); }
.modal-head h3{ font-size:17px; font-weight:600; }
.modal-head p{ margin:4px 0 0; font-size:12.5px; color:var(--ink-faint); }
.modal-close{ background:transparent; border:none; color:var(--ink-faint); }
.modal-body{ padding:22px 24px; }

@media (max-width:1100px){
  .kpi-grid{ grid-template-columns:repeat(2,1fr); }
  .grid-2{ grid-template-columns:1fr; }
  .heatbar-row{ grid-template-columns:90px 1fr 40px; }
}
`;
