import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Shield, Cpu, ListOrdered, Database, AlertCircle,
  Inbox, Settings as SettingsIcon, LogOut, Search, Bell, ChevronDown,
  ChevronRight, X, Download, RefreshCw, UserPlus, Server, Cloud,
  Share2, Activity, CheckCircle2, AlertTriangle, Play, Pause, RotateCcw,
  Clock, ShieldCheck, Key, Lock, Trash2, Eye, Filter
} from 'lucide-react';
import logoImg from '../../assets/logo.jpg';

/* =========================================================================
   MOCK DATA (Matching sysadmin.png & System Admin Infrastructure)
   ========================================================================= */

const INITIAL_USERS = [
  { id: 'USR-01', name: 'Abishek B K', email: 'abishek@nilora.gov.in', role: 'System Administrator', status: 'Online', lastActive: 'Just now', district: 'State HQ' },
  { id: 'USR-02', name: 'R. Subramaniam', email: 'subramaniam.r@tn.gov.in', role: 'District Administrator', status: 'Online', lastActive: '2 mins ago', district: 'Coimbatore' },
  { id: 'USR-03', name: 'Dr. K. Prakash', email: 'prakash.k@tn.gov.in', role: 'State Nodal Officer', status: 'Online', lastActive: '8 mins ago', district: 'State HQ' },
  { id: 'USR-04', name: 'Meena R', email: 'meena.r@rev.gov.in', role: 'Field & Verification Officer', status: 'Online', lastActive: '12 mins ago', district: 'Pollachi' },
  { id: 'USR-05', name: 'S. Iyer', email: 'iyer.s@audit.gov.in', role: 'Auditor', status: 'Online', lastActive: '15 mins ago', district: 'State HQ' },
  { id: 'USR-06', name: 'Karthik S', email: 'karthik.s@reg.gov.in', role: 'Registrar', status: 'Online', lastActive: '24 mins ago', district: 'Coimbatore' },
  { id: 'USR-07', name: 'Deepa N', email: 'deepa.n@rev.gov.in', role: 'Field & Verification Officer', status: 'Offline', lastActive: '2 hours ago', district: 'Sulur' },
  { id: 'USR-08', name: 'M. Anand', email: 'anand.m@rev.gov.in', role: 'Tahsildar', status: 'Offline', lastActive: 'Yesterday', district: 'Pollachi' }
];

const AI_WORKERS = [
  { id: 'worker-01', name: 'ExtractNet-Node-A1', type: 'OCR & Layout Engine', status: 'Active', cpu: '54%', memory: '2.1 GB', processed: 1420, errors: 0 },
  { id: 'worker-02', name: 'ExtractNet-Node-A2', type: 'OCR & Layout Engine', status: 'Active', cpu: '68%', memory: '2.4 GB', processed: 1390, errors: 1 },
  { id: 'worker-03', name: 'SpatialVector-Node-01', type: 'Cadastral Polygon Vectorizer', status: 'Active', cpu: '78%', memory: '3.6 GB', processed: 820, errors: 0 },
  { id: 'worker-04', name: 'SpatialVector-Node-02', type: 'Cadastral Polygon Vectorizer', status: 'Active', cpu: '72%', memory: '3.4 GB', processed: 790, errors: 0 },
  { id: 'worker-05', name: 'HTR-Tamil-Node-01', type: 'Handwritten Tamil AI (1890-1980)', status: 'Active', cpu: '81%', memory: '4.1 GB', processed: 650, errors: 2 },
  { id: 'worker-06', name: 'CrossCheck-Rules-01', type: 'Discrepancy Validator', status: 'Active', cpu: '42%', memory: '1.8 GB', processed: 2840, errors: 0 },
  { id: 'worker-07', name: 'HashChain-Ledger-01', type: 'Blockchain Seal Validator', status: 'Active', cpu: '36%', memory: '1.5 GB', processed: 3120, errors: 0 },
  { id: 'worker-08', name: 'PDF-Ingest-Worker-01', type: 'High-Res Ingestion Pipeline', status: 'Active', cpu: '49%', memory: '1.9 GB', processed: 1890, errors: 1 },
  { id: 'worker-09', name: 'GIS-GeoServer-Worker', type: 'WMS/WFS Tile Renderer', status: 'Active', cpu: '61%', memory: '2.8 GB', processed: 940, errors: 0 }
];

const ERROR_LOGS = [
  { id: 'ERR-9841', timestamp: '10:24:18 AM', level: 'ERROR', service: 'ExtractNet-Node-A2', message: 'Tesseract OCR engine low contrast memory buffer timeout on doc_1044_scan.jpg', trace: 'TimeoutException at OCRPipeline.cpp:418' },
  { id: 'ERR-9840', timestamp: '09:41:02 AM', level: 'WARN', service: 'GIS-GeoServer-Worker', message: 'Coordinate projection EPSG:3857 datum transformation variance > 0.05m', trace: 'TransformWarning at Proj4CRS.js:102' },
  { id: 'ERR-9839', timestamp: '08:15:33 AM', level: 'ERROR', service: 'HTR-Tamil-Node-01', message: 'Corrupted TIFF header in 1921 settlement deed scan 153_1921.tiff', trace: 'ImageDecodeError at IngestWorker.py:88' },
  { id: 'ERR-9838', timestamp: '07:50:11 AM', level: 'INFO', service: 'HashChain-Ledger-01', message: 'State block #88231 successfully verified across 4 validator nodes', trace: 'ConsensusReached at LedgerNode.go:204' }
];

export default function SystemAdministratorDashboard({ userName = 'System Administrator', onLogout = () => {}, addToast = () => {} }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [resourceTimeframe, setResourceTimeframe] = useState('Last 24 hours');
  const [resourceDropdownOpen, setResourceDropdownOpen] = useState(false);

  // Modals & Sub-state
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Field & Verification Officer', district: 'Coimbatore' });
  const [workerList, setWorkerList] = useState(AI_WORKERS);

  useEffect(() => {
    if (document.getElementById('sys-dash-fonts')) return;
    const link = document.createElement('link');
    link.id = 'sys-dash-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  function handleAddUser(e) {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    const newEntry = {
      id: `USR-${String(users.length + 1).padStart(2, '0')}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'Online',
      lastActive: 'Just now',
      district: newUser.district
    };
    setUsers([newEntry, ...users]);
    setAddUserModalOpen(false);
    setNewUser({ name: '', email: '', role: 'Field & Verification Officer', district: 'Coimbatore' });
    addToast(`User ${newEntry.name} provisioned successfully`, 'success');
  }

  function restartWorker(workerId) {
    addToast(`Restarting ${workerId}...`, 'info');
    setTimeout(() => {
      setWorkerList(prev => prev.map(w => w.id === workerId ? { ...w, cpu: '12%', memory: '1.2 GB', errors: 0 } : w));
      addToast(`${workerId} restarted and healthy`, 'success');
    }, 1000);
  }

  function restartAllWorkers() {
    addToast('Restarting all 9 AI pipeline worker nodes...', 'info');
    setTimeout(() => {
      setWorkerList(prev => prev.map(w => ({ ...w, cpu: `${Math.floor(Math.random() * 25 + 20)}%`, errors: 0 })));
      addToast('All AI Worker nodes successfully re-initialized', 'success');
    }, 1200);
  }

  return (
    <div className="sys-root">
      <style>{SYS_ADMIN_STYLES}</style>

      {/* =====================================================================
          SIDEBAR NAVIGATION (Darker Mint Green #c5ebd7 -> #b2dfc8)
          ===================================================================== */}
      <aside className="sys-sidebar">
        <div className="sys-sidebar-top">
          {/* Brand Logo */}
          <div className="sys-brand" onClick={() => setActiveTab('dashboard')}>
            <div className="sys-brand-logo-wrap">
              <img src={logoImg} alt="NilOra" className="sys-logo-img" />
            </div>
            <div className="sys-brand-text-col">
              <span className="sys-brand-title">Nilora</span>
              <span className="sys-brand-sub">LAND RECORDS AT ORIGIN</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="sys-nav">
            <button
              className={`sys-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button
              className={`sys-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} />
              <span>User Management</span>
            </button>
            <button
              className={`sys-nav-item ${activeTab === 'roles' ? 'active' : ''}`}
              onClick={() => setActiveTab('roles')}
            >
              <Shield size={18} />
              <span>Roles &amp; Permissions</span>
            </button>
            <button
              className={`sys-nav-item ${activeTab === 'workers' ? 'active' : ''}`}
              onClick={() => setActiveTab('workers')}
            >
              <Cpu size={18} />
              <span>AI Workers</span>
            </button>
            <button
              className={`sys-nav-item ${activeTab === 'queue' ? 'active' : ''}`}
              onClick={() => setActiveTab('queue')}
            >
              <ListOrdered size={18} />
              <span>Queue Status</span>
            </button>
            <button
              className={`sys-nav-item ${activeTab === 'db' ? 'active' : ''}`}
              onClick={() => setActiveTab('db')}
            >
              <Database size={18} />
              <span>Database Health</span>
            </button>
            <button
              className={`sys-nav-item ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              <AlertCircle size={18} />
              <span>Error Logs</span>
            </button>
            <button
              className={`sys-nav-item ${activeTab === 'dlq' ? 'active' : ''}`}
              onClick={() => setActiveTab('dlq')}
            >
              <Inbox size={18} />
              <span>Dead Letter Queue</span>
            </button>
          </nav>
        </div>

        {/* Bottom Nav */}
        <div className="sys-sidebar-bottom">
          <button
            className={`sys-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>
          <button className="sys-nav-item" onClick={onLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =====================================================================
          MAIN CONTENT WRAPPER
          ===================================================================== */}
      <div className="sys-main-wrapper">
        {/* Top Header */}
        <header className="sys-header">
          <div className="sys-header-left">
            <span className="sys-live-dot" />
            <span className="sys-role-title">System Administrator</span>
          </div>

          <div className="sys-header-right">
            {/* Search Pill */}
            <div className="sys-search-pill">
              <Search size={16} className="text-muted" />
              <input
                type="text"
                placeholder="Search users, jobs, logs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button className="sys-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={18} />
                <span className="sys-bell-dot" />
              </button>
              {notifOpen && (
                <div className="sys-dropdown sys-notif-dd">
                  <div className="sys-dd-head">
                    <b>System Alerts</b>
                    <span className="sys-pill-sm">4 Alerts</span>
                  </div>
                  <div className="sys-notif-item">
                    <div className="notif-t">Dead Letter Queue Alert</div>
                    <div className="notif-s">4 jobs failed after 3 retries in worker pool</div>
                    <div className="notif-tm">12 mins ago</div>
                  </div>
                  <div className="sys-notif-item">
                    <div className="notif-t">Memory Utilization 74%</div>
                    <div className="notif-s">Node pool auto-scaling triggered</div>
                    <div className="notif-tm">25 mins ago</div>
                  </div>
                  <div className="sys-notif-item">
                    <div className="notif-t">Daily Database Backup</div>
                    <div className="notif-s">Snapshot created successfully (14.2 GB)</div>
                    <div className="notif-tm">2 hours ago</div>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar Pill */}
            <div className="relative">
              <button className="sys-user-pill" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="sys-avatar">S</div>
                <span className="sys-user-name">System Administrator</span>
                <ChevronDown size={14} className="text-muted" />
              </button>
              {profileOpen && (
                <div className="sys-dropdown sys-profile-dd">
                  <div className="sys-dd-user">
                    <b>System Administrator</b>
                    <span>sysadmin@nilora.gov.in</span>
                  </div>
                  <div className="sys-dd-divider" />
                  <button className="sys-dd-item" onClick={() => { setActiveTab('settings'); setProfileOpen(false); }}>
                    <SettingsIcon size={14} /> System Settings
                  </button>
                  <button className="sys-dd-item danger" onClick={onLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ===================================================================
            STAGE VIEW: DASHBOARD TAB
            =================================================================== */}
        {activeTab === 'dashboard' && (
          <div className="sys-content-stage">
            {/* Hero Row */}
            <div className="sys-hero-row">
              <div className="sys-hero-text">
                <div className="sys-title-wrap">
                  <h1 className="sys-title">Welcome Back</h1>
                  <span className="sys-gear-icon">⚙️</span>
                </div>
                <p className="sys-subtitle">Monitor and manage system resources, users, and AI pipeline.</p>
              </div>
              <div className="sys-date-card">
                <div className="sys-date-ic">
                  <Clock size={20} className="text-emerald" />
                </div>
                <div className="sys-date-text">
                  <span className="sys-date-num">Wed, 03 Sep 2026</span>
                  <span className="sys-day">Wednesday</span>
                </div>
              </div>
            </div>

            {/* 4 Top KPI Cards Grid */}
            <div className="sys-kpi-grid">
              {/* Card 1: Active Users */}
              <div className="sys-kpi-card" onClick={() => setActiveTab('users')}>
                <div className="kpi-icon-box bg-mint">
                  <Users size={20} className="text-emerald" />
                </div>
                <div className="kpi-body">
                  <div className="kpi-val">6</div>
                  <div className="kpi-lbl">Active Users</div>
                  <div className="kpi-status-row">
                    <span className="dot dot-green" />
                    <span className="status-txt">Online</span>
                  </div>
                </div>
              </div>

              {/* Card 2: AI Latency */}
              <div className="sys-kpi-card" onClick={() => setActiveTab('workers')}>
                <div className="kpi-icon-box bg-mint">
                  <Activity size={20} className="text-emerald" />
                </div>
                <div className="kpi-body">
                  <div className="kpi-val">1.2s</div>
                  <div className="kpi-lbl">AI Latency</div>
                  <div className="kpi-status-row">
                    <span className="dot dot-green" />
                    <span className="status-txt">Normal</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Failed Jobs */}
              <div className="sys-kpi-card" onClick={() => setActiveTab('dlq')}>
                <div className="kpi-icon-box bg-peach">
                  <AlertTriangle size={20} className="text-red" />
                </div>
                <div className="kpi-body">
                  <div className="kpi-val">4</div>
                  <div className="kpi-lbl">Failed Jobs</div>
                  <div className="kpi-status-row">
                    <span className="dot dot-red" />
                    <span className="status-txt text-red">Requires attention</span>
                  </div>
                </div>
              </div>

              {/* Card 4: System Uptime */}
              <div className="sys-kpi-card">
                <div className="kpi-icon-box bg-mint">
                  <ShieldCheck size={20} className="text-emerald" />
                </div>
                <div className="kpi-body">
                  <div className="kpi-val">99.99%</div>
                  <div className="kpi-lbl">System Uptime</div>
                  <div className="kpi-status-row">
                    <span className="dot dot-green" />
                    <span className="status-txt">Healthy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Resource Usage & AI Worker Queue */}
            <div className="sys-middle-grid">
              {/* Left Card: Resource Usage */}
              <div className="sys-card">
                <div className="sys-card-head">
                  <div className="sys-card-head-left">
                    <Database size={18} className="text-emerald" />
                    <h3 className="sys-card-title">Resource Usage</h3>
                  </div>
                  <div className="sys-timeframe-dropdown">
                    <button
                      className="sys-timeframe-btn"
                      onClick={() => setResourceDropdownOpen(!resourceDropdownOpen)}
                    >
                      <Clock size={14} />
                      <span>{resourceTimeframe}</span>
                      <ChevronDown size={14} />
                    </button>
                    {resourceDropdownOpen && (
                      <div className="sys-tf-menu">
                        {['Last 1 hour', 'Last 6 hours', 'Last 24 hours', 'Last 7 days'].map(tf => (
                          <button
                            key={tf}
                            className="sys-tf-item"
                            onClick={() => { setResourceTimeframe(tf); setResourceDropdownOpen(false); }}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4 Circular Gauge Rings */}
                <div className="sys-gauges-grid">
                  {/* Gauge 1: CPU */}
                  <div className="gauge-col">
                    <div className="gauge-wrap">
                      <svg viewBox="0 0 36 36" className="gauge-svg">
                        <path className="gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="gauge-val" strokeDasharray="62, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="gauge-pct">62%</div>
                    </div>
                    <div className="gauge-meta">
                      <Cpu size={16} className="gauge-ic" />
                      <span className="gauge-name">CPU</span>
                    </div>
                  </div>

                  {/* Gauge 2: Memory */}
                  <div className="gauge-col">
                    <div className="gauge-wrap">
                      <svg viewBox="0 0 36 36" className="gauge-svg">
                        <path className="gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="gauge-val" strokeDasharray="74, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="gauge-pct">74%</div>
                    </div>
                    <div className="gauge-meta">
                      <Database size={16} className="gauge-ic" />
                      <span className="gauge-name">Memory</span>
                    </div>
                  </div>

                  {/* Gauge 3: Database */}
                  <div className="gauge-col">
                    <div className="gauge-wrap">
                      <svg viewBox="0 0 36 36" className="gauge-svg">
                        <path className="gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="gauge-val" strokeDasharray="68, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="gauge-pct">68%</div>
                    </div>
                    <div className="gauge-meta">
                      <Cloud size={16} className="gauge-ic" />
                      <span className="gauge-name">Database</span>
                    </div>
                  </div>

                  {/* Gauge 4: API Gateway */}
                  <div className="gauge-col">
                    <div className="gauge-wrap">
                      <svg viewBox="0 0 36 36" className="gauge-svg">
                        <path className="gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="gauge-val" strokeDasharray="38, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="gauge-pct">38%</div>
                    </div>
                    <div className="gauge-meta">
                      <Share2 size={16} className="gauge-ic" />
                      <span className="gauge-name">API Gateway</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Card: AI Worker Queue */}
              <div className="sys-card">
                <div className="sys-card-head">
                  <div className="sys-card-head-left">
                    <Cpu size={18} className="text-emerald" />
                    <h3 className="sys-card-title">AI Worker Queue</h3>
                  </div>
                </div>

                {/* 3 Metric Badges */}
                <div className="sys-queue-metrics">
                  <div className="q-metric-box">
                    <div className="q-num">500</div>
                    <div className="q-lbl">Docs Waiting</div>
                  </div>
                  <div className="q-metric-box">
                    <div className="q-num">9</div>
                    <div className="q-lbl">Active Workers</div>
                  </div>
                  <div className="q-metric-box">
                    <div className="q-num">2m 14s</div>
                    <div className="q-lbl">Avg Wait Time</div>
                  </div>
                </div>

                {/* Wave Frequency Bar Chart (Green gradient bars) */}
                <div className="sys-wave-bars">
                  {[30, 45, 55, 70, 85, 95, 75, 88, 92, 80, 84, 76, 78, 70, 60, 45, 35, 25].map((h, i) => (
                    <div key={i} className="wave-bar-col">
                      <div
                        className="wave-bar-fill"
                        style={{
                          height: `${h}%`,
                          background: i < 5 ? '#0c5838' : i < 11 ? '#10b981' : '#a7f3d0'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Section: Quick Actions */}
            <div className="sys-card">
              <div className="sys-card-head">
                <div className="sys-card-head-left">
                  <span className="text-emerald font-bold">⚡</span>
                  <h3 className="sys-card-title">Quick Actions</h3>
                </div>
              </div>

              <div className="sys-quick-grid">
                <button className="sys-quick-btn" onClick={() => setAddUserModalOpen(true)}>
                  <UserPlus size={18} className="text-emerald" />
                  <span>Add / Manage User</span>
                  <ChevronRight size={16} className="q-arrow" />
                </button>
                <button className="sys-quick-btn" onClick={restartAllWorkers}>
                  <RefreshCw size={18} className="text-emerald" />
                  <span>Restart AI Worker</span>
                  <ChevronRight size={16} className="q-arrow" />
                </button>
                <button className="sys-quick-btn" onClick={() => setActiveTab('logs')}>
                  <AlertCircle size={18} className="text-emerald" />
                  <span>View Error Logs</span>
                  <ChevronRight size={16} className="q-arrow" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-VIEW: USER MANAGEMENT
            =================================================================== */}
        {activeTab === 'users' && (
          <div className="sys-content-stage">
            <div className="sys-card">
              <div className="sys-card-head">
                <div>
                  <h2 className="sys-card-title">System Users &amp; Access Controls</h2>
                  <p className="sys-card-sub">Active sessions, provisioned roles, and district assignments.</p>
                </div>
                <button className="sys-btn-primary" onClick={() => setAddUserModalOpen(true)}>
                  <UserPlus size={16} /> + Add New User
                </button>
              </div>

              <div className="sys-table-wrap">
                <table className="sys-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>System Role</th>
                      <th>District Assigned</th>
                      <th>Status</th>
                      <th>Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="mono font-bold text-emerald">{u.id}</td>
                        <td><b>{u.name}</b></td>
                        <td className="mono">{u.email}</td>
                        <td><span className="role-tag">{u.role}</span></td>
                        <td>{u.district}</td>
                        <td>
                          <span className={`status-pill ${u.status === 'Online' ? 'online' : 'offline'}`}>
                            <span className="dot" /> {u.status}
                          </span>
                        </td>
                        <td className="mono text-muted">{u.lastActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-VIEW: AI WORKERS
            =================================================================== */}
        {activeTab === 'workers' && (
          <div className="sys-content-stage">
            <div className="sys-card">
              <div className="sys-card-head">
                <div>
                  <h2 className="sys-card-title">AI Pipeline Compute Pool (9 Worker Nodes)</h2>
                  <p className="sys-card-sub">Real-time status, CPU/Memory telemetry, and node restart triggers.</p>
                </div>
                <button className="sys-btn-primary" onClick={restartAllWorkers}>
                  <RefreshCw size={15} /> Restart All Workers
                </button>
              </div>

              <div className="sys-workers-grid">
                {workerList.map(w => (
                  <div key={w.id} className="worker-card">
                    <div className="w-head">
                      <div>
                        <b className="w-name">{w.name}</b>
                        <span className="w-type">{w.type}</span>
                      </div>
                      <span className="w-badge">Active</span>
                    </div>
                    <div className="w-stats-row">
                      <div><span className="lbl">CPU Load</span><b className="mono">{w.cpu}</b></div>
                      <div><span className="lbl">Memory</span><b className="mono">{w.memory}</b></div>
                      <div><span className="lbl">Processed</span><b className="mono">{w.processed} docs</b></div>
                    </div>
                    <button className="w-restart-btn" onClick={() => restartWorker(w.id)}>
                      <RotateCcw size={13} /> Restart Node
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-VIEW: ERROR LOGS & DLQ
            =================================================================== */}
        {(activeTab === 'logs' || activeTab === 'dlq' || activeTab === 'queue' || activeTab === 'db' || activeTab === 'roles') && (
          <div className="sys-content-stage">
            <div className="sys-card">
              <div className="sys-card-head">
                <div>
                  <h2 className="sys-card-title">System Error Logs &amp; Telemetry Stream</h2>
                  <p className="sys-card-sub">Real-time exception tracking across backend workers and database replicas.</p>
                </div>
                <button className="sys-btn-primary" onClick={() => addToast('Logs exported to logfile.txt', 'success')}>
                  <Download size={15} /> Export Logs
                </button>
              </div>

              <div className="sys-logs-list">
                {ERROR_LOGS.map(err => (
                  <div key={err.id} className="sys-log-row">
                    <div className="log-top">
                      <span className={`log-badge ${err.level.toLowerCase()}`}>{err.level}</span>
                      <span className="log-srv font-bold">{err.service}</span>
                      <span className="log-time mono">{err.timestamp}</span>
                    </div>
                    <div className="log-msg">{err.message}</div>
                    <div className="log-trace mono">{err.trace}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-VIEW: SETTINGS
            =================================================================== */}
        {activeTab === 'settings' && (
          <div className="sys-content-stage">
            <div className="sys-card">
              <div className="sys-card-head">
                <h2 className="sys-card-title">System Administrator Preferences</h2>
              </div>
              <form className="sys-form" onSubmit={e => { e.preventDefault(); addToast('Settings saved successfully', 'success'); }}>
                <div className="form-group">
                  <label>Administrator Name</label>
                  <input type="text" defaultValue={userName} />
                </div>
                <div className="form-group">
                  <label>Alert Email Webhook</label>
                  <input type="email" defaultValue="sysadmin@nilora.gov.in" />
                </div>
                <div className="form-group">
                  <label>Auto-Scaling Worker Ceiling</label>
                  <select defaultValue="12">
                    <option value="9">9 Nodes (Standard)</option>
                    <option value="12">12 Nodes (Burst Capacity)</option>
                    <option value="18">18 Nodes (Peak Digitization Load)</option>
                  </select>
                </div>
                <button type="submit" className="sys-btn-primary">Save Changes</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL: ADD / MANAGE USER
          ===================================================================== */}
      {addUserModalOpen && (
        <div className="sys-modal-overlay" onClick={() => setAddUserModalOpen(false)}>
          <div className="sys-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="sys-modal-head">
              <div>
                <span className="sys-modal-tag">ACCESS MANAGEMENT</span>
                <h3 className="sys-modal-title">Provision New User Account</h3>
              </div>
              <button className="sys-modal-close" onClick={() => setAddUserModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="sys-modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. S. Subramaniam"
                    value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Official Email</label>
                  <input
                    type="email"
                    placeholder="e.g. subramaniam.s@tn.gov.in"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>System Role</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="District Administrator">District Administrator</option>
                    <option value="Field & Verification Officer">Field &amp; Verification Officer</option>
                    <option value="Auditor">Auditor</option>
                    <option value="Registrar">Registrar</option>
                    <option value="State Nodal Officer">State Nodal Officer</option>
                    <option value="Tahsildar">Tahsildar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Revenue District</label>
                  <select
                    value={newUser.district}
                    onChange={e => setNewUser({ ...newUser, district: e.target.value })}
                  >
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Tiruppur">Tiruppur</option>
                    <option value="Salem">Salem</option>
                    <option value="Erode">Erode</option>
                    <option value="State HQ">State HQ (All Districts)</option>
                  </select>
                </div>
              </div>
              <div className="sys-modal-footer">
                <button type="button" className="sys-btn-secondary" onClick={() => setAddUserModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sys-btn-primary">
                  <UserPlus size={15} /> Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   EMBEDDED STYLES (Matching sysadmin.png)
   ========================================================================= */

const SYS_ADMIN_STYLES = `
.sys-root {
  display: flex;
  min-height: 100vh;
  background: #f4fbf7;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #0c281a;
  overflow-x: hidden;
}

.sys-root * {
  box-sizing: border-box;
}

/* Sidebar (Darker Mint Green #c5ebd7 -> #b2dfc8) */
.sys-sidebar {
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

.sys-sidebar-top {
  display: flex;
  flex-direction: column;
}

.sys-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 24px;
  cursor: pointer;
  user-select: none;
}

.sys-brand-logo-wrap {
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

.sys-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sys-brand-text-col {
  display: flex;
  flex-direction: column;
}

.sys-brand-title {
  font-size: 20px;
  font-weight: 800;
  color: #0c281a;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.sys-brand-sub {
  font-size: 8.5px;
  font-weight: 800;
  color: #059669;
  letter-spacing: 0.08em;
  margin-top: 2px;
}

.sys-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sys-nav-item {
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

.sys-nav-item:hover {
  background: rgba(255, 255, 255, 0.75);
  color: #047857;
}

.sys-nav-item.active {
  background: #094e32;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(9, 78, 50, 0.32);
}

.sys-sidebar-bottom {
  border-top: 1px solid #7bc69e;
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Main Layout */
.sys-main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
}

.sys-header {
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(163, 222, 192, 0.4);
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1000;
}

.sys-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sys-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.sys-role-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.sys-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sys-search-pill {
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

.sys-search-pill input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 12.5px;
  font-family: inherit;
  width: 100%;
  color: #111827;
}

.sys-icon-btn {
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

.sys-bell-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  border: 1.5px solid #ffffff;
}

.sys-user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
}

.sys-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #0c5838;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sys-user-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #111827;
}

.sys-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  padding: 12px;
  z-index: 50000;
}

.sys-profile-dd { width: 220px; }
.sys-notif-dd { width: 300px; }

.sys-dd-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 10px;
}

.sys-pill-sm {
  font-size: 11px;
  font-weight: 700;
  background: #fee2e2;
  color: #dc2626;
  padding: 2px 6px;
  border-radius: 4px;
}

.sys-notif-item {
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.notif-t { font-size: 12.5px; font-weight: 700; color: #111827; }
.notif-s { font-size: 11.5px; color: #4b6354; margin: 2px 0; }
.notif-tm { font-size: 10.5px; color: #9ca3af; }

.sys-dd-user { display: flex; flex-direction: column; padding: 4px; }
.sys-dd-user b { font-size: 13.5px; color: #111827; }
.sys-dd-user span { font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px; }
.sys-dd-divider { height: 1px; background: #f3f4f6; margin: 8px 0; }

.sys-dd-item {
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

.sys-dd-item:hover { background: #f0fdf4; color: #059669; }
.sys-dd-item.danger:hover { background: #fef2f2; color: #dc2626; }

/* Stage Content */
.sys-content-stage {
  padding: 28px 36px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sys-hero-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.sys-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sys-title {
  font-size: 26px;
  font-weight: 800;
  color: #0c281a;
  margin: 0;
  line-height: 1.25;
}

.sys-gear-icon {
  font-size: 20px;
}

.sys-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: #4b6354;
  margin: 4px 0 0;
}

.sys-date-card {
  background: #ffffff;
  border: 1px solid rgba(163, 222, 192, 0.6);
  padding: 8px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.sys-date-text {
  display: flex;
  flex-direction: column;
}

.sys-day {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.sys-date-num {
  font-size: 13.5px;
  color: #0c281a;
  font-weight: 800;
}

/* 4 KPI Cards Grid */
.sys-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.sys-kpi-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(163, 222, 192, 0.45);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.18s ease;
}

.sys-kpi-card:hover {
  transform: translateY(-2px);
  border-color: #059669;
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.08);
}

.kpi-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.bg-mint { background: #dcfce7; }
.bg-peach { background: #fee2e2; }

.text-emerald { color: #059669; }
.text-red { color: #dc2626; }

.kpi-body {
  display: flex;
  flex-direction: column;
}

.kpi-val {
  font-size: 26px;
  font-weight: 800;
  color: #0c281a;
  line-height: 1.1;
}

.kpi-lbl {
  font-size: 12.5px;
  font-weight: 600;
  color: #4b6354;
  margin-top: 2px;
}

.kpi-status-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot-green { background: #10b981; }
.dot-red { background: #ef4444; }

.status-txt {
  font-size: 11px;
  font-weight: 700;
  color: #059669;
}

/* Middle Row */
.sys-middle-grid {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 18px;
}

.sys-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(163, 222, 192, 0.45);
  padding: 20px 22px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
}

.sys-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.sys-card-head-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sys-card-title {
  font-size: 15.5px;
  font-weight: 800;
  color: #0c281a;
  margin: 0;
}

.sys-card-sub {
  font-size: 12px;
  color: #6b7280;
  margin: 3px 0 0;
}

.sys-timeframe-dropdown {
  position: relative;
}

.sys-timeframe-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8faf9;
  border: 1px solid #d1d5db;
  padding: 5px 10px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
}

.sys-tf-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  padding: 4px;
  z-index: 5000;
  width: 140px;
}

.sys-tf-item {
  width: 100%;
  padding: 6px 8px;
  text-align: left;
  border: none;
  background: transparent;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
}

.sys-tf-item:hover {
  background: #f0fdf4;
  color: #059669;
}

/* 4 Gauges Grid */
.sys-gauges-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 10px 0;
}

.gauge-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.gauge-wrap {
  position: relative;
  width: 80px;
  height: 80px;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gauge-bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 3.5;
}

.gauge-val {
  fill: none;
  stroke: #0c5838;
  stroke-width: 3.5;
  stroke-linecap: round;
}

.gauge-pct {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  color: #0c281a;
}

.gauge-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: #374151;
}

.gauge-ic {
  color: #059669;
}

/* AI Worker Queue Metrics & Wave Graph */
.sys-queue-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.q-metric-box {
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  text-align: center;
}

.q-num {
  font-size: 18px;
  font-weight: 800;
  color: #0c281a;
}

.q-lbl {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin-top: 2px;
}

.sys-wave-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 90px;
  padding: 0 4px 4px;
  border-bottom: 1.5px solid #e5e7eb;
}

.wave-bar-col {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.wave-bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

/* Quick Actions */
.sys-quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.sys-quick-btn {
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.16s ease;
}

.sys-quick-btn:hover {
  background: #f0fdf4;
  border-color: #a3dec0;
}

.q-arrow {
  margin-left: auto;
  color: #9ca3af;
}

/* User Management Table */
.sys-table-wrap {
  overflow-x: auto;
}

.sys-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.sys-table th {
  text-align: left;
  padding: 10px 12px;
  background: #f8faf9;
  border-bottom: 2px solid #e5e7eb;
  font-size: 11.5px;
  font-weight: 800;
  color: #4b6354;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sys-table td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #1f2937;
}

.role-tag {
  font-size: 11.5px;
  font-weight: 700;
  background: #f3f4f6;
  color: #374151;
  padding: 2px 8px;
  border-radius: 6px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 99px;
}

.status-pill.online {
  background: #dcfce7;
  color: #166534;
}

.status-pill.offline {
  background: #f3f4f6;
  color: #6b7280;
}

/* Workers Grid */
.sys-workers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.worker-card {
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.w-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.w-name { font-size: 14px; color: #111827; }
.w-type { font-size: 11.5px; color: #6b7280; display: block; margin-top: 2px; }
.w-badge { font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; padding: 2px 7px; border-radius: 4px; }

.w-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  font-size: 12px;
}

.w-stats-row .lbl { font-size: 10.5px; color: #6b7280; display: block; }

.w-restart-btn {
  background: #ffffff;
  border: 1px solid #d1d5db;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}

.w-restart-btn:hover {
  background: #f0fdf4;
  color: #059669;
  border-color: #a3dec0;
}

/* Logs */
.sys-logs-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sys-log-row {
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 16px;
}

.log-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.log-badge {
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.log-badge.error { background: #fee2e2; color: #dc2626; }
.log-badge.warn { background: #fef3c7; color: #b45309; }
.log-badge.info { background: #e0f2fe; color: #0284c7; }

.log-srv { font-size: 12.5px; color: #111827; }
.log-time { font-size: 11px; color: #9ca3af; margin-left: auto; }
.log-msg { font-size: 13px; color: #1f2937; margin-bottom: 4px; }
.log-trace { font-size: 11.5px; color: #6b7280; }

/* Forms & Buttons */
.sys-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
  margin-top: 10px;
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

.sys-btn-primary {
  background: #094e32;
  color: #ffffff;
  border: none;
  padding: 9px 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.sys-btn-secondary {
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

/* Modals */
.sys-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 24, 13, 0.75);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  padding: 20px;
}

.sys-modal-dialog {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}

.sys-modal-head {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #f8faf9;
  border-bottom: 1px solid #f3f4f6;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.sys-modal-tag {
  font-size: 11px;
  font-weight: 800;
  color: #059669;
  letter-spacing: 0.06em;
}

.sys-modal-title {
  font-size: 18px;
  font-weight: 800;
  color: #0c281a;
  margin: 3px 0 0;
}

.sys-modal-close {
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

.sys-modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sys-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
  background: #f8faf9;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
}

@media (max-width: 1100px) {
  .sys-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .sys-middle-grid { grid-template-columns: 1fr; }
  .sys-quick-grid { grid-template-columns: 1fr; }
  .sys-workers-grid { grid-template-columns: 1fr; }
  .sys-gauges-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .sys-root { flex-direction: column; }
  .sys-sidebar { width: 100%; }
}
`;
