import React from 'react';
import { 
  Activity, 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  IndianRupee, 
  Database,
  User,
  Pill,
  Bed,
  Droplet,
  Bot,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: 'Admin' | 'Doctor' | 'Receptionist';
  setUserRole: (role: 'Admin' | 'Doctor' | 'Receptionist') => void;
}

export function Sidebar({ activeTab, setActiveTab, userRole, setUserRole }: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, roles: ['Admin', 'Doctor', 'Receptionist'] },
    { id: 'patients', label: 'Patients', icon: Users, roles: ['Admin', 'Doctor', 'Receptionist'] },
    { id: 'doctors', label: 'Doctors', icon: UserCheck, roles: ['Admin', 'Doctor', 'Receptionist'] },
    { id: 'appointments', label: 'Appointments', icon: Calendar, roles: ['Admin', 'Doctor', 'Receptionist'] },
    { id: 'treatments', label: 'Treatments & History', icon: FileText, roles: ['Admin', 'Doctor'] },
    { id: 'billing', label: 'Billing & Invoices', icon: IndianRupee, roles: ['Admin', 'Receptionist'] },
    { id: 'pharmacy', label: 'Pharmacy Management', icon: Pill, roles: ['Admin', 'Doctor', 'Receptionist'] },
    { id: 'beds', label: 'Bed & Ward Allocator', icon: Bed, roles: ['Admin', 'Doctor', 'Receptionist'] },
    { id: 'blood-donor', label: 'Blood Donor Registry', icon: Droplet, roles: ['Admin', 'Doctor', 'Receptionist'] },
    { id: 'chatbot', label: 'AI Clinical Assistant', icon: Bot, roles: ['Admin', 'Doctor', 'Receptionist'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Doctor', 'Receptionist'] },
    { id: 'database', label: 'MongoDB Console', icon: Database, roles: ['Admin'] }
  ];

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as 'Admin' | 'Doctor' | 'Receptionist';
    setUserRole(role);
    // Auto shift tab if current tab is restricted
    const selectedTabInfo = tabs.find(t => t.id === activeTab);
    if (selectedTabInfo && !selectedTabInfo.roles.includes(role)) {
      setActiveTab('dashboard');
    }
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-slate-100 flex flex-col justify-between h-full shadow-2xl border-r border-slate-700" id="app-sidebar">
      <div>
        {/* Hospital Branding */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="bg-blue-600 p-2.5 rounded-lg flex items-center justify-center text-white">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">Nithin</h1>
            <p className="text-xs text-blue-400 font-medium uppercase tracking-wider font-semibold">Hospital Management System</p>
          </div>
        </div>

        {/* Role Authenticator Switcher */}
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Current User Role
          </label>
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 px-3 py-2 rounded-md">
            <User className="h-4 w-4 text-blue-400" />
            <select
              value={userRole}
              onChange={handleRoleChange}
              className="bg-transparent text-sm font-medium text-white grow focus:outline-none cursor-pointer"
              id="role-selector"
            >
              <option value="Admin" className="bg-slate-900 text-white">Admin (Full Access)</option>
              <option value="Doctor" className="bg-slate-900 text-white">Doctor (Treatments)</option>
              <option value="Receptionist" className="bg-slate-900 text-white">Receptionist (Billing)</option>
            </select>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1">
          {tabs.map((tab) => {
            const hasAccess = tab.roles.includes(userRole);
            const Icon = tab.icon;
            
            if (!hasAccess) return null;

            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/50 font-bold scale-[1.02]' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white hover:shadow-md'
                }`}
                id={`sidebar-tab-${tab.id}`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Meta Credits */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 text-slate-500 text-xs">
        <p className="font-mono text-center">Connected: hospitalDB</p>
        <p className="text-center mt-1 text-[10px]">Secure Local Mongo Tunnel</p>
      </div>
    </aside>
  );
}
