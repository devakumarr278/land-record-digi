import React, { useState } from 'react';
import LandingPage from './components/Landing/LandingPage';
import OperatorDashboard from './components/Dashboard/OperatorDashboard';
import RegistrarDashboard from './components/Dashboard/RegistrarDashboard';
import CitizenDashboard from './components/Dashboard/CitizenDashboard';
import DistrictAdministratorDashboard from './components/Dashboard/DistrictAdministratorDashboard';
import ToastContainer from './components/Layout/ToastContainer';
import AuditorDashboard from './components/Dashboard/AuditorDashboard';
import StateNodalOfficerDashboard from './components/Dashboard/StateNodalOfficerDashboard';
import SystemAdministratorDashboard from './components/Dashboard/SystemAdministratorDashboard';

function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard'
  const [role, setRole] = useState(null); // 'citizen' | 'operator' | 'registrar'
  const [userName, setUserName] = useState(null);
  
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, kind = '') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2850);
  };

  const handleLogin = (userRole, name) => {
    setRole(userRole);
    setUserName(name);
    setView('dashboard');
    addToast(`Welcome back! Logged in as ${name}.`, 'success');
  };

  const handleLogout = () => {
    setView('landing');
    setRole(null);
    setUserName(null);
    addToast('You have been logged out.');
  };

  return (
    <>
      <div id="app">
        {view === 'landing' && (
          <LandingPage onLogin={handleLogin} />
        )}
        {view === 'dashboard' && role === 'operator' && (
          <OperatorDashboard userName={userName} onLogout={handleLogout} addToast={addToast} />
        )}
        {view === 'dashboard' && (role === 'registrar' || role === 'tehsildar' || role === 'subregistrar') && (
          <RegistrarDashboard userName={userName} onLogout={handleLogout} addToast={addToast} />
        )}
        {view === 'dashboard' && role === 'citizen' && (
          <CitizenDashboard userName={userName} onLogout={handleLogout} addToast={addToast} />
        )}
        {view === 'dashboard' && role === 'districtadmin' && (
          <DistrictAdministratorDashboard userName={userName} onLogout={handleLogout} addToast={addToast} />
        )}
        {view === 'dashboard' && role === 'auditor' && (
          <AuditorDashboard userName={userName} onLogout={handleLogout} addToast={addToast} />
        )}
        {view === 'dashboard' && role === 'statenodal' && (
          <StateNodalOfficerDashboard userName={userName} onLogout={handleLogout} addToast={addToast} />
        )}
        {view === 'dashboard' && role === 'systemadmin' && (
          <SystemAdministratorDashboard userName={userName} onLogout={handleLogout} addToast={addToast} />
        )}
      </div>
      <div id="modal-root"></div>
      <ToastContainer toasts={toasts} />
    </>
  );
}

export default App;
