import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Trophy, TrendingUp, Radio, Map as MapIcon, Layers,
  Database, ShieldCheck, SlidersHorizontal, Settings as SettingsIcon, LogOut,
  Search, Bell, ChevronDown, ChevronRight, X, Download, Wifi, WifiOff,
  Activity, ArrowUpRight, ArrowDownRight, Send, Filter, CheckCircle2,
  AlertTriangle, RefreshCw, Key, Megaphone, Check, Globe, MapPin, Eye,
  Sliders, Shield, FileText, CheckCircle, Clock
} from 'lucide-react';
import logoImg from '../../assets/logo.jpg';
import RealCadastralMap from '../Common/RealCadastralMap';

/* =========================================================================
   MOCK DATA (Matching statenodalofficier.png & State Nodal Ecosystem)
   ========================================================================= */

const DISTRICT_PROGRESS_DATA = [
  { name: 'Chennai', progress: 92, digitized: '184.3K', discrepancy: 3.1, trend: '+2.4%', status: 'Leading', officers: 28 },
  { name: 'Kanchipuram', progress: 82, digitized: '121.8K', discrepancy: 4.6, trend: '+1.8%', status: 'On Track', officers: 19 },
  { name: 'Coimbatore', progress: 78, digitized: '158.9K', discrepancy: 5.2, trend: '+3.1%', status: 'On Track', officers: 32 },
  { name: 'Tiruchirapalli', progress: 71, digitized: '97.4K', discrepancy: 6.0, trend: '+0.9%', status: 'On Track', officers: 22 },
  { name: 'Madurai', progress: 65, digitized: '88.3K', discrepancy: 6.7, trend: '+2.0%', status: 'Moderate', officers: 24 },
  { name: 'Salem', progress: 54, digitized: '60.1K', discrepancy: 9.3, trend: '-0.6%', status: 'Needs Review', officers: 18 },
  { name: 'Erode', progress: 60, digitized: '64.2K', discrepancy: 7.4, trend: '-1.2%', status: 'Moderate', officers: 16 },
  { name: 'Dindigul', progress: 58, digitized: '51.7K', discrepancy: 8.1, trend: '+0.4%', status: 'Moderate', officers: 14 },
  { name: 'Vellore', progress: 44, digitized: '39.8K', discrepancy: 10.8, trend: '+0.7%', status: 'Lagging', officers: 15 },
  { name: 'Tirunelveli', progress: 48, digitized: '42.6K', discrepancy: 9.9, trend: '+1.1%', status: 'Lagging', officers: 17 }
];

const INTEGRATIONS_HEALTH = [
  {
    id: 'lrms',
    name: 'LRMS API',
    subtitle: '2 mins ago',
    status: 'Connected',
    statusTone: 'green',
    uptime: '99.8%',
    latency: '184ms',
    endpoint: 'https://lrms.tn.gov.in/api/v3',
    recordsSynced: '1,042,850'
  },
  {
    id: 'gis',
    name: 'State GIS API',
    subtitle: 'Syncing now',
    status: 'Syncing',
    statusTone: 'amber',
    uptime: '97.2%',
    latency: '412ms',
    endpoint: 'https://gis.tn.gov.in/cadastral/v2',
    recordsSynced: '784,120'
  },
  {
    id: 'legacy',
    name: 'Legacy DB',
    subtitle: '5 mins ago',
    status: 'Connected',
    statusTone: 'green',
    uptime: '99.9%',
    latency: '96ms',
    endpoint: 'https://archive-db.tn.gov.in',
    recordsSynced: '2,450,000'
  }
];

const INITIAL_POLICIES = [
  { id: 'p1', title: 'Auto-validate records above confidence threshold', desc: 'Skip manual review when every extracted field clears the AI confidence threshold.', enabled: true, category: 'AI Validation' },
  { id: 'p2', title: 'Require dual verification for mutation records', desc: 'Mutation-type documents require sign-off from both Tahsildar and District Administrator.', enabled: true, category: 'Compliance' },
  { id: 'p3', title: 'Allow Field Officers to bulk upload', desc: 'Field & Verification Officers can queue up to 50 documents in a single batch.', enabled: false, category: 'Ingestion' },
  { id: 'p4', title: 'Enable citizen grievance auto-routing', desc: 'Route incoming citizen discrepancy queries automatically to taluk Tahsildar by village code.', enabled: true, category: 'Citizen Services' },
  { id: 'p5', title: 'Enforce hash lock after Auditor sign-off', desc: 'Seal document state in immutable registry ledger once compliance audit completes.', enabled: true, category: 'Blockchain Security' }
];

const INITIAL_THRESHOLDS = [
  { id: 't1', name: 'Auto-validate Confidence Threshold', value: 95, unit: '%', desc: 'Fields at or above this score are auto-verified without manual verification.' },
  { id: 't2', name: 'Review-Required Escalation Bar', value: 75, unit: '%', desc: 'Fields below this score are automatically queued for operator review.' },
  { id: 't3', name: 'Duplicate Record Sensitivity', value: 60, unit: '%', desc: 'Aggressiveness of the AI spatial model in flagging duplicate survey subdivision polygons.' },
  { id: 't4', name: 'Minimum OCR Quality Score', value: 55, unit: '%', desc: 'Scans below this quality are flagged for high-resolution re-scanning.' }
];

export default function StateNodalOfficerDashboard({ userName = 'State Nodal Officer', onLogout = () => {}, addToast = () => {} }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  
  // Modals
  const [heatmapModalOpen, setHeatmapModalOpen] = useState(false);
  const [manageKeysModalOpen, setManageKeysModalOpen] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  
  // State management
  const [policies, setPolicies] = useState(INITIAL_POLICIES);
  const [thresholds, setThresholds] = useState(INITIAL_THRESHOLDS);
  const [apiKeys, setApiKeys] = useState([
    { id: 'KEY-LRMS-902', name: 'LRMS Production Sync Token', key: 'tn_live_9a8f7c6e5d4b3a2f1e0d', created: '12 Aug 2026', status: 'Active' },
    { id: 'KEY-GIS-418', name: 'State GIS GeoServer Key', key: 'tn_live_1b2c3d4e5f6a7b8c9d0e', created: '20 Jul 2026', status: 'Active' },
    { id: 'KEY-ARCH-110', name: 'Archive DB Readonly Key', key: 'tn_live_fe8d7c6b5a4321098765', created: '01 Jun 2026', status: 'Active' }
  ]);
  const [broadcastMsg, setBroadcastMsg] = useState({ title: '', priority: 'High', audience: 'All Districts', body: '' });

  useEffect(() => {
    if (document.getElementById('sno-dash-fonts')) return;
    const link = document.createElement('link');
    link.id = 'sno-dash-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  function togglePolicy(id) {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    addToast('Policy updated successfully', 'success');
  }

  function handleThresholdChange(id, val) {
    setThresholds(prev => prev.map(t => t.id === id ? { ...t, value: Number(val) } : t));
  }

  function handleSendBroadcast(e) {
    e.preventDefault();
    if (!broadcastMsg.title || !broadcastMsg.body) {
      addToast('Please fill in broadcast title and message', 'error');
      return;
    }
    addToast(`Broadcast dispatched to ${broadcastMsg.audience}`, 'success');
    setBroadcastModalOpen(false);
    setBroadcastMsg({ title: '', priority: 'High', audience: 'All Districts', body: '' });
  }

  return (
    <div className="sno-root">
      <style>{STATE_NODAL_STYLES}</style>

      {/* =====================================================================
          SIDEBAR NAVIGATION (Darker Mint Green #c5ebd7 -> #b2dfc8)
          ===================================================================== */}
      <aside className="sno-sidebar">
        <div className="sno-sidebar-top">
          {/* Brand Logo */}
          <div className="sno-brand" onClick={() => setActiveTab('dashboard')}>
            <div className="sno-brand-logo-wrap">
              <img src={logoImg} alt="NilOra" className="sno-logo-img" />
            </div>
            <div className="sno-brand-text-col">
              <span className="sno-brand-title">Nilora</span>
              <span className="sno-brand-sub">LAND RECORDS AT ORIGIN</span>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="sno-nav">
            {/* MAIN */}
            <div className="sno-nav-group">
              <button
                className={`sno-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
              <button
                className={`sno-nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('leaderboard')}
              >
                <Trophy size={18} />
                <span>District Leaderboard</span>
              </button>
              <button
                className={`sno-nav-item ${activeTab === 'statewide' ? 'active' : ''}`}
                onClick={() => setActiveTab('statewide')}
              >
                <TrendingUp size={18} />
                <span>Statewide Progress</span>
              </button>
            </div>

            {/* INTEGRATIONS */}
            <div className="sno-nav-group">
              <div className="sno-nav-label">INTEGRATIONS</div>
              <button
                className={`sno-nav-item ${activeTab === 'lrms' ? 'active' : ''}`}
                onClick={() => setActiveTab('lrms')}
              >
                <Radio size={18} />
                <span>LRMS Status</span>
              </button>
              <button
                className={`sno-nav-item ${activeTab === 'gis' ? 'active' : ''}`}
                onClick={() => setActiveTab('gis')}
              >
                <MapIcon size={18} />
                <span>GIS Status</span>
              </button>
              <button
                className={`sno-nav-item ${activeTab === 'db' ? 'active' : ''}`}
                onClick={() => setActiveTab('db')}
              >
                <Database size={18} />
                <span>Database Sync</span>
              </button>
            </div>

            {/* CONFIGURATION */}
            <div className="sno-nav-group">
              <div className="sno-nav-label">CONFIGURATION</div>
              <button
                className={`sno-nav-item ${activeTab === 'policies' ? 'active' : ''}`}
                onClick={() => setActiveTab('policies')}
              >
                <ShieldCheck size={18} />
                <span>System Policies</span>
              </button>
              <button
                className={`sno-nav-item ${activeTab === 'thresholds' ? 'active' : ''}`}
                onClick={() => setActiveTab('thresholds')}
              >
                <SlidersHorizontal size={18} />
                <span>Thresholds</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Nav */}
        <div className="sno-sidebar-bottom">
          <button
            className={`sno-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>
          <button className="sno-nav-item" onClick={onLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =====================================================================
          MAIN CONTENT WRAPPER
          ===================================================================== */}
      <div className="sno-main-wrapper">
        {/* Top Header */}
        <header className="sno-header">
          {/* Breadcrumb & State Selector */}
          <div className="sno-breadcrumb-wrap">
            <div className="sno-bc-root">
              <MapPin size={16} className="text-emerald" />
              <span>State Nodal Officer</span>
            </div>
            <span className="sno-bc-sep">&gt;</span>
            <div className="sno-state-selector">
              <button
                className="sno-state-btn"
                onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
              >
                <b>{selectedState}</b>
                <ChevronDown size={15} />
              </button>
              {stateDropdownOpen && (
                <div className="sno-state-dropdown">
                  {['Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh'].map(st => (
                    <button
                      key={st}
                      className={`sno-state-item ${selectedState === st ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedState(st);
                        setStateDropdownOpen(false);
                        addToast(`Switched view to ${st}`, 'info');
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="sno-header-right">
            {/* Search Pill */}
            <div className="sno-search-pill">
              <Search size={16} className="text-muted" />
              <input
                type="text"
                placeholder="Search districts, integrations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button className="sno-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={18} />
                <span className="sno-bell-dot" />
              </button>
              {notifOpen && (
                <div className="sno-dropdown sno-notif-dd">
                  <div className="sno-dd-head">
                    <b>State Alerts</b>
                    <span className="sno-pill-sm">3 New</span>
                  </div>
                  <div className="sno-notif-item">
                    <div className="notif-t">LRMS API Latency Spike</div>
                    <div className="notif-s">Tiruchirapalli gateway latency touched 412ms</div>
                    <div className="notif-tm">10 mins ago</div>
                  </div>
                  <div className="sno-notif-item">
                    <div className="notif-t">Chennai Milestone Reached</div>
                    <div className="notif-s">92% cadastral records successfully verified</div>
                    <div className="notif-tm">1 hour ago</div>
                  </div>
                  <div className="sno-notif-item">
                    <div className="notif-t">New Policy Deployed</div>
                    <div className="notif-s">Dual-verification rule active across all 38 districts</div>
                    <div className="notif-tm">4 hours ago</div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar */}
            <div className="relative">
              <button className="sno-user-pill" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="sno-avatar">SN</div>
                <ChevronDown size={14} className="text-muted" />
              </button>
              {profileOpen && (
                <div className="sno-dropdown sno-profile-dd">
                  <div className="sno-dd-user">
                    <b>State Nodal Officer</b>
                    <span>nodal.tn@gov.in</span>
                  </div>
                  <div className="sno-dd-divider" />
                  <button className="sno-dd-item" onClick={() => { setActiveTab('settings'); setProfileOpen(false); }}>
                    <SettingsIcon size={14} /> Account Settings
                  </button>
                  <button className="sno-dd-item danger" onClick={onLogout}>
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
          <div className="sno-content-stage">
            {/* Hero Row */}
            <div className="sno-hero-row">
              <div className="sno-hero-text">
                <h1 className="sno-title">Welcome Back</h1>
                <p className="sno-subtitle">State Nodal Officer</p>
              </div>
              <div className="sno-date-card">
                <div className="sno-date-ic">
                  <Clock size={20} className="text-emerald" />
                </div>
                <div className="sno-date-text">
                  <span className="sno-date-num">Wed, 03 Sep 2026</span>
                  <span className="sno-day">Wednesday</span>
                </div>
              </div>
            </div>

            {/* 4 Top KPI Cards Grid */}
            <div className="sno-kpi-grid">
              {/* Card 1: Donut Target */}
              <div className="sno-kpi-card" onClick={() => setActiveTab('statewide')}>
                <div className="kpi-donut-metric">
                  <div className="donut-circle-wrap">
                    <svg viewBox="0 0 36 36" className="donut-ring-svg">
                      <path
                        className="donut-ring-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="donut-ring-val"
                        strokeDasharray="61, 100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="donut-center-pct">61%</div>
                  </div>
                  <div className="donut-info">
                    <div className="donut-title">Statewide Target</div>
                  </div>
                </div>
              </div>

              {/* Card 2: Total Digitized */}
              <div className="sno-kpi-card" onClick={() => setActiveTab('leaderboard')}>
                <div className="kpi-card-inner">
                  <div className="kpi-icon-box bg-mint">
                    <Database size={20} className="text-emerald" />
                  </div>
                  <div className="kpi-text-block">
                    <div className="kpi-val">1.0M</div>
                    <div className="kpi-lbl">Total Digitized (State)</div>
                  </div>
                </div>
              </div>

              {/* Card 3: Active Integrations */}
              <div className="sno-kpi-card" onClick={() => setActiveTab('lrms')}>
                <div className="kpi-card-inner">
                  <div className="kpi-icon-box bg-sky">
                    <Wifi size={20} className="text-sky" />
                  </div>
                  <div className="kpi-text-block">
                    <div className="kpi-val">2 / 3</div>
                    <div className="kpi-lbl">Active Integrations</div>
                  </div>
                </div>
              </div>

              {/* Card 4: AI Discrepancy Rate */}
              <div className="sno-kpi-card">
                <div className="kpi-card-inner">
                  <div className="kpi-icon-box bg-amber">
                    <AlertTriangle size={20} className="text-amber" />
                  </div>
                  <div className="kpi-text-block">
                    <div className="kpi-val">7.9%</div>
                    <div className="kpi-lbl">AI Discrepancy Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row (District Progress & Integration Health) */}
            <div className="sno-middle-grid">
              {/* Left Card: District Progress */}
              <div className="sno-card">
                <div className="sno-card-head">
                  <div className="sno-card-title">District Progress</div>
                  <button className="sno-link-btn" onClick={() => setActiveTab('leaderboard')}>
                    Full view →
                  </button>
                </div>
                <div className="sno-progress-list">
                  {DISTRICT_PROGRESS_DATA.slice(0, 5).map(dist => (
                    <div key={dist.name} className="sno-dist-row">
                      <span className="dist-name">{dist.name}</span>
                      <div className="dist-bar-track">
                        <div className="dist-bar-fill" style={{ width: `${dist.progress}%` }} />
                      </div>
                      <span className="dist-pct">{dist.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Card: Integration Health */}
              <div className="sno-card">
                <div className="sno-card-head">
                  <div className="sno-card-title">Integration Health</div>
                </div>
                <div className="sno-integrations-list">
                  {INTEGRATIONS_HEALTH.map(int => (
                    <div key={int.id} className="sno-integ-row">
                      <div className="integ-left">
                        <div className="integ-icon-box">
                          {int.id === 'lrms' ? <Database size={18} /> : int.id === 'gis' ? <MapIcon size={18} /> : <Layers size={18} />}
                        </div>
                        <div className="integ-meta">
                          <b className="integ-name">{int.name}</b>
                          <span className="integ-sub">{int.subtitle}</span>
                        </div>
                      </div>
                      <div className={`integ-pill ${int.statusTone}`}>
                        <span className="integ-dot" />
                        <span>{int.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row (3 Wide CTAs) */}
            <div className="sno-actions-grid">
              <button className="sno-cta-btn" onClick={() => setHeatmapModalOpen(true)}>
                <MapIcon size={20} />
                <span>View State Heatmap</span>
                <ChevronRight size={18} className="cta-arrow" />
              </button>
              <button className="sno-cta-btn" onClick={() => setManageKeysModalOpen(true)}>
                <Key size={20} />
                <span>Manage Integration Keys</span>
                <ChevronRight size={18} className="cta-arrow" />
              </button>
              <button className="sno-cta-btn" onClick={() => setBroadcastModalOpen(true)}>
                <Send size={20} />
                <span>Broadcast Message to Districts</span>
                <ChevronRight size={18} className="cta-arrow" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-VIEW: DISTRICT LEADERBOARD
            =================================================================== */}
        {activeTab === 'leaderboard' && (
          <div className="sno-content-stage">
            <div className="sno-card">
              <div className="sno-card-head">
                <div>
                  <h2 className="sno-card-title">Statewide District Leaderboard</h2>
                  <p className="sno-card-sub">Ranked performance across all 38 revenue districts in Tamil Nadu.</p>
                </div>
                <button className="sno-btn-primary" onClick={() => addToast('Leaderboard exported to CSV', 'success')}>
                  <Download size={15} /> Export Report
                </button>
              </div>

              <div className="sno-table-wrap">
                <table className="sno-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>District</th>
                      <th>Digitization Progress</th>
                      <th>Total Records</th>
                      <th>Discrepancy Rate</th>
                      <th>30-Day Trend</th>
                      <th>Active Officers</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DISTRICT_PROGRESS_DATA.map((dist, idx) => (
                      <tr key={dist.name}>
                        <td><b className="rank-num">#{idx + 1}</b></td>
                        <td><b>{dist.name}</b></td>
                        <td>
                          <div className="table-bar-cell">
                            <div className="tbl-track">
                              <div className="tbl-fill" style={{ width: `${dist.progress}%` }} />
                            </div>
                            <span>{dist.progress}%</span>
                          </div>
                        </td>
                        <td className="mono">{dist.digitized}</td>
                        <td className="mono">{dist.discrepancy}%</td>
                        <td><span className={dist.trend.startsWith('+') ? 'text-emerald font-bold' : 'text-amber font-bold'}>{dist.trend}</span></td>
                        <td>{dist.officers} Officers</td>
                        <td>
                          <span className={`status-badge badge-${dist.status.toLowerCase().replace(' ', '-')}`}>
                            {dist.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-VIEW: STATEWIDE PROGRESS
            =================================================================== */}
        {activeTab === 'statewide' && (
          <div className="sno-content-stage">
            <div className="sno-card">
              <div className="sno-card-head">
                <div>
                  <h2 className="sno-card-title">Statewide GIS & Digitization Analytics</h2>
                  <p className="sno-card-sub">Real-time cadastral ingestion vs ground truth validation targets.</p>
                </div>
              </div>

              <div style={{ height: 380, borderRadius: 12, overflow: 'hidden', border: '1.5px solid #a3dec0', marginTop: 16 }}>
                <RealCadastralMap height="100%" selectedParcelId="STATE-TN" />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-VIEW: INTEGRATIONS (LRMS, GIS, DB)
            =================================================================== */}
        {(activeTab === 'lrms' || activeTab === 'gis' || activeTab === 'db') && (
          <div className="sno-content-stage">
            <div className="sno-card">
              <div className="sno-card-head">
                <div>
                  <h2 className="sno-card-title">Integration Hub & Sync Gateways</h2>
                  <p className="sno-card-sub">API endpoints, webhook delivery status, and state registry feeds.</p>
                </div>
                <button className="sno-btn-primary" onClick={() => addToast('Pinging all integration gateways...', 'info')}>
                  <RefreshCw size={15} /> Ping Gateways
                </button>
              </div>

              <div className="sno-integrations-detail-grid">
                {INTEGRATIONS_HEALTH.map(int => (
                  <div key={int.id} className="sno-integ-detail-card">
                    <div className="int-head">
                      <div className="int-title-row">
                        <b className="int-name">{int.name}</b>
                        <span className={`integ-pill ${int.statusTone}`}>{int.status}</span>
                      </div>
                      <span className="int-ep mono">{int.endpoint}</span>
                    </div>
                    <div className="int-stats-grid">
                      <div><span className="lbl">Uptime</span><b>{int.uptime}</b></div>
                      <div><span className="lbl">Latency</span><b>{int.latency}</b></div>
                      <div><span className="lbl">Records Synced</span><b>{int.recordsSynced}</b></div>
                      <div><span className="lbl">Last Handshake</span><b>{int.subtitle}</b></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-VIEW: SYSTEM POLICIES
            =================================================================== */}
        {activeTab === 'policies' && (
          <div className="sno-content-stage">
            <div className="sno-card">
              <div className="sno-card-head">
                <div>
                  <h2 className="sno-card-title">Statewide System Policies & Verification Rules</h2>
                  <p className="sno-card-sub">Enforce governance mandates and compliance thresholds state-wide.</p>
                </div>
              </div>

              <div className="sno-policies-list">
                {policies.map(p => (
                  <div key={p.id} className="sno-policy-row">
                    <div className="policy-info">
                      <div className="policy-cat">{p.category}</div>
                      <b className="policy-title">{p.title}</b>
                      <p className="policy-desc">{p.desc}</p>
                    </div>
                    <button
                      className={`sno-toggle-btn ${p.enabled ? 'active' : ''}`}
                      onClick={() => togglePolicy(p.id)}
                    >
                      <span className="toggle-slider" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-VIEW: THRESHOLDS
            =================================================================== */}
        {activeTab === 'thresholds' && (
          <div className="sno-content-stage">
            <div className="sno-card">
              <div className="sno-card-head">
                <div>
                  <h2 className="sno-card-title">AI Pipeline & Verification Thresholds</h2>
                  <p className="sno-card-sub">Configure machine learning confidence parameters for automatic digitization.</p>
                </div>
              </div>

              <div className="sno-thresholds-list">
                {thresholds.map(t => (
                  <div key={t.id} className="sno-thresh-row">
                    <div className="thresh-info">
                      <b className="thresh-name">{t.name}</b>
                      <p className="thresh-desc">{t.desc}</p>
                    </div>
                    <div className="thresh-control">
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={t.value}
                        onChange={e => handleThresholdChange(t.id, e.target.value)}
                        className="sno-range-slider"
                      />
                      <span className="thresh-val mono">{t.value}{t.unit}</span>
                    </div>
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
          <div className="sno-content-stage">
            <div className="sno-card">
              <div className="sno-card-head">
                <h2 className="sno-card-title">State Administration Settings</h2>
              </div>
              <form className="sno-form" onSubmit={e => { e.preventDefault(); addToast('Settings saved successfully', 'success'); }}>
                <div className="form-group">
                  <label>Officer Name</label>
                  <input type="text" defaultValue={userName} />
                </div>
                <div className="form-group">
                  <label>Official Email</label>
                  <input type="email" defaultValue="nodal.tn@gov.in" />
                </div>
                <div className="form-group">
                  <label>Default State Zone</label>
                  <select defaultValue="Tamil Nadu">
                    <option value="Tamil Nadu">Tamil Nadu (Headquarters)</option>
                  </select>
                </div>
                <button type="submit" className="sno-btn-primary">Save Changes</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL 1: VIEW STATE HEATMAP
          ===================================================================== */}
      {heatmapModalOpen && (
        <div className="sno-modal-overlay" onClick={() => setHeatmapModalOpen(false)}>
          <div className="sno-modal-dialog large" onClick={e => e.stopPropagation()}>
            <div className="sno-modal-head">
              <div>
                <span className="sno-modal-tag">GIS REVENUE OVERLAY</span>
                <h3 className="sno-modal-title">Tamil Nadu Statewide Digitization Heatmap</h3>
              </div>
              <button className="sno-modal-close" onClick={() => setHeatmapModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="sno-modal-body">
              <div style={{ height: 440, borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <RealCadastralMap height="100%" selectedParcelId="TN-HEATMAP" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: MANAGE INTEGRATION KEYS
          ===================================================================== */}
      {manageKeysModalOpen && (
        <div className="sno-modal-overlay" onClick={() => setManageKeysModalOpen(false)}>
          <div className="sno-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="sno-modal-head">
              <div>
                <span className="sno-modal-tag">SECURITY &amp; ACCESS</span>
                <h3 className="sno-modal-title">Manage API Integration Tokens</h3>
              </div>
              <button className="sno-modal-close" onClick={() => setManageKeysModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="sno-modal-body">
              <div className="sno-keys-list">
                {apiKeys.map(k => (
                  <div key={k.id} className="sno-key-row">
                    <div>
                      <b className="key-name">{k.name}</b>
                      <div className="key-code mono">{k.key}</div>
                      <span className="key-date">Generated on {k.created}</span>
                    </div>
                    <button className="sno-btn-secondary" onClick={() => addToast('API Key copied to clipboard', 'info')}>
                      Copy
                    </button>
                  </div>
                ))}
              </div>
              <button className="sno-btn-primary" onClick={() => addToast('New API Token generated', 'success')}>
                + Generate New Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: BROADCAST MESSAGE TO DISTRICTS
          ===================================================================== */}
      {broadcastModalOpen && (
        <div className="sno-modal-overlay" onClick={() => setBroadcastModalOpen(false)}>
          <div className="sno-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="sno-modal-head">
              <div>
                <span className="sno-modal-tag">DIRECTIVE BROADCAST</span>
                <h3 className="sno-modal-title">Broadcast Message to District Collectors &amp; Admins</h3>
              </div>
              <button className="sno-modal-close" onClick={() => setBroadcastModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSendBroadcast}>
              <div className="sno-modal-body">
                <div className="form-group">
                  <label>Target Audience</label>
                  <select
                    value={broadcastMsg.audience}
                    onChange={e => setBroadcastMsg({ ...broadcastMsg, audience: e.target.value })}
                  >
                    <option value="All Districts">All 38 Revenue Districts</option>
                    <option value="Coimbatore Region">Coimbatore Region (Coimbatore, Tiruppur, Erode, Nilgiris)</option>
                    <option value="Chennai Metropolitan">Chennai Metropolitan Area</option>
                    <option value="Districts Below Target">Districts Below 60% Target</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Directive Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Expedite Q4 Cadastral Vector Ingestion"
                    value={broadcastMsg.title}
                    onChange={e => setBroadcastMsg({ ...broadcastMsg, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Directive Body &amp; Instructions</label>
                  <textarea
                    rows={4}
                    placeholder="Enter policy guidance, deadlines, or escalation requirements..."
                    value={broadcastMsg.body}
                    onChange={e => setBroadcastMsg({ ...broadcastMsg, body: e.target.value })}
                    className="sno-modal-textarea"
                    required
                  />
                </div>
              </div>
              <div className="sno-modal-footer">
                <button type="button" className="sno-btn-secondary" onClick={() => setBroadcastModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sno-btn-primary">
                  <Send size={15} /> Dispatch Directive
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
   EMBEDDED STYLES (Matching statenodalofficier.png)
   ========================================================================= */

const STATE_NODAL_STYLES = `
.sno-root {
  display: flex;
  min-height: 100vh;
  background: #f4fbf7;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #0c281a;
  overflow-x: hidden;
}

.sno-root * {
  box-sizing: border-box;
}

/* Sidebar (Darker Mint Green #c5ebd7 -> #b2dfc8) */
.sno-sidebar {
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

.sno-sidebar-top {
  display: flex;
  flex-direction: column;
}

.sno-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 24px;
  cursor: pointer;
  user-select: none;
}

.sno-brand-logo-wrap {
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

.sno-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sno-brand-text-col {
  display: flex;
  flex-direction: column;
}

.sno-brand-title {
  font-size: 20px;
  font-weight: 800;
  color: #0c281a;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.sno-brand-sub {
  font-size: 8.5px;
  font-weight: 800;
  color: #059669;
  letter-spacing: 0.08em;
  margin-top: 2px;
}

.sno-nav {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sno-nav-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sno-nav-label {
  font-size: 10.5px;
  font-weight: 800;
  color: #20563b;
  letter-spacing: 0.06em;
  padding: 0 12px 4px;
}

.sno-nav-item {
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

.sno-nav-item:hover {
  background: rgba(255, 255, 255, 0.75);
  color: #047857;
}

.sno-nav-item.active {
  background: #094e32;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(9, 78, 50, 0.32);
}

.sno-sidebar-bottom {
  border-top: 1px solid #7bc69e;
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Main Layout */
.sno-main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
}

.sno-header {
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

.sno-breadcrumb-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
}

.sno-bc-root {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4b5563;
  font-weight: 600;
}

.sno-bc-sep {
  color: #9ca3af;
}

.sno-state-selector {
  position: relative;
}

.sno-state-btn {
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

.sno-state-btn:hover {
  background: #f0fdf4;
}

.sno-state-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 180px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 6px;
  z-index: 50000;
}

.sno-state-item {
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

.sno-state-item:hover, .sno-state-item.active {
  background: #f0fdf4;
  color: #059669;
}

.sno-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sno-search-pill {
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

.sno-search-pill input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 12.5px;
  font-family: inherit;
  width: 100%;
  color: #111827;
}

.sno-icon-btn {
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

.sno-bell-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  border: 1.5px solid #ffffff;
}

.sno-user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
}

.sno-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #0c5838;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sno-dropdown {
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

.sno-profile-dd { width: 220px; }
.sno-notif-dd { width: 300px; }

.sno-dd-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 10px;
}

.sno-pill-sm {
  font-size: 11px;
  font-weight: 700;
  background: #fee2e2;
  color: #dc2626;
  padding: 2px 6px;
  border-radius: 4px;
}

.sno-notif-item {
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.notif-t { font-size: 12.5px; font-weight: 700; color: #111827; }
.notif-s { font-size: 11.5px; color: #4b6354; margin: 2px 0; }
.notif-tm { font-size: 10.5px; color: #9ca3af; }

.sno-dd-user { display: flex; flex-direction: column; padding: 4px; }
.sno-dd-user b { font-size: 13.5px; color: #111827; }
.sno-dd-user span { font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px; }
.sno-dd-divider { height: 1px; background: #f3f4f6; margin: 8px 0; }

.sno-dd-item {
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

.sno-dd-item:hover { background: #f0fdf4; color: #059669; }
.sno-dd-item.danger:hover { background: #fef2f2; color: #dc2626; }

/* Stage Content */
.sno-content-stage {
  padding: 28px 36px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sno-hero-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.sno-title {
  font-size: 26px;
  font-weight: 800;
  color: #0c281a;
  margin: 0;
  line-height: 1.25;
}

.sno-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #4b6354;
  margin: 4px 0 0;
}

.sno-date-card {
  background: #ffffff;
  border: 1px solid rgba(163, 222, 192, 0.6);
  padding: 8px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.sno-date-text {
  display: flex;
  flex-direction: column;
}

.sno-day {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.sno-date-num {
  font-size: 13.5px;
  color: #0c281a;
  font-weight: 800;
}

/* 4 KPI Cards Grid */
.sno-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.sno-kpi-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(163, 222, 192, 0.45);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.18s ease;
}

.sno-kpi-card:hover {
  transform: translateY(-2px);
  border-color: #059669;
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.08);
}

.kpi-card-inner {
  display: flex;
  align-items: center;
  gap: 14px;
}

.kpi-donut-metric {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.donut-circle-wrap {
  position: relative;
  width: 60px;
  height: 60px;
  flex: none;
}

.donut-ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-ring-bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 3.8;
}

.donut-ring-val {
  fill: none;
  stroke: #0c5838;
  stroke-width: 3.8;
  stroke-linecap: round;
}

.donut-center-pct {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #0c281a;
}

.donut-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #4b6354;
}

.kpi-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.bg-mint { background: #dcfce7; }
.bg-sky { background: #e0f2fe; }
.bg-amber { background: #fef3c7; }

.text-emerald { color: #059669; }
.text-sky { color: #0284c7; }
.text-amber { color: #d97706; }

.kpi-val {
  font-size: 24px;
  font-weight: 800;
  color: #0c281a;
  line-height: 1.1;
}

.kpi-lbl {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-top: 3px;
}

/* Middle Row */
.sno-middle-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 18px;
}

.sno-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(163, 222, 192, 0.45);
  padding: 20px 22px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
}

.sno-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sno-card-title {
  font-size: 15.5px;
  font-weight: 800;
  color: #0c281a;
  margin: 0;
}

.sno-card-sub {
  font-size: 12px;
  color: #6b7280;
  margin: 3px 0 0;
}

.sno-link-btn {
  background: transparent;
  border: none;
  color: #059669;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.sno-link-btn:hover {
  text-decoration: underline;
}

/* District Progress Bars */
.sno-progress-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sno-dist-row {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13.5px;
}

.dist-name {
  width: 110px;
  font-weight: 700;
  color: #1f2937;
  flex: none;
}

.dist-bar-track {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}

.dist-bar-fill {
  height: 100%;
  background: #0c5838;
  border-radius: 99px;
}

.dist-pct {
  width: 36px;
  text-align: right;
  font-weight: 800;
  color: #0c281a;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
}

/* Integration Health Rows */
.sno-integrations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sno-integ-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.integ-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.integ-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #e6f4ea;
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
}

.integ-meta {
  display: flex;
  flex-direction: column;
}

.integ-name {
  font-size: 13px;
  color: #111827;
}

.integ-sub {
  font-size: 11px;
  color: #6b7280;
}

.integ-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 99px;
}

.integ-pill.green {
  background: #dcfce7;
  color: #166534;
}

.integ-pill.amber {
  background: #fef3c7;
  color: #b45309;
}

.integ-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Bottom CTA Actions */
.sno-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.sno-cta-btn {
  background: #094e32;
  color: #ffffff;
  border: none;
  padding: 18px 20px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 4px 14px rgba(9, 78, 50, 0.2);
}

.sno-cta-btn:hover {
  background: #073d27;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(9, 78, 50, 0.3);
}

.cta-arrow {
  margin-left: auto;
  opacity: 0.8;
}

/* Table Wrap */
.sno-table-wrap {
  overflow-x: auto;
}

.sno-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.sno-table th {
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

.sno-table td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #1f2937;
}

.rank-num {
  color: #059669;
}

.table-bar-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tbl-track {
  width: 90px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}

.tbl-fill {
  height: 100%;
  background: #0c5838;
}

.status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 99px;
}

.badge-leading { background: #dcfce7; color: #166534; }
.badge-on-track { background: #e0f2fe; color: #0284c7; }
.badge-moderate { background: #fef3c7; color: #b45309; }
.badge-needs-review, .badge-lagging { background: #fee2e2; color: #dc2626; }

/* Integrations Detail */
.sno-integrations-detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 14px;
}

.sno-integ-detail-card {
  background: #f8faf9;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}

.int-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.int-name { font-size: 15px; color: #111827; }
.int-ep { font-size: 11px; color: #6b7280; display: block; margin-bottom: 12px; }

.int-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  font-size: 12.5px;
}

.int-stats-grid .lbl { font-size: 11px; color: #6b7280; display: block; }

/* Policies & Thresholds */
.sno-policies-list, .sno-thresholds-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 10px;
}

.sno-policy-row, .sno-thresh-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.policy-cat { font-size: 10.5px; font-weight: 800; color: #059669; text-transform: uppercase; }
.policy-title, .thresh-name { font-size: 14px; color: #111827; }
.policy-desc, .thresh-desc { font-size: 12px; color: #6b7280; margin: 3px 0 0; }

.sno-toggle-btn {
  width: 44px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 99px;
  border: none;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sno-toggle-btn.active {
  background: #0c5838;
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.sno-toggle-btn.active .toggle-slider {
  left: 23px;
}

.thresh-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sno-range-slider {
  accent-color: #0c5838;
  cursor: pointer;
}

.thresh-val {
  font-size: 13px;
  font-weight: 800;
  color: #0c281a;
  min-width: 45px;
  text-align: right;
}

/* Forms & Buttons */
.sno-form {
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

.sno-btn-primary {
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

.sno-btn-secondary {
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
.sno-modal-overlay {
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

.sno-modal-dialog {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}

.sno-modal-dialog.large {
  max-width: 800px;
}

.sno-modal-head {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #f8faf9;
  border-bottom: 1px solid #f3f4f6;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.sno-modal-tag {
  font-size: 11px;
  font-weight: 800;
  color: #059669;
  letter-spacing: 0.06em;
}

.sno-modal-title {
  font-size: 18px;
  font-weight: 800;
  color: #0c281a;
  margin: 3px 0 0;
}

.sno-modal-close {
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

.sno-modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sno-modal-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
}

.sno-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
  background: #f8faf9;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
}

.sno-keys-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sno-key-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.key-name { font-size: 13px; color: #111827; }
.key-code { font-size: 12px; color: #059669; margin: 3px 0; }
.key-date { font-size: 11px; color: #6b7280; }

@media (max-width: 1100px) {
  .sno-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .sno-middle-grid { grid-template-columns: 1fr; }
  .sno-actions-grid { grid-template-columns: 1fr; }
  .sno-integrations-detail-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .sno-root { flex-direction: column; }
  .sno-sidebar { width: 100%; }
}
`;
