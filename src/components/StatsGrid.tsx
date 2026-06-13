import React from 'react';
import { DatabaseStats } from '../types';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  IndianRupee, 
  AlertCircle, 
  Award,
  Database
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Tooltip 
} from 'recharts';

interface StatsGridProps {
  stats: DatabaseStats | null;
  triggerRefresh: () => void;
  onTabChange?: (tab: string) => void;
}

export function StatsGrid({ stats, triggerRefresh, onTabChange }: StatsGridProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-48"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        
        {/* Total Patients */}
        <div 
          onClick={() => onTabChange?.('patients')}
          className="relative bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 dark:from-blue-950 dark:via-blue-900/40 dark:to-slate-800 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] select-none h-48 overflow-hidden" 
          id="stat-patients"
          title="Click to view Patients"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="relative z-10 flex items-start justify-between w-full">
            <div>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Total Patients</p>
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">{stats.patientsCount}</h3>
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold font-mono block mt-1">Collection: patients</span>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3.5 rounded-xl text-white shadow-lg">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Mini Area Chart for Intake Trend */}
          <div className="h-16 w-full -mb-1 mt-1" id="patient-intake-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.patientIntakeTrend || []} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '2 2' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 dark:border-slate-800 text-white p-2 rounded-lg text-[10px] font-bold shadow-xl space-y-0.5">
                          <p className="text-slate-400 text-[9px] font-mono">{payload[0].payload.date}</p>
                          <p className="font-mono text-blue-400 flex items-center space-x-1">
                            <span>●</span>
                            <span>+{payload[0].value} New Intake</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorIntake)" 
                  activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 1.5, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Doctors */}
        <div 
          onClick={() => onTabChange?.('doctors')}
          className="relative bg-gradient-to-br from-teal-50 via-teal-100/50 to-teal-50 dark:from-teal-950 dark:via-teal-900/40 dark:to-slate-800 p-6 rounded-2xl border border-teal-200 dark:border-teal-800 shadow-lg hover:shadow-2xl hover:border-teal-400 dark:hover:border-teal-600 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] select-none h-48 overflow-hidden" 
          id="stat-doctors"
          title="Click to view Doctors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/20 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="relative z-10 flex items-start justify-between w-full">
            <div>
              <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Total Doctors</p>
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">{stats.doctorsCount}</h3>
              <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold font-mono block mt-1">Collection: doctors</span>
            </div>
            <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-3.5 rounded-xl text-white shadow-lg">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>

          {/* Specialization overview */}
          <div className="w-full mt-2 space-y-1.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Leading Specializations</p>
            <div className="flex flex-wrap gap-1">
              <span className="px-1.5 py-0.5 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-[9px] font-bold rounded-md">Cardio</span>
              <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-[9px] font-bold rounded-md">Peds</span>
              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-bold rounded-md">General</span>
              <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-[9px] font-bold rounded-md">Neuro</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div 
          onClick={() => onTabChange?.('billing')}
          className="relative bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-50 dark:from-emerald-950 dark:via-emerald-900/40 dark:to-slate-800 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-lg hover:shadow-2xl hover:border-emerald-400 dark:hover:border-emerald-600 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] select-none h-48 overflow-hidden" 
          id="stat-revenue"
          title="Click to view Billing & Invoices"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="relative z-10 flex items-start justify-between w-full">
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Revenue</p>
              <h3 className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-2">₹{stats.totalRevenue}</h3>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold font-mono block mt-1">Paid Bills aggregate</span>
            </div>
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3.5 rounded-xl text-white shadow-lg">
              <IndianRupee className="h-6 w-6" />
            </div>
          </div>

          {/* Mini Area Chart for Revenue Trend */}
          <div className="h-16 w-full -mb-1 mt-1" id="revenue-trend-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueTrend || []} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '2 2' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 dark:border-slate-800 text-white p-2 rounded-lg text-[10px] font-bold shadow-xl space-y-0.5">
                          <p className="text-slate-400 text-[9px] font-mono">{payload[0].payload.date}</p>
                          <p className="font-mono text-emerald-400 flex items-center space-x-1">
                            <span>●</span>
                            <span>₹{payload[0].value} Revenue</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 1.5, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Bills count */}
        <div 
          onClick={() => onTabChange?.('billing')}
          className="relative bg-gradient-to-br from-amber-50 via-amber-100/50 to-amber-50 dark:from-amber-950 dark:via-amber-900/40 dark:to-slate-800 p-6 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-lg hover:shadow-2xl hover:border-amber-400 dark:hover:border-amber-600 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] select-none h-48 overflow-hidden" 
          id="stat-pending"
          title="Click to view Pending/Unpaid Bills"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="relative z-10 flex items-start justify-between w-full">
            <div>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Unpaid Accounts</p>
              <h3 className="text-4xl font-extrabold text-amber-700 dark:text-amber-300 mt-2">{stats.pendingBillsCount}</h3>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold font-mono block mt-1">Requires follow-up</span>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>

          {/* Collection settlement progress rate */}
          <div className="w-full mt-2 space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Collection Settlement</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">60% Rate</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden shadow-inner">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Advanced Mongo Analytics / Aggregates highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Visited Doctor aggregate display */}
        <div 
          onClick={() => onTabChange?.('doctors')}
          className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 hover:bg-slate-100/30 dark:hover:bg-slate-800/60 active:scale-[0.98] select-none" 
          id="stat-visited-doctor"
          title="Click to view Doctor list"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded">
                ⚡ MongoDB Aggregation Result
              </span>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">Most Consulted Specialist</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Calculated in real-time via $group + $sort + $limit</p>
            </div>
            <Award className="h-8 w-8 text-amber-500 flex-shrink-0 animate-bounce" />
          </div>

          {stats.mostVisitedDoctor ? (
            <div className="mt-4 flex items-center justify-between bg-white dark:bg-slate-800 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">{stats.mostVisitedDoctor.doctorName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stats.mostVisitedDoctor.specialization}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{stats.mostVisitedDoctor.totalVisits} visits</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">visitsCount: $sum</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-center py-3 bg-white dark:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 text-xs italic">
              No appointments scheduled yet.
            </div>
          )}
        </div>

        {/* Database Health Card */}

      </div>
    </div>
  );
}
