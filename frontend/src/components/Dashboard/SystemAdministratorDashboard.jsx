import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, KeyRound, Cpu, ListOrdered, Database,
  AlertOctagon, Inbox, Settings as SettingsIcon, LogOut,
  ChevronsLeft, ChevronsRight, Search, MapPin, X, Plus, RefreshCw,
  CheckCircle2, XCircle, AlertTriangle, Server, Gauge, Activity,
  Loader2, RotateCcw, UserPlus, ShieldCheck, Trash2, Eye
} from 'lucide-react';

/* =========================================================================
   MOCK DATA
   ========================================================================= */

const INITIAL_USERS = [
  { id: 'U-201', name: 'Meena R',        email: 'meena.r@tn.gov.in',        role: 'Field Officer',        status: 'active',   lastLogin: '2 mins ago' },
  { id: 'U-202', name: 'Karthik S',      email: 'karthik.s@tn.gov.in',      role: 'Verification Officer', status: 'active',   lastLogin: '8 mins ago' },
  { id: 'U-203', name: 'S. Iyer',        email: 's.iyer@tn.gov.in',         role: 'Tehsildar',            status: 'active',   lastLogin: '20 mins ago' },
  { id: 'U-204', name: 'K. Prakash',     email: 'k.prakash@tn.gov.in',      role: 'District Admin',       status: 'active',   lastLogin: '1 hr ago' },
  { id: 'U-205', name: 'R. Subramaniam', email: 'r.subramaniam@tn.gov.in',  role: 'Tehsildar',             status: 'inactive', lastLogin: '3 days ago' },
  { id: 'U-206', name: 'Deepa N',        email: 'deepa.n@tn.gov.in',        role: 'Verification Officer', status: 'active',   lastLogin: '35 mins ago' },
  { id: 'U-207', name: 'A. Chandran',    email: 'a.chandran@tn.gov.in',     role: 'Auditor',              status: 'active',   lastLogin: '1 hr ago' },
  { id: 'U-208', name: 'V. Lakshmi',     email: 'v.lakshmi@tn.gov.in',      role: 'State Nodal Officer',  status: 'inactive', lastLogin: '6 days ago' },
];

const ROLES = [
  { role: 'Citizen', users: 48210, perms: ['View own land records', 'Submit documents / grievances'] },
  { role: 'Field & Verification Officer', users: 312, perms: ['Digitize documents', 'Upload records', 'Review AI extraction'] },
  { role: 'Tehsildar / Sub-Registrar', users: 96, perms: ['Approve / reject mutations', 'Legal sign-off'] },
  { role: 'District Administrator', users: 32, perms: ['Manage district workload', 'View district analytics'] },
  { role: 'State Nodal Officer', users: 6, perms: ['Statewide monitoring', 'Manage integrations', 'Configure policies'] },
  { role: 'Auditor', users: 11, perms: ['Read-only access to all records', 'Export compliance logs'] },
  { role: 'System Administrator', users: 4, perms: ['Full infrastructure access', 'Manage users & roles'] },
];

const AI_WORKERS = [
  { id: 'GPU-01', status: 'active', load: 84, docs: 412, uptime: '14d 6h' },
  { id: 'GPU-02', status: 'active', load: 76, docs: 388, uptime: '14d 6h' },
  { id: 'GPU-03', status: 'active', load: 91, docs: 447, uptime: '9d 2h' },
  { id: 'GPU-04', status: 'idle',   load: 12, docs: 205, uptime: '14d 6h' },
  { id: 'GPU-05', status: 'active', load: 68, docs: 356, uptime: '3d 11h' },
  { id: 'GPU-06', status: 'restarting', load: 0, docs: 298, uptime: '—' },
  { id: 'GPU-07', status: 'active', load: 79, docs: 401, uptime: '14d 6h' },
  { id: 'GPU-08', status: 'active', load: 55, docs: 312, uptime: '7d 19h' },
  { id: 'GPU-09', status: 'active', load: 88, docs: 429, uptime: '14d 6h' },
  { id: 'GPU-10', status: 'active', load: 62, docs: 340, uptime: '2d 4h' },
  { id: 'GPU-11', status: 'idle',   load: 8,  docs: 190, uptime: '14d 6h' },
  { id: 'GPU-12', status: 'active', load: 73, docs: 377, uptime: '5d 8h' },
];

const HEALTH = {
  cpu: 62, memory: 74, dbStorage: 68, apiTraffic: 1240,
};

const QUEUE = {
  waiting: 500, processing: 12, failed: 4, avgWait: '2m 14s', throughput: '186 docs/min',
};

const DB_HEALTH = {
  storageUsed: 68, storageTotal: '2 TB', connections: 340, maxConnections: 500,
  replicationLag: '120ms', lastBackup: '2 hours ago', queryLatency: '38ms',
};

const ERROR_LOGS = [
  { t: '10:44 AM', service: 'OCR Engine', level: 'error',   message: 'Timeout processing scan LR-1052 — exceeded 30s extraction window' },
  { t: '10:31 AM', service: 'GIS Sync',   level: 'warning', message: 'State GIS API responded with degraded latency (620ms)' },
  { t: '10:12 AM', service: 'Auth Service', level: 'error', message: 'Failed login attempts threshold exceeded for user U-205' },
  { t: '9:58 AM',  service: 'Queue Worker', level: 'error', message: 'GPU-06 crashed mid-job — job requeued automatically' },
  { t: '9:40 AM',  service: 'Database',   level: 'warning', message: 'Connection pool at 82% capacity during peak upload window' },
  { t: '9:15 AM',  service: 'LRMS Sync',  level: 'error',   message: 'Batch sync to LRMS API rejected — schema mismatch on 3 records' },
];

const DEAD_LETTER = [
  { id: 'J-88410', doc: 'LR-1052', service: 'OCR Engine', error: 'Extraction timeout after 3 retries', attempts: 3, t: '10:44 AM' },
  { id: 'J-88397', doc: 'LR-1048', service: 'GIS Sync', error: 'Invalid polygon geometry returned', attempts: 3, t: '10:20 AM' },
  { id: 'J-88381', doc: 'LR-1041', service: 'Queue Worker', error: 'Worker GPU-06 terminated unexpectedly', attempts: 2, t: '9:58 AM' },
  { id: 'J-88372', doc: 'LR-1037', service: 'LRMS Sync', error: 'Schema mismatch — khata_no field type', attempts: 3, t: '9:15 AM' },
];

const NAV = [
  { group: 'Main', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { group: 'Access', items: [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: KeyRound },
  ] },
  { group: 'Infrastructure', items: [
    { id: 'workers', label: 'AI Workers', icon: Cpu },
    { id: 'queue', label: 'Queue Status', icon: ListOrdered },
    { id: 'dbhealth', label: 'Database Health', icon: Database },
  ] },
  { group: 'Logs', items: [
    { id: 'errors', label: 'Error Logs', icon: AlertOctagon },
    { id: 'dlq', label: 'Dead Letter Queue', icon: Inbox },
  ] },
];

/* =========================================================================
   HELPERS
   ========================================================================= */

function gaugeTone(pct) {
  if (pct >= 85) return 'rust';
  if (pct >= 65) return 'amber';
  return 'green';
}

const WORKER_META = {
  active:     { label: 'Active',     tone: 'green' },
  idle:       { label: 'Idle',       tone: 'ink' },
  restarting: { label: 'Restarting', tone: 'rust' },
};

function WorkerBadge({ status }) {
  const meta = WORKER_META[status] || WORKER_META.idle;
  return <span className={`badge badge-${meta.tone}`}>{meta.label}</span>;
}

/* =========================================================================
   ROOT COMPONENT
   ========================================================================= */

export default function SystemAdministratorDashboard({ userName = 'System Administrator', onLogout = () => {}, addToast = () => {} }) {
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
  const [users, setUsers] = useState(INITIAL_USERS);
  const [workers, setWorkers] = useState(AI_WORKERS);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Field & Verification Officer' });
  const [dlq, setDlq] = useState(DEAD_LETTER);
  const [restartingAll, setRestartingAll] = useState(false);

  const activeUsers = users.filter(u => u.status === 'active').length;
  const failedJobs = dlq.length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;

  function toggleUserStatus(id) {
    setUsers(us => us.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    const u = users.find(u => u.id === id);
    addToast(`${u.name} ${u.status === 'active' ? 'deactivated' : 'activated'}.`, 'success');
  }

  function addUser(e) {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) { addToast('Enter a name and email.'); return; }
    const id = 'U-' + (200 + users.length + 1);
    setUsers(us => [{ id, name: newUser.name, email: newUser.email, role: newUser.role, status: 'active', lastLogin: 'Never' }, ...us]);
    addToast(`${newUser.name} added as ${newUser.role}.`, 'success');
    setNewUser({ name: '', email: '', role: 'Field & Verification Officer' });
    setAddUserOpen(false);
  }

  function restartWorker(id) {
    setWorkers(ws => ws.map(w => w.id === id ? { ...w, status: 'restarting', load: 0 } : w));
    addToast(`${id} restarting…`);
    setTimeout(() => {
      setWorkers(ws => ws.map(w => w.id === id ? { ...w, status: 'active', load: 20 + Math.floor(Math.random() * 40), uptime: '0m' } : w));
      addToast(`${id} back online.`, 'success');
    }, 1600);
  }

  function restartAllIdle() {
    const idleIds = workers.filter(w => w.status === 'idle').map(w => w.id);
    if (idleIds.length === 0) { addToast('No idle workers to restart.'); return; }
    setRestartingAll(true);
    setWorkers(ws => ws.map(w => idleIds.includes(w.id) ? { ...w, status: 'restarting', load: 0 } : w));
    setTimeout(() => {
      setWorkers(ws => ws.map(w => idleIds.includes(w.id) ? { ...w, status: 'active', load: 25 + Math.floor(Math.random() * 35), uptime: '0m' } : w));
      setRestartingAll(false);
      addToast(`${idleIds.length} worker(s) restarted.`, 'success');
    }, 1600);
  }

  function resolveDlqJob(id) {
    setDlq(d => d.filter(j => j.id !== id));
    addToast(`Job ${id} requeued for processing.`, 'success');
  }

  /* ---------------------------------------------------------------------
     PAGE RENDERERS
     --------------------------------------------------------------------- */

  function renderDashboard() {
    return (
      <>
        <PageHead title={`Welcome, ${userName} ⚙️`} sub="Server health, users, permissions, and AI pipeline infrastructure." />
        <div className="kpi-grid">
          <KPI label="Active Users" val={`${activeUsers} Online`} icon={Users} />
          <KPI label="AI Pipeline Latency" val="1.2s avg / page" icon={Activity} />
          <KPI label="Failed Jobs" val={failedJobs} icon={AlertOctagon} tone={failedJobs > 0 ? 'rust' : 'green'} onClick={() => setActiveTab('dlq')} />
          <KPI label="System Uptime" val="99.99%" icon={ShieldCheck} tone="green" />
        </div>

        <div className="grid-2">
          <div className="panel">
            <div className="panel-head"><h3>SYSTEM HEALTH MATRIX</h3></div>
            <div className="panel-body">
              <div className="gauge-list">
                <GaugeRow label="CPU Usage" value={HEALTH.cpu} unit="%" />
                <GaugeRow label="Memory Usage" value={HEALTH.memory} unit="%" />
                <GaugeRow label="Database Storage" value={HEALTH.dbStorage} unit="%" />
                <div className="gauge-row">
                  <span className="gauge-label">API Gateway Traffic</span>
                  <span className="gauge-flat mono">{HEALTH.apiTraffic.toLocaleString('en-IN')} req/min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h3>AI WORKER QUEUE</h3></div>
            <div className="panel-body">
              <div className="queue-stats">
                <div className="qs-item"><b>{QUEUE.waiting}</b><span>Docs Waiting</span></div>
                <div className="qs-item"><b>{activeWorkers}</b><span>Active GPU Workers</span></div>
                <div className="qs-item"><b>{QUEUE.avgWait}</b><span>Avg Wait Time</span></div>
              </div>
              <div className="worker-strip">
                {workers.map(w => (
                  <div key={w.id} className={`worker-chip status-${w.status}`} title={`${w.id} — ${w.status}`}>
                    {w.status === 'restarting' ? <Loader2 size={11} className="spin" /> : <Cpu size={11} />}
                  </div>
                ))}
              </div>
              <button className="btn btn-outline btn-block" style={{ marginTop: 14 }} onClick={() => setActiveTab('workers')}>
                <Cpu size={15} /> Manage AI Workers
              </button>
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-head"><h3>QUICK ACTIONS</h3></div>
          <div className="panel-body quick-actions quick-actions-row">
            <button className="qa-btn" onClick={() => setAddUserOpen(true)}><UserPlus size={17} /> Add / Manage User</button>
            <button className="qa-btn" onClick={restartAllIdle}><RotateCcw size={17} /> Restart AI Worker</button>
            <button className="qa-btn" onClick={() => setActiveTab('errors')}><AlertOctagon size={17} /> View Error Logs</button>
          </div>
        </div>
      </>
    );
  }

  function renderUsers() {
    return (
      <>
        <PageHead title="User Management" sub="Every account with access to the platform."
                  rightBtn={<button className="btn btn-primary" onClick={() => setAddUserOpen(true)}><UserPlus size={15} /> Add User</button>} />
        <div className="panel">
          <div className="panel-body">
            <table>
              <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th></th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><b>{u.name}</b><span className="int-sub mono">{u.id}</span></td>
                    <td className="mono">{u.email}</td>
                    <td>{u.role}</td>
                    <td><span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-rust'}`}>{u.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                    <td className="mono">{u.lastLogin}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => toggleUserStatus(u.id)}>{u.status === 'active' ? 'Deactivate' : 'Activate'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  function renderRoles() {
    return (
      <>
        <PageHead title="Roles & Permissions" sub="What each role is allowed to see and do across the platform." />
        <div className="role-grid">
          {ROLES.map(r => (
            <div key={r.role} className="panel role-card">
              <div className="panel-head"><h3>{r.role.toUpperCase()}</h3><span className="mono muted">{r.users.toLocaleString('en-IN')} users</span></div>
              <div className="panel-body">
                <ul className="perm-list">
                  {r.perms.map((p, i) => <li key={i}><CheckCircle2 size={13} /> {p}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  function renderWorkers() {
    return (
      <>
        <PageHead title="AI Workers" sub="GPU workers powering the document extraction pipeline."
                  rightBtn={<button className="btn btn-primary" onClick={restartAllIdle} disabled={restartingAll}>
                    {restartingAll ? <Loader2 size={15} className="spin" /> : <RotateCcw size={15} />} Restart Idle Workers
                  </button>} />
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          <KPI label="Active Workers" val={activeWorkers} icon={Cpu} tone="green" />
          <KPI label="Idle Workers" val={workers.filter(w => w.status === 'idle').length} icon={Cpu} />
          <KPI label="Avg Load" val={`${Math.round(workers.reduce((s, w) => s + w.load, 0) / workers.length)}%`} icon={Gauge} />
        </div>
        <div className="panel">
          <div className="panel-body">
            <table>
              <thead><tr><th>Worker</th><th>Status</th><th>Load</th><th>Docs Processed</th><th>Uptime</th><th></th></tr></thead>
              <tbody>
                {workers.map(w => (
                  <tr key={w.id}>
                    <td className="mono"><b>{w.id}</b></td>
                    <td><WorkerBadge status={w.status} /></td>
                    <td>
                      <div className="hb-track" style={{ maxWidth: 100, display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }}>
                        <div className={`hb-fill tone-${gaugeTone(w.load) === 'amber' ? 'ink' : gaugeTone(w.load)}`} style={{ width: `${w.load}%` }} />
                      </div>
                      <span className="mono">{w.load}%</span>
                    </td>
                    <td className="mono">{w.docs}</td>
                    <td className="mono">{w.uptime}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" disabled={w.status === 'restarting'} onClick={() => restartWorker(w.id)}>
                        {w.status === 'restarting' ? <Loader2 size={13} className="spin" /> : <RotateCcw size={13} />} Restart
                      </button>
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

  function renderQueue() {
    return (
      <>
        <PageHead title="Queue Status" sub="Live view of the asynchronous document processing queue." />
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <KPI label="Docs Waiting" val={QUEUE.waiting} icon={Inbox} />
          <KPI label="Currently Processing" val={QUEUE.processing} icon={Activity} />
          <KPI label="Failed Jobs" val={QUEUE.failed} icon={AlertOctagon} tone="rust" onClick={() => setActiveTab('dlq')} />
          <KPI label="Throughput" val={QUEUE.throughput} icon={Gauge} />
        </div>
        <div className="panel">
          <div className="panel-head"><h3>QUEUE PIPELINE</h3></div>
          <div className="panel-body">
            <div className="stage-row">
              <Stage n={QUEUE.waiting} label="Waiting" />
              <div className="stage-arrow">→</div>
              <Stage n={QUEUE.processing} label="Processing" />
              <div className="stage-arrow">→</div>
              <Stage n={activeWorkers} label="Active Workers" />
              <div className="stage-arrow">→</div>
              <Stage n={QUEUE.failed} label="Failed" />
            </div>
            <p className="muted" style={{ marginTop: 16 }}>Average wait time is currently <b className="mono">{QUEUE.avgWait}</b> at a throughput of <b className="mono">{QUEUE.throughput}</b>.</p>
          </div>
        </div>
      </>
    );
  }

  function renderDbHealth() {
    return (
      <>
        <PageHead title="Database Health" sub="Storage, connections, and replication status." />
        <div className="grid-2">
          <div className="panel">
            <div className="panel-head"><h3>STORAGE & CONNECTIONS</h3></div>
            <div className="panel-body">
              <GaugeRow label="Storage Used" value={DB_HEALTH.storageUsed} unit="%" />
              <div className="extract-row"><span className="k">Total Capacity</span><span className="v mono">{DB_HEALTH.storageTotal}</span></div>
              <div className="extract-row"><span className="k">Active Connections</span><span className="v mono">{DB_HEALTH.connections} / {DB_HEALTH.maxConnections}</span></div>
              <div className="extract-row"><span className="k">Query Latency</span><span className="v mono">{DB_HEALTH.queryLatency}</span></div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head"><h3>REPLICATION & BACKUPS</h3></div>
            <div className="panel-body">
              <div className="extract-row"><span className="k">Replication Lag</span><span className="v mono">{DB_HEALTH.replicationLag}</span></div>
              <div className="extract-row"><span className="k">Last Backup</span><span className="v mono">{DB_HEALTH.lastBackup}</span></div>
              <div className="extract-row"><span className="k">Backup Status</span><span className="status-chip">Healthy</span></div>
              <button className="btn btn-outline btn-block" style={{ marginTop: 16 }}
                      onClick={() => addToast('Manual backup started.', 'success')}>
                <Database size={15} /> Trigger Manual Backup
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderErrors() {
    return (
      <>
        <PageHead title="Error Logs" sub="System-level errors and warnings across every service." />
        <div className="panel">
          <div className="panel-body" style={{ padding: 0 }}>
            <div className="feed-list">
              {ERROR_LOGS.map((e, i) => (
                <div key={i} className="feed-row">
                  <span className="feed-time mono">{e.t}</span>
                  <div className="feed-body">
                    <span className={`feed-role tone-${e.level === 'error' ? 'rust' : 'ink'}`}>{e.level === 'error' ? 'ERROR' : 'WARNING'}</span>
                    <span> <b>{e.service}</b> — {e.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderDlq() {
    if (dlq.length === 0) {
      return (
        <>
          <PageHead title="Dead Letter Queue" sub="Jobs that failed after all automatic retries." />
          <div className="panel"><div className="panel-body">
            <EmptyState icon={CheckCircle2} title="Dead letter queue is empty" sub="No failed jobs are waiting to be resolved." />
          </div></div>
        </>
      );
    }
    return (
      <>
        <PageHead title="Dead Letter Queue" sub="Jobs that failed after all automatic retries." />
        <div className="panel">
          <div className="panel-body">
            <table>
              <thead><tr><th>Job</th><th>Document</th><th>Service</th><th>Error</th><th>Attempts</th><th>Failed At</th><th></th></tr></thead>
              <tbody>
                {dlq.map(j => (
                  <tr key={j.id}>
                    <td className="mono"><b>{j.id}</b></td>
                    <td className="mono">{j.doc}</td>
                    <td>{j.service}</td>
                    <td className="reason-cell">{j.error}</td>
                    <td className="mono">{j.attempts}</td>
                    <td className="mono">{j.t}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => resolveDlqJob(j.id)}><RotateCcw size={13} /> Requeue</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <div className="field"><label>Role</label><input type="text" defaultValue="System Administrator" disabled /></div>
          <button className="btn btn-primary" onClick={() => addToast('Settings saved.', 'success')}>Save Changes</button>
        </div></div>
      </>
    );
  }

  function renderContent() {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUsers();
      case 'roles': return renderRoles();
      case 'workers': return renderWorkers();
      case 'queue': return renderQueue();
      case 'dbhealth': return renderDbHealth();
      case 'errors': return renderErrors();
      case 'dlq': return renderDlq();
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
            <span className="tb-chip">System Administrator</span>
          </div>
          <div className="tb-right">
            <div className="tb-search"><Search size={14} /><input placeholder="Search users, jobs, logs…" /></div>
            <div className="tb-user"><MapPin size={13} /> {userName}</div>
          </div>
        </header>
        <div className="page">{renderContent()}</div>
      </div>

      {addUserOpen && (
        <div className="modal-overlay" onClick={() => setAddUserOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div><h3>Add User</h3><p>Grant a new team member access to the platform.</p></div>
              <button className="modal-close" onClick={() => setAddUserOpen(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={addUser}>
                <div className="field"><label>Full Name</label>
                  <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="e.g. Priya Venkat" />
                </div>
                <div className="field"><label>Email</label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="name@tn.gov.in" />
                </div>
                <div className="field"><label>Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    {ROLES.filter(r => r.role !== 'Citizen').map(r => <option key={r.role}>{r.role}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-block"><UserPlus size={15} /> Add User</button>
              </form>
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

function KPI({ label, val, icon: Icon, tone = 'ink', onClick }) {
  return (
    <div className={`kpi ${onClick ? 'kpi-clickable' : ''}`} onClick={onClick}>
      <div className={`kpi-ic tone-${tone}`}><Icon size={16} /></div>
      <div className="kpi-val">{val}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

function GaugeRow({ label, value, unit }) {
  const tone = gaugeTone(value);
  return (
    <div className="gauge-row">
      <span className="gauge-label">{label}</span>
      <div className="hb-track"><div className={`hb-fill tone-${tone === 'amber' ? 'ink' : tone}`} style={{ width: `${value}%` }} /></div>
      <span className="mono gauge-val">{value}{unit}</span>
    </div>
  );
}

function Stage({ n, label }) { return <div className="stage"><b>{n}</b><span>{label}</span></div>; }

function EmptyState({ icon: Icon, title, sub }) {
  return <div className="empty-state"><Icon size={28} /><b>{title}</b><span>{sub}</span></div>;
}

/* =========================================================================
   CSS — same design tokens as the Operator dashboard, extended for gauges,
   worker chips, role cards, and system-health widgets
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
.spin{ animation:spin 1s linear infinite; }
@keyframes spin{ to{ transform:rotate(360deg); } }

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
.kpi-clickable{ cursor:pointer; }
.kpi-clickable:hover{ border-color:var(--rust); }
.kpi-ic{ width:30px; height:30px; border-radius:6px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
.tone-ink{ background:var(--navy-soft); color:var(--ink); }
.tone-rust{ background:var(--rust-soft); color:var(--rust); }
.tone-green{ background:var(--green-soft); color:var(--green); }
.kpi-val{ font-family:'Source Serif 4', serif; font-size:24px; font-weight:600; }
.kpi-label{ font-size:12px; color:var(--ink-faint); margin-top:2px; }

/* Panels */
.grid-2{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
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
.btn-primary:disabled{ opacity:0.6; cursor:not-allowed; }
.btn-outline{ color:var(--ink); border-color:var(--line-strong); }
.btn-outline:hover{ border-color:var(--ink); }
.btn-ghost{ display:inline-flex; align-items:center; gap:6px; border-color:transparent; color:var(--rust); padding:6px 10px; }
.btn-ghost:disabled{ opacity:0.5; cursor:not-allowed; }
.btn-sm{ padding:8px 14px; font-size:12.5px; }
.btn-block{ width:100%; justify-content:center; }

.field{ margin-bottom:14px; }
.field label{ display:block; font-size:11.5px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:var(--ink-faint); margin-bottom:6px; }
.field input,.field select{ width:100%; padding:9px 11px; border:1px solid var(--line-strong); background:#fff; border-radius:2px; font-size:13.5px; color:var(--ink); }

/* Table */
table{ width:100%; border-collapse:collapse; font-size:13.5px; }
th{ text-align:left; font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-faint); padding:8px 10px; border-bottom:1px solid var(--line); }
td{ padding:11px 10px; border-bottom:1px solid var(--line); vertical-align:top; }
.int-sub{ display:block; font-size:11.5px; color:var(--ink-faint); margin-top:2px; }
.reason-cell{ max-width:260px; color:var(--ink-soft); font-size:12.5px; }

.badge{ font-family:'IBM Plex Mono', monospace; font-size:11px; font-weight:600; padding:3px 9px; border-radius:2px; letter-spacing:0.03em; display:inline-flex; align-items:center; gap:5px; }
.badge-ink{ background:var(--navy-soft); color:var(--ink); }
.badge-rust{ background:var(--rust-soft); color:var(--rust); }
.badge-green{ background:var(--green-soft); color:var(--green); }

/* Gauges */
.gauge-list{ display:flex; flex-direction:column; gap:16px; }
.gauge-row{ display:grid; grid-template-columns:140px 1fr 60px; gap:12px; align-items:center; }
.gauge-label{ font-size:13px; font-weight:500; }
.gauge-val{ text-align:right; font-size:12.5px; color:var(--ink-soft); }
.gauge-flat{ text-align:right; grid-column:2 / span 2; font-size:13px; color:var(--ink); }
.hb-track{ height:8px; background:var(--paper); border:1px solid var(--line); border-radius:2px; overflow:hidden; }
.hb-fill{ height:100%; }
.hb-fill.tone-green{ background:var(--green); }
.hb-fill.tone-ink{ background:var(--ink); }
.hb-fill.tone-rust{ background:var(--rust); }

/* Queue */
.queue-stats{ display:flex; gap:10px; margin-bottom:16px; }
.qs-item{ flex:1; text-align:center; padding:14px 10px; background:var(--paper); border:1px solid var(--line); }
.qs-item b{ display:block; font-family:'Source Serif 4', serif; font-size:20px; }
.qs-item span{ font-size:11px; color:var(--ink-faint); }
.worker-strip{ display:flex; flex-wrap:wrap; gap:6px; }
.worker-chip{ width:26px; height:26px; border-radius:4px; display:flex; align-items:center; justify-content:center; background:var(--paper); border:1px solid var(--line); color:var(--ink-faint); }
.worker-chip.status-active{ background:var(--green-soft); color:var(--green); border-color:var(--green-soft); }
.worker-chip.status-restarting{ background:var(--rust-soft); color:var(--rust); border-color:var(--rust-soft); }
.worker-chip.status-idle{ background:var(--paper); color:var(--ink-faint); }

.stage-row{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.stage{ text-align:center; padding:14px 18px; background:var(--paper); border:1px solid var(--line); min-width:90px; }
.stage b{ display:block; font-family:'Source Serif 4', serif; font-size:20px; }
.stage span{ font-size:11px; color:var(--ink-faint); }
.stage-arrow{ color:var(--line-strong); flex:none; font-size:16px; }

/* Roles */
.role-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.role-card .panel-head h3{ letter-spacing:0.05em; }
.perm-list{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:9px; }
.perm-list li{ display:flex; align-items:flex-start; gap:8px; font-size:13px; color:var(--ink-soft); }
.perm-list li svg{ color:var(--green); flex:none; margin-top:2px; }

/* Audit-style feed (errors) */
.feed-list{ display:flex; flex-direction:column; }
.feed-row{ display:grid; grid-template-columns:70px 1fr; gap:14px; padding:12px 20px; border-bottom:1px solid var(--line); font-size:13px; }
.feed-list .feed-row:last-child{ border-bottom:none; }
.feed-time{ color:var(--ink-faint); font-size:11.5px; padding-top:2px; }
.feed-role{ display:inline-block; font-family:'IBM Plex Mono', monospace; font-size:10.5px; font-weight:600; letter-spacing:0.03em; padding:2px 7px; border-radius:2px; margin-right:4px; }
.feed-role.tone-ink{ background:var(--navy-soft); color:var(--ink); }
.feed-role.tone-rust{ background:var(--rust-soft); color:var(--rust); }

/* Extract-row reused */
.extract-row{ display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:13.5px; }
.extract-row .k{ color:var(--ink-faint); }
.extract-row .v{ font-family:'IBM Plex Mono', monospace; font-weight:500; }
.status-chip{ display:inline-flex; align-items:center; gap:6px; background:var(--green-soft); color:var(--green); font-family:'IBM Plex Mono', monospace; font-size:11.5px; font-weight:600; padding:3px 9px; }
.status-chip::before{ content:''; width:5px; height:5px; border-radius:50%; background:var(--green); }

.empty-state{ display:flex; flex-direction:column; align-items:center; gap:8px; padding:50px 20px; color:var(--ink-faint); text-align:center; }
.empty-state b{ color:var(--ink); font-size:14.5px; }

/* Modal */
.modal-overlay{ position:fixed; inset:0; background:rgba(27,42,65,0.5); display:flex; align-items:center; justify-content:center; z-index:100; padding:20px; }
.modal{ background:#fff; width:100%; max-width:480px; max-height:88vh; overflow:auto; border-radius:2px; }
.modal-head{ display:flex; justify-content:space-between; align-items:flex-start; padding:20px 24px; border-bottom:1px solid var(--line); }
.modal-head h3{ font-size:17px; font-weight:600; }
.modal-head p{ margin:4px 0 0; font-size:12.5px; color:var(--ink-faint); }
.modal-close{ background:transparent; border:none; color:var(--ink-faint); }
.modal-body{ padding:22px 24px; }

@media (max-width:1100px){
  .kpi-grid{ grid-template-columns:repeat(2,1fr); }
  .grid-2{ grid-template-columns:1fr; }
  .role-grid{ grid-template-columns:1fr; }
  .gauge-row{ grid-template-columns:110px 1fr 46px; }
}
`;
