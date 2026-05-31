import React, { useState, useEffect } from 'react';
import { Treatment, Patient, Doctor } from '../types';
import { 
  FileText, 
  Plus, 
  User, 
  Stethoscope, 
  HeartCrack,
  Calendar,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface TreatmentsTabProps {
  userRole: 'Admin' | 'Doctor' | 'Receptionist';
  onRefreshStats: () => void;
}

export function TreatmentsTab({ userRole, onRefreshStats }: TreatmentsTabProps) {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Treatment state
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    diagnosis: '',
    prescription: ''
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const treatRes = await fetch('/api/treatments');
      if (treatRes.ok) {
        const data = await treatRes.json();
        setTreatments(data);
      }

      const pRes = await fetch('/api/patients');
      if (pRes.ok) {
        setPatients(await pRes.json());
      }

      const dRes = await fetch('/api/doctors');
      if (dRes.ok) {
        setDoctors(await dRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      patientId: patients[0]?._id || '',
      doctorId: doctors[0]?._id || '',
      diagnosis: '',
      prescription: ''
    });
    setErrorLog('');
    setShowAddModal(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLog('');

    if (!formData.patientId || !formData.doctorId || !formData.diagnosis || !formData.prescription) {
      setErrorLog("Validation Error: Please fill in all required clinical fields.");
      return;
    }

    try {
      const response = await fetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (!response.ok) {
        setErrorLog(result.error || 'Failed to insert treatment file.');
      } else {
        setShowAddModal(false);
        fetchData();
        onRefreshStats();
      }
    } catch (err: any) {
      setErrorLog(err.message || 'Server error.');
    }
  };

  return (
    <div className="space-y-6" id="treatments-module">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Clinical Treatments & Medical Logs</h2>
          <p className="text-sm text-slate-500 font-medium">Add diagnosis profiles, prescribe medicines, and review patient medical histories.</p>
        </div>

        <button 
          onClick={handleOpenAdd}
          disabled={patients.length === 0 || doctors.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm px-4 py-2.5 rounded-lg inline-flex items-center space-x-2 shadow-sm transition"
          id="btn-add-treatment"
        >
          <Plus className="h-4 w-4" />
          <span>Add Treatment Entry</span>
        </button>
      </div>

      {userRole === 'Doctor' && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-lg text-xs font-semibold">
          ✨ Greeting, Doctor! You have full specialized permissions to log diagnoses, prescribe pharmaceutical compounds, and amend treatment files.
        </div>
      )}

      {/* Grid of Medical Dossiers */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-mono">Running Mongoose find().populate('patientId').populate('doctorId')...</p>
        </div>
      ) : treatments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center text-slate-400">
          <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold">No medical diagnoses recorded in treatments collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="treatments-list-grid">
          {treatments.map((t) => (
            <div key={t._id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
              
              {/* Header profile names */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-rose-50 p-2 rounded-lg text-rose-600">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-none">{t.patient?.patientName || 'Patient'}</h4>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block mt-1">ID: #{t.patient?.patientId || 'N/A'}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-slate-400 font-mono text-[10px] text-slate-500 font-semibold">{new Date(t.treatmentDate).toLocaleDateString()}</span>
                  <div className="flex items-center sm:justify-end space-x-1 text-xs text-slate-500 font-medium font-semibold mt-0.5">
                    <Stethoscope className="h-3 w-3 text-teal-600" />
                    <span>{t.doctor?.doctorName || 'Staff Physician'}</span>
                  </div>
                </div>
              </div>

              {/* Diagnosis box */}
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Clinical Diagnosis</span>
                <p className="text-sm font-bold text-slate-900 bg-red-50/50 border border-red-100/30 px-3 py-2 rounded-lg inline-block">
                  {t.diagnosis}
                </p>
              </div>

              {/* Prescriptions box */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Prescription Regimen</span>
                <p className="font-mono text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-line">
                  {t.prescription}
                </p>
              </div>

              {/* Connection stats footer */}
              <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>ObjectId: _id: {t._id?.substring(0, 12)}...</span>
                <span className="text-blue-600 font-bold">Populated successfully</span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CREATE TREATMENT FILES MODAL */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="treatment-modal-title"
          aria-describedby="treatment-modal-desc"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden focus-visible:ring-2 focus-visible:ring-blue-600">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 id="treatment-modal-title" className="font-bold text-lg text-white">Log Diagnose Prescription</h3>
                <p id="treatment-modal-desc" className="text-xs text-slate-400 font-mono">Collection Name: treatments</p>
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
                <label htmlFor="tx-patient-id" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Target Patient Profile *
                </label>
                <select 
                  id="tx-patient-id"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-808 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white transition-all text-slate-800"
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.patientName} (ID: #{p.patientId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tx-doctor-id" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Reporting Clinical Specialist *
                </label>
                <select 
                  id="tx-doctor-id"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-808 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white transition-all text-slate-800"
                  required
                >
                  <option value="">-- Choose Physician --</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.doctorName} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tx-diagnosis" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Primary Medical Diagnosis *
                </label>
                <input 
                  id="tx-diagnosis"
                  type="text"
                  required
                  placeholder="e.g. Acute Migraine / Seasonal Gastritis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-805 transition-all text-slate-800"
                />
              </div>

              <div>
                <label htmlFor="tx-prescription" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Prescription Pharmaceutical Regimen *
                </label>
                <textarea 
                  id="tx-prescription"
                  required
                  rows={4}
                  placeholder="e.g. Paracetamol 500mg BID, avoid bright screens, stay hydrated."
                  value={formData.prescription}
                  onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                  className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-805 transition-all text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-sm hover:bg-slate-50 focus:ring-2 focus:ring-slate-400 focus:outline-hidden transition-all"
                  aria-label="Cancel and close dialog"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-hidden transition-all"
                >
                  Save Diagnostics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
