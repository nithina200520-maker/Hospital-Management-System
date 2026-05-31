import React, { useState, useEffect } from 'react';
import { Appointment, Patient, Doctor } from '../types';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Plus, 
  X, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';

interface AppointmentsTabProps {
  userRole: 'Admin' | 'Doctor' | 'Receptionist';
  onRefreshStats: () => void;
}

export function AppointmentsTab({ userRole, onRefreshStats }: AppointmentsTabProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);

  // Form Booking parameters
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().slice(0, 16) // Default to now formatted as YYYY-MM-DDTHH:MM
  });
  const [errorLog, setErrorLog] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showBookModal) {
        setShowBookModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBookModal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch appointments
      const appRes = await fetch('/api/appointments');
      if (appRes.ok) {
        const data = await appRes.json();
        setAppointments(data);
      }
      
      // Fetch patients for references selector
      const pRes = await fetch('/api/patients');
      if (pRes.ok) {
        const pData = await pRes.json();
        setPatients(pData);
      }

      // Fetch doctors for references selector
      const dRes = await fetch('/api/doctors');
      if (dRes.ok) {
        const dData = await dRes.json();
        setDoctors(dData);
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

  const handleOpenBook = () => {
    setFormData({
      patientId: patients[0]?._id || '',
      doctorId: doctors[0]?._id || '',
      appointmentDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16) // default tomorrow
    });
    setErrorLog('');
    setShowBookModal(true);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLog('');

    if (!formData.patientId || !formData.doctorId) {
      setErrorLog("Validation Error: Please select both a valid Patient and Doctor.");
      return;
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: formData.patientId,
          doctorId: formData.doctorId,
          appointmentDate: new Date(formData.appointmentDate).toISOString()
        })
      });
      const result = await response.json();
      if (!response.ok) {
        setErrorLog(result.error || 'Failed to book slot.');
      } else {
        setShowBookModal(false);
        fetchData();
        onRefreshStats();
      }
    } catch (err: any) {
      setErrorLog(err.message || 'Server error.');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'Scheduled' | 'Completed' | 'Cancelled') => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        // Update local list
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
        onRefreshStats();
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to update status.');
      }
    } catch (e) {
      alert('Network issue updating status.');
    }
  };

  return (
    <div className="space-y-6" id="appointments-module">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Operational Appointments Book</h2>
          <p className="text-sm text-slate-500 font-medium">Book consultation calendars, check scheduling logs, and update status.</p>
        </div>

        <button 
          onClick={handleOpenBook}
          disabled={patients.length === 0 || doctors.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm px-4 py-2.5 rounded-lg inline-flex items-center space-x-2 shadow-sm transition"
          id="btn-book-appointment"
        >
          <Calendar className="h-4 w-4" />
          <span>Book Consultation</span>
        </button>
      </div>

      {patients.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs font-semibold flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>Important Notice: To schedule an appointment, you must first register at least one patient record under the Patients tab.</p>
        </div>
      )}

      {/* Main Table view of appointments */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="appointments-table-container">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-mono">Resolving Document references (ObjectId)...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Calendar className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-bold">No active clinical appointments logged today.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Schedule Time</th>
                  <th className="py-4 px-6">Patient Reference</th>
                  <th className="py-4 px-6">Specialist Physician</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {appointments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-6 font-medium text-slate-800">
                      <div className="flex items-center space-x-2.5">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="font-bold text-slate-800">{new Date(a.appointmentDate).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500 font-mono">
                            {new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-6">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-400" />
                        <div>
                          <p className="font-bold text-slate-800">{a.patient?.patientName || 'Deleted Patient'}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">ID: #{a.patient?.patientId || 'N/A'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-6 font-semibold text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-4 w-4 text-teal-500" />
                        <div>
                          <p className="text-slate-800 font-bold">{a.doctor?.doctorName || 'Staff Physician'}</p>
                          <p className="text-xs text-slate-400">{a.doctor?.specialization}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-6 text-center">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        a.status === 'Completed' 
                          ? 'bg-green-50 border-green-200 text-green-800' 
                          : a.status === 'Cancelled'
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-blue-50 border-blue-200 text-blue-800'
                      }`} id={`status-badge-${a._id}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          a.status === 'Completed' ? 'bg-green-500' : a.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500 shadow-sm animate-pulse'
                        }`}></span>
                        <span>{a.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-6 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        {a.status === 'Scheduled' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(a._id, 'Completed')}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1.5 rounded transition"
                              title="Mark treatment completed"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(a._id, 'Cancelled')}
                              className="bg-slate-100 hover:bg-red-100 hover:text-red-800 text-slate-600 font-bold text-xs px-2.5 py-1.5 rounded transition"
                              title="Cancel slot"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {a.status !== 'Scheduled' && (
                          <span className="text-[10px] text-slate-400 font-mono">Ledger Lock</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BOOK CONSULTATION MODAL */}
      {showBookModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-modal-title"
          aria-describedby="book-modal-desc"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden focus-visible:ring-2 focus-visible:ring-blue-600">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 id="book-modal-title" className="font-bold text-lg text-white">Schedule Treatment Consultation</h3>
                <p id="book-modal-desc" className="text-xs text-slate-400 font-mono">Collection Name: appointments</p>
              </div>
              <button 
                onClick={() => setShowBookModal(false)} 
                className="text-slate-400 hover:text-white p-1.5 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-400 focus:bg-slate-800/50 transition-all"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBook} className="p-6 space-y-4 text-xs font-semibold text-slate-600">
              {errorLog && (
                <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200" role="alert">
                  <p className="font-mono text-[11px] leading-relaxed">{errorLog}</p>
                </div>
              )}

              <div>
                <label htmlFor="apt-patient-id" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Target Patient Record *
                </label>
                <select 
                  id="apt-patient-id"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white transition-all"
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.patientName} (ID: #{p.patientId}, Blood: {p.bloodGroup})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="apt-doctor-id" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Assign Specialist MD *
                </label>
                <select 
                  id="apt-doctor-id"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white transition-all"
                  required
                >
                  <option value="">-- Choose Specialist Doctor --</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.doctorName} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="apt-date" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Schedule Date / Time Slot *
                </label>
                <input 
                  id="apt-date"
                  type="datetime-local"
                  required
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  className="w-full text-sm font-mono bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-sm hover:bg-slate-50 focus:ring-2 focus:ring-slate-400 focus:outline-hidden transition-all"
                  aria-label="Cancel and close dialog"
                >
                  Close
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm shadow-xs focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-hidden transition-all"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
