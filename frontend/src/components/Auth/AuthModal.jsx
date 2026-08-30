import React, { useState, useEffect } from 'react';
import './AuthModal.css'; // reuse existing styles

// Mapping from government role values to internal role identifiers
const GOV_ROLE_MAP = {
  field_verification_officer: 'operator',
  tehsildar_sub_registrar: 'registrar',
  district_administrator: 'districtadmin',
  dilrmp_state_nodal_officer: 'statenodal',
  auditor: 'auditor',
  admin: 'systemadmin',
};

// UI meta for categories
const CATEGORY_META = {
  citizen: {
    label: 'Citizen',
    blurb: 'Search public records and track requests.',
    icon: (<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6"/><path d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>)
  },
  government: {
    label: 'Government Official',
    blurb: 'Field, verification, revenue and audit roles.',
    icon: (<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4.2v1.6H4V7.2L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M5.5 9.8v8.4M9.2 9.8v8.4M14.8 9.8v8.4M18.5 9.8v8.4" stroke="currentColor" strokeWidth="1.6"/><path d="M4 20.4h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>)
  },
  admin: {
    label: 'System Administrator',
    blurb: 'Platform administration and access control.',
    icon: (<svg viewBox="0 0 24 24" fill="none"><path d="M12 3.5l6.5 2.6v4.4c0 4.4-2.8 7.9-6.5 9-3.7-1.1-6.5-4.6-6.5-9V6.1L12 3.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M9.3 12.2l1.9 1.9 3.5-3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>)
  },
};

// Government role definitions (mirrors the HTML demo)
const GOVERNMENT_ROLES = [
  { value: 'field_verification_officer', label: 'Field & Verification Officer', icon: '🔍', blurb: 'Digitize documents, upload records, review AI extraction' },
  { value: 'tehsildar_sub_registrar', label: 'Tehsildar / Sub-Registrar', icon: '⚖️', blurb: 'Handle legally significant verification and decisions' },
  { value: 'district_administrator', label: 'District Administrator', icon: '🏛️', blurb: 'Manage district workload, cases and analytics' },
  { value: 'dilrmp_state_nodal_officer', label: 'State Nodal Officer', icon: '🏢', blurb: 'State-level monitoring, configuration and integration' },
  { value: 'auditor', label: 'Auditor', icon: '🧾', blurb: 'Audit documents' },
];

// Local storage helpers (from the demo)
const STORAGE_KEYS = { CITIZENS: 'landintel_citizens', GOV_REQUESTS: 'landintel_gov_requests' };
const ADMIN_CREDENTIALS = { employeeId: 'ADMIN001', password: 'Admin@123' };
const GOVERNMENT_CREDENTIALS = {
  operator: { username: 'operator', password: 'Operator@123', role: 'field_verification_officer' },
  registrar: { username: 'registrar', password: 'Registrar@123', role: 'tehsildar_sub_registrar' },
  districtadmin: { username: 'districtadmin', password: 'District@123', role: 'district_administrator' },
  statenodal: { username: 'statenodal', password: 'State@123', role: 'dilrmp_state_nodal_officer' },
  auditor: { username: 'auditor', password: 'Auditor@123', role: 'auditor' },
  systemadmin: { username: 'admin', password: 'Admin@123', role: 'admin' },
};
function readList(key) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : []; } catch (e) { return []; } }
function writeList(key, list) { localStorage.setItem(key, JSON.stringify(list)); }
function generateRequestId() { const y = new Date().getFullYear(); return `GOV-${y}-${Math.floor(10000+Math.random()*89999)}`; }
function roleLabel(v) { const r = GOVERNMENT_ROLES.find(r=>r.value===v); return r ? r.label : v; }
function roleIcon(v) { const r = GOVERNMENT_ROLES.find(r=>r.value===v); return r ? r.icon : '🏛️'; }

// Mock backend functions (same logic as the HTML demo)
function registerCitizen(data) {
  const citizens = readList(STORAGE_KEYS.CITIZENS);
  if (citizens.some(c=>c.email.toLowerCase()===data.email.toLowerCase())) {
    throw new Error('An account with this email already exists. Try logging in instead.');
  }
  const citizen = { id: 'CIT-'+Date.now(), fullName: data.fullName, mobile: data.mobile, email: data.email, password: data.password, createdAt: new Date().toISOString() };
  citizens.push(citizen);
  writeList(STORAGE_KEYS.CITIZENS, citizens);
  return citizen;
}
function loginCitizen(data) {
  const citizens = readList(STORAGE_KEYS.CITIZENS);
  const match = citizens.find(c=>c.email.toLowerCase()===data.email.toLowerCase() && c.password===data.password);
  if (!match) throw new Error('Incorrect email or password.');
  return match;
}
function submitGovernmentAccessRequest(data) {
  const requests = readList(STORAGE_KEYS.GOV_REQUESTS);
  if (requests.some(r=>r.employeeId.toLowerCase()===data.employeeId.toLowerCase())) {
    throw new Error('An access request already exists for this Employee ID.');
  }
  const request = {
    id: generateRequestId(),
    employeeId: data.employeeId,
    officialEmail: data.officialEmail,
    mobile: data.mobile,
    role: data.role,
    roleLabel: roleLabel(data.role),
    password: data.password,
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
  };
  requests.push(request);
  writeList(STORAGE_KEYS.GOV_REQUESTS, requests);
  return request;
}
function loginGovernmentOfficial(data) {
  const username = (data.username || data.employeeId || '').trim().toLowerCase();
  const password = data.password;

  const directMatch = Object.values(GOVERNMENT_CREDENTIALS).find(
    (entry) => entry.username.toLowerCase() === username && entry.password === password
  );

  if (directMatch) {
    return { employeeId: username, username, role: directMatch.role, status: 'ACTIVE', directLogin: true };
  }

  const requests = readList(STORAGE_KEYS.GOV_REQUESTS);
  const match = requests.find(r => r.employeeId.toLowerCase() === username);
  if (!match) throw new Error('Incorrect username or password.');
  if (match.password !== password) throw new Error('Incorrect username or password.');
  if (match.status === 'PENDING') { const e = new Error('Your access request is still pending administrator approval.'); e.code = 'PENDING_APPROVAL'; throw e; }
  if (match.status === 'REJECTED') { const e = new Error('Your access request was rejected. Contact the system administrator.'); e.code = 'REJECTED'; throw e; }
  return match;
}
function loginAdmin(data) {
  if (data.employeeId===ADMIN_CREDENTIALS.employeeId && data.password===ADMIN_CREDENTIALS.password) {
    return { employeeId: data.employeeId, role: 'admin' };
  }
  throw new Error('Incorrect admin ID or password.');
}

export default function AuthModal({ type, initialCategory, onClose, onSwitch, onLogin }) {
  const [step, setStep] = useState(initialCategory ? 'form' : 'category');
  const [category, setCategory] = useState(initialCategory || null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  const [citizenForm, setCitizenForm] = useState({ fullName: '', mobile: '', email: '', password: '', confirmPassword: '' });
  const [govForm, setGovForm] = useState({ employeeId: '', officialEmail: '', mobile: '', role: '', password: '', confirmPassword: '' });
  const [govLoginForm, setGovLoginForm] = useState({ username: '', role: '', password: '' });
  const [adminForm, setAdminForm] = useState({ employeeId: '', password: '' });

  useEffect(() => { setError(''); }, [type]);

  const handleChooseCategory = (cat) => { setCategory(cat); setError(''); if (cat === 'government') setStep('govRole'); else setStep('form'); };
  const handleChooseGovRole = (roleValue) => {
    if (type === 'login') setGovLoginForm(prev => ({ ...prev, role: roleValue }));
    else setGovForm(prev => ({ ...prev, role: roleValue }));
    setError(''); setStep('form');
  };
  const handleBack = () => { setError(''); if (step === 'form' && category === 'government') setStep('govRole'); else setStep('category'); };
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };
  const setField = (setter) => (field) => (e) => setter(prev => ({ ...prev, [field]: e.target.value }));

  // Submission handlers
  const submitCitizenRegister = (e) => { e.preventDefault(); setError(''); if (citizenForm.password !== citizenForm.confirmPassword) { setError('Passwords do not match.'); return; } try { const c = registerCitizen(citizenForm); onLogin('citizen', c.fullName, { email: c.email }); onClose(); } catch (err) { setError(err.message); } };
  const submitCitizenLogin = (e) => { e.preventDefault(); setError(''); try { const c = loginCitizen(citizenForm); onLogin('citizen', c.fullName, { email: c.email }); onClose(); } catch (err) { setError(err.message); } };
  const submitGovRegister = (e) => { e.preventDefault(); setError(''); if (!govForm.role) { setError('Select the role you are requesting access for.'); setStep('govRole'); return; } if (govForm.password !== govForm.confirmPassword) { setError('Passwords do not match.'); return; } try { const r = submitGovernmentAccessRequest(govForm); setSubmittedRequest(r); setStep('pending'); } catch (err) { setError(err.message); } };
  const submitGovLogin = (e) => { e.preventDefault(); setError(''); if (!govLoginForm.role) { setError('Select your government role.'); setStep('govRole'); return; } try { const o = loginGovernmentOfficial(govLoginForm); const internal = GOV_ROLE_MAP[govLoginForm.role] || o.role || govLoginForm.role; onLogin(internal, roleLabel(govLoginForm.role), { employeeId: o.employeeId || govLoginForm.username, govRole: govLoginForm.role, username: govLoginForm.username }); onClose(); } catch (err) { setError(err.message); } };
  const submitAdminLogin = (e) => { e.preventDefault(); setError(''); try { const a = loginAdmin(adminForm); onLogin('systemadmin', 'System Administrator', { employeeId: a.employeeId }); onClose(); } catch (err) { setError(err.message); } };
  const handleBackToLoginFromPending = () => { setGovLoginForm({ username: submittedRequest?.employeeId || '', password: '' }); setSubmittedRequest(null); setStep('form'); onSwitch('login'); };

  const title = step === 'pending' ? 'Request submitted'
    : step === 'category' ? (type === 'login' ? 'Choose how you want to log in' : 'Choose how you want to register')
    : step === 'govRole' ? 'Select your government role'
    : type === 'login' ? `${CATEGORY_META[category].label} login`
    : category === 'citizen' ? 'Create your citizen account' : 'Government official access request';
  const subtitle = step === 'category' ? 'Each portal has its own access rules and dashboard.'
    : step === 'govRole' ? (type === 'login' ? 'Choose the position you are logging in as.' : 'Choose the position you are requesting access for.')
    : (step === 'form' && category === 'government' && type === 'register') ? 'Your details are sent to the System Administrator for verification.'
    : undefined;

  return (
    <div className="am-overlay" onClick={handleBackdrop}>
      <div className="am-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="am-head">
          <div>
            {(step === 'form' || step === 'govRole') && (
              <button type="button" className="am-back" onClick={handleBack}>← {(step === 'govRole' ? 'Change portal' : (category === 'government' ? 'Change role' : 'Change portal'))}</button>
            )}
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="am-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="am-body">
          {/* Category selection */}
          {step === 'category' && (
            <div className="am-category-grid">
              {Object.keys(CATEGORY_META).map(cat => (
                <button key={cat} type="button" className="am-category-card" onClick={() => handleChooseCategory(cat)}>
                  <span className="am-category-icon">{CATEGORY_META[cat].icon}</span>
                  <b>{CATEGORY_META[cat].label}</b>
                  <span className="am-category-blurb">{CATEGORY_META[cat].blurb}</span>
                </button>
              ))}
            </div>
          )}

          {/* Government role picker */}
          {step === 'govRole' && (
            <div className="am-role-list">
              {GOVERNMENT_ROLES.map(r => (
                <button key={r.value} type="button" className={`am-role-list-card${(type === 'login' ? govLoginForm.role : govForm.role) === r.value ? ' active' : ''}`} onClick={() => handleChooseGovRole(r.value)}>
                  <span className="am-role-list-icon">{r.icon}</span>
                  <span className="am-role-list-text"><b>{r.label}</b><span>{r.blurb}</span></span>
                </button>
              ))}
            </div>
          )}

          {/* Forms */}
          {step === 'form' && category === 'citizen' && type === 'register' && (
            <form onSubmit={submitCitizenRegister}>
              <div className="am-field"><label>Full name</label><input type="text" required placeholder="Your full name" value={citizenForm.fullName} onChange={setField(setCitizenForm)('fullName')} /></div>
              <div className="am-field-row">
                <div className="am-field"><label>Mobile number</label><input type="tel" required placeholder="10-digit number" value={citizenForm.mobile} onChange={setField(setCitizenForm)('mobile')} /></div>
                <div className="am-field"><label>Email address</label><input type="email" required placeholder="you@example.com" value={citizenForm.email} onChange={setField(setCitizenForm)('email')} /></div>
              </div>
              <div className="am-field-row">
                <div className="am-field"><label>Password</label><input type="password" required placeholder="••••••••" value={citizenForm.password} onChange={setField(setCitizenForm)('password')} /></div>
                <div className="am-field"><label>Confirm password</label><input type="password" required placeholder="••••••••" value={citizenForm.confirmPassword} onChange={setField(setCitizenForm)('confirmPassword')} /></div>
              </div>
              {error && <div className="am-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-block">Create account</button>
              <p className="am-hint">Already have an account? <a href="#" onClick={e=>{e.preventDefault(); onSwitch('login');}}>Log in</a></p>
            </form>
          )}
          {step === 'form' && category === 'citizen' && type === 'login' && (
            <form onSubmit={submitCitizenLogin}>
              <div className="am-field"><label>Email address</label><input type="email" required placeholder="you@example.com" value={citizenForm.email} onChange={setField(setCitizenForm)('email')} /></div>
              <div className="am-field"><label>Password</label><input type="password" required placeholder="••••••••" value={citizenForm.password} onChange={setField(setCitizenForm)('password')} /></div>
              {error && <div className="am-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-block">Log in</button>
              <p className="am-hint">New here? <a href="#" onClick={e=>{e.preventDefault(); onSwitch('register');}}>Create a citizen account</a></p>
            </form>
          )}
          {step === 'form' && category === 'government' && type === 'register' && (
            <form onSubmit={submitGovRegister}>
              <div className="am-role-summary"><span className="am-role-icon">{roleIcon(govForm.role)}</span><div className="am-role-info"><b>{roleLabel(govForm.role) || 'No role selected'}</b></div><a onClick={()=>setStep('govRole')}>Change role</a></div>
              <div className="am-field-row"><div className="am-field"><label>Employee ID</label><input type="text" required placeholder="e.g. GOV10245" value={govForm.employeeId} onChange={setField(setGovForm)('employeeId')} /></div><div className="am-field"><label>Official email</label><input type="email" required placeholder="name@dept.gov.in" value={govForm.officialEmail} onChange={setField(setGovForm)('officialEmail')} /></div></div>
              <div className="am-field"><label>Mobile number</label><input type="tel" required placeholder="10-digit number" value={govForm.mobile} onChange={setField(setGovForm)('mobile')} /></div>
              <div className="am-field-row"><div className="am-field"><label>Password</label><input type="password" required placeholder="••••••••" value={govForm.password} onChange={setField(setGovForm)('password')} /></div><div className="am-field"><label>Confirm password</label><input type="password" required placeholder="••••••••" value={govForm.confirmPassword} onChange={setField(setGovForm)('confirmPassword')} /></div></div>
              <p className="am-notice"><b>Note:</b> Selecting a role only <b>requests</b> it. An admin reviews and approves before activation.</p>
              {error && <div className="am-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-block">Submit access request</button>
              <p className="am-hint">Already approved? <a href="#" onClick={e=>{e.preventDefault(); onSwitch('login');}}>Log in</a></p>
            </form>
          )}
          {step === 'form' && category === 'government' && type === 'login' && (
            <form onSubmit={submitGovLogin}>
              <div className="am-role-summary"><span className="am-role-icon">{roleIcon(govLoginForm.role)}</span><div className="am-role-info"><b>{roleLabel(govLoginForm.role) || 'No role selected'}</b></div><a onClick={()=>setStep('govRole')}>Change role</a></div>
              <div className="am-field"><label>Username</label><input type="text" required placeholder="e.g. operator" value={govLoginForm.username} onChange={setField(setGovLoginForm)('username')} /></div>
              <div className="am-field"><label>Password</label><input type="password" required placeholder="••••••••" value={govLoginForm.password} onChange={setField(setGovLoginForm)('password')} /></div>
              {error && <div className="am-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-block">Log in</button>
              <p className="am-hint-muted">Demo government credentials: operator / Operator@123, registrar / Registrar@123, districtadmin / District@123, statenodal / State@123, auditor / Auditor@123.</p>
              <p className="am-hint">Need an approved access request? <a href="#" onClick={e=>{e.preventDefault(); onSwitch('register');}}>Request government access</a></p>
            </form>
          )}
          {step === 'form' && category === 'admin' && (
            <form onSubmit={submitAdminLogin}>
              <div className="am-field"><label>Admin ID</label><input type="text" required placeholder="Admin employee ID" value={adminForm.employeeId} onChange={setField(setAdminForm)('employeeId')} /></div>
              <div className="am-field"><label>Password</label><input type="password" required placeholder="••••••••" value={adminForm.password} onChange={setField(setAdminForm)('password')} /></div>
              {error && <div className="am-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-block">Log in</button>
              <p className="am-hint-muted">Admin accounts are provisioned by the platform team. (Demo: ADMIN001 / Admin@123)</p>
            </form>
          )}
          {step === 'pending' && submittedRequest && (
            <div className="am-pending">
              <div className="am-pending-icon">⏳</div>
              <p>Your request for <b>{submittedRequest.roleLabel}</b> access has been sent to the administrator for verification.</p>
              <div className="am-pending-card">
                <div className="am-pending-row"><span>Request ID</span><b>{submittedRequest.id}</b></div>
                <div className="am-pending-row"><span>Status</span><span className="am-status-pending">PENDING APPROVAL</span></div>
              </div>
              <p className="am-hint-muted">You'll be able to log in once the request is approved.</p>
              <button type="button" className="btn btn-primary btn-block" onClick={handleBackToLoginFromPending}>Back to login</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
