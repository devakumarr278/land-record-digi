import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Map as MapIcon, Compass, Link2, Bell, FileText,
  Settings as SettingsIcon, LogOut, Search, User, ChevronDown,
  ShieldCheck, ShieldAlert, Users, FileCheck2, ArrowRight,
  ZoomIn, ZoomOut, Crosshair, X, Eye, CheckCircle2, AlertTriangle,
  Clock, Download, Hash, Lock, ChevronRight, UserCog, FileSearch,
  Loader2, ExternalLink, Shield
} from 'lucide-react';
import auditbg from '../../assets/auditbg.png';
import logoImg from '../../assets/logo.jpg';
import RealCadastralMap from '../Common/RealCadastralMap';

/* =========================================================================
   MOCK DATA & AUDIT FEED
   ========================================================================= */

const AUDIT_EVENTS = [
  { t: '10:42', fullT: '10:42 AM', role: 'Tahsildar', user: 'R. Subramaniam', action: 'Area change approved', doc: 'LR-1021', tone: 'green' },
  { t: '10:38', fullT: '10:38 AM', role: 'Field Officer', user: 'Meena R', action: 'New scan uploaded', doc: 'LR-1044', tone: 'green' },
  { t: '10:31', fullT: '10:31 AM', role: 'District Admin', user: 'K. Prakash', action: 'Case reassigned', doc: 'LR-1039', tone: 'green' },
  { t: '10:19', fullT: '10:19 AM', role: 'Tahsildar', user: 'S. Iyer', action: 'Ownership transfer rejected', doc: 'LR-1012', tone: 'red' },
  { t: '10:05', fullT: '10:05 AM', role: 'Verification Officer', user: 'Karthik S', action: 'Field corrected (manual)', doc: 'LR-1017', tone: 'yellow' },
  { t: '09:54', fullT: '09:54 AM', role: 'Auditor', user: 'Abishek B K', action: 'Compliance log exported', doc: 'Q3-2026', tone: 'green' },
  { t: '09:41', fullT: '09:41 AM', role: 'System', user: 'AI Engine', action: 'Auto-validated all fields', doc: 'LR-1009', tone: 'green' },
  { t: '09:22', fullT: '09:22 AM', role: 'Tahsildar', user: 'R. Subramaniam', action: 'Mutation deed verified', doc: 'LR-1004', tone: 'green' },
];

const DECISIONS = [
  { doc: 'LR-1017', field: 'Owner Name', role: 'Verification Officer', user: 'Karthik S', officerId: 'OFC-1042', from: 'RAVI KUAMR', to: 'RAVI KUMAR', reason: 'OCR misread — corrected against original scan', evidence: 'Mutation-2010.pdf', t: '10:05 AM', date: '03 Sep 2026' },
  { doc: 'LR-1021', field: 'Area', role: 'Tahsildar', user: 'S. Iyer', officerId: 'OFC-1008', from: '2.50 Aores', to: '2.50 Acres', reason: 'AI confidence below threshold (43%) — verified with village register', evidence: 'Survey_Register_Vol4.pdf', t: '10:42 AM', date: '03 Sep 2026' },
  { doc: 'LR-1012', field: 'Ownership Transfer', role: 'Tahsildar', user: 'S. Iyer', officerId: 'OFC-1008', from: 'Pending', to: 'Rejected', reason: 'Supporting sale deed did not match claimant identity', evidence: 'sale_deed_1012.pdf', t: '10:19 AM', date: '03 Sep 2026' },
  { doc: 'LR-1044', field: 'Survey Number', role: 'Field Officer', user: 'Meena R', officerId: 'OFC-1019', from: '1044', to: '1044/A', reason: 'Partition survey subdivision split', evidence: 'partition_subdivision_1044.pdf', t: '10:38 AM', date: '03 Sep 2026' },
];

const DOCUMENT_PROVENANCE = {
  'LR-1021': { page: 2, region: 'Survey table — Area column, row 7', coords: { x: 55, y: 28, w: 30, h: 6 }, ocrEngine: 'OCR-v2.1 (printed)', field: 'Area', rawValue: '2.50 Aores', confidence: 43, model: 'ExtractNet-v3', extractedAt: '10:40 AM', sourceFile: 'scan_1021_02.jpg', survey: '125/2', village: 'Kinathukadavu' },
  'LR-1044': { page: 1, region: 'Header block', coords: { x: 20, y: 8, w: 60, h: 8 }, ocrEngine: 'OCR-v2.1 (printed)', field: 'Survey Number', rawValue: '1044/A', confidence: 96, model: 'ExtractNet-v3', extractedAt: '10:38 AM', sourceFile: 'scan_1044_01.jpg', survey: '118/3', village: 'Anaimalai' },
  'LR-1039': { page: 2, region: 'Case assignment note', coords: { x: 12, y: 70, w: 50, h: 6 }, ocrEngine: 'System Auto', field: 'Assigned Officer', rawValue: 'Verification Officer', confidence: 99, model: 'AutoAssign-v1', extractedAt: '10:31 AM', sourceFile: 'reassignment_order.pdf', survey: '92/1', village: 'Sulur' },
  'LR-1012': { page: 1, region: 'Transfer clause — paragraph 2', coords: { x: 10, y: 62, w: 72, h: 10 }, ocrEngine: 'OCR-v2.1 (printed)', field: 'Ownership Transfer', rawValue: 'Pending', confidence: 88, model: 'ExtractNet-v3', extractedAt: '10:19 AM', sourceFile: 'sale_deed_1012.pdf', survey: '18/4', village: 'Pollachi' },
  'LR-1017': { page: 4, region: 'Owner field — row 3, left column', coords: { x: 14, y: 52, w: 34, h: 8 }, ocrEngine: 'HTR-v2.1 (handwritten)', field: 'Owner Name', rawValue: 'RAVI KUAMR', confidence: 43, model: 'ExtractNet-v3', extractedAt: '10:05 AM', sourceFile: 'scan_1017_04.jpg', survey: '77/1', village: 'Madukkarai' },
  'LR-1009': { page: 1, region: 'Full-page auto-validation', coords: { x: 8, y: 8, w: 84, h: 84 }, ocrEngine: 'OCR-v2.1 (printed)', field: 'All Fields', rawValue: 'Verified', confidence: 99, model: 'ExtractNet-v3', extractedAt: '09:41 AM', sourceFile: 'scan_1009_01.jpg', survey: '54/2', village: 'Sulur' },
};

const CHAIN_BLOCKS = [
  { id: 'B-88231', doc: 'LR-1021', hash: '7a3f9e...c02d', prev: '4b1c88...7f11', t: '10:42 AM', validator: 'Node-TN-01' },
  { id: 'B-88230', doc: 'LR-1044', hash: '4b1c88...7f11', prev: '9e0a21...3bd4', t: '10:38 AM', validator: 'Node-TN-03' },
  { id: 'B-88229', doc: 'LR-1039', hash: '9e0a21...3bd4', prev: 'd12f66...aa08', t: '10:31 AM', validator: 'Node-TN-02' },
  { id: 'B-88228', doc: 'LR-1012', hash: 'd12f66...aa08', prev: '81cbe3...5502', t: '10:19 AM', validator: 'Node-TN-01' },
  { id: 'B-88227', doc: 'LR-1017', hash: '81cbe3...5502', prev: '2fd410...9c77', t: '10:05 AM', validator: 'Node-TN-04' },
  { id: 'B-88226', doc: 'LR-1009', hash: '2fd410...9c77', prev: 'e6a879...10f3', t: '09:41 AM', validator: 'Node-TN-02' },
];

const COMPLIANCE_LOGS = [
  { period: 'September 2026', events: 45210, overrides: 24, status: 'Ready', size: '3.2 MB' },
  { period: 'August 2026', events: 61840, overrides: 31, status: 'Ready', size: '4.1 MB' },
  { period: 'July 2026', events: 58920, overrides: 19, status: 'Ready', size: '3.9 MB' },
  { period: 'June 2026', events: 52310, overrides: 27, status: 'Ready', size: '3.5 MB' },
];

/* =========================================================================
   AUDITOR DASHBOARD COMPONENT
   ========================================================================= */

export default function AuditorDashboard({ userName = 'Auditor', onLogout = () => { }, addToast = () => { } }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [provenanceDoc, setProvenanceDoc] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedParcelId, setSelectedParcelId] = useState('LR-1021');
  const [exporting, setExporting] = useState(null);

  // Load font
  useEffect(() => {
    if (document.getElementById('aud-dash-fonts')) return;
    const link = document.createElement('link');
    link.id = 'aud-dash-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;
    if (DOCUMENT_PROVENANCE[q]) {
      setProvenanceDoc(q);
      setSelectedParcelId(q);
      addToast(`Showing provenance record for ${q}`, 'info');
    } else {
      setActiveTab('trace');
      addToast(`Filtered audit records matching "${searchQuery}"`, 'info');
    }
  }

  function exportCompliance(period) {
    setExporting(period);
    setTimeout(() => {
      const rows = [
        ['Auditor Compliance Export', period],
        ['Platform', 'NilOra Registry'],
        ['Verified By', userName],
        ['Timestamp', new Date().toLocaleString('en-IN')],
        [],
        ['Time', 'Role', 'User', 'Action', 'Document ID'],
        ...AUDIT_EVENTS.map(e => [e.fullT, e.role, e.user, e.action, e.doc]),
      ];
      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nilora-audit-${period.replace(/\s+/g, '-').toLowerCase()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExporting(null);
      addToast(`Compliance log for ${period} exported successfully.`, 'success');
    }, 700);
  }

  return (
    <div className="aud-root">
      <style>{AUDITOR_STYLES}</style>

      {/* =====================================================================
          SIDEBAR NAVIGATION (Mint Green Background with Crisp Border for Menu Card)
          ===================================================================== */}
      <aside className="aud-sidebar">
        <div className="aud-sidebar-top">
          {/* Brand Logo */}
          <div className="aud-brand" onClick={() => setActiveTab('dashboard')}>
            <div className="aud-brand-mark">
              <img src={logoImg} alt="NilOra" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
            <span className="aud-brand-text">NilOra</span>
          </div>

          {/* Navigation Items */}
          <nav className="aud-nav-list">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'map', label: 'Map View', icon: MapIcon },
              { id: 'trace', label: 'Trace', icon: Compass },
              { id: 'chain', label: 'Hash Chain', icon: Link2 },
              { id: 'alerts', label: 'Alerts', icon: Bell },
              { id: 'reports', label: 'Reports', icon: FileText },
            ].map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`aud-nav-item ${active ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Tagline */}
        <div className="aud-sidebar-bottom">
          <div className="aud-tagline">
            Trusted<br />
            Land Records<br />
            for a Stronger<br />
            Tomorrow.
            <div className="aud-tagline-bar" />
          </div>
        </div>
      </aside>

      {/* =====================================================================
          MAIN CONTENT AREA
          ===================================================================== */}
      <div className="aud-main">
        {/* Top Header */}
        <header className="aud-header">
          <form className="aud-search-bar" onSubmit={handleSearchSubmit}>
            <Search size={16} className="aud-search-icon" />
            <input
              type="text"
              placeholder="Search by survey no., document ID, village, or owner..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="aud-header-right">
            {/* Notification Bell */}
            <button
              className="aud-icon-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              title="Notifications"
            >
              <Bell size={18} />
              <span className="aud-notif-dot" />
            </button>

            {/* User Profile Pill */}
            <div className="aud-profile-wrap">
              <button className="aud-user-pill" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="aud-avatar">A</div>
                <div className="aud-user-info">
                  <User size={13} className="aud-role-icon" />
                  <span className="aud-username">{userName}</span>
                </div>
                <ChevronDown size={14} className="aud-chevron" />
              </button>

              {profileOpen && (
                <div className="aud-profile-dropdown">
                  <div className="aud-dd-user">
                    <b>{userName}</b>
                    <span>Auditor · Compliance Officer</span>
                  </div>
                  <div className="aud-dd-divider" />
                  <button className="aud-dd-item" onClick={() => { setActiveTab('reports'); setProfileOpen(false); }}>
                    <FileText size={14} /> Audit Reports
                  </button>
                  <button className="aud-dd-item" onClick={() => { setActiveTab('chain'); setProfileOpen(false); }}>
                    <Link2 size={14} /> Ledger Hash Chain
                  </button>
                  <div className="aud-dd-divider" />
                  <button className="aud-dd-item danger" onClick={onLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="aud-content">
            {/* Greeting & Subtitle */}
            <div className="aud-hero-row">
              <div className="aud-greeting">
                <h1 className="aud-title">Welcome Back, {userName}</h1>
                <p className="aud-subtitle">Verify. Trace. Ensure integrity.</p>
              </div>
              <div className="aud-quote-box">
                <span className="aud-quote-text">“Accurate records stronger communities.”</span>
                <span className="aud-quote-bar" />
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="aud-kpi-grid">
              {/* Card 1 */}
              <div className="aud-kpi-card">
                <div className="kpi-icon-wrap bg-green-soft">
                  <FileText size={22} className="text-green" />
                </div>
                <div className="kpi-data">
                  <div className="kpi-value">45,210</div>
                  <div className="kpi-label">Audit Events</div>
                </div>
                <div className="kpi-trend text-green">
                  <ChevronDown size={16} /> <span>+12%</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="aud-kpi-card">
                <div className="kpi-icon-wrap bg-red-soft">
                  <ShieldAlert size={22} className="text-red" />
                </div>
                <div className="kpi-data">
                  <div className="kpi-value">0</div>
                  <div className="kpi-label">Tamper Alerts</div>
                </div>
                <div className="kpi-trend text-red">
                  <ChevronDown size={16} /> <span>0%</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="aud-kpi-card">
                <div className="kpi-icon-wrap bg-yellow-soft">
                  <Users size={22} className="text-yellow" />
                </div>
                <div className="kpi-data">
                  <div className="kpi-value">24</div>
                  <div className="kpi-label">Manual Overrides</div>
                </div>
                <div className="kpi-trend text-yellow">
                  <ChevronDown size={16} /> <span>-8%</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="aud-kpi-card">
                <div className="kpi-icon-wrap bg-emerald-soft">
                  <ShieldCheck size={22} className="text-emerald" />
                </div>
                <div className="kpi-data">
                  <div className="kpi-value">100%</div>
                  <div className="kpi-label">Ledger Integrity</div>
                </div>
                <div className="kpi-trend text-emerald">
                  <span style={{ fontSize: 13, fontWeight: 800 }}>∧</span> <span>+0%</span>
                </div>
              </div>
            </div>

            {/* Center Section: Real Interactive Satellite Cadastral Map & Recent Audit Activity */}
            <div className="aud-middle-grid">
              {/* Real Leaflet Satellite Cadastral Map */}
              <div className="aud-map-card">
                <RealCadastralMap
                  selectedId={selectedParcelId}
                  onSelectParcel={(id) => {
                    setSelectedParcelId(id);
                    setProvenanceDoc(id);
                  }}
                  height="100%"
                />
              </div>

              {/* Recent Audit Activity Card */}
              <div className="aud-feed-card">
                <div className="aud-card-header">
                  <h3 className="aud-card-title">Recent Audit Activity</h3>
                  <button className="aud-link-btn" onClick={() => setActiveTab('trace')}>
                    View All →
                  </button>
                </div>

                <div className="aud-feed-list">
                  {AUDIT_EVENTS.slice(0, 5).map((e, idx) => (
                    <div key={idx} className="aud-feed-row">
                      <div className="feed-left">
                        <span className={`aud-dot dot-${e.tone}`} />
                        <span className="feed-time">{e.t}</span>
                        <span className="feed-divider">|</span>
                        <span className="feed-desc">{e.action}</span>
                      </div>
                      <button
                        className="feed-doc-link"
                        onClick={() => {
                          setSelectedParcelId(e.doc);
                          setProvenanceDoc(e.doc);
                        }}
                        title={`View provenance for ${e.doc}`}
                      >
                        {e.doc}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="aud-actions-section">
              <h3 className="aud-section-title">Quick Actions</h3>
              <div className="aud-actions-grid">
                {/* 1. Verify Document */}
                <div className="aud-action-card bg-action-mint" onClick={() => {
                  setSelectedParcelId('LR-1021');
                  setProvenanceDoc('LR-1021');
                  addToast('Opening verification provenance for LR-1021', 'info');
                }}>
                  <div className="action-icon text-green">
                    <FileCheck2 size={24} />
                  </div>
                  <span className="action-text">Verify Document</span>
                  <ArrowRight size={18} className="action-arrow text-green" />
                </div>

                {/* 2. Open Map */}
                <div className="aud-action-card bg-action-blue" onClick={() => setActiveTab('map')}>
                  <div className="action-icon text-blue">
                    <MapIcon size={24} />
                  </div>
                  <span className="action-text">Open Map</span>
                  <ArrowRight size={18} className="action-arrow text-blue" />
                </div>

                {/* 3. View Hash Chain */}
                <div className="aud-action-card bg-action-purple" onClick={() => setActiveTab('chain')}>
                  <div className="action-icon text-purple">
                    <Link2 size={24} />
                  </div>
                  <span className="action-text">View Hash Chain</span>
                  <ArrowRight size={18} className="action-arrow text-purple" />
                </div>

                {/* 4. Generate Report */}
                <div className="aud-action-card bg-action-orange" onClick={() => exportCompliance('September 2026')}>
                  <div className="action-icon text-orange">
                    <FileText size={24} />
                  </div>
                  <span className="action-text">Generate Report</span>
                  <ArrowRight size={18} className="action-arrow text-orange" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub-View: Map View (Full Interactive Real Map) */}
        {activeTab === 'map' && (
          <div className="aud-panel-page">
            <div className="aud-view-card">
              <div className="aud-card-header">
                <div>
                  <h2 className="aud-panel-title">Real Cadastral GIS Satellite Map</h2>
                  <p className="aud-panel-subtitle">Interactive Esri World Imagery & OpenStreetMap layers with Tamil Nadu cadastral boundaries.</p>
                </div>
                <button className="aud-btn-back" onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</button>
              </div>

              <div className="aud-full-map-wrap">
                <RealCadastralMap
                  selectedId={selectedParcelId}
                  onSelectParcel={(id) => {
                    setSelectedParcelId(id);
                    setProvenanceDoc(id);
                  }}
                  height="100%"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sub-View: Trace */}
        {activeTab === 'trace' && (
          <div className="aud-panel-page">
            <div className="aud-view-card">
              <div className="aud-card-header">
                <div>
                  <h2 className="aud-panel-title">Document Provenance & Trace</h2>
                  <p className="aud-panel-subtitle">Inspect the origin, human modifications, and cryptographic seal for all audited documents.</p>
                </div>
                <button className="aud-btn-back" onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</button>
              </div>

              <div className="aud-trace-grid">
                {Object.keys(DOCUMENT_PROVENANCE).map(docKey => {
                  const p = DOCUMENT_PROVENANCE[docKey];
                  return (
                    <div key={docKey} className="aud-trace-card" onClick={() => {
                      setSelectedParcelId(docKey);
                      setProvenanceDoc(docKey);
                    }}>
                      <div className="trace-card-top">
                        <span className="aud-doc-id">{docKey}</span>
                        <span className="aud-tag-survey">Survey {p.survey}</span>
                      </div>
                      <div className="trace-card-body">
                        <div><b>Village:</b> {p.village}</div>
                        <div><b>Field:</b> {p.field}</div>
                        <div><b>Engine:</b> {p.ocrEngine}</div>
                        <div><b>Confidence:</b> <span className={`conf-tag ${p.confidence > 70 ? 'high' : 'low'}`}>{p.confidence}%</span></div>
                      </div>
                      <button className="aud-btn-sm-primary">
                        <Eye size={13} /> View Provenance
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sub-View: Hash Chain */}
        {activeTab === 'chain' && (
          <div className="aud-panel-page">
            <div className="aud-view-card">
              <div className="aud-card-header">
                <div>
                  <h2 className="aud-panel-title">Cryptographic Hash-Chain Ledger</h2>
                  <p className="aud-panel-subtitle">Immutable audit trail. Each entry cryptographically hashes the previous record.</p>
                </div>
                <button className="aud-btn-back" onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</button>
              </div>

              <div className="aud-chain-list">
                {CHAIN_BLOCKS.map((b, idx) => (
                  <div key={b.id} className="aud-chain-block">
                    <div className="chain-top">
                      <div className="chain-id-row">
                        <Hash size={16} className="text-green" />
                        <b>{b.id}</b>
                        <span className="aud-tag-verified"><CheckCircle2 size={12} /> Sealed & Verified</span>
                      </div>
                      <span className="chain-time">{b.t}</span>
                    </div>

                    <div className="chain-details">
                      <div className="cd-row">
                        <span className="cd-lbl">Document Target:</span>
                        <button className="doc-link-btn" onClick={() => {
                          setSelectedParcelId(b.doc);
                          setProvenanceDoc(b.doc);
                        }}>{b.doc}</button>
                      </div>
                      <div className="cd-row">
                        <span className="cd-lbl">Block Hash:</span>
                        <span className="mono-hash">{b.hash}</span>
                      </div>
                      <div className="cd-row">
                        <span className="cd-lbl">Previous Hash:</span>
                        <span className="mono-hash">{b.prev}</span>
                      </div>
                      <div className="cd-row">
                        <span className="cd-lbl">Validator Node:</span>
                        <span>{b.validator}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sub-View: Alerts */}
        {activeTab === 'alerts' && (
          <div className="aud-panel-page">
            <div className="aud-view-card">
              <div className="aud-card-header">
                <div>
                  <h2 className="aud-panel-title">Tamper Detection & Discrepancy Alerts</h2>
                  <p className="aud-panel-subtitle">Continuous background verification of block hashes and database entries.</p>
                </div>
                <button className="aud-btn-back" onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</button>
              </div>

              <div className="aud-empty-alerts">
                <div className="empty-shield-icon">
                  <ShieldCheck size={48} className="text-emerald" />
                </div>
                <h3>All 88,231 Hash-Chain Blocks Verified</h3>
                <p>No cryptographic tampering, broken hash links, or unauthorized modifications detected across the registry.</p>
              </div>
            </div>
          </div>
        )}

        {/* Sub-View: Reports */}
        {activeTab === 'reports' && (
          <div className="aud-panel-page">
            <div className="aud-view-card">
              <div className="aud-card-header">
                <div>
                  <h2 className="aud-panel-title">Compliance & Governance Logs</h2>
                  <p className="aud-panel-subtitle">Download official certified audit logs for statutory review.</p>
                </div>
                <button className="aud-btn-back" onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</button>
              </div>

              <div className="aud-table-wrap">
                <table className="aud-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Total Audit Events</th>
                      <th>Manual Overrides</th>
                      <th>Ledger Status</th>
                      <th>File Size</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPLIANCE_LOGS.map(log => (
                      <tr key={log.period}>
                        <td><b>{log.period}</b></td>
                        <td>{log.events.toLocaleString('en-IN')}</td>
                        <td>{log.overrides}</td>
                        <td><span className="badge-intact">100% Intact</span></td>
                        <td>{log.size}</td>
                        <td>
                          <button
                            className="aud-btn-sm-primary"
                            onClick={() => exportCompliance(log.period)}
                            disabled={exporting === log.period}
                          >
                            {exporting === log.period ? <Loader2 size={13} className="spin" /> : <Download size={13} />}
                            {exporting === log.period ? 'Exporting…' : 'Export CSV'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sub-View: GIS Cadastral Map Explorer */}
        {activeTab === 'map' && (
          <div className="aud-panel-page">
            <div className="aud-view-card" style={{ padding: '24px' }}>
              <div className="aud-card-header" style={{ marginBottom: 16 }}>
                <div>
                  <h2 className="aud-panel-title">GIS Cadastral Map & Parcel Explorer</h2>
                  <p className="aud-panel-subtitle">Real-time high-resolution satellite imagery with overlaid cadastral survey boundaries and verification status.</p>
                </div>
                <button className="aud-btn-back" onClick={() => setActiveTab('dashboard')}>← Back to Dashboard</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', minHeight: '520px' }}>
                <div style={{ height: '520px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #b3e3ca' }}>
                  <RealCadastralMap
                    selectedId={selectedParcelId}
                    onSelectParcel={(id) => {
                      setSelectedParcelId(id);
                      setProvenanceDoc(id);
                    }}
                    height="100%"
                  />
                </div>

                <div style={{ background: '#f8faf9', borderRadius: '12px', border: '1px solid #d1fae5', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#064e3b' }}>Select Parcel to Inspect</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
                    {Object.keys(DOCUMENT_PROVENANCE).map(docKey => {
                      const p = DOCUMENT_PROVENANCE[docKey];
                      const isSel = selectedParcelId === docKey;
                      return (
                        <div
                          key={docKey}
                          onClick={() => {
                            setSelectedParcelId(docKey);
                            setProvenanceDoc(docKey);
                          }}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            background: isSel ? '#ecfdf5' : '#ffffff',
                            border: isSel ? '1.5px solid #10b981' : '1px solid #e5e7eb',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <b style={{ color: '#064e3b', fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>{docKey}</b>
                            <span style={{ fontSize: 11, background: '#d1fae5', color: '#047857', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                              Survey {p.survey}
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: '#6b7280' }}>
                            {p.village} · Extracted at {p.extractedAt}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    className="aud-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                    onClick={() => setProvenanceDoc(selectedParcelId)}
                  >
                    <FileSearch size={15} /> View Full Provenance
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          PROVENANCE MODAL
          ===================================================================== */}
      {provenanceDoc && (
        <div className="aud-modal-overlay" onClick={() => setProvenanceDoc(null)}>
          <div className="aud-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="aud-modal-head">
              <div>
                <span className="aud-modal-eyebrow">DOCUMENT PROVENANCE & AUDIT TRAIL</span>
                <h3 className="aud-modal-title">{provenanceDoc}</h3>
              </div>
              <button className="aud-modal-close" onClick={() => setProvenanceDoc(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="aud-modal-body">
              {/* Step 1: Extraction Provenance */}
              <div className="prov-box">
                <div className="prov-box-title">
                  <FileSearch size={16} className="text-green" /> 1. Extraction Origin
                </div>
                {DOCUMENT_PROVENANCE[provenanceDoc] ? (
                  <div className="prov-grid">
                    <div><b>Source:</b> {DOCUMENT_PROVENANCE[provenanceDoc].sourceFile}</div>
                    <div><b>Page:</b> Page {DOCUMENT_PROVENANCE[provenanceDoc].page}</div>
                    <div><b>Engine:</b> {DOCUMENT_PROVENANCE[provenanceDoc].ocrEngine}</div>
                    <div><b>Confidence:</b> {DOCUMENT_PROVENANCE[provenanceDoc].confidence}%</div>
                    <div><b>Raw Value:</b> <code>{DOCUMENT_PROVENANCE[provenanceDoc].rawValue}</code></div>
                    <div><b>Survey:</b> {DOCUMENT_PROVENANCE[provenanceDoc].survey}</div>
                  </div>
                ) : (
                  <p className="text-muted">Standard document audit stream recorded.</p>
                )}
              </div>

              {/* Step 2: Decision Provenance (if overridden) */}
              {DECISIONS.find(d => d.doc === provenanceDoc) && (
                <div className="prov-box">
                  <div className="prov-box-title">
                    <UserCog size={16} className="text-yellow" /> 2. Officer Decision & Manual Override
                  </div>
                  {(() => {
                    const dec = DECISIONS.find(d => d.doc === provenanceDoc);
                    return (
                      <div className="prov-decision-diff">
                        <div className="diff-node old">
                          <span>AI Value:</span>
                          <del>{dec.from}</del>
                        </div>
                        <ChevronRight size={16} />
                        <div className="diff-node new">
                          <span>Officer Value:</span>
                          <b>{dec.to}</b>
                        </div>
                        <div className="diff-meta">
                          <b>Officer:</b> {dec.user} ({dec.role}) · <b>Reason:</b> {dec.reason}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Step 3: Hash-Chain Seal */}
              <div className="prov-box">
                <div className="prov-box-title">
                  <Lock size={16} className="text-emerald" /> 3. Cryptographic Seal
                </div>
                <div className="prov-grid">
                  <div><b>Block:</b> B-88231</div>
                  <div><b>Hash:</b> <code>7a3f9ec...c02d</code></div>
                  <div><b>Status:</b> Sealed on State Blockchain Ledger</div>
                </div>
              </div>
            </div>

            <div className="aud-modal-footer">
              <button className="aud-btn-outline" onClick={() => setProvenanceDoc(null)}>Close</button>
              <button className="aud-btn-primary" onClick={() => {
                addToast(`Exported digital certificate for ${provenanceDoc}`, 'success');
                setProvenanceDoc(null);
              }}>
                <Download size={14} /> Export Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   AUDITOR DASHBOARD STYLES
   ========================================================================= */

const AUDITOR_STYLES = `
.aud-root {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  background: #ebf5ee url('${auditbg}') no-repeat right top / cover;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #0c2317;
  overflow-x: hidden;
}

.aud-root * {
  box-sizing: border-box;
}

/* =========================================================================
   SIDEBAR (Rich Mint Green Background with Crisp Border for Menu Card)
   ========================================================================= */
.aud-sidebar {
  width: 236px;
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

.aud-sidebar-top {
  display: flex;
  flex-direction: column;
}

.aud-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px 28px;
  cursor: pointer;
  user-select: none;
}

.aud-brand-mark {
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

.aud-brand-text {
  font-size: 20px;
  font-weight: 800;
  color: #0c2317;
  letter-spacing: -0.02em;
}

.aud-nav-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(255, 255, 255, 0.55);
  border: 1.5px solid #7bc69e;
  padding: 10px 8px;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(4, 120, 87, 0.06);
}

.aud-nav-item {
  width: 100%;
  height: 42px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  border-radius: 9999px;
  border: 1px solid transparent;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #1b452f;
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: left;
}

.aud-nav-item:hover {
  background: rgba(255, 255, 255, 0.8);
  color: #047857;
  border-color: #7bc69e;
}

.aud-nav-item.active {
  background: #094e32;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(9, 78, 50, 0.32);
  border-color: #094e32;
}

.aud-sidebar-bottom {
  padding: 14px 10px 4px;
  border-top: 1px solid #7bc69e;
}

.aud-tagline {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  color: #1b452f;
}

.aud-tagline-bar {
  width: 32px;
  height: 2px;
  background: #059669;
  margin-top: 8px;
  border-radius: 2px;
}

/* =========================================================================
   MAIN LAYOUT & HEADER
   ========================================================================= */
.aud-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 16px 36px 36px 20px;
}

.aud-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.aud-search-bar {
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

.aud-search-icon {
  color: #6b7280;
  flex: none;
}

.aud-search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  outline: none;
}

.aud-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.aud-icon-btn {
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
  transition: all 0.18s ease;
}

.aud-icon-btn:hover {
  border-color: #059669;
  color: #059669;
}

.aud-notif-dot {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  border: 1.5px solid #ffffff;
}

.aud-profile-wrap {
  position: relative;
}

.aud-user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e1ede5;
  border: 1px solid #c2ded0;
  padding: 4px 12px 4px 4px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.aud-user-pill:hover {
  background: #d4e8dc;
}

.aud-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #064e3b;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aud-user-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.aud-role-icon {
  color: #059669;
}

.aud-username {
  font-size: 13.5px;
  font-weight: 700;
  color: #111827;
}

.aud-chevron {
  color: #4b5563;
}

.aud-header {
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

.aud-profile-dropdown {
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

.aud-dd-user {
  display: flex;
  flex-direction: column;
  padding: 4px 6px;
}

.aud-dd-user b { font-size: 13.5px; color: #111827; }
.aud-dd-user span { font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px; }
.aud-dd-divider { height: 1px; background: #f3f4f6; margin: 8px 0; }

.aud-dd-item {
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

.aud-dd-item:hover { background: #f0fdf4; color: #059669; }
.aud-dd-item.danger:hover { background: #fef2f2; color: #dc2626; }

/* =========================================================================
   DASHBOARD HERO & KPIS
   ========================================================================= */
.aud-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.aud-hero-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.aud-title {
  font-size: 26px;
  font-weight: 800;
  color: #0c2317;
  margin: 0;
}

.aud-subtitle {
  font-size: 14.5px;
  font-weight: 500;
  color: #374151;
  margin: 4px 0 0;
}

.aud-quote-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.aud-quote-text {
  font-size: 13px;
  font-style: italic;
  color: #374151;
  font-weight: 600;
}

.aud-quote-bar {
  width: 28px;
  height: 2px;
  background: #059669;
  margin-top: 6px;
}

/* KPI Grid */
.aud-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.aud-kpi-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 14px;
  border: 1px solid rgba(200, 225, 210, 0.8);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  backdrop-filter: blur(8px);
}

.kpi-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.bg-green-soft { background: #dcfce7; }
.bg-red-soft { background: #fee2e2; }
.bg-yellow-soft { background: #fef3c7; }
.bg-emerald-soft { background: #d1fae5; }

.text-green { color: #059669; }
.text-red { color: #dc2626; }
.text-yellow { color: #d97706; }
.text-emerald { color: #047857; }
.text-blue { color: #0284c7; }
.text-purple { color: #9333ea; }
.text-orange { color: #ea580c; }

.kpi-value {
  font-size: 24px;
  font-weight: 800;
  color: #0c2317;
  line-height: 1.1;
}

.kpi-label {
  font-size: 12.5px;
  color: #4b6354;
  font-weight: 600;
  margin-top: 4px;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  margin-top: 10px;
}

/* =========================================================================
   MIDDLE SECTION: REAL SATELLITE MAP & AUDIT ACTIVITY
   ========================================================================= */
.aud-middle-grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 16px;
}

.aud-map-card {
  background: #0f2418;
  border-radius: 14px;
  border: 1.5px solid rgba(16, 185, 129, 0.35);
  overflow: hidden;
  position: relative;
  height: 290px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* Feed Card */
.aud-feed-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 14px;
  border: 1px solid rgba(200, 225, 210, 0.8);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.aud-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.aud-card-title {
  font-size: 16px;
  font-weight: 800;
  color: #0c2317;
  margin: 0;
}

.aud-link-btn {
  background: transparent;
  border: none;
  color: #059669;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.aud-link-btn:hover {
  text-decoration: underline;
}

.aud-feed-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.aud-feed-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px dashed #e5e7eb;
}

.aud-feed-row:last-child {
  border-bottom: none;
}

.feed-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.aud-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

.dot-green { background: #10b981; }
.dot-red { background: #ef4444; }
.dot-yellow { background: #f59e0b; }

.feed-time {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: #6b7280;
}

.feed-divider {
  color: #cbd5e1;
}

.feed-desc {
  color: #1f2937;
  font-weight: 500;
}

.feed-doc-link {
  background: transparent;
  border: none;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 800;
  color: #059669;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s;
}

.feed-doc-link:hover {
  background: #dcfce7;
}

/* =========================================================================
   QUICK ACTIONS
   ========================================================================= */
.aud-actions-section {
  margin-top: 2px;
}

.aud-section-title {
  font-size: 15px;
  font-weight: 800;
  color: #0c2317;
  margin: 0 0 10px;
}

.aud-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.aud-action-card {
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.18s ease;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.aud-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.bg-action-mint { background: #e8f5ed; }
.bg-action-blue { background: #e0f2fe; }
.bg-action-purple { background: #f3e8ff; }
.bg-action-orange { background: #ffedd5; }

.action-text {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
  flex: 1;
  margin-left: 12px;
}

/* =========================================================================
   SUB-PANELS & MODALS
   ========================================================================= */
.aud-panel-page {
  padding: 6px 0 20px;
}

.aud-view-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 26px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.aud-panel-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
}

.aud-panel-subtitle {
  font-size: 13.5px;
  color: #4b6354;
  margin: 4px 0 0;
}

.aud-btn-back {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #059669;
  padding: 7px 14px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

.aud-full-map-wrap {
  height: 480px;
  margin-top: 18px;
}

.aud-trace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.aud-trace-card {
  background: #f8faf9;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.aud-trace-card:hover {
  border-color: #059669;
  background: #ffffff;
}

.aud-doc-id {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 16px;
  font-weight: 800;
  color: #059669;
}

.aud-tag-survey {
  font-size: 11.5px;
  background: #dcfce7;
  color: #166534;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 700;
}

.conf-tag.high { color: #059669; font-weight: 800; }
.conf-tag.low { color: #dc2626; font-weight: 800; }

.aud-btn-sm-primary {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Hash Chain */
.aud-chain-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 18px;
}

.aud-chain-block {
  background: #f8faf9;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 18px;
}

.chain-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.chain-id-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.aud-tag-verified {
  font-size: 11.5px;
  background: #d1fae5;
  color: #065f46;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.mono-hash {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
  background: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.cd-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  margin-bottom: 6px;
}

.cd-lbl {
  color: #6b7280;
  width: 130px;
  font-weight: 600;
}

/* Empty Alerts */
.aud-empty-alerts {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 20px;
}

.empty-shield-icon {
  margin-bottom: 14px;
}

/* Table */
.aud-table-wrap {
  overflow-x: auto;
  margin-top: 18px;
}

.aud-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

.aud-table th {
  text-align: left;
  padding: 12px;
  background: #f8faf9;
  border-bottom: 2px solid #e5e7eb;
  font-size: 11.5px;
  font-weight: 800;
  text-transform: uppercase;
}

.aud-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #f3f4f6;
}

.badge-intact {
  background: #d1fae5;
  color: #065f46;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* Modal */
.aud-modal-overlay {
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

.aud-modal-dialog {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}

.aud-modal-head {
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #f8faf9;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.aud-modal-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #059669;
}

.aud-modal-title {
  font-size: 20px;
  font-weight: 800;
  margin: 2px 0 0;
}

.aud-modal-close {
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

.aud-modal-body {
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prov-box {
  background: #f8faf9;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
}

.prov-box-title {
  font-size: 13.5px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.prov-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 12.5px;
}

.prov-decision-diff {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 13px;
}

.diff-node {
  padding: 6px 10px;
  border-radius: 6px;
}

.diff-node.old { background: #fee2e2; color: #991b1b; }
.diff-node.new { background: #dcfce7; color: #166534; }
.diff-meta { width: 100%; font-size: 12px; color: #4b5563; margin-top: 4px; }

.aud-modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.aud-btn-primary {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.aud-btn-outline {
  background: #ffffff;
  border: 1.5px solid #d1d5db;
  color: #374151;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .aud-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .aud-middle-grid { grid-template-columns: 1fr; }
  .aud-actions-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .aud-root { flex-direction: column; }
  .aud-sidebar { width: 100%; border-right: none; border-bottom: 1.5px solid #a3dec0; }
  .aud-main { padding: 14px; }
  .aud-hero-row { flex-direction: column; align-items: flex-start; gap: 8px; }
}
`;