import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatsGrid } from './components/StatsGrid';
import { PatientsTab } from './components/PatientsTab';
import { DoctorsTab } from './components/DoctorsTab';
import { AppointmentsTab } from './components/AppointmentsTab';
import { TreatmentsTab } from './components/TreatmentsTab';
import { BillingTab } from './components/BillingTab';
import { MongoPlayground } from './components/MongoPlayground';
import { PharmacyTab } from './components/PharmacyTab';
import { LaboratoryTab } from './components/LaboratoryTab';
import { BedsTab } from './components/BedsTab';
import { EmergencyTab } from './components/EmergencyTab';
import { ChatbotTab } from './components/ChatbotTab';
import { SettingsTab } from './components/SettingsTab';
import { DatabaseStats, Appointment } from './types';
import { 
  ShieldAlert, 
  Database, 
  CheckCircle, 
  HelpCircle,
  Clock,
  Sparkles,
  Bell,
  X,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hospital-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // Default to system preference on initial boot if no local override exists
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('hospital-theme', theme);
  }, [theme]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<'Admin' | 'Doctor' | 'Receptionist'>('Admin');
  
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [dbStatusText, setDbStatusText] = useState('Checking MongoDB tunnel status...');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (e) {
      console.error('Error fetching appointments:', e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setDbStatusText('Active connected cluster: hospitalDB.patients, hospitalDB.doctors, hospitalDB.appointments, hospitalDB.treatments, hospitalDB.billing (Local Storage file persistency synced).');
      }
    } catch (e) {
      console.error(e);
      setDbStatusText('Database connection stale.');
    }
    fetchAppointments();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const todayAppointments = appointments.filter(app => {
    if (app.status !== 'Scheduled') return false;
    const appDate = new Date(app.appointmentDate);
    const today = new Date();
    return appDate.getFullYear() === today.getFullYear() &&
           appDate.getMonth() === today.getMonth() &&
           appDate.getDate() === today.getDate();
  });

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden" id="hospital-app-root">
      
      {/* Dynamic Left Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={userRole} 
        setUserRole={setUserRole} 
      />

      {/* Main Content Workspace Layout */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        
        {/* Top Header Panel bar representing clean architecture */}
        <header className="bg-white border-b border-slate-200 h-16 min-h-16 flex items-center justify-between px-8 shadow-xs">
          <div className="flex items-center space-x-3">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">Database Context:</span>
            <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded uppercase">
              hospitalDB_Active
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Highly Polished Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-amber-400 rounded-lg transition-all duration-150 flex items-center space-x-2 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer select-none"
              id="theme-toggle-btn"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4 text-slate-500" />
                  <span className="text-[11px] font-bold tracking-tight">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-amber-400 rotate-12 transition-transform" />
                  <span className="text-[11px] font-bold tracking-tight text-amber-400">Light Mode</span>
                </>
              )}
            </button>

            {/* Bell Icon Notification */}
            <div className="relative inline-block text-left" id="bell-notifications-container">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition focus:outline-none"
                id="bell-notification-btn"
                aria-label="Notification Center"
              >
                <Bell className="h-5 w-5" />
                {todayAppointments.length > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center h-2 w-2 bg-red-500 rounded-full">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  </span>
                )}
                {todayAppointments.length > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-white bg-red-500 rounded-full animate-bounce">
                    {todayAppointments.length}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div 
                  className="absolute right-0 mt-3 w-80 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-fade-in"
                  id="notifications-dropdown"
                >
                  <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-blue-400" />
                      <span className="font-bold text-xs" id="notification-header-title">Today's Scheduled List</span>
                    </div>
                    <span className="bg-blue-600/30 text-blue-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded" id="notification-header-count">
                      {todayAppointments.length} matching
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100" id="notification-list-body">
                    {todayAppointments.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 space-y-2" id="notification-empty-state">
                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto" />
                        <p className="text-xs font-bold leading-normal">Excellent! No outstanding appointments scheduled for today.</p>
                      </div>
                    ) : (
                      todayAppointments.map((app) => (
                        <div 
                          key={app._id} 
                          className="p-3 hover:bg-slate-50 transition cursor-pointer text-left"
                          onClick={() => {
                            setActiveTab('appointments');
                            setShowNotifications(false);
                          }}
                          id={`notification-item-${app._id}`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-slate-800 truncate max-w-[170px]" id={`notification-patient-${app._id}`}>
                              👤 {app.patient?.patientName || 'Deleted Patient'}
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded whitespace-nowrap" id={`notification-time-${app._id}`}>
                              {new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 flex items-center truncate" id={`notification-doctor-${app._id}`}>
                            <span className="text-teal-600 mr-1 font-bold">🩺</span>
                            {app.doctor?.doctorName || 'Staff Physician'} ({app.doctor?.specialization})
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('appointments');
                        setShowNotifications(false);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
                      id="view-all-appointments-link"
                    >
                      View Operational Appointments Book &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role Status Badge */}
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Current Authentically Logged User</span>
              <span className="font-bold text-xs text-slate-800 bg-slate-100 px-2 py-1 rounded inline-block mt-0.5 border">
                👩‍⚕️ Privilege Context: <strong className="text-blue-600 uppercase font-black">{userRole}</strong>
              </span>
            </div>

            {/* Time Indicator */}
            <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-right hidden sm:block">
              <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Security Gate UTC</span>
              <span className="font-mono text-[10px] font-bold text-slate-700">2026-05-29 17:34</span>
            </div>
          </div>
        </header>

        {/* Inner Scroll Container */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
          
          {/* Tab Render Switchboard Router */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                  <p className="text-sm text-slate-500 font-semibold mt-0.5">MERN hospitalDB Analytics interface and database tracking indexes.</p>
                </div>
              </div>

              {/* Status Info box */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start space-x-3 text-xs text-blue-900 font-semibold">
                <Database className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-950">Integrated MongoDB Engine status:</h4>
                  <p className="font-normal font-mono text-[11px] text-blue-900/90 mt-1">{dbStatusText}</p>
                </div>
              </div>

              {/* Stats Analytics Grid */}
              <StatsGrid stats={stats} triggerRefresh={fetchStats} onTabChange={setActiveTab} />

              {/* Quick instructions and documentation for playground */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Skills & Operation Guide</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 font-semibold">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="font-extrabold text-slate-800 text-[13px] border-b pb-1.5 mb-2 flex items-center space-x-1.5">
                      <span>🔑 Role Permissions</span>
                    </p>
                    <ul className="space-y-1.5 leading-relaxed text-slate-500">
                      <li>• <strong className="text-slate-700">Admin</strong> has absolute schema modification rights.</li>
                      <li>• <strong className="text-slate-700">Doctor</strong> has access to log medical history profiles.</li>
                      <li>• <strong className="text-slate-700">Receptionist</strong> operates scheduler and drafts invoices.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="font-extrabold text-slate-800 text-[13px] border-b pb-1.5 mb-2 flex items-center space-x-1.5">
                      <span>🏷️ Database Indexes</span>
                    </p>
                    <p className="text-slate-500 leading-normal mb-1.5">
                      Optimize lookups matching clinical tags & times:
                    </p>
                    <code className="block bg-slate-200 p-1.5 rounded-md text-[10px] font-mono leading-tight whitespace-pre-wrap">
                      db.patients.createIndex({"{"} patientName: 1 {"}"});
                      db.doctors.createIndex({"{"} doctorName: 1, specialization: 1 {"}"});
                    </code>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="font-extrabold text-slate-800 text-[13px] border-b pb-1.5 mb-2 flex items-center space-x-1.5">
                      <span>📊 Advanced Analytics</span>
                    </p>
                    <p className="text-slate-500 leading-normal mb-1">
                      Check standard Mongoose code blocks in the <strong className="text-blue-600">MongoDB Console</strong> tab to watch aggregation pipeline filters run!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <PatientsTab userRole={userRole} onRefreshStats={fetchStats} />
          )}

          {activeTab === 'doctors' && (
            <DoctorsTab userRole={userRole} onRefreshStats={fetchStats} />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsTab userRole={userRole} onRefreshStats={fetchStats} />
          )}

          {activeTab === 'treatments' && (
            <TreatmentsTab userRole={userRole} onRefreshStats={fetchStats} />
          )}

          {activeTab === 'billing' && (
            <BillingTab userRole={userRole} onRefreshStats={fetchStats} />
          )}

          {activeTab === 'pharmacy' && (
            <PharmacyTab userRole={userRole} />
          )}

          {activeTab === 'laboratory' && (
            <LaboratoryTab userRole={userRole} />
          )}

          {activeTab === 'beds' && (
            <BedsTab userRole={userRole} />
          )}

          {activeTab === 'emergency' && (
            <EmergencyTab userRole={userRole} />
          )}

          {activeTab === 'chatbot' && (
            <ChatbotTab />
          )}

          {activeTab === 'settings' && (
            <SettingsTab />
          )}

          {activeTab === 'database' && (
            <MongoPlayground />
          )}

        </div>
      </main>
    </div>
  );
}
