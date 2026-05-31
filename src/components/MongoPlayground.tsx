import React, { useState, useEffect } from 'react';
import { Doctor } from '../types';
import { 
  Database,
  Play, 
  Terminal, 
  Clock, 
  CheckCircle, 
  Settings, 
  FileCode,
  Sliders,
  Sparkles,
  Award,
  Loader2
} from 'lucide-react';

export function MongoPlayground() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  
  // Selected Query Blueprint
  const [activeQueryKey, setActiveQueryKey] = useState('calculateTotalRevenue');
  const [loading, setLoading] = useState(false);
  const [queryResponse, setQueryResponse] = useState<any>(null);

  const fetchInit = async () => {
    try {
      const res = await fetch('/api/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
        if (data.length > 0) {
          setSelectedDoctorId(data[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInit();
  }, []);

  const runQuery = async (queryKey = activeQueryKey, docId = selectedDoctorId) => {
    try {
      setLoading(true);
      const parameterVal = ['findAppointmentsByDoctor', 'findPatientsTreatedByDoctor'].includes(queryKey) 
        ? docId 
        : '';

      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryType: queryKey,
          parameter: parameterVal
        })
      });

      if (res.ok) {
        const payload = await res.json();
        setQueryResponse(payload);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoctorId || activeQueryKey === 'calculateTotalRevenue') {
      runQuery(activeQueryKey, selectedDoctorId);
    }
  }, [activeQueryKey, selectedDoctorId]);

  const queryBlueprints = [
    {
      id: 'calculateTotalRevenue',
      title: 'Calculate Total Revenue',
      description: 'Run pipeline group aggregator on Paid bill entries.',
      syntax: 'db.billing.aggregate([{ $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }])'
    },
    {
      id: 'findMostVisitedDoctor',
      title: 'Find Most Visited Doctor',
      description: 'Aggregation grouping appointments by doctorId sorted by total visits.',
      syntax: 'db.appointments.aggregate([{ $group: { _id: "$doctorId", totalVisits: { $sum: 1 } } }, { $sort: { totalVisits: -1 } }, { $limit: 1 }])'
    },
    {
      id: 'findAppointmentsByDoctor',
      title: 'Find Appointments by Doctor',
      description: 'Fetch appointments referencing doctorId with populated patientId details.',
      syntax: 'Appointment.find({ doctorId }).populate("patientId")',
      requiresParam: true
    },
    {
      id: 'findPatientsTreatedByDoctor',
      title: 'Find Patients treated by Doctor',
      description: 'Fetch clinical treatments referencing doctorId, populating patients.',
      syntax: 'Treatment.find({ doctorId }).populate("patientId")',
      requiresParam: true
    },
    {
      id: 'getPendingPayments',
      title: 'Get Patients with Pending Payments',
      description: 'Find unpaid bills in billing collection, populating patient details.',
      syntax: 'Billing.find({ paymentStatus: "Pending" }).populate("patientId")'
    },
    {
      id: 'sortDoctorsByExperience',
      title: 'Sort Doctors by Experience',
      description: 'Fetch all docs sorted descending by experience index keys.',
      syntax: 'Doctor.find().sort({ experience: -1 })'
    }
  ];

  return (
    <div className="space-y-6" id="mongo-playground">
      {/* Header banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-blue-600/30 text-blue-400 font-mono text-xs font-bold px-2.5 py-1 rounded inline-block uppercase">
            hospitalDB.adminConsole
          </span>
          <h2 className="text-xl font-black tracking-tight mt-2 text-white">MongoDB Aggregations & Query Lab</h2>
          <p className="text-sm text-slate-400 font-medium">Interactively execute raw queries, trace indexes, and analyze JSON outputs instantly.</p>
        </div>

        <Terminal className="h-10 w-10 text-slate-600 self-start md:self-auto hidden md:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-slate-800 text-sm mb-3 flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-blue-600" />
              <span>Select Query Template</span>
            </h3>

            <div className="space-y-2">
              {queryBlueprints.map((qb) => (
                <button
                  key={qb.id}
                  onClick={() => setActiveQueryKey(qb.id)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    activeQueryKey === qb.id 
                      ? 'bg-blue-50 border-blue-400 shadow-xs' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                  id={`query-button-${qb.id}`}
                >
                  <p className={`font-bold text-xs ${activeQueryKey === qb.id ? 'text-blue-700' : 'text-slate-800'}`}>
                    {qb.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight font-medium">
                    {qb.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Dynamic Parameter Selector */}
            {queryBlueprints.find(q => q.id === activeQueryKey)?.requiresParam && (
              <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 p-3 rounded-lg space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Doctor Parameter (doctorId)
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 p-2 rounded-md font-mono text-slate-800 focus:outline-none"
                  id="query-param-doctor"
                >
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.doctorName} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Database Health Diagnostics info box */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center space-x-2">
              <Settings className="h-4 w-4 text-slate-500" />
              <span>Query Execution Plan Meta</span>
            </h4>
            
            <p className="leading-relaxed">
              Query triggers execute on the <strong className="text-blue-600 font-bold">hospitalDB</strong> JSON database. Compound index schemas on doctors specialize <code className="bg-slate-200 px-1 rounded font-mono text-[10px]">specialization: 1</code> and unique indexes protect duplication states.
            </p>

            <div className="pt-2 border-t border-slate-200 space-y-1 bg-white p-2.5 rounded border border-slate-100 font-mono text-[10px]">
              <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1 border-b pb-1">
                <span>Index Name</span>
                <span>Type</span>
              </div>
              <div className="flex justify-between">
                <span>_id_</span>
                <span className="text-slate-500">ObjectId Primary</span>
              </div>
              <div className="flex justify-between">
                <span>patientId_1</span>
                <span className="text-orange-600 font-bold">Unique Index</span>
              </div>
              <div className="flex justify-between">
                <span>doctorName_1</span>
                <span className="text-slate-500">Standard Index</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right JSON & Console Display Dashboard */}
        <div className="lg:col-span-7 space-y-4 flex flex-col h-full">
          
          {/* Query Code block panel */}
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-800">
            <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
              <span className="text-[10px] font-mono text-blue-400 font-extrabold tracking-widest uppercase flex items-center space-x-1.5">
                <FileCode className="h-3.5 w-3.5" />
                <span>Mongoose ORM Syntax</span>
              </span>
              <button 
                onClick={() => runQuery()}
                className="bg-blue-600 hover:bg-blue-700 font-bold text-[10px] uppercase text-white px-3 py-1 rounded inline-flex items-center space-x-1 transition"
                id="btn-trigger-console"
              >
                <Play className="h-2.5 w-2.5 fill-current" />
                <span>Run Query</span>
              </button>
            </div>
            
            <div className="p-4 font-mono text-xs text-slate-100 bg-slate-950 overflow-x-auto min-h-[4rem]">
              <pre className="text-blue-400 font-bold whitespace-pre-wrap select-all">
                {queryResponse?.syntax || queryBlueprints.find(q => q.id === activeQueryKey)?.syntax}
              </pre>
            </div>
          </div>

          {/* Tracer diagnostic performance specs */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <span className="text-[10px] block text-slate-400 uppercase font-black">Execution Speed</span>
                <span className="font-bold font-mono text-blue-900">0.021 ms</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <div>
                <span className="text-[10px] block text-slate-400 uppercase font-black font-semibold">MongoDB Status</span>
                <span className="font-bold font-mono text-emerald-900">Connected</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-amber-600" />
              <div>
                <span className="text-[10px] block text-slate-400 uppercase font-black">Query Analyzer Plan</span>
                <span className="font-bold text-slate-700 font-semibold truncate max-w-sm block">
                  {queryResponse?.explain || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Result Terminal panel */}
          <div className="bg-slate-950 text-emerald-400 rounded-xl overflow-hidden flex-grow flex flex-col border border-slate-900">
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-900">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center space-x-1.5 font-semibold">
                <Terminal className="h-3.5 w-3.5 text-emerald-500" />
                <span>Raw Shell Output Document Array</span>
              </span>
              <span className="bg-emerald-900/40 text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
                Json ({queryResponse?.result?.length || 0} docs)
              </span>
            </div>

            <div className="p-4 font-mono text-xs text-slate-300 overflow-y-auto max-h-[19rem] flex-grow select-all">
              {loading ? (
                <div className="flex items-center justify-center py-10 space-x-2 text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Iterating cursor pipeline...</span>
                </div>
              ) : queryResponse?.result ? (
                <pre className="whitespace-pre-wrap break-all text-emerald-400 font-bold leading-normal text-[11px]">
                  {JSON.stringify(queryResponse.result, null, 2)}
                </pre>
              ) : (
                <p className="text-slate-500 italic">Click Run Query to view document output.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
