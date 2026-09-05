import React, { useState, useEffect } from 'react';
import LandingPage from './components/Landing/LandingPage';
import OperatorDashboard from './components/Dashboard/OperatorDashboard';
import RegistrarDashboard from './components/Dashboard/RegistrarDashboard';
import CitizenDashboard from './components/Dashboard/CitizenDashboard';
import DistrictAdministratorDashboard from './components/Dashboard/DistrictAdministratorDashboard';
import ToastContainer from './components/Layout/ToastContainer';
import AuditorDashboard from './components/Dashboard/AuditorDashboard';
import StateNodalOfficerDashboard from './components/Dashboard/StateNodalOfficerDashboard';
import SystemAdministratorDashboard from './components/Dashboard/SystemAdministratorDashboard';

function getInitialState() {
  try {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash && hash !== 'home') {
      const parts = hash.split('/');
      if (parts[0] === 'dashboard' && parts[1]) {
        return { view: 'dashboard', role: parts[1], userName: parts[2] ? decodeURIComponent(parts[2]) : parts[1].toUpperCase() };
      }
      const knownRoles = ['operator', 'registrar', 'citizen', 'districtadmin', 'auditor', 'statenodal', 'systemadmin', 'tahsildar', 'tehsildar', 'subregistrar'];
      if (knownRoles.includes(parts[0])) {
        return { view: 'dashboard', role: parts[0], userName: parts[1] ? decodeURIComponent(parts[1]) : parts[0].toUpperCase() };
      }
    }
    // If opening http://localhost:5173 directly with no dashboard hash, clear any stale dashboard session
    localStorage.removeItem('land_record_auth');
  } catch (e) {
    console.warn('[App] Failed to parse initial state:', e);
  }
  return { view: 'landing', role: null, userName: null };
}

function App() {
  const [authState, setAuthState] = useState(getInitialState);
  const { view, role, userName } = authState;
  
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    try {
      if (view === 'dashboard' && role) {
        localStorage.setItem('land_record_auth', JSON.stringify({ view, role, userName }));
        window.location.hash = `dashboard/${role}${userName ? `/${encodeURIComponent(userName)}` : ''}`;
      } else {
        localStorage.removeItem('land_record_auth');
        if (window.location.hash.startsWith('#dashboard')) {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    } catch (e) {
      console.warn('[App] Storage sync failed:', e);
    }
  }, [view, role, userName]);

  // Handle browser back/forward navigation or hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const state = getInitialState();
      setAuthState(state);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const addToast = (msg, kind = '') => {
    setTimeout(() => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, msg, kind }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2850);
    }, 0);
  };

  const handleLogin = (userRole, name) => {
    setAuthState({
      role: userRole,
      userName: name,
      view: 'dashboard',
    });
    addToast(`Welcome back! Logged in as ${name}.`, 'success');
  };

  const handleLogout = () => {
    setAuthState({
      view: 'landing',
      role: null,
      userName: null,
    });
    addToast('You have been logged out.');
  };

  return (
    <>
      <div id="app">
        {view === 'landing' && (
          <LandingPage onLogin={handleLogin} />
        )}
        {view === 'dashboard' && role === 'operator' && (
          <OperatorDashboard userName={userName || 'Operator'} onLogout={handleLogout} addToast={addToast} />
        )}
        {view === 'dashboard' && (role === 'registrar' || role === 'tahsildar' || role === 'tehsildar' || role === 'subregistrar') && (
          <RegistrarDashboard userName={userName || 'Tahsildar'} onLogout={handleLogout} addToast={addToast} />
        )}
        {view === 'dashboard' && role === 'citizen' && (
          <CitizenDashboard userName={userName || 'Citizen'} onLogout={handleLogout} addToast={addToast} />
        )}
        {view === 'dashboard' && role === 'districtadmin' && (
          <DistrictAdministratorDashboard userName={userName || 'District Administrator'} onLogout={handleLogout} addToast={addToast} />
        )}
        {view === 'dashboard' && role === 'auditor' && (
          <AuditorDashboard userName={userName || 'Auditor'} onLogout={handleLogout} addToast={addToast} />
        )}
        {view === 'dashboard' && role === 'statenodal' && (
          <StateNodalOfficerDashboard userName={userName || 'State Nodal Officer'} onLogout={handleLogout} addToast={addToast} />
        )}
        {view === 'dashboard' && role === 'systemadmin' && (
          <SystemAdministratorDashboard userName={userName || 'System Administrator'} onLogout={handleLogout} addToast={addToast} />
        )}
      </div>
      <div id="modal-root"></div>
      <ToastContainer toasts={toasts} />
    </>
  );
}

export default App;
