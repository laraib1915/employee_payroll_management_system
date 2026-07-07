import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import Settings from './pages/Settings';

// Components
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';

const AppLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '240px' }}>
        <Navbar />
        <div style={{ 
          padding: '90px 32px 32px',
          background: '#f8f9fc',
          minHeight: '100vh',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />
        <Route
          path="/employees"
          element={
            <AppLayout>
              <Employees />
            </AppLayout>
          }
        />
        <Route
          path="/attendance"
          element={
            <AppLayout>
              <Attendance />
            </AppLayout>
          }
        />
        <Route
          path="/payroll"
          element={
            <AppLayout>
              <Payroll />
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;