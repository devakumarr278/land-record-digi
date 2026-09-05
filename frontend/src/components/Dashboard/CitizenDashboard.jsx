import React, { useState, useEffect } from 'react';
import {
  Search, Map, FileText, Send, History, Bell,
  Settings as SettingsIcon, LogOut, X, Lock, Eye,
  CheckCircle2, Clock, AlertTriangle, ArrowRight,
  ChevronDown, Download, Shield, Sparkles, ExternalLink,
  HelpCircle, Info, Layers, UserCheck
} from 'lucide-react';
import citibg from '../../assets/citibg.png';
import logoImg from '../../assets/logo.jpg';
import RealCadastralMap from '../Common/RealCadastralMap';

/* =========================================================================
   MOCK DATA FOR CITIZEN PORTAL
   ========================================================================= */

const ALL_RECORDS = [
  {
    survey: '125/2',
    village: 'Kinathukadavu',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    status: 'verified',
    area: '2.50 Acres',
    classification: 'Agricultural Wet Land',
    owner: 'Abishek B K',
    pattaNumber: 'PT-884920',
    lastMutation: '14-Jan-2024',
    taxPaidUntil: '2026-2027',
    cadastralMap: '/cadastral_map_125_2.jpg'
  },
  {
    survey: '77/1',
    village: 'Madukkarai',
    taluk: 'Sulur',
    district: 'Coimbatore',
    status: 'discrepancy',
    area: '0.80 Acres',
    classification: 'Residential Plot',
    owner: 'Abishek B K (Co-Owner)',
    pattaNumber: 'PT-391024',
    lastMutation: '28-Nov-2023',
    taxPaidUntil: '2025-2026',
    cadastralMap: '/cadastral_map_118_3.jpg'
  },
  {
    survey: '54/2',
    village: 'Sulur',
    taluk: 'Sulur',
    district: 'Coimbatore',
    status: 'verified',
    area: '3.10 Acres',
    classification: 'Agricultural Dry Land',
    owner: 'Abishek B K',
    pattaNumber: 'PT-551982',
    lastMutation: '05-Mar-2025',
    taxPaidUntil: '2026-2027',
    cadastralMap: '/cadastral_map_125_2.jpg'
  },
  {
    survey: '210/4',
    village: 'Kinathukadavu',
    taluk: 'Pollachi',
    district: 'Coimbatore',
    status: 'verified',
    area: '1.25 Acres',
    classification: 'Commercial Garden',
    owner: 'Sundaram K',
    pattaNumber: 'PT-112094',
    lastMutation: '10-Oct-2024',
    taxPaidUntil: '2026-2027',
    cadastralMap: '/cadastral_map_118_3.jpg'
  }
];

const MY_RECORDS = [ALL_RECORDS[0], ALL_RECORDS[1], ALL_RECORDS[2]];

const INITIAL_REQUESTS = [
  { id: 1020, survey: '77/1', type: 'Area Mismatch', stage: 1, submittedDate: '20-Feb-2026', lastUpdate: '28-Feb-2026', note: 'Surveyor assigned for boundary cross-verification.' },
  { id: 1015, survey: '125/2', type: 'Name Correction in Chitta', stage: 3, submittedDate: '10-Jan-2026', lastUpdate: '18-Feb-2026', note: 'Digitally verified and approved by Sub-Registrar.' },
];

const DOCUMENTS = [
  { id: 'doc-1', title: 'Patta / Chitta Extract', survey: '125/2', type: 'Digital Certified Copy', size: '1.4 MB', date: '14-Jan-2026', verified: true },
  { id: 'doc-2', title: 'Encumbrance Certificate (EC)', survey: '125/2', type: '15-Year Search Certificate', size: '2.1 MB', date: '02-Feb-2026', verified: true },
  { id: 'doc-3', title: 'Field Measurement Book (FMB)', survey: '125/2', type: 'Cadastral Geo-Vector Sketch', size: '3.8 MB', date: '20-Dec-2025', verified: true },
  { id: 'doc-4', title: 'Mutation Order Deed', survey: '77/1', type: 'Revenue Order Copy', size: '950 KB', date: '28-Nov-2023', verified: false, restricted: true },
];

const NOTIFICATIONS = [
  { id: 1, title: 'Record Verified for Survey 125/2', time: '2 days ago', unread: true, desc: 'Digital Patta extraction has been re-verified with state blockchain hash.' },
  { id: 2, title: 'Request #1020 Under Review', time: '5 days ago', unread: false, desc: 'Taluk surveyor team is inspecting field boundaries.' },
  { id: 3, title: 'Annual Land Tax Assessment Updated', time: '1 week ago', unread: false, desc: 'Financial year 2026-2027 demand note is now accessible in Documents.' },
];

/* =========================================================================
   CITIZEN DASHBOARD COMPONENT
   ========================================================================= */

export default function CitizenDashboard({ userName = 'Abishek b k', onLogout = () => {}, addToast = () => {} }) {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [viewParcel, setViewParcel] = useState(null);
  const [requestForm, setRequestForm] = useState(null);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [reqCounter, setReqCounter] = useState(1021);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [infoModal, setInfoModal] = useState(null);

  // Search filter state
  const [filterDistrict, setFilterDistrict] = useState('Coimbatore');
  const [filterTaluk, setFilterTaluk] = useState('All');
  const [filterVillage, setFilterVillage] = useState('All');

  // Load Google Fonts
  useEffect(() => {
    if (document.getElementById('cit-dash-fonts')) return;
    const link = document.createElement('link');
    link.id = 'cit-dash-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  // Quick search handler
  function handleQuickSearch(e) {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setSearchResults(ALL_RECORDS);
      setActiveTab('search');
      return;
    }

    const filtered = ALL_RECORDS.filter(r =>
      r.survey.toLowerCase().includes(query) ||
      r.village.toLowerCase().includes(query) ||
      r.taluk.toLowerCase().includes(query) ||
      r.district.toLowerCase().includes(query) ||
      r.owner.toLowerCase().includes(query) ||
      r.pattaNumber.toLowerCase().includes(query)
    );

    setSearchResults(filtered);
    setActiveTab('search');
    addToast(`Found ${filtered.length} record(s) matching "${searchQuery}"`, 'info');
  }

  // Filtered search handler
  function handleFilterSearch(e) {
    e.preventDefault();
    const filtered = ALL_RECORDS.filter(r => {
      let ok = true;
      if (filterTaluk !== 'All') ok = ok && r.taluk === filterTaluk;
      if (filterVillage !== 'All') ok = ok && r.village === filterVillage;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        ok = ok && (
          r.survey.toLowerCase().includes(q) ||
          r.owner.toLowerCase().includes(q) ||
          r.pattaNumber.toLowerCase().includes(q)
        );
      }
      return ok;
    });
    setSearchResults(filtered);
  }

  // Handle new request submission
  function handleRequestSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newId = reqCounter;
    setReqCounter(c => c + 1);

    const newReq = {
      id: newId,
      survey: fd.get('survey') || 'General',
      type: fd.get('type') || 'Discrepancy Correction',
      stage: 0,
      submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastUpdate: 'Just now',
      note: fd.get('description') || 'Submitted for revenue officer verification.'
    };

    setRequests([newReq, ...requests]);
    setRequestForm(null);
    setActiveTab('requests');
    addToast(`Request #${newId} registered successfully.`, 'success');
  }

  const currentParcel = viewParcel
    ? ALL_RECORDS.find(x => x.survey === viewParcel) || MY_RECORDS[0]
    : null;

  return (
    <div className="cit-portal-root">
      <style>{CITIZEN_STYLES}</style>

      {/* =====================================================================
          TOP NAVIGATION BAR (Matching exact design)
          ===================================================================== */}
      <header className="cit-header">
        <div className="cit-header-left">
          {/* Logo */}
          <div className="cit-logo" onClick={() => setActiveTab('home')}>
            <div className="cit-logo-mark">
              <img src={logoImg} alt="NilOra" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
            <span className="cit-logo-text">NilOra</span>
          </div>

          {/* Navigation Links */}
          <nav className="cit-nav">
            {[
              { id: 'home', label: 'Home' },
              { id: 'search', label: 'Search' },
              { id: 'myparcels', label: 'My Parcels' },
              { id: 'documents', label: 'Documents' },
              { id: 'requests', label: 'Requests' },
              { id: 'history', label: 'History' },
            ].map(item => (
              <button
                key={item.id}
                className={`cit-nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'search' && !searchResults) setSearchResults(ALL_RECORDS);
                }}
              >
                {item.label}
                {activeTab === item.id && <span className="cit-active-bar" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="cit-header-right">
          {/* Top Search Pill */}
          <form className="cit-top-search" onSubmit={handleQuickSearch}>
            <Search size={15} className="cit-search-icon" />
            <input
              type="text"
              placeholder="Search records, owner name, survey number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Notification Bell */}
          <div className="cit-notif-wrapper">
            <button
              className="cit-icon-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              title="Notifications"
            >
              <Bell size={18} strokeWidth={2} />
              <span className="cit-badge-dot" />
            </button>

            {notifOpen && (
              <div className="cit-dropdown-card cit-notif-dropdown">
                <div className="cit-dd-head">
                  <b>Notifications</b>
                  <span className="cit-pill-sm">3 New</span>
                </div>
                <div className="cit-notif-list">
                  {NOTIFICATIONS.map(n => (
                    <div key={n.id} className="cit-notif-item">
                      <div className="cit-notif-title">{n.title}</div>
                      <div className="cit-notif-desc">{n.desc}</div>
                      <div className="cit-notif-time">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="cit-profile-wrapper">
            <button
              className="cit-user-btn"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="cit-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="cit-username">{userName}</span>
              <ChevronDown size={14} className="cit-chevron" />
            </button>

            {profileOpen && (
              <div className="cit-dropdown-card cit-profile-dropdown">
                <div className="cit-user-summary">
                  <div className="cit-avatar-lg">{userName.charAt(0).toUpperCase()}</div>
                  <div>
                    <b>{userName}</b>
                    <div className="cit-role-tag">Citizen User · Verified Aadhaar</div>
                  </div>
                </div>
                <div className="cit-dd-divider" />
                <button className="cit-dd-item" onClick={() => { setActiveTab('myparcels'); setProfileOpen(false); }}>
                  <Map size={15} /> My Registered Parcels
                </button>
                <button className="cit-dd-item" onClick={() => { setActiveTab('documents'); setProfileOpen(false); }}>
                  <FileText size={15} /> Digital Vault
                </button>
                <button className="cit-dd-item" onClick={() => { setInfoModal('help'); setProfileOpen(false); }}>
                  <HelpCircle size={15} /> Help & Guidelines
                </button>
                <div className="cit-dd-divider" />
                <button className="cit-dd-item danger" onClick={onLogout}>
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================================
          MAIN VIEW CONTAINER
          ===================================================================== */}
      <main className="cit-main">
        {activeTab === 'home' && (
          <div className="cit-hero-stage">
            {/* Floating Brand Pillars on Right (Matching Indian Map Graphic in citizen.png) */}
            <div className="cit-brand-pillar">
              <div className="pillar-word">People.</div>
              <div className="pillar-word">Land.</div>
              <div className="pillar-word">Progress.</div>
              <div className="pillar-word">India.</div>
              <div className="pillar-underline" />
            </div>

            {/* Center Hero Block */}
            <div className="cit-hero-center">
              {/* Eyebrow */}
              <div className="cit-eyebrow">
                <span className="cit-eyebrow-line" />
                <span className="cit-eyebrow-text">CITIZEN PORTAL</span>
                <span className="cit-eyebrow-line" />
              </div>

              {/* Main Heading */}
              <h1 className="cit-hero-title">
                Your Land.<br />
                Our Shared India.
              </h1>

              {/* Subtitle */}
              <p className="cit-hero-subtitle">
                Access land records. Build a stronger tomorrow.
              </p>

              {/* 4 Interactive Action Nodes */}
              <div className="cit-action-nodes">
                {/* 1. My Parcels */}
                <div className="cit-node-group" onClick={() => setActiveTab('myparcels')}>
                  <div className="cit-node-bubble bubble-blue">
                    <Map size={36} strokeWidth={2.2} className="cit-node-icon blue-icon" />
                  </div>
                  <span className="cit-node-label">My Parcels</span>
                </div>

                {/* 2. Search Records (Center Focal Hub) */}
                <div className="cit-node-group focal-group" onClick={() => {
                  setSearchResults(ALL_RECORDS);
                  setActiveTab('search');
                }}>
                  <div className="cit-focal-halo">
                    <div className="cit-focal-core">
                      <Search size={32} strokeWidth={2.4} className="cit-focal-icon" />
                      <div className="cit-focal-text">
                        <span>Search</span>
                        <span>Records</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Documents */}
                <div className="cit-node-group" onClick={() => setActiveTab('documents')}>
                  <div className="cit-node-bubble bubble-orange">
                    <FileText size={36} strokeWidth={2.2} className="cit-node-icon orange-icon" />
                  </div>
                  <span className="cit-node-label">Documents</span>
                </div>

                {/* 4. Requests */}
                <div className="cit-node-group" onClick={() => setActiveTab('requests')}>
                  <div className="cit-node-bubble bubble-purple">
                    <Send size={34} strokeWidth={2.2} className="cit-node-icon purple-icon" />
                  </div>
                  <span className="cit-node-label">Requests</span>
                </div>
              </div>

              {/* Wide Hero Search Capsule */}
              <form className="cit-hero-search-capsule" onSubmit={handleQuickSearch}>
                <Search size={20} className="capsule-search-icon" />
                <input
                  type="text"
                  placeholder="Search by district, taluk, village or survey number..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="capsule-submit-btn" title="Search Records">
                  <ArrowRight size={20} strokeWidth={2.5} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            SEARCH TAB VIEW
            =================================================================== */}
        {activeTab === 'search' && (
          <div className="cit-panel-view">
            <div className="cit-view-card">
              <div className="cit-view-header">
                <div>
                  <h2 className="cit-view-title">Public Land Record Search</h2>
                  <p className="cit-view-subtitle">Search Cadastral land records, ownership verification, and survey maps.</p>
                </div>
                <button className="cit-btn-back" onClick={() => setActiveTab('home')}>← Back to Home</button>
              </div>

              {/* Filter controls */}
              <form className="cit-filter-grid" onSubmit={handleFilterSearch}>
                <div className="cit-form-field">
                  <label>District</label>
                  <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Tiruppur">Tiruppur</option>
                    <option value="Erode">Erode</option>
                  </select>
                </div>

                <div className="cit-form-field">
                  <label>Taluk</label>
                  <select value={filterTaluk} onChange={e => setFilterTaluk(e.target.value)}>
                    <option value="All">All Taluks</option>
                    <option value="Pollachi">Pollachi</option>
                    <option value="Sulur">Sulur</option>
                    <option value="Coimbatore South">Coimbatore South</option>
                  </select>
                </div>

                <div className="cit-form-field">
                  <label>Village</label>
                  <select value={filterVillage} onChange={e => setFilterVillage(e.target.value)}>
                    <option value="All">All Villages</option>
                    <option value="Kinathukadavu">Kinathukadavu</option>
                    <option value="Madukkarai">Madukkarai</option>
                    <option value="Sulur">Sulur</option>
                  </select>
                </div>

                <div className="cit-form-field">
                  <label>Survey No. / Owner</label>
                  <input
                    type="text"
                    placeholder="e.g. 125/2 or Abishek"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="cit-form-actions">
                  <button type="submit" className="cit-btn-primary">Apply Filter</button>
                  <button type="button" className="cit-btn-outline" onClick={() => {
                    setFilterTaluk('All');
                    setFilterVillage('All');
                    setSearchQuery('');
                    setSearchResults(ALL_RECORDS);
                  }}>Reset</button>
                </div>
              </form>

              {/* Search Results List */}
              <div className="cit-results-wrap">
                <div className="cit-results-head">
                  <h3>Matching Parcels ({(searchResults || ALL_RECORDS).length})</h3>
                  <span className="cit-chip-status">Digital Registry Live</span>
                </div>

                <div className="cit-records-grid">
                  {(searchResults || ALL_RECORDS).map(record => (
                    <div key={record.survey} className="cit-parcel-card">
                      <div className="cit-card-top">
                        <div className="cit-survey-tag">
                          <span className="survey-lbl">SURVEY NO.</span>
                          <b className="survey-num">{record.survey}</b>
                        </div>
                        <span className={`cit-status-badge ${record.status}`}>
                          {record.status === 'verified' ? '✓ Verified' : '⚠ Discrepancy'}
                        </span>
                      </div>

                      <div className="cit-card-details">
                        <div className="detail-row">
                          <span className="detail-lbl">Village & Taluk</span>
                          <b>{record.village}, {record.taluk}</b>
                        </div>
                        <div className="detail-row">
                          <span className="detail-lbl">Registered Area</span>
                          <b>{record.area}</b>
                        </div>
                        <div className="detail-row">
                          <span className="detail-lbl">Classification</span>
                          <span>{record.classification}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-lbl">Owner Name</span>
                          <b>{record.owner}</b>
                        </div>
                      </div>

                      <div className="cit-card-actions">
                        <button className="cit-btn-primary btn-sm" onClick={() => setViewParcel(record.survey)}>
                          <Eye size={14} /> View Parcel & GIS
                        </button>
                        <button className="cit-btn-outline btn-sm" onClick={() => {
                          setSelectedDoc({
                            title: `Extract for Survey ${record.survey}`,
                            survey: record.survey,
                            owner: record.owner,
                            patta: record.pattaNumber,
                            area: record.area
                          });
                        }}>
                          <Download size={14} /> Extract
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MY PARCELS TAB VIEW
            =================================================================== */}
        {activeTab === 'myparcels' && (
          <div className="cit-panel-view">
            <div className="cit-view-card">
              <div className="cit-view-header">
                <div>
                  <h2 className="cit-view-title">My Registered Parcels</h2>
                  <p className="cit-view-subtitle">Parcels linked to your verified Aadhaar / Citizen ID ({userName}).</p>
                </div>
                <div className="cit-view-actions">
                  <button className="cit-btn-outline" onClick={() => setRequestForm('')}>+ Report Discrepancy</button>
                  <button className="cit-btn-back" onClick={() => setActiveTab('home')}>← Back to Home</button>
                </div>
              </div>

              <div className="cit-table-wrap">
                <table className="cit-table">
                  <thead>
                    <tr>
                      <th>Survey No.</th>
                      <th>Location</th>
                      <th>Extent / Area</th>
                      <th>Classification</th>
                      <th>Patta No.</th>
                      <th>Tax Status</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MY_RECORDS.map(r => (
                      <tr key={r.survey}>
                        <td><b className="cit-mono-badge">{r.survey}</b></td>
                        <td>
                          <b>{r.village}</b>
                          <div className="sub-text">{r.taluk}, {r.district}</div>
                        </td>
                        <td>{r.area}</td>
                        <td><span className="cit-pill-muted">{r.classification}</span></td>
                        <td><span className="cit-mono">{r.pattaNumber}</span></td>
                        <td><span className="cit-text-success">Paid ({r.taxPaidUntil})</span></td>
                        <td>
                          <span className={`cit-status-badge ${r.status}`}>
                            {r.status === 'verified' ? '✓ Verified' : '⚠ Review'}
                          </span>
                        </td>
                        <td>
                          <div className="cit-flex-gap">
                            <button className="cit-btn-primary btn-xs" onClick={() => setViewParcel(r.survey)}>
                              View GIS
                            </button>
                            <button className="cit-btn-outline btn-xs" onClick={() => setRequestForm(r.survey)}>
                              Issue
                            </button>
                          </div>
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
            DOCUMENTS TAB VIEW
            =================================================================== */}
        {activeTab === 'documents' && (
          <div className="cit-panel-view">
            <div className="cit-view-card">
              <div className="cit-view-header">
                <div>
                  <h2 className="cit-view-title">Digital Document Vault</h2>
                  <p className="cit-view-subtitle">Digitally signed & blockchain verified land records, patta certificates, and mutation deeds.</p>
                </div>
                <button className="cit-btn-back" onClick={() => setActiveTab('home')}>← Back to Home</button>
              </div>

              <div className="cit-doc-grid">
                {DOCUMENTS.map(doc => (
                  <div key={doc.id} className="cit-doc-card">
                    <div className="doc-card-icon">
                      {doc.restricted ? <Lock size={22} className="text-amber" /> : <FileText size={22} className="text-emerald" />}
                    </div>
                    <div className="doc-card-info">
                      <div className="doc-header-row">
                        <b className="doc-title">{doc.title}</b>
                        {doc.verified && <span className="cit-badge-seal">Digitally Signed</span>}
                      </div>
                      <div className="doc-sub">Survey {doc.survey} · {doc.type}</div>
                      <div className="doc-meta">Issued: {doc.date} · Size: {doc.size}</div>
                    </div>
                    <div className="doc-card-actions">
                      {doc.restricted ? (
                        <button className="cit-btn-disabled" disabled>
                          <Lock size={13} /> Restricted
                        </button>
                      ) : (
                        <>
                          <button className="cit-btn-outline btn-sm" onClick={() => setSelectedDoc(doc)}>
                            <Eye size={13} /> View
                          </button>
                          <button className="cit-btn-primary btn-sm" onClick={() => addToast(`Downloaded ${doc.title} (PDF)`, 'success')}>
                            <Download size={13} /> Download
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            REQUESTS TAB VIEW
            =================================================================== */}
        {activeTab === 'requests' && (
          <div className="cit-panel-view">
            <div className="cit-view-card">
              <div className="cit-view-header">
                <div>
                  <h2 className="cit-view-title">Citizen Grievance & Mutation Requests</h2>
                  <p className="cit-view-subtitle">Track your submitted correction requests, boundary surveys, and title rectifications.</p>
                </div>
                <div className="cit-view-actions">
                  <button className="cit-btn-primary" onClick={() => setRequestForm('')}>+ New Request</button>
                  <button className="cit-btn-back" onClick={() => setActiveTab('home')}>← Back to Home</button>
                </div>
              </div>

              <div className="cit-requests-list">
                {requests.map(req => {
                  const steps = ['Submitted', 'Field Inspection', 'Officer Review', 'Resolved'];
                  return (
                    <div key={req.id} className="cit-request-item">
                      <div className="req-head">
                        <div>
                          <div className="req-title-row">
                            <b className="req-id">Request #{req.id}</b>
                            <span className="cit-pill-muted">{req.type}</span>
                            <span className="cit-pill-survey">Survey {req.survey}</span>
                          </div>
                          <div className="req-date">Submitted: {req.submittedDate} · Last update: {req.lastUpdate}</div>
                        </div>
                        <span className={`cit-status-pill ${req.stage === 3 ? 'success' : 'pending'}`}>
                          {steps[req.stage]}
                        </span>
                      </div>

                      {/* 4-Step Visual Progress Stepper */}
                      <div className="cit-stepper">
                        {steps.map((st, i) => (
                          <div key={st} className={`step-node ${i <= req.stage ? 'active' : ''} ${i === req.stage ? 'current' : ''}`}>
                            <div className="step-circle">{i < req.stage ? '✓' : i + 1}</div>
                            <span className="step-label">{st}</span>
                            {i < steps.length - 1 && <div className={`step-line ${i < req.stage ? 'filled' : ''}`} />}
                          </div>
                        ))}
                      </div>

                      <div className="req-note">
                        <b>Latest Status Note:</b> {req.note}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            HISTORY TAB VIEW
            =================================================================== */}
        {activeTab === 'history' && (
          <div className="cit-panel-view">
            <div className="cit-view-card">
              <div className="cit-view-header">
                <div>
                  <h2 className="cit-view-title">Parcel Ownership & Chain of Title History</h2>
                  <p className="cit-view-subtitle">Chronological record of registrations, mutations, and cadastral resurveys for Survey 125/2.</p>
                </div>
                <button className="cit-btn-back" onClick={() => setActiveTab('home')}>← Back to Home</button>
              </div>

              <div className="cit-timeline">
                {[
                  { year: '2026', title: 'Digital Re-Verification & GIS Cadastral Lock', authority: 'Coimbatore District Land Authority', deed: 'DL-2026-9901', status: 'Active' },
                  { year: '2015', title: 'Agricultural Revenue Tax Assessment Refreshed', authority: 'Pollachi Taluk Office', deed: 'REV-2015-4421', status: 'Archived' },
                  { year: '2008', title: 'Sale Deed & Title Transfer Registration', authority: 'Sub-Registrar Kinathukadavu', deed: 'DOC-2008-1192', status: 'Archived' },
                  { year: '1998', title: 'Family Partition & Mutation Deed', authority: 'Revenue Divisional Office', deed: 'MUT-1998-0504', status: 'Archived' },
                  { year: '1985', title: 'Original Settlement & Cadastral Mapping', authority: 'Survey & Settlement Department', deed: 'SET-1985-0012', status: 'Origin' },
                ].map((item, idx) => (
                  <div key={idx} className="timeline-entry">
                    <div className="timeline-marker">
                      <div className="marker-dot" />
                      {idx < 4 && <div className="marker-line" />}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-year">{item.year}</div>
                      <b className="timeline-title">{item.title}</b>
                      <div className="timeline-meta">{item.authority} · Reference: <span className="cit-mono">{item.deed}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =====================================================================
          FOOTER (Matching exact design)
          ===================================================================== */}
      <footer className="cit-footer">
        <div className="cit-footer-left">
          © 2026 NilOra. Government of India. All rights reserved.
        </div>
        <div className="cit-footer-right">
          <button className="cit-footer-link" onClick={() => setInfoModal('privacy')}>Privacy</button>
          <span className="cit-footer-sep">|</span>
          <button className="cit-footer-link" onClick={() => setInfoModal('terms')}>Terms</button>
          <span className="cit-footer-sep">|</span>
          <button className="cit-footer-link" onClick={() => setInfoModal('help')}>Help</button>
          <span className="cit-footer-sep">|</span>
          <button className="cit-footer-link" onClick={() => setInfoModal('contact')}>Contact</button>
        </div>
      </footer>

      {/* =====================================================================
          MODAL: PARCEL DETAILS & GIS PREVIEW
          ===================================================================== */}
      {currentParcel && (
        <div className="cit-modal-overlay" onClick={() => setViewParcel(null)}>
          <div className="cit-modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="cit-modal-header">
              <div>
                <h3 className="cit-modal-title">Land Parcel · Survey {currentParcel.survey}</h3>
                <p className="cit-modal-subtitle">{currentParcel.village}, {currentParcel.taluk}, {currentParcel.district}</p>
              </div>
              <button className="cit-modal-close" onClick={() => setViewParcel(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="cit-modal-body">
              <div className="cit-parcel-grid">
                {/* Information Panel */}
                <div className="cit-parcel-info">
                  <div className="info-kv-row">
                    <span className="kv-label">Verification Status</span>
                    <span className={`cit-status-badge ${currentParcel.status}`}>
                      {currentParcel.status === 'verified' ? '✓ Verified by Registry' : '⚠ Discrepancy Flagged'}
                    </span>
                  </div>

                  <div className="info-kv-row">
                    <span className="kv-label">Total Extent</span>
                    <b>{currentParcel.area}</b>
                  </div>

                  <div className="info-kv-row">
                    <span className="kv-label">Land Classification</span>
                    <b>{currentParcel.classification}</b>
                  </div>

                  <div className="info-kv-row">
                    <span className="kv-label">Registered Owner</span>
                    <b>{currentParcel.owner}</b>
                  </div>

                  <div className="info-kv-row">
                    <span className="kv-label">Patta / Chitta No.</span>
                    <span className="cit-mono">{currentParcel.pattaNumber}</span>
                  </div>

                  <div className="info-kv-row">
                    <span className="kv-label">Last Mutation Date</span>
                    <span>{currentParcel.lastMutation}</span>
                  </div>

                  {currentParcel.status === 'discrepancy' && (
                    <div className="cit-alert-warning">
                      <AlertTriangle size={16} />
                      <div>
                        <b>Boundary Notice:</b> A slight area variance is under review with the Tahsildar office.
                      </div>
                    </div>
                  )}

                  <div className="cit-modal-action-row">
                    <button
                      className="cit-btn-primary"
                      onClick={() => {
                        addToast(`Generated digital extract for Survey ${currentParcel.survey}`, 'success');
                      }}
                    >
                      <Download size={14} /> Download Certificate
                    </button>
                    <button
                      className="cit-btn-outline"
                      onClick={() => {
                        setRequestForm(currentParcel.survey);
                        setViewParcel(null);
                      }}
                    >
                      Report Issue
                    </button>
                  </div>
                </div>

                {/* Real Satellite Cadastral GIS Box */}
                <div className="cit-gis-viewer" style={{ minHeight: '340px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div className="gis-header" style={{ padding: '10px 14px', background: '#0a2318' }}>
                    <b style={{ color: '#fff' }}>Real Satellite GIS: Survey {currentParcel.survey}</b>
                    <span className="cit-tag-live">Live Vector</span>
                  </div>
                  <div style={{ flex: 1, minHeight: '280px', position: 'relative' }}>
                    <RealCadastralMap
                      selectedId="LR-1021"
                      height="100%"
                      showControls={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: NEW GRIEVANCE / MUTATION REQUEST
          ===================================================================== */}
      {requestForm !== null && (
        <div className="cit-modal-overlay" onClick={() => setRequestForm(null)}>
          <div className="cit-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="cit-modal-header">
              <div>
                <h3 className="cit-modal-title">Raise Citizen Request / Grievance</h3>
                <p className="cit-modal-subtitle">Directly routed to the Taluk Survey & Revenue Department.</p>
              </div>
              <button className="cit-modal-close" onClick={() => setRequestForm(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit}>
              <div className="cit-modal-body">
                <div className="cit-form-field">
                  <label>Survey Number (optional)</label>
                  <input type="text" name="survey" defaultValue={requestForm || ''} placeholder="e.g. 125/2" />
                </div>

                <div className="cit-form-field">
                  <label>Request Category</label>
                  <select name="type" required>
                    <option value="Area Mismatch in Patta">Area Mismatch in Patta</option>
                    <option value="Name / Spelling Correction">Name / Spelling Correction</option>
                    <option value="Boundary Dispute Inspection">Boundary Dispute Inspection</option>
                    <option value="Digital Extract Re-verification">Digital Extract Re-verification</option>
                    <option value="Encumbrance Certificate Issue">Encumbrance Certificate Issue</option>
                  </select>
                </div>

                <div className="cit-form-field">
                  <label>Detailed Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    placeholder="Describe the discrepancy or the correction required in your land record..."
                  />
                </div>
              </div>

              <div className="cit-modal-footer">
                <button type="button" className="cit-btn-outline" onClick={() => setRequestForm(null)}>Cancel</button>
                <button type="submit" className="cit-btn-primary">Submit to Revenue Desk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: DOCUMENT VIEWER
          ===================================================================== */}
      {selectedDoc && (
        <div className="cit-modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="cit-modal-dialog modal-md" onClick={e => e.stopPropagation()}>
            <div className="cit-modal-header">
              <div>
                <h3 className="cit-modal-title">{selectedDoc.title}</h3>
                <p className="cit-modal-subtitle">Survey {selectedDoc.survey} · Government Certified Digital Record</p>
              </div>
              <button className="cit-modal-close" onClick={() => setSelectedDoc(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="cit-modal-body">
              <div className="cit-cert-preview">
                <div className="cert-watermark">NILORA VERIFIED</div>
                <div className="cert-top">
                  <div className="emblem-seal">🏛️</div>
                  <b>GOVERNMENT OF TAMIL NADU</b>
                  <div className="dept-name">REVENUE & DISASTER MANAGEMENT DEPARTMENT</div>
                </div>
                <div className="cert-divider" />
                <div className="cert-body">
                  <p>This is to digitally certify that land parcel under <b>Survey No. {selectedDoc.survey}</b> in <b>Kinathukadavu Village, Pollachi Taluk</b> is recorded in the Digital Cadastral Registry.</p>
                  <div className="cert-info-box">
                    <div><b>Owner:</b> {selectedDoc.owner || 'Abishek B K'}</div>
                    <div><b>Patta No:</b> {selectedDoc.patta || 'PT-884920'}</div>
                    <div><b>Extent:</b> {selectedDoc.area || '2.50 Acres'}</div>
                    <div><b>Digital Seal ID:</b> SHA256:7f8a92...b84c1</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cit-modal-footer">
              <button className="cit-btn-outline" onClick={() => setSelectedDoc(null)}>Close</button>
              <button className="cit-btn-primary" onClick={() => {
                addToast('Downloaded certified PDF document.', 'success');
                setSelectedDoc(null);
              }}>
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: INFO (Privacy, Terms, Help, Contact)
          ===================================================================== */}
      {infoModal && (
        <div className="cit-modal-overlay" onClick={() => setInfoModal(null)}>
          <div className="cit-modal-dialog modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cit-modal-header">
              <h3 className="cit-modal-title">
                {infoModal === 'privacy' && 'Privacy & Data Security'}
                {infoModal === 'terms' && 'Terms of Service'}
                {infoModal === 'help' && 'Citizen Portal Help Desk'}
                {infoModal === 'contact' && 'Contact Support'}
              </h3>
              <button className="cit-modal-close" onClick={() => setInfoModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="cit-modal-body">
              {infoModal === 'privacy' && (
                <p style={{ lineHeight: 1.6, color: '#334e40' }}>
                  Your land records and Aadhaar authentication data are encrypted using state-grade 256-bit AES standards. Access to certified deed extracts is audit-logged and protected under the National Data Governance Framework.
                </p>
              )}
              {infoModal === 'terms' && (
                <p style={{ lineHeight: 1.6, color: '#334e40' }}>
                  LandIntel provides official digital extracts for informational and verification purposes. Certified extracts are valid under the Information Technology Act, 2000.
                </p>
              )}
              {infoModal === 'help' && (
                <div style={{ lineHeight: 1.6, color: '#334e40' }}>
                  <p><b>How to view your records:</b></p>
                  <ol style={{ paddingLeft: 20 }}>
                    <li>Click <b>My Parcels</b> to view land registered in your name.</li>
                    <li>Use the <b>Search</b> bar to lookup any survey number across Tamil Nadu.</li>
                    <li>Download digitally signed Patta / Chitta extracts from <b>Documents</b>.</li>
                  </ol>
                </div>
              )}
              {infoModal === 'contact' && (
                <div className="cit-info-content">
                  <h4>Contact Support</h4>
                  <p>For discrepancies, portal assistance, or mutation inquiries:</p>
                  <div className="cit-contact-card">
                    <p><b>Helpdesk:</b> 1800-425-LAND (Toll Free)</p>
                    <p><b>Email:</b> support.nilora@nic.in</p>
                    <p><b>Office:</b> Commissionerate of Land Administration, Ezhilagam, Chepauk, Chennai - 600005</p>
                  </div>
                </div>
              )}
            </div>
            <div className="cit-modal-footer">
              <button className="cit-btn-primary" onClick={() => setInfoModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   CSS STYLESHEET — PIXEL-PERFECT CITIZEN PORTAL DESIGN
   ========================================================================= */

const CITIZEN_STYLES = `
/* CSS Reset & Scope */
.cit-portal-root {
  min-height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #eef4f0 url('${citibg}') no-repeat center bottom / cover;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #0c2317;
  overflow-x: hidden;
  position: relative;
}

.cit-portal-root * {
  box-sizing: border-box;
}

/* =========================================================================
   HEADER / TOP NAVIGATION BAR
   ========================================================================= */
.cit-header {
  height: 74px;
  padding: 0 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  flex: none;
  z-index: 1000 !important;
}

.cit-header-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

/* Brand Logo */
.cit-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.cit-logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.35);
}

.cit-logo-mark svg path {
  stroke: #ffffff;
}

.cit-logo-text {
  font-size: 21px;
  font-weight: 800;
  color: #0d281a;
  letter-spacing: -0.02em;
}

/* Nav Menu */
.cit-nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.cit-nav-link {
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 600;
  color: #374151;
  padding: 8px 6px;
  cursor: pointer;
  position: relative;
  transition: color 0.18s ease;
}

.cit-nav-link:hover {
  color: #059669;
}

.cit-nav-link.active {
  color: #0d281a;
  font-weight: 800;
}

.cit-active-bar {
  position: absolute;
  bottom: 0;
  left: 6px;
  right: 6px;
  height: 2.5px;
  background: #059669;
  border-radius: 99px;
}

/* Header Right Elements */
.cit-header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cit-top-search {
  width: 330px;
  height: 40px;
  background: rgba(255, 255, 255, 0.92);
  border: 1.5px solid rgba(16, 185, 129, 0.25);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.cit-top-search:focus-within {
  border-color: #059669;
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.15);
}

.cit-search-icon {
  color: #6b7280;
  flex: none;
}

.cit-top-search input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  outline: none;
}

.cit-top-search input::placeholder {
  color: #6b7280;
}

.cit-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(200, 220, 210, 0.6);
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.18s ease;
}

.cit-icon-btn:hover {
  background: #ffffff;
  color: #059669;
  border-color: #059669;
}

.cit-badge-dot {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  border: 1.5px solid #ffffff;
}

/* User Pill */
.cit-profile-wrapper, .cit-notif-wrapper {
  position: relative;
}

.cit-user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 99px;
  transition: background 0.18s;
}

.cit-user-btn:hover {
  background: rgba(255, 255, 255, 0.6);
}

.cit-avatar {
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
  box-shadow: 0 2px 6px rgba(6, 78, 59, 0.3);
}

.cit-username {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.cit-chevron {
  color: #4b5563;
}

/* Dropdowns */
.cit-dropdown-card {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18);
  z-index: 50000 !important;
  padding: 14px;
  backdrop-filter: blur(12px);
  animation: citFadeIn 0.18s ease;
}

.cit-notif-dropdown {
  width: 320px;
}

.cit-profile-dropdown {
  width: 260px;
}

.cit-dd-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.cit-notif-item {
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.cit-notif-item:last-child {
  border-bottom: none;
}

.cit-notif-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.cit-notif-desc {
  font-size: 12px;
  color: #4b5563;
  margin-top: 3px;
  line-height: 1.4;
}

.cit-notif-time {
  font-size: 11px;
  color: #059669;
  font-weight: 600;
  margin-top: 4px;
}

.cit-user-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 4px;
}

.cit-avatar-lg {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #064e3b;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cit-role-tag {
  font-size: 11.5px;
  color: #059669;
  font-weight: 600;
  margin-top: 2px;
}

.cit-dd-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 8px 0;
}

.cit-dd-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: #374151;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}

.cit-dd-item:hover {
  background: #f0fdf4;
  color: #059669;
}

.cit-dd-item.danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* =========================================================================
   HERO STAGE (Matching exact center composition)
   ========================================================================= */
.cit-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.cit-hero-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 24px 60px;
  position: relative;
}

/* Right Floating Pillar */
.cit-brand-pillar {
  position: absolute;
  top: 14%;
  right: 8%;
  text-align: left;
  user-select: none;
}

.pillar-word {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  color: #166534;
  letter-spacing: -0.01em;
}

.pillar-underline {
  width: 36px;
  height: 2px;
  background: #059669;
  margin-top: 8px;
  border-radius: 2px;
}

/* Center Hero Core */
.cit-hero-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 820px;
  width: 100%;
  z-index: 10;
}

/* Eyebrow */
.cit-eyebrow {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.cit-eyebrow-line {
  width: 42px;
  height: 1.5px;
  background: #059669;
  opacity: 0.85;
}

.cit-eyebrow-text {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.24em;
  color: #059669;
  text-transform: uppercase;
}

/* Title & Subtitle */
.cit-hero-title {
  font-size: 50px;
  font-weight: 800;
  line-height: 1.15;
  color: #0c2317;
  letter-spacing: -0.025em;
  margin: 10px 0 12px;
}

.cit-hero-subtitle {
  font-size: 17px;
  font-weight: 500;
  color: #2d4f3e;
  margin: 0 0 38px;
}

/* 4 Action Nodes */
.cit-action-nodes {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 36px;
  margin-bottom: 34px;
}

.cit-node-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.22s ease;
  user-select: none;
}

.cit-node-group:hover {
  transform: translateY(-4px);
}

.cit-node-bubble {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.bubble-blue {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  box-shadow: 0 8px 24px rgba(56, 189, 248, 0.28);
}

.blue-icon {
  color: #0284c7;
}

.bubble-orange {
  background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.28);
}

.orange-icon {
  color: #ea580c;
}

.bubble-purple {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.28);
}

.purple-icon {
  color: #9333ea;
}

.cit-node-label {
  margin-top: 12px;
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
}

/* Focal Center Hub (Search Records) */
.cit-node-group.focal-group {
  transform: translateY(-4px);
}

.cit-node-group.focal-group:hover {
  transform: translateY(-8px);
}

.cit-focal-halo {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: rgba(5, 150, 105, 0.13);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  box-shadow: 0 0 32px rgba(5, 150, 105, 0.18);
  transition: all 0.25s ease;
}

.cit-node-group.focal-group:hover .cit-focal-halo {
  background: rgba(5, 150, 105, 0.2);
  box-shadow: 0 0 40px rgba(5, 150, 105, 0.3);
}

.cit-focal-core {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  background: linear-gradient(145deg, #059669 0%, #047857 50%, #064e3b 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 28px rgba(4, 120, 87, 0.45);
}

.cit-focal-icon {
  color: #ffffff;
  margin-bottom: 2px;
}

.cit-focal-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12.5px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.15;
}

/* Wide Hero Search Capsule */
.cit-hero-search-capsule {
  width: 580px;
  max-width: 92vw;
  height: 56px;
  background: #ffffff;
  border: 1.5px solid rgba(16, 185, 129, 0.35);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  padding: 6px 8px 6px 20px;
  box-shadow: 0 10px 30px rgba(4, 120, 87, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.cit-hero-search-capsule:focus-within {
  border-color: #059669;
  box-shadow: 0 12px 36px rgba(5, 150, 105, 0.22);
}

.capsule-search-icon {
  color: #059669;
  flex: none;
}

.cit-hero-search-capsule input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14.5px;
  font-weight: 500;
  color: #111827;
  padding: 0 14px;
  outline: none;
}

.cit-hero-search-capsule input::placeholder {
  color: #6b7280;
}

.capsule-submit-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #059669;
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
  transition: all 0.18s ease;
  flex: none;
}

.capsule-submit-btn:hover {
  background: #047857;
  transform: scale(1.05);
}

/* =========================================================================
   PANEL SUB-VIEWS (SEARCH, PARCELS, DOCS, REQUESTS, HISTORY)
   ========================================================================= */
.cit-panel-view {
  padding: 10px 48px 40px;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  animation: citFadeIn 0.2s ease;
}

.cit-view-card {
  background: rgba(255, 255, 255, 0.94);
  border-radius: 20px;
  border: 1.5px solid rgba(16, 185, 129, 0.25);
  padding: 32px;
  box-shadow: 0 20px 50px rgba(2, 24, 13, 0.1);
  backdrop-filter: blur(16px);
}

.cit-view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid #e5e7eb;
}

.cit-view-title {
  font-size: 24px;
  font-weight: 800;
  color: #0c2317;
  margin: 0 0 6px;
}

.cit-view-subtitle {
  font-size: 14px;
  color: #4b6354;
  margin: 0;
  font-weight: 500;
}

.cit-view-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cit-btn-back {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #059669;
  padding: 8px 16px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.15s;
}

.cit-btn-back:hover {
  background: #059669;
  color: #ffffff;
}

/* Filters */
.cit-filter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  gap: 16px;
  align-items: flex-end;
  background: #f8faf9;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  margin-bottom: 28px;
}

.cit-form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cit-form-field label {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cit-form-field input, .cit-form-field select, .cit-form-field textarea {
  padding: 10px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13.5px;
  color: #111827;
  background: #ffffff;
  outline: none;
  transition: border-color 0.15s;
}

.cit-form-field input:focus, .cit-form-field select:focus, .cit-form-field textarea:focus {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
}

.cit-form-actions {
  display: flex;
  gap: 8px;
}

/* Buttons */
.cit-btn-primary {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: all 0.15s;
}

.cit-btn-primary:hover {
  background: #047857;
}

.cit-btn-outline {
  background: #ffffff;
  color: #374151;
  border: 1.5px solid #d1d5db;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: all 0.15s;
}

.cit-btn-outline:hover {
  border-color: #059669;
  color: #059669;
  background: #f0fdf4;
}

.cit-btn-disabled {
  background: #f3f4f6;
  color: #9ca3af;
  border: 1px solid #e5e7eb;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: not-allowed;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-sm {
  padding: 7px 14px;
  font-size: 12.5px;
}

.btn-xs {
  padding: 5px 10px;
  font-size: 11.5px;
  border-radius: 6px;
}

/* Records Grid */
.cit-results-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.cit-results-head h3 {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
}

.cit-chip-status {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 99px;
}

.cit-records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.cit-parcel-card {
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.18s;
}

.cit-parcel-card:hover {
  border-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.08);
}

.cit-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.cit-survey-tag {
  display: flex;
  flex-direction: column;
}

.survey-lbl {
  font-size: 10px;
  font-weight: 800;
  color: #6b7280;
  letter-spacing: 0.06em;
}

.survey-num {
  font-size: 20px;
  font-weight: 800;
  color: #0c2317;
  font-family: 'IBM Plex Mono', monospace;
}

.cit-status-badge {
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
}

.cit-status-badge.verified {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.cit-status-badge.discrepancy {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.cit-card-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
  font-size: 13px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed #f3f4f6;
  padding-bottom: 4px;
}

.detail-lbl {
  color: #6b7280;
  font-weight: 500;
}

.cit-card-actions {
  display: flex;
  gap: 10px;
}

/* Table */
.cit-table-wrap {
  overflow-x: auto;
}

.cit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

.cit-table th {
  text-align: left;
  padding: 12px 14px;
  background: #f8faf9;
  border-bottom: 2px solid #e5e7eb;
  font-size: 11.5px;
  font-weight: 800;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cit-table td {
  padding: 14px;
  border-bottom: 1px solid #f3f4f6;
  color: #1f2937;
}

.cit-mono-badge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  background: #f0fdf4;
  color: #166534;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #bbf7d0;
}

.cit-mono {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
}

.sub-text {
  font-size: 11.5px;
  color: #6b7280;
  margin-top: 2px;
}

.cit-pill-muted {
  font-size: 11.5px;
  background: #f3f4f6;
  color: #4b5563;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.cit-text-success {
  color: #059669;
  font-weight: 700;
}

.cit-flex-gap {
  display: flex;
  gap: 6px;
}

/* Documents Grid */
.cit-doc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 18px;
}

.cit-doc-card {
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
}

.doc-card-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.doc-card-info {
  flex: 1;
}

.doc-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-title {
  font-size: 14.5px;
  font-weight: 800;
  color: #111827;
}

.cit-badge-seal {
  font-size: 10px;
  font-weight: 800;
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.doc-sub {
  font-size: 12.5px;
  color: #4b5563;
  margin-top: 2px;
}

.doc-meta {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.doc-card-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Requests View */
.cit-requests-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cit-request-item {
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  padding: 22px;
}

.req-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.req-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.req-id {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
}

.cit-pill-survey {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  background: #dcfce7;
  color: #166534;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
}

.req-date {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.cit-status-pill {
  font-size: 12px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 99px;
}

.cit-status-pill.success {
  background: #dcfce7;
  color: #15803d;
}

.cit-status-pill.pending {
  background: #fef3c7;
  color: #b45309;
}

/* Stepper */
.cit-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin: 24px 0 18px;
  padding: 0 20px;
}

.step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 2px solid #d1d5db;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 12.5px;
  margin-bottom: 6px;
}

.step-node.active .step-circle {
  background: #059669;
  border-color: #059669;
  color: #ffffff;
}

.step-node.current .step-circle {
  box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.2);
}

.step-label {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
}

.step-node.active .step-label {
  color: #111827;
}

.step-line {
  position: absolute;
  top: 16px;
  left: 50%;
  width: calc(100vw / 5.5);
  max-width: 220px;
  height: 3px;
  background: #e5e7eb;
  z-index: -1;
}

.step-line.filled {
  background: #059669;
}

.req-note {
  background: #f8faf9;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  border-left: 3px solid #059669;
}

/* Timeline */
.cit-timeline {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.timeline-entry {
  display: flex;
  gap: 20px;
  position: relative;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #059669;
  border: 3px solid #d1fae5;
  flex: none;
}

.marker-line {
  width: 2px;
  flex: 1;
  background: #d1fae5;
  margin: 4px 0;
  min-height: 40px;
}

.timeline-content {
  padding-bottom: 24px;
}

.timeline-year {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12.5px;
  font-weight: 800;
  color: #059669;
}

.timeline-title {
  font-size: 14.5px;
  font-weight: 800;
  color: #111827;
  display: block;
  margin: 2px 0 4px;
}

.timeline-meta {
  font-size: 12.5px;
  color: #6b7280;
}

/* =========================================================================
   FOOTER (Matching exact design)
   ========================================================================= */
.cit-footer {
  height: 52px;
  padding: 0 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
  font-weight: 500;
  color: #374151;
  background: transparent;
  flex: none;
  z-index: 20;
}

.cit-footer-left {
  color: #4b6354;
}

.cit-footer-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cit-footer-link {
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: #4b6354;
  cursor: pointer;
  padding: 2px 4px;
  transition: color 0.15s;
}

.cit-footer-link:hover {
  color: #059669;
}

.cit-footer-sep {
  color: #9ca3af;
  opacity: 0.6;
}

/* =========================================================================
   MODAL OVERLAYS & DIALOGS
   ========================================================================= */
.cit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 24, 13, 0.75);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000 !important;
  padding: 20px;
  animation: citFadeIn 0.18s ease;
}

.cit-modal-dialog {
  background: #ffffff;
  border-radius: 18px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.cit-modal-dialog.modal-lg {
  max-width: 860px;
}

.cit-modal-dialog.modal-md {
  max-width: 620px;
}

.cit-modal-dialog.modal-sm {
  max-width: 440px;
}

.cit-modal-header {
  padding: 22px 26px 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f3f4f6;
  background: #f8faf9;
  border-top-left-radius: 17px;
  border-top-right-radius: 17px;
}

.cit-modal-title {
  font-size: 18px;
  font-weight: 800;
  color: #0c2317;
  margin: 0;
}

.cit-modal-subtitle {
  font-size: 13px;
  color: #4b6354;
  margin: 4px 0 0;
}

.cit-modal-close {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.cit-modal-close:hover {
  background: #fee2e2;
  color: #dc2626;
}

.cit-modal-body {
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cit-modal-footer {
  padding: 16px 26px;
  border-top: 1px solid #f3f4f6;
  background: #f8faf9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-bottom-left-radius: 17px;
  border-bottom-right-radius: 17px;
}

/* Parcel Modal Grid */
.cit-parcel-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 22px;
}

.cit-parcel-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-kv-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13.5px;
}

.kv-label {
  color: #6b7280;
  font-weight: 500;
}

.cit-alert-warning {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12.5px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.cit-modal-action-row {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

/* GIS Cadastral Box */
.cit-gis-viewer {
  background: #082015;
  border-radius: 12px;
  padding: 18px;
  color: #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1.5px solid #166534;
}

.gis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.cit-tag-live {
  background: #059669;
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 4px;
  text-transform: uppercase;
}

.gis-grid-cells {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.gis-cell {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: #9ca3af;
}

.gis-cell.active-parcel {
  background: linear-gradient(135deg, #059669, #047857);
  border: 1.5px solid #34d399;
  color: #ffffff;
  box-shadow: 0 0 16px rgba(52, 211, 153, 0.4);
}

.center-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cell-num {
  font-weight: 800;
  font-size: 12.5px;
}

.cell-tag {
  font-size: 9px;
  text-transform: uppercase;
  opacity: 0.85;
}

.neighbor-num {
  opacity: 0.6;
}

.gis-footer {
  font-size: 11px;
  color: #6ee7b7;
  font-family: 'IBM Plex Mono', monospace;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
}

/* Certificate Preview */
.cit-cert-preview {
  border: 2px solid #059669;
  border-radius: 12px;
  padding: 24px;
  background: #fdfefe;
  position: relative;
  overflow: hidden;
}

.cert-watermark {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 32px;
  font-weight: 900;
  color: rgba(5, 150, 105, 0.06);
  pointer-events: none;
  white-space: nowrap;
}

.cert-top {
  text-align: center;
}

.emblem-seal {
  font-size: 28px;
  margin-bottom: 4px;
}

.dept-name {
  font-size: 11.5px;
  color: #059669;
  font-weight: 800;
  letter-spacing: 0.06em;
  margin-top: 2px;
}

.cert-divider {
  height: 1.5px;
  background: #d1fae5;
  margin: 16px 0;
}

.cert-body {
  font-size: 13.5px;
  line-height: 1.6;
  color: #1f2937;
}

.cert-info-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 12px;
  margin-top: 14px;
  font-size: 12.5px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Animations */
@keyframes citFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive queries */
@media (max-width: 1024px) {
  .cit-brand-pillar { display: none; }
  .cit-hero-title { font-size: 38px; }
  .cit-action-nodes { gap: 20px; }
  .cit-node-bubble { width: 72px; height: 72px; }
  .cit-focal-halo { width: 110px; height: 110px; }
  .cit-focal-core { width: 90px; height: 90px; }
  .cit-filter-grid { grid-template-columns: 1fr 1fr; }
  .cit-parcel-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .cit-header { padding: 0 20px; }
  .cit-nav { display: none; }
  .cit-top-search { display: none; }
  .cit-hero-stage { padding: 20px 16px 40px; }
  .cit-hero-title { font-size: 30px; }
  .cit-hero-search-capsule { width: 100%; height: 50px; }
  .cit-action-nodes { flex-wrap: wrap; gap: 16px; }
  .cit-footer { padding: 0 20px; flex-direction: column; gap: 8px; height: auto; padding-bottom: 16px; }
  .cit-panel-view { padding: 10px 16px 30px; }
  .cit-view-card { padding: 20px; }
}
`;
