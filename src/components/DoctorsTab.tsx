import React, { useState, useEffect } from 'react';
import { Doctor } from '../types';
import { 
  UserCheck, 
  Plus, 
  Search, 
  ArrowUpDown, 
  CheckCircle, 
  Phone, 
  Calendar,
  X,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface DoctorsTabProps {
  userRole: 'Admin' | 'Doctor' | 'Receptionist';
  onRefreshStats: () => void;
}

export function DoctorsTab({ userRole, onRefreshStats }: DoctorsTabProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [specFilter, setSpecFilter] = useState('');
  const [sortExperience, setSortExperience] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    doctorName: '',
    doctorId: '',
    specialization: 'General Medicine',
    experience: '10',
    phone: '+1 (555) ',
    availability: 'Mon, Wed, Fri'
  });
  const [errorLog, setErrorLog] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddModal) {
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      let url = '/api/doctors';
      const params: string[] = [];
      if (specFilter) {
        params.push(`specialization=${encodeURIComponent(specFilter)}`);
      }
      if (sortExperience) {
        params.push('sort=experience');
      }
      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specFilter, sortExperience]);

  const handleOpenAdd = () => {
    const nextRand = Math.floor(200 + Math.random() * 100);
    setFormData({
      doctorName: '',
      doctorId: nextRand.toString(),
      specialization: 'General Medicine',
      experience: '10',
      phone: '+1 (555) ',
      availability: 'Mon, Wed, Fri'
    });
    setErrorLog('');
    setShowAddModal(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'Admin') {
      alert("Role Permission Violation: Only users logged in with the 'Admin' role can register new medical staff.");
      return;
    }

    setErrorLog('');
    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (!response.ok) {
        setErrorLog(result.error || 'Failed to register doctor.');
      } else {
        setShowAddModal(false);
        fetchDoctors();
        onRefreshStats();
      }
    } catch (error: any) {
      setErrorLog(error.message || 'Server error.');
    }
  };

  // Get list of distinct specializations from mock data to fill dropdown filter
  const specializations = [
    "Cardiology",
    "Pediatrics",
    "General Medicine",
    "Anesthesiology",
    "Neurology",
  ];

  return (
    <div className="space-y-6" id="doctors-module">
      
      {/* Page Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Medical Specialists Directories</h2>
          <p className="text-sm text-slate-500 font-medium">Filter staff by specialized clinical units, sort by experience, or add physician rosters.</p>
        </div>

        {userRole === 'Admin' && (
          <button 
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg inline-flex items-center space-x-2 shadow-sm transition"
            id="btn-register-doctor"
          >
            <Plus className="h-4 w-4" />
            <span>Register Doctor</span>
          </button>
        )}
      </div>

      {/* Specialty Filter & Experience Sort Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Unit Specialization:</span>
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none focus:ring-0"
              id="specialization-filter"
            >
              <option value="">All Specializations</option>
              {specializations.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Trigger */}
        <button
          onClick={() => setSortExperience(!sortExperience)}
          className={`px-4 py-2 text-xs font-bold rounded-lg border text-slate-700 inline-flex items-center space-x-2 transition ${
            sortExperience 
              ? 'bg-blue-50 border-blue-200 text-blue-700 font-extrabold shadow-xs' 
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
          id="btn-sort-experience"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span>Sort doctors by experience {sortExperience ? '(Descending)' : ''}</span>
        </button>
      </div>

      {/* Grid of Doctors Card */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs font-mono">Loading doctor rosters...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center text-slate-400">
          <UserCheck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold">No medical doctors match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="doctors-list-grid">
          {doctors.map((d) => (
            <div key={d._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              
              {/* Doctor Header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-blue-50 text-blue-800 text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded">
                      ID: #{d.doctorId}
                    </span>
                    <h3 className="font-bold text-slate-950 text-base mt-2">{d.doctorName}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{d.specialization}</p>
                  </div>
                  
                  {/* Experience Badge */}
                  <div className="text-right flex flex-col items-end">
                    <span className="text-slate-900 font-extrabold text-sm">{d.experience} Yrs</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest leading-none font-bold">Experience</span>
                  </div>
                </div>
              </div>

              {/* Body stats */}
              <div className="p-5 bg-slate-50 border-b border-slate-100 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2.5">
                  <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none mb-0.5">Availability</span>
                    <span className="font-semibold text-slate-700">{d.availability}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none mb-0.5">Mobile Contact</span>
                    <span className="font-mono text-slate-700 font-semibold">{d.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Status footer */}
              <div className="px-5 py-3.5 bg-white flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-slate-500">Active Duty</span>
                </div>
                <span className="font-mono text-[9px] text-slate-400 uppercase">MongoDB record</span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* REGISTER NEW DOCTOR MODAL (Admin Only check) */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="doc-modal-title"
          aria-describedby="doc-modal-desc"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden focus-visible:ring-2 focus-visible:ring-blue-600">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 id="doc-modal-title" className="font-bold text-lg text-white">Register Clinical Specialist</h3>
                <p id="doc-modal-desc" className="text-xs text-slate-400 font-mono">Privileged action: Admin</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-white p-1.5 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-400 focus:bg-slate-800/50 transition-all"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-6 space-y-4 text-xs font-semibold text-slate-600">
              {errorLog && (
                <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200" role="alert">
                  <p className="font-mono text-[11px] font-medium leading-relaxed">{errorLog}</p>
                </div>
              )}

              <div>
                <label htmlFor="doc-name" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Doctor / Specialist Name *
                </label>
                <input 
                  id="doc-name"
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Conan Doyle"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-800 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="doc-id" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Doctor ID *
                  </label>
                  <input 
                    id="doc-id"
                    type="number"
                    required
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full text-sm font-mono bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-800 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="doc-experience" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Experience (Years)
                  </label>
                  <input 
                    id="doc-experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full text-sm font-mono bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="doc-specialization" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Clinical Specialty Sector
                </label>
                <select 
                  id="doc-specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-805 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white transition-all"
                >
                  {specializations.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="doc-availability" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Availability Core Slots
                </label>
                <input 
                  id="doc-availability"
                  type="text"
                  placeholder="e.g. Mon, Wed, Fri"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-800 transition-all"
                />
              </div>

              <div>
                <label htmlFor="doc-phone" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Direct Line Contact
                </label>
                <input 
                  id="doc-phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-800 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-sm hover:bg-slate-50 focus:ring-2 focus:ring-slate-400 focus:outline-hidden transition-all"
                  aria-label="Cancel registration and close dialog"
                >
                  Close
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-hidden transition-all"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
