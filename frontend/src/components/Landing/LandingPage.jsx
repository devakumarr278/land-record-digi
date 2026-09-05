import React, { useState, useEffect, useRef } from 'react';
import AuthModal from '../Auth/AuthModal';
import LandMap from '../LandMap/LandMap';
import bgImage from '../../assets/bgimage.png';
import logoImg from '../../assets/logo.jpg';
import './Landing.css';

// Cadastral Parcels Data precisely assigned to each white-bordered land plot in bgimage.png
const CADASTRAL_PARCELS = [
  // ── Central Primary & Homestead Plots ──
  {
    id: '103/1',
    surveyNo: '103/1',
    owner: 'Ramasamy Gounder',
    area: '2.50 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 0,
    confidence: '98%',
    coords: '11.0168° N, 76.9558° E',
    polyPath: 'M 305 168 L 475 95 L 545 182 L 375 255 Z',
    labelX: 425,
    labelY: 175,
    soilType: 'Fertile Alluvial Loam',
    landType: 'Wet Agricultural (Nanja - நன்செய்)'
  },
  {
    id: '103/2',
    surveyNo: '103/2',
    owner: 'Arumugam & Sons',
    area: '1.75 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 2,
    confidence: '95%',
    coords: '11.0152° N, 76.9565° E',
    polyPath: 'M 375 255 L 545 182 L 600 248 L 430 322 Z',
    labelX: 488,
    labelY: 252,
    soilType: 'Red Sandy Loam',
    landType: 'Homestead & Garden (Natham - நத்தம்)'
  },

  // ── Left Agricultural Fields ──
  {
    id: '101/1',
    surveyNo: '101/1',
    owner: 'K. Ramanathan',
    area: '3.20 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 0,
    confidence: '96%',
    coords: '11.0192° N, 76.9515° E',
    polyPath: 'M 45 60 L 175 10 L 235 85 L 105 135 Z',
    labelX: 140,
    labelY: 72,
    soilType: 'Alluvial Clay Loam',
    landType: 'Wet Land (Nanja - நன்செய்)'
  },
  {
    id: '101/2',
    surveyNo: '101/2',
    owner: 'S. Muthusamy',
    area: '2.80 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 0,
    confidence: '94%',
    coords: '11.0198° N, 76.9540° E',
    polyPath: 'M 175 10 L 320 0 L 385 70 L 235 85 Z',
    labelX: 278,
    labelY: 42,
    soilType: 'Clay Loam',
    landType: 'Wet Land (Nanja - நன்செய்)'
  },
  {
    id: '102/1',
    surveyNo: '102/1',
    owner: 'Subramaniam Chettiar',
    area: '2.60 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 4,
    confidence: '94%',
    coords: '11.0175° N, 76.9530° E',
    polyPath: 'M 105 135 L 235 85 L 305 168 L 170 218 Z',
    labelX: 204,
    labelY: 151,
    soilType: 'Clay Loam',
    landType: 'Wet Land (Nanja - நன்செய்)'
  },
  {
    id: '102/2',
    surveyNo: '102/2',
    owner: 'A. Periyasamy',
    area: '1.95 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 0,
    confidence: '93%',
    coords: '11.0165° N, 76.9510° E',
    polyPath: 'M 0 175 L 105 135 L 170 218 L 65 260 Z',
    labelX: 85,
    labelY: 196,
    soilType: 'Alluvial Loam',
    landType: 'Wet Land (Nanja - நன்செய்)'
  },
  {
    id: '104/1',
    surveyNo: '104/1',
    owner: 'K. S. Narayanan',
    area: '1.85 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 0,
    confidence: '97%',
    coords: '11.0195° N, 76.9565° E',
    polyPath: 'M 385 70 L 525 15 L 595 88 L 475 95 Z',
    labelX: 495,
    labelY: 68,
    soilType: 'River Silt & Loam',
    landType: 'Wet Land (Nanja - நன்செய்)'
  },
  {
    id: '104/2',
    surveyNo: '104/2',
    owner: 'M. Sengottaiyan',
    area: '1.60 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 0,
    confidence: '95%',
    coords: '11.0205° N, 76.9590° E',
    polyPath: 'M 525 15 L 650 0 L 705 60 L 595 88 Z',
    labelX: 618,
    labelY: 40,
    soilType: 'River Silt',
    landType: 'Wet Land (Nanja - நன்செய்)'
  },
  {
    id: '105/1',
    surveyNo: '105/1',
    owner: 'V. Meenakshi Ammal',
    area: '2.40 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 0,
    confidence: '92%',
    coords: '11.0155° N, 76.9535° E',
    polyPath: 'M 170 218 L 305 168 L 375 255 L 240 305 Z',
    labelX: 272,
    labelY: 236,
    soilType: 'Black Cotton Soil',
    landType: 'Wet Land (Nanja - நன்செய்)'
  },
  {
    id: '105/2',
    surveyNo: '105/2',
    owner: 'Marimuthu Thevar',
    area: '3.50 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 0,
    confidence: '97%',
    coords: '11.0140° N, 76.9520° E',
    polyPath: 'M 65 260 L 240 305 L 310 395 L 135 450 Z',
    labelX: 188,
    labelY: 352,
    soilType: 'Rich Alluvial Soil',
    landType: 'Wet Land (Nanja - நன்செய்)'
  },

  // ── Right-Bank Agricultural Plots (Across River) ──
  {
    id: '106/1',
    surveyNo: '106/1',
    owner: 'C. Kandasamy',
    area: '2.10 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 0,
    confidence: '95%',
    coords: '11.0195° N, 76.9640° E',
    polyPath: 'M 705 60 L 830 10 L 880 75 L 755 125 Z',
    labelX: 792,
    labelY: 68,
    soilType: 'Clayey Loam',
    landType: 'Wet Land (Nanja - நன்செய்)'
  },
  {
    id: '106/2',
    surveyNo: '106/2',
    owner: 'Palaniswami & Brothers',
    area: '3.10 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 1,
    confidence: '93%',
    coords: '11.0175° N, 76.9630° E',
    polyPath: 'M 660 165 L 765 118 L 825 192 L 720 240 Z',
    labelX: 742,
    labelY: 178,
    soilType: 'Black Cotton Soil',
    landType: 'Wet Land (Nanja - நன்செய்)'
  },
  {
    id: '107/1',
    surveyNo: '107/1',
    owner: 'Velusamy Murugan',
    area: '2.15 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 0,
    confidence: '94%',
    coords: '11.0180° N, 76.9660° E',
    polyPath: 'M 765 118 L 880 70 L 940 142 L 825 192 Z',
    labelX: 852,
    labelY: 130,
    soilType: 'Red Loam',
    landType: 'Dry Land (Punja - புன்செய்)'
  },
  {
    id: '107/2',
    surveyNo: '107/2',
    owner: 'Thangavelu Gounder',
    area: '1.90 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 0,
    confidence: '95%',
    coords: '11.0155° N, 76.9640° E',
    polyPath: 'M 720 240 L 825 192 L 885 268 L 780 318 Z',
    labelX: 802,
    labelY: 254,
    soilType: 'Clayey Loam',
    landType: 'Wet Land (Nanja - நன்செய்)'
  },
  {
    id: '108/1',
    surveyNo: '108/1',
    owner: 'R. Shanmugam',
    area: '2.75 Acres',
    village: 'Alangudi',
    district: 'Coimbatore',
    mutationStatus: 'Validated',
    encumbrances: 0,
    confidence: '96%',
    coords: '11.0135° N, 76.9625° E',
    polyPath: 'M 670 345 L 820 280 L 880 358 L 730 425 Z',
    labelX: 775,
    labelY: 352,
    soilType: 'Rich Alluvial Soil',
    landType: 'Wet Land (Nanja - நன்செய்)'
  }
];

const LANGUAGES = [
  { code: 'EN', name: 'English' },
  { code: 'HI', name: 'हिन्दी (Hindi)' },
  { code: 'TA', name: 'தமிழ் (Tamil)' },
  { code: 'TE', name: 'తెలుగు (Telugu)' },
  { code: 'KN', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'MR', name: 'मराठी (Marathi)' },
  { code: 'BN', name: 'বাংলা (Bengali)' },
  { code: 'GU', name: 'ગુજરાતી (Gujarati)' }
];

export default function LandingPage({ onLogin }) {
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null
  const [authRole, setAuthRole] = useState('citizen');
  const [selectedParcel, setSelectedParcel] = useState(CADASTRAL_PARCELS[0]);
  const [hoveredParcelId, setHoveredParcelId] = useState(null);
  const [activeNav, setActiveNav] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  
  // UI Dropdowns & Modals
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGisLayer, setActiveGisLayer] = useState('all'); // 'all' | 'satellite' | 'cadastral'

  // Scroll listener for sticky navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll-triggered reveal animations
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToId = (id) => {
    setActiveNav(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenLogin = () => setAuthModal('login');
  
  const handleOpenRegister = (role = 'citizen') => {
    setAuthRole(role);
    setAuthModal('register');
  };

  // State Emblem of India / Ashoka Lion Capital SVG matching designref.png
  const StateEmblemIcon = () => (
    <svg width="42" height="48" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8 C43 8, 36 12, 36 21 C36 27, 40 33, 44 39 L41 39 C34 31, 26 27, 22 35 C19 41, 22 49, 28 53 L28 59 C24 60, 18 63, 18 69 L82 69 C82 63, 76 60, 72 59 L72 53 C78 49, 81 41, 78 35 C74 27, 66 31, 59 39 L56 39 C60 33, 64 27, 64 21 C64 12, 57 8, 50 8 Z" fill="#ffffff" opacity="0.95" />
      <circle cx="50" cy="18" r="3.5" fill="#061810" />
      <path d="M47 26 Q50 30 53 26" stroke="#061810" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="50" cy="76" r="7.5" stroke="#ffffff" strokeWidth="2.2" />
      <circle cx="50" cy="76" r="2.2" fill="#ffffff" />
      <path d="M50 68.5 L50 83.5 M42.5 76 L57.5 76 M44.5 70.5 L55.5 81.5 M44.5 81.5 L55.5 70.5" stroke="#ffffff" strokeWidth="1.1" />
      <circle cx="28" cy="76" r="3" fill="#ffffff" opacity="0.8" />
      <circle cx="72" cy="76" r="3" fill="#ffffff" opacity="0.8" />
      <path d="M14 84 L86 84 L88 91 L12 91 Z" fill="#ffffff" opacity="0.9" />
      <rect x="20" y="86" width="60" height="1.8" fill="#061810" opacity="0.6" />
      <text x="50" y="104" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontFamily="'Inter', sans-serif" fontWeight="700" letterSpacing="0.08em" opacity="0.9">
        सत्यमेव जयते
      </text>
    </svg>
  );

  // Active or hovered parcel for Card display
  const currentDisplayedParcel = hoveredParcelId 
    ? (CADASTRAL_PARCELS.find(p => p.id === hoveredParcelId) || selectedParcel)
    : selectedParcel;

  // Filtered search results for Search Modal
  const filteredParcels = CADASTRAL_PARCELS.filter(p => 
    p.surveyNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="landing-theme">
      {/* ── Top Fixed Navigation Bar ── */}
      <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="wrap">
          {/* Brand & Emblem */}
          <div className="brand-container anim-fade-in" onClick={() => scrollToId('home')}>
            <div className="emblem-seal">
              <img src={logoImg} alt="NilOra" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            </div>
            <div className="brand-titles">
              <span className="brand-main-title">NilOra</span>
              <span className="brand-sub-title">Intelligent Cadastral Land Digitization &amp; Verification</span>
              <span className="brand-badge">Govt. of India &nbsp;|&nbsp; MoRD</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav-menu anim-fade-in">
            <a 
              href="#home" 
              className={`nav-item ${activeNav === 'home' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollToId('home'); }}
            >
              Home
            </a>
            <a 
              href="#platform" 
              className={`nav-item ${activeNav === 'platform' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollToId('platform'); }}
            >
              Platform
            </a>
            <a 
              href="#gis" 
              className={`nav-item ${activeNav === 'gis' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollToId('gis'); }}
            >
              GIS
            </a>
            <a 
              href="#validation" 
              className={`nav-item ${activeNav === 'validation' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollToId('validation'); }}
            >
              Validation
            </a>
            <a 
              href="#use-cases" 
              className={`nav-item ${activeNav === 'use-cases' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollToId('use-cases'); }}
            >
              Use Cases
            </a>
            <a 
              href="#about" 
              className={`nav-item ${activeNav === 'about' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollToId('about'); }}
            >
              About
            </a>
          </nav>

          {/* Nav Actions */}
          <div className="nav-actions-group anim-fade-in">
            {/* Search Icon Button */}
            <button 
              className="icon-btn" 
              title="Search Land Records"
              onClick={() => setShowSearchModal(true)}
              aria-label="Search"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* Language Selector Dropdown */}
            <div className="lang-dropdown-wrapper">
              <button 
                className="lang-selector-btn"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-label="Select Language"
              >
                <span>{currentLang}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {langMenuOpen && (
                <div className="lang-menu-dropdown">
                  {LANGUAGES.map(lang => (
                    <button 
                      key={lang.code}
                      className={`lang-menu-item ${currentLang === lang.code ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentLang(lang.code);
                        setLangMenuOpen(false);
                      }}
                    >
                      <span>{lang.name}</span>
                      {currentLang === lang.code && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login Button */}
            <button 
              className="btn-login-ghost"
              onClick={handleOpenLogin}
            >
              Login
            </button>

            {/* Get Started Button */}
            <button 
              className="btn-primary-teal"
              onClick={() => handleOpenRegister('citizen')}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Drone Farmland Landscape) ── */}
      <section className="hero-section" id="home">
        {/* Background photo layer */}
        <div className="hero-backdrop-layer" style={{ backgroundImage: `url(${bgImage})` }}></div>
        {/* Lite left-to-right fade overlay */}
        <div className="hero-gradient-overlay"></div>

        {/* Clean Interactive SVG Cadastral Grid Layer with On-Hover Area Highlights */}
        <svg 
          className="hero-cadastral-svg" 
          viewBox="0 0 1000 500" 
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Render Cadastral Parcel Hover Zones & Survey Badges */}
          {CADASTRAL_PARCELS.map((parcel) => {
            const isHovered = hoveredParcelId === parcel.id;
            const isSelected = selectedParcel.id === parcel.id;
            const isPrimary = parcel.id === '103/1';
            const isActive = isHovered || isSelected;

            return (
              <g 
                key={parcel.id} 
                onClick={() => setSelectedParcel(parcel)}
                onMouseEnter={() => setHoveredParcelId(parcel.id)}
                onMouseLeave={() => setHoveredParcelId(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Cadastral Land Boundary (invisible by default, clean highlight on hover matching image white borders) */}
                <path 
                  d={parcel.polyPath}
                  className={`cadastral-poly ${isActive ? 'active-poly' : ''} ${isPrimary && !hoveredParcelId ? 'primary-subtle' : ''}`}
                />

                {/* Assigned Survey Number Badge (clean, visible on each white-bordered plot) */}
                <g 
                  transform={`translate(${parcel.labelX}, ${parcel.labelY})`}
                  className={`cadastral-badge-group ${isActive ? 'active' : ''}`}
                >
                  <rect
                    x="-26"
                    y="-9"
                    width="52"
                    height="18"
                    rx="4"
                    className="cadastral-badge-bg"
                  />
                  <text 
                    x="0" 
                    y="3.5" 
                    className="cadastral-label"
                  >
                    Sy. {parcel.surveyNo}
                  </text>
                </g>

                {/* Dynamic On-Hover Floating Area & Extent Tooltip Callout */}
                {isHovered && (
                  <g transform={`translate(${parcel.labelX}, ${parcel.labelY - 36})`} className="cadastral-hover-tooltip">
                    <rect
                      x="-82"
                      y="-28"
                      width="164"
                      height="54"
                      rx="7"
                      fill="rgba(6, 23, 16, 0.96)"
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="1"
                    />
                    {/* Top row: Survey No & Mutation Status */}
                    <text x="-70" y="-11" fill="#ffffff" fontSize="10.5" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
                      Sy. {parcel.surveyNo}
                    </text>
                    <text x="70" y="-11" textAnchor="end" fill="#6ee7b7" fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono, monospace">
                      ✓ {parcel.mutationStatus}
                    </text>

                    {/* Middle row: Extracted Land Area */}
                    <text x="-70" y="6" fill="#ffffff" fontSize="12" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
                      Area: <tspan fill="#a7f3d0" fontFamily="JetBrains Mono, monospace">{parcel.area}</tspan>
                    </text>

                    {/* Bottom row: Primary Owner */}
                    <text x="-70" y="19" fill="#94a3b8" fontSize="8.5" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
                      {parcel.owner} · {parcel.landType.split('(')[0].trim()}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hero Top Content Grid */}
        <div className="wrap" style={{ width: '100%' }}>
          <div className="hero-main-content">
            {/* Left Hero Column with Staggered Entrance Animations & Dark Fade */}
            <div className="hero-left">
              <span className="hero-eyebrow anim-hero-eyebrow">DIGITAL LAND RECORD INTELLIGENCE</span>
              <h1 className="hero-title anim-hero-title">
                Transform Paper Deeds<br />
                <span className="hero-title-highlight">into Verifiable</span><br />
                Digital Records.
              </h1>
              <p className="hero-tagline anim-hero-tagline">
                Digitize. Validate. Understand.
              </p>
              <div className="hero-cta-row anim-hero-ctas">
                <button 
                  className="btn-hero-explore"
                  onClick={() => scrollToId('platform')}
                >
                  <span>Explore Platform</span>
                  <span className="arrow-right-icon">→</span>
                </button>
                <button 
                  className="btn-hero-demo"
                  onClick={() => setShowDemoModal(true)}
                >
                  <span className="play-circle-icon">▶</span>
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>

            {/* Right Floating "Parcel Intelligence" Glass Card with Slide-in Animation */}
            <div className="hero-right">
              <div className="parcel-intel-card anim-hero-card">
                <div className="card-header-row">
                  <span className="card-title">Parcel Intelligence</span>
                  <span className="verified-badge-pill">
                    <span className="dot-badge">●</span>
                    <span>{currentDisplayedParcel.mutationStatus}</span>
                  </span>
                </div>

                <div className="card-data-table">
                  <div className="card-data-row">
                    <span className="data-label">Survey Number</span>
                    <span className="data-value accent-survey">{currentDisplayedParcel.surveyNo}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="data-label">Owner</span>
                    <span className="data-value">{currentDisplayedParcel.owner}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="data-label">Area</span>
                    <span className="data-value">{currentDisplayedParcel.area}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="data-label">Village</span>
                    <span className="data-value">{currentDisplayedParcel.village}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="data-label">District</span>
                    <span className="data-value">{currentDisplayedParcel.district}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="data-label">Mutation Status</span>
                    <span className="data-value status-validated">{currentDisplayedParcel.mutationStatus}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="data-label">Encumbrances</span>
                    <span className="data-value">{currentDisplayedParcel.encumbrances}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="data-label">Confidence</span>
                    <span className="data-value confidence-score">{currentDisplayedParcel.confidence}</span>
                  </div>
                </div>

                <button 
                  className="btn-view-map"
                  onClick={() => scrollToId('gis')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                    <line x1="8" y1="2" x2="8" y2="18"></line>
                    <line x1="16" y1="6" x2="16" y2="22"></line>
                  </svg>
                  <span>View on Map</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Watermark Quote at Bottom Right matching designref.png */}
        <div className="hero-watermark-tag anim-hero-watermark">
          <div className="hero-watermark-words">
            “LAND<br />
            PEOPLE<br />
            PROGRESS<br />
            A STRONGER TOMORROW”
          </div>
        </div>

        {/* Bottom Hero Stats Metrics Bar */}
        <div className="wrap" style={{ width: '100%' }}>
          <div className="hero-stats-bar anim-hero-stats">
            <div className="stats-grid">
              <div className="stat-card-item">
                <span className="stat-number">22+</span>
                <span className="stat-label">Indian Languages</span>
              </div>
              <div className="stat-divider-line"></div>
              <div className="stat-card-item">
                <span className="stat-number">100M+</span>
                <span className="stat-label">Legacy Records</span>
              </div>
              <div className="stat-divider-line"></div>
              <div className="stat-card-item">
                <span className="stat-number">GIS</span>
                <span className="stat-label">Integrated</span>
              </div>
              <div className="stat-divider-line"></div>
              <div className="stat-card-item">
                <span className="stat-number">Human</span>
                <span className="stat-label">Verified</span>
              </div>
              <div className="stat-divider-line"></div>
              <div className="stat-card-item">
                <span className="stat-number">Trusted</span>
                <span className="stat-label">&amp; Scalable</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Platform Architecture & Pipeline (Scroll Reveal) ── */}
      <section className="content-section section-alt-bg" id="platform">
        <div className="wrap">
          <div className="section-header-block reveal-on-scroll">
            <span className="section-eyebrow">DIGITAL TRANSFORMATION PIPELINE</span>
            <h2 className="section-main-title">From fragile paper archives to immutable spatial truth</h2>
            <p className="section-description">
              Our automated 3-stage intelligence engine handles damaged colonial maps, multilingual title deeds, and cadastral spatial discrepancies with cryptographic audit logs.
            </p>
          </div>

          <div className="pipeline-steps-grid">
            {/* Step 1 */}
            <div className="pipeline-card reveal-on-scroll stagger-1">
              <span className="pipeline-step-badge">STEP 01</span>
              <div className="pipeline-icon-box">📄</div>
              <h3>Multilingual OCR Ingestion</h3>
              <p>
                Proprietary Indic OCR parses complex handwritten scripts, Urdu revenue terms, Modi script, Tamil palm-leaf registers, and English deeds.
              </p>
              <div className="pipeline-feature-tags">
                <span className="tag-pill">22 Indic Languages</span>
                <span className="tag-pill">Field Extraction</span>
                <span className="tag-pill">Pre-processing Filters</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="pipeline-card reveal-on-scroll stagger-2">
              <span className="pipeline-step-badge">STEP 02</span>
              <div className="pipeline-icon-box">🛰️</div>
              <h3>AI Cadastral Alignment</h3>
              <p>
                Computer vision matches legacy village survey maps (FMB sketches) to satellite drone orthomosaics with automated boundary snapping and discrepancy alerts.
              </p>
              <div className="pipeline-feature-tags">
                <span className="tag-pill">Geo-referencing</span>
                <span className="tag-pill">Subdivision Splitting</span>
                <span className="tag-pill">Overlap Detection</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="pipeline-card reveal-on-scroll stagger-3">
              <span className="pipeline-step-badge">STEP 03</span>
              <div className="pipeline-icon-box">🔐</div>
              <h3>Immutable Cryptographic Ledger</h3>
              <p>
                Every officer verification, boundary alteration, and citizen inquiry is hash-chained with SHA-256 for complete tamper-evident auditability.
              </p>
              <div className="pipeline-feature-tags">
                <span className="tag-pill">SHA-256 Chain</span>
                <span className="tag-pill">Digital Signatures</span>
                <span className="tag-pill">Role-Based Signoff</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Interactive GIS Map Viewer (Scroll Reveal) ── */}
      <section className="content-section" id="gis">
        <div className="wrap">
          <div className="section-header-block reveal-on-scroll">
            <span className="section-eyebrow">GEOSPATIAL INTELLIGENCE</span>
            <h2 className="section-main-title">Interactive Cadastral GIS &amp; Boundary Analysis</h2>
            <p className="section-description">
              Explore georeferenced land boundaries, inspect subdivided survey plots, and verify title legitimacy in real-time.
            </p>
          </div>

          <div className="reveal-on-scroll stagger-1">
            <LandMap onRequestExtract={() => handleOpenRegister('citizen')} />
          </div>
        </div>
      </section>

      {/* ── Section: Validation & AI Extraction (Scroll Reveal) ── */}
      <section className="content-section section-alt-bg" id="validation">
        <div className="wrap">
          <div className="section-header-block reveal-on-scroll">
            <span className="section-eyebrow">AUTOMATED CROSS-VALIDATION</span>
            <h2 className="section-main-title">Multi-Registry Verification &amp; Discrepancy Detection</h2>
            <p className="section-description">
              Our validation engine compares scanned physical settlement deeds against digital revenue records, checking boundaries, encumbrances, and ownership consistency.
            </p>
          </div>

          <div className="validation-split-grid">
            {/* Panel 1: OCR Extraction from Physical Deed */}
            <div className="validation-doc-panel reveal-on-scroll stagger-1">
              <h4>
                <span>📜</span>
                <span>Archived Deed Document (OCR Parsed)</span>
              </h4>
              <div className="deed-preview-box">
                <p>
                  <strong>REGISTRATION DISTRICT:</strong> <span className="ocr-highlight">Coimbatore</span><br />
                  <strong>TALUK / VILLAGE:</strong> <span className="ocr-highlight">Alangudi</span><br />
                  <strong>SURVEY NUMBER:</strong> <span className="ocr-highlight">143/2A</span><br />
                  <strong>PATTA HOLDER:</strong> <span className="ocr-highlight">Ramasamy Gounder</span><br />
                  <strong>EXTENT OF LAND:</strong> <span className="ocr-highlight">2.50 Acres (1.012 Hectares)</span><br />
                  <strong>BOUNDARIES:</strong> North by Survey 144/1, South by 145/3B, East by 142/2B, West by Main Canal.
                </p>
              </div>
              <div className="confidence-meter-row">
                <span className="data-label">OCR Character Accuracy</span>
                <div className="confidence-bar-track">
                  <div className="confidence-bar-fill" style={{ width: '96%' }}></div>
                </div>
                <span className="data-value confidence-score">96.4%</span>
              </div>
            </div>

            {/* Panel 2: Verified Cadastral GIS Record */}
            <div className="validation-doc-panel reveal-on-scroll stagger-2">
              <h4>
                <span>🛡️</span>
                <span>GIS Cadastral Match &amp; Audit Trail</span>
              </h4>
              <div className="deed-preview-box">
                <p>
                  <strong>SPATIAL POLYGON STATUS:</strong> <span className="ocr-highlight">Zero Boundary Overlaps</span><br />
                  <strong>ENCUMBRANCE CHECK:</strong> Clean (12 Historical Verification Records)<br />
                  <strong>HASH CHAIN INTEGRITY:</strong> Valid (Block #89421-B)<br />
                  <strong>VERIFYING AUTHORITY:</strong> Tahsildar Office, Zone 4<br />
                  <strong>LAST AUDIT TIMESTAMP:</strong> 2026-03-02 14:22:05 UTC<br />
                  <strong>MATCH CONFIDENCE:</strong> <span className="ocr-highlight">92% High Confidence</span>
                </p>
              </div>
              <div className="confidence-meter-row">
                <span className="data-label">Spatial Georeference Match</span>
                <div className="confidence-bar-track">
                  <div className="confidence-bar-fill" style={{ width: '92%' }}></div>
                </div>
                <span className="data-value confidence-score">92.0%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Use Cases & Role Ecosystem (Scroll Reveal) ── */}
      <section className="content-section" id="use-cases">
        <div className="wrap">
          <div className="section-header-block reveal-on-scroll">
            <span className="section-eyebrow">GOVERNMENT &amp; CITIZEN PORTALS</span>
            <h2 className="section-main-title">Role-Based Access for Every Stakeholder</h2>
            <p className="section-description">
              Purpose-built dashboards with granular cryptographic access control for field officers, registrars, state nodal leaders, and citizens.
            </p>
          </div>

          <div className="role-cards-grid">
            {/* Citizen */}
            <div className="role-box-card reveal-on-scroll stagger-1">
              <div>
                <span className="role-badge">PORTAL 01</span>
                <div className="role-icon-emoji">👤</div>
                <h3>Citizen &amp; Landowner</h3>
                <p>
                  Search verified land records, view digitized boundary maps, download certified extract copies, and submit grievance requests.
                </p>
              </div>
              <span className="role-action-link" onClick={() => handleOpenRegister('citizen')}>
                Search &amp; Register →
              </span>
            </div>

            {/* Field Officer */}
            <div className="role-box-card reveal-on-scroll stagger-2">
              <div>
                <span className="role-badge">PORTAL 02</span>
                <div className="role-icon-emoji">🔍</div>
                <h3>Field Verification Officer</h3>
                <p>
                  Upload scanned historic records, review multi-lingual OCR extractions, georeference FMB sketches, and flag boundary disputes.
                </p>
              </div>
              <span className="role-action-link" onClick={() => handleOpenRegister('operator')}>
                Officer Access →
              </span>
            </div>

            {/* Tahsildar / Sub-Registrar */}
            <div className="role-box-card reveal-on-scroll stagger-3">
              <div>
                <span className="role-badge">PORTAL 03</span>
                <div className="role-icon-emoji">⚖️</div>
                <h3>Tahsildar / Sub-Registrar</h3>
                <p>
                  Review legal deeds, verify AI-suggested subdivisions, approve mutation requests, and digitally sign verified land certificates.
                </p>
              </div>
              <span className="role-action-link" onClick={() => handleOpenRegister('registrar')}>
                Tahsildar Portal →
              </span>
            </div>

            {/* District Admin */}
            <div className="role-box-card reveal-on-scroll stagger-4">
              <div>
                <span className="role-badge">PORTAL 04</span>
                <div className="role-icon-emoji">🏛️</div>
                <h3>District Administrator</h3>
                <p>
                  Oversee district-wide digitization velocity, manage officer allocations, analyze disputed parcels, and resolve escalation tickets.
                </p>
              </div>
              <span className="role-action-link" onClick={() => handleOpenRegister('districtadmin')}>
                District Console →
              </span>
            </div>

            {/* State Nodal Officer */}
            <div className="role-box-card reveal-on-scroll stagger-5">
              <div>
                <span className="role-badge">PORTAL 05</span>
                <div className="role-icon-emoji">🏢</div>
                <h3>DILRMP State Nodal Officer</h3>
                <p>
                  Monitor state-level modernization metrics, integrate state cadastral repositories, and manage regional governance configurations.
                </p>
              </div>
              <span className="role-action-link" onClick={() => handleOpenRegister('statenodal')}>
                State Dashboard →
              </span>
            </div>

            {/* Auditor & Compliance */}
            <div className="role-box-card reveal-on-scroll stagger-6">
              <div>
                <span className="role-badge">PORTAL 06</span>
                <div className="role-icon-emoji">🧾</div>
                <h3>Auditor &amp; Compliance</h3>
                <p>
                  Inspect SHA-256 cryptographic logs, verify deed mutation chain-of-custody, and generate compliance reports for regulatory scrutiny.
                </p>
              </div>
              <span className="role-action-link" onClick={() => handleOpenRegister('auditor')}>
                Audit Registry →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: About & Security (Scroll Reveal) ── */}
      <section className="content-section section-alt-bg" id="about">
        <div className="wrap">
          <div className="about-layout-grid">
            <div className="reveal-on-scroll stagger-1">
              <span className="section-eyebrow">STANDARDS &amp; GOVERNANCE</span>
              <h2 className="section-main-title">Closing the gap between fragile archives &amp; public trust</h2>
              <p className="section-description" style={{ marginBottom: '24px' }}>
                Built strictly in compliance with Digital India Land Records Modernization Programme (DILRMP) and National Spatial Data Infrastructure (NSDI) frameworks to eliminate land disputes.
              </p>

              <div className="security-badge-grid">
                <div className="sec-badge-item">
                  <b>AES-256-GCM</b>
                  <span>Military-grade record encryption at rest &amp; in transit</span>
                </div>
                <div className="sec-badge-item">
                  <b>SHA-256 Linked</b>
                  <span>Cryptographic hash chains for tamper-evident tracking</span>
                </div>
                <div className="sec-badge-item">
                  <b>OGC Compliant</b>
                  <span>Open Geospatial Consortium standard GIS layers</span>
                </div>
                <div className="sec-badge-item">
                  <b>Role-Based RBAC</b>
                  <span>Strict zero-trust administrative governance</span>
                </div>
              </div>
            </div>

            <div className="audit-chain-visual reveal-on-scroll stagger-2">
              <span className="section-eyebrow" style={{ marginBottom: '16px' }}>CRYPTOGRAPHIC AUDIT LOG</span>
              
              <div className="chain-block">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <b className="chain-block-title">Block #89421 · Deed Ingestion</b>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>14:22:05 UTC</span>
                </div>
                <div className="hash-line">SHA-256: 4e9c7a82b3d1f054e...8f912c</div>
              </div>

              <div className="chain-block">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <b className="chain-block-title">Block #89422 · GIS Geo-referencing</b>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>14:24:19 UTC</span>
                </div>
                <div className="hash-line">SHA-256: 7b21a8f93e4d0182c...9a41b2</div>
              </div>

              <div className="chain-block">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <b className="chain-block-title">Block #89423 · Authority Approval</b>
                  <span style={{ fontSize: '11px', color: '#047857', fontWeight: '700' }}>VERIFIED</span>
                </div>
                <div className="hash-line">SHA-256: d83f1092e47b8a109...2c48e7</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer-main">
        <div className="wrap">
          <div className="footer-grid reveal-on-scroll">
            <div>
              <div className="brand-container">
                <div className="emblem-seal" style={{ width: '36px', height: '40px' }}>
                  <StateEmblemIcon />
                </div>
                <div className="brand-titles">
                  <span className="brand-main-title" style={{ fontSize: '13px' }}>Intelligent Land Record</span>
                  <span className="brand-sub-title" style={{ fontSize: '11px' }}>Digitization &amp; Validation System</span>
                  <span className="brand-badge" style={{ fontSize: '9px' }}>Govt. of India | MoRD</span>
                </div>
              </div>
              <p className="footer-tagline">
                An AI-assisted national land record digitization, GIS georeferencing, and public-access registry.
              </p>
            </div>

            <div>
              <h4 className="footer-col-title">Navigation</h4>
              <ul className="footer-nav-list">
                <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToId('home'); }}>Home</a></li>
                <li><a href="#platform" onClick={(e) => { e.preventDefault(); scrollToId('platform'); }}>Platform</a></li>
                <li><a href="#gis" onClick={(e) => { e.preventDefault(); scrollToId('gis'); }}>GIS Viewer</a></li>
                <li><a href="#validation" onClick={(e) => { e.preventDefault(); scrollToId('validation'); }}>Validation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-col-title">Portals</h4>
              <ul className="footer-nav-list">
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleOpenRegister('citizen'); }}>Citizen Portal</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleOpenRegister('operator'); }}>Field Officer</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleOpenRegister('registrar'); }}>Sub-Registrar</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleOpenLogin(); }}>Official Login</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-col-title">Compliance</h4>
              <ul className="footer-nav-list">
                <li><a href="#">DILRMP Guidelines</a></li>
                <li><a href="#">NSDI Spatial Standards</a></li>
                <li><a href="#">Security &amp; Privacy Policy</a></li>
                <li><a href="#">Smart India Hackathon 2026</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            © 2026 Intelligent Land Record Digitization &amp; Validation System · Ministry of Rural Development (MoRD) &amp; Govt. of India.
          </div>
        </div>
      </footer>

      {/* ── Modal: Quick Search ── */}
      {showSearchModal && (
        <div className="modal-backdrop" onClick={() => setShowSearchModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Search Verified Land Records</h3>
              <button className="btn-modal-close" onClick={() => setShowSearchModal(false)}>✕</button>
            </div>
            <div className="modal-content-body">
              <div className="gis-search-box" style={{ width: '100%', marginBottom: '20px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  placeholder="Enter survey number (e.g. 143/2A), owner name, or village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredParcels.length > 0 ? (
                  filteredParcels.map((p) => (
                    <div 
                      key={p.id} 
                      className="sec-badge-item"
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onClick={() => {
                        setSelectedParcel(p);
                        setShowSearchModal(false);
                        scrollToId('home');
                      }}
                    >
                      <div>
                        <b style={{ color: 'var(--accent-teal)' }}>Survey No. {p.surveyNo}</b>
                        <span>{p.owner} · {p.village}, {p.district} ({p.area})</span>
                      </div>
                      <span className="verified-badge-pill">
                        <span className="dot-badge">●</span>
                        <span>{p.mutationStatus}</span>
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No matching land records found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Watch Demo ── */}
      {showDemoModal && (
        <div className="modal-backdrop" onClick={() => setShowDemoModal(false)}>
          <div className="modal-window" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Platform Intelligence Demo Walkthrough</h3>
              <button className="btn-modal-close" onClick={() => setShowDemoModal(false)}>✕</button>
            </div>
            <div className="modal-content-body">
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(45,212,191,0.3)', marginBottom: '16px' }}>
                <img 
                  src={bgImage} 
                  alt="Demo Preview" 
                  style={{ width: '100%', height: '360px', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(5, 19, 14, 0.65)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
                  <div className="pipeline-icon-box" style={{ width: '64px', height: '64px', fontSize: '32px', marginBottom: '12px' }}>
                    ▶
                  </div>
                  <h4 style={{ color: '#ffffff', fontSize: '20px', margin: '0 0 8px 0' }}>Automated AI Land Digitization Pipeline</h4>
                  <p style={{ color: '#cbd5e1', maxWidth: '460px', fontSize: '14px', margin: 0 }}>
                    Watch how scanned settlement deeds are parsed with Indic OCR, matched with drone orthomosaics, and cryptographically committed.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="btn-login-ghost" onClick={() => setShowDemoModal(false)}>Close</button>
                <button className="btn-primary-teal" onClick={() => { setShowDemoModal(false); handleOpenRegister('citizen'); }}>Get Started Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Auth Modal ── */}
      {authModal && (
        <AuthModal
          type={authModal}
          initialRole={authRole}
          onClose={() => setAuthModal(null)}
          onSwitch={(type) => setAuthModal(type)}
          onLogin={onLogin}
        />
      )}
    </div>
  );
}
