import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Activity, 
  Loader2, 
  X,
  AlertTriangle,
  HeartCrack,
  CalendarDays,
  MapPin,
  PhoneCall,
  Download,
  QrCode,
  ClipboardCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ConfirmationDialog } from './ConfirmationDialog';

interface PatientsTabProps {
  userRole: 'Admin' | 'Doctor' | 'Receptionist';
  onRefreshStats: () => void;
}

export function PatientsTab({ userRole, onRefreshStats }: PatientsTabProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Custom Confirmation Dialog State
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    patientId: string;
    patientName: string;
  }>({
    isOpen: false,
    patientId: '',
    patientName: ''
  });

  // QR Check-In Viewer Modal State
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrPatient, setQRPatient] = useState<Patient | null>(null);

  // Scanner Simulator Modal State
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerSelectedPatientId, setScannerSelectedPatientId] = useState('');
  const [scanAnimationActive, setScanAnimationActive] = useState(false);
  const [scanStatus, setScanStatus] = useState<{
    type: 'success' | 'info' | 'error' | null;
    message: string;
    receipt: {
      patientName: string;
      doctorName: string;
      specialization: string;
      time: string;
      date: string;
    } | null;
  }>({
    type: null,
    message: '',
    receipt: null
  });
  
  // Form fields
  const [formData, setFormData] = useState({
    _id: '',
    patientName: '',
    patientId: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    bloodGroup: 'O+',
    diseases: ''
  });
  const [errorLog, setErrorLog] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowHistoryModal(false);
        setShowQRModal(false);
        setShowScannerModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Loaded medical history records for selected patient
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [billsHistory, setBillsHistory] = useState<any[]>([]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const controller = new AbortController(); // Added abort logic for rapid typing
      const res = await fetch(`/api/patients?search=${encodeURIComponent(searchQuery)}`, { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenAdd = () => {
    // Generate simple auto-sequential ID or let them write
    const nextRandomId = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      _id: '',
      patientName: '',
      patientId: nextRandomId.toString(),
      age: '35',
      gender: 'Male',
      phone: '+1 (555) ',
      address: '',
      bloodGroup: 'O+',
      diseases: ''
    });
    setErrorLog('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setFormData({
      _id: p._id,
      patientName: p.patientName,
      patientId: p.patientId.toString(),
      age: p.age.toString(),
      gender: p.gender,
      phone: p.phone,
      address: p.address,
      bloodGroup: p.bloodGroup,
      diseases: p.diseases
    });
    setErrorLog('');
    setShowEditModal(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLog('');
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (!response.ok) {
        setErrorLog(result.error || 'Failed to insert document.');
      } else {
        setShowAddModal(false);
        fetchPatients();
        onRefreshStats();
      }
    } catch (error: any) {
      setErrorLog(error.message || 'Server error inserting record.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLog('');
    try {
      const response = await fetch(`/api/patients/${formData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (!response.ok) {
        setErrorLog(result.error || 'Failed to update document.');
      } else {
        setShowEditModal(false);
        fetchPatients();
        onRefreshStats();
      }
    } catch (error: any) {
      setErrorLog(error.message || 'Server error updating record.');
    }
  };

  const handleDeleteRequest = (patientId: string, name: string) => {
    setDeleteConfirmState({
      isOpen: true,
      patientId,
      patientName: name
    });
  };

  const handleShowQRCode = (p: Patient) => {
    setQRPatient(p);
    setShowQRModal(true);
  };

  const handleSimulateScan = async (patientIdToScan: string) => {
    if (!patientIdToScan) {
      setScanStatus({
        type: 'error',
        message: 'Scan error: No patient selected or scanned.',
        receipt: null
      });
      return;
    }

    setScanAnimationActive(true);
    setScanStatus({
      type: 'info',
      message: 'Processing decoded QR payload: PATIENT-CHECKIN-' + patientIdToScan + '...',
      receipt: null
    });

    // Simulate delay
    setTimeout(async () => {
      try {
        const selectedPat = patients.find(p => p.patientId.toString() === patientIdToScan.toString());
        if (!selectedPat) {
          setScanStatus({
            type: 'error',
            message: `Check-In Failed: Patient ID #${patientIdToScan} is not registered in hospitalDB.`,
            receipt: null
          });
          setScanAnimationActive(false);
          return;
        }

        // Query all appointments
        const appRes = await fetch('/api/appointments');
        if (!appRes.ok) {
          throw new Error("Unable to retrieve appointments collection.");
        }
        const appointmentsList: any[] = await appRes.json();
        
        // Find today's Scheduled appointment for this patient
        const today = new Date();
        const patientAppointments = appointmentsList.filter(app => {
          if (!app.patientId || !selectedPat._id) return false;
          // Clean ID check
          const appPatId = typeof app.patientId === 'object' ? app.patientId._id : app.patientId;
          if (appPatId !== selectedPat._id) return false;
          const appDate = new Date(app.appointmentDate);
          return appDate.getFullYear() === today.getFullYear() &&
                 appDate.getMonth() === today.getMonth() &&
                 appDate.getDate() === today.getDate();
        });

        // If there's an active scheduled appointment today, check it in!
        const activeApt = patientAppointments.find(app => app.status === 'Scheduled');

        if (activeApt) {
          // Update appointment status to Completed (acting as Checked-In)
          const updateRes = await fetch(`/api/appointments/${activeApt._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Completed' })
          });

          if (updateRes.ok) {
            setScanStatus({
              type: 'success',
              message: `Arrived Success: Patient QR authenticated! Admitted into consult queue.`,
              receipt: {
                patientName: selectedPat.patientName,
                doctorName: activeApt.doctor?.doctorName || 'Assigned Specialist',
                specialization: activeApt.doctor?.specialization || 'General',
                time: new Date(activeApt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date(activeApt.appointmentDate).toLocaleDateString()
              }
            });
            onRefreshStats();
          } else {
            const errorResult = await updateRes.json();
            setScanStatus({
              type: 'error',
              message: `Queue update failed: ${errorResult.error || 'Server rejected mutation'}`,
              receipt: null
            });
          }
        } else {
          // Has no scheduled slot today, or it's already checked-in/completed
          const completedApt = patientAppointments.find(app => app.status === 'Completed');
          if (completedApt) {
            setScanStatus({
              type: 'info',
              message: `Already Checked-In: Patient "${selectedPat.patientName}" has already checked in and completed their appointment today.`,
              receipt: {
                patientName: selectedPat.patientName,
                doctorName: completedApt.doctor?.doctorName || 'Assigned Specialist',
                specialization: completedApt.doctor?.specialization || 'General',
                time: new Date(completedApt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date(completedApt.appointmentDate).toLocaleDateString()
              }
            });
          } else {
            setScanStatus({
              type: 'warning',
              message: `No appointment scheduled for today (or it was cancelled) for patient "${selectedPat.patientName}". Creating direct walk-in queue check-in.`,
              receipt: {
                patientName: selectedPat.patientName,
                doctorName: 'On-Call General Physician',
                specialization: 'General Medicine (Walk-In)',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date().toLocaleDateString()
              }
            });
          }
        }
      } catch (err: any) {
        setScanStatus({
          type: 'error',
          message: `Network read error: ${err.message || 'Call failed'}`,
          receipt: null
        });
      } finally {
        setScanAnimationActive(false);
      }
    }, 1500);
  };

  const handleViewMedicalHistory = async (patient: Patient) => {
    setSelectedPatient(patient);
    setMedicalHistory([]);
    setBillsHistory([]);
    setShowHistoryModal(true);

    try {
      // Find treatments
      const trRes = await fetch('/api/treatments');
      if (trRes.ok) {
        const treatments: any[] = await trRes.ok ? await trRes.json() : [];
        setMedicalHistory(treatments.filter(t => t.patientId === patient._id));
      }
      // Find billing
      const billRes = await fetch('/api/billing');
      if (billRes.ok) {
        const bills: any[] = await billRes.json();
        setBillsHistory(bills.filter(b => b.patientId === patient._id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    if (patients.length === 0) {
      alert("No patient data available to export.");
      return;
    }

    // Header column names
    const headers = ["Patient ID", "Patient Name", "Age", "Gender", "Phone", "Address", "Blood Group", "Created At"];
    
    // Construct rows
    const rows = patients.map(p => {
      return [
        `#${p.patientId}`,
        p.patientName,
        p.age,
        p.gender,
        p.phone || "",
        p.address || "",
        p.bloodGroup,
        p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""
      ].map(val => {
        // Handle values with commas or double quotes to avoid CSV parsing corruption
        const stringVal = String(val).replace(/"/g, '""');
        if (stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('"')) {
          return `"${stringVal}"`;
        }
        return stringVal;
      });
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Create, trigger, and discard standard client download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `patients_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="patients-module">
      
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Patient Management</h2>
          <p className="text-sm text-slate-500 font-medium">Add new records, search parameters, or review medical history directories.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userRole === 'Admin' && (
            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-bold text-sm px-4 py-2.5 rounded-lg inline-flex items-center space-x-2 border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-150"
              id="btn-export-patients"
              title="Export patient records as CSV"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          )}

          <button 
            onClick={() => {
              setScannerSelectedPatientId('');
              setScanStatus({ type: null, message: '', receipt: null });
              setShowScannerModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg inline-flex items-center space-x-2 shadow-sm transition-all duration-150"
            id="btn-scanner-station"
            title="Open digital QR code check-in gate simulation"
          >
            <QrCode className="h-4 w-4" />
            <span>Arrival Scanner Desk</span>
          </button>

          <button 
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg inline-flex items-center space-x-2 shadow-sm transition-all duration-150"
            id="btn-add-patient"
          >
            <Plus className="h-4 w-4" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
        <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
        <input 
          type="text"
          placeholder="Search patients by name, ID, or blood group..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="grow bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
          id="patient-search-input"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-100 rounded text-slate-400">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Patient Data Grid / Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="patients-table-container">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-mono leading-none">Querying collection: patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Users className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold">No patients record found matching the search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-mono">Patient ID</th>
                  <th className="py-4 px-6">Patient Name</th>
                  <th className="py-4 px-6 text-center">Age / Gender</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6 text-center">Blood Group</th>
                  <th className="py-2 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-6 font-mono text-xs font-bold text-blue-600">
                      #{p.patientId}
                    </td>
                    <td className="py-3 px-6 font-semibold text-slate-800">
                      {p.patientName}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className="font-mono">{p.age}</span> yrs / {p.gender}
                    </td>
                    <td className="py-3 px-6 text-slate-600">
                      {p.phone || <em className="text-slate-400">N/A</em>}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className="bg-rose-50 text-rose-800 font-extrabold font-mono text-xs px-2.5 py-1 rounded-full border border-rose-200">
                        {p.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewMedicalHistory(p)}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1.5 rounded font-semibold inline-flex items-center space-x-1 transition-all"
                          title="View clinical medical file"
                        >
                          <Activity className="h-3 w-3 text-red-500" />
                          <span>Medical File</span>
                        </button>
                        <button
                          onClick={() => handleShowQRCode(p)}
                          className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs px-2.5 py-1.5 rounded font-semibold inline-flex items-center space-x-1 transition-all"
                          title="View patient check-in QR code"
                        >
                          <QrCode className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          <span>Check-In QR</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 transition"
                          title="Modify details"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(p._id, p.patientName)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-rose-950/30 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                          title="Delete record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD PATIENT MODAL */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-patient-title"
          aria-describedby="add-patient-desc"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden focus-visible:ring-2 focus-visible:ring-blue-600">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 id="add-patient-title" className="font-bold text-lg text-white">Create Patient Document</h3>
                <p id="add-patient-desc" className="text-xs text-slate-400 font-mono">Collection Name: patients</p>
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
                <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200 flex items-start space-x-2" role="alert">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="font-mono text-[11px] font-medium leading-normal">{errorLog}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="p-add-name" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Patient Name *
                  </label>
                  <input 
                    id="p-add-name"
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-805 transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="p-add-id" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Patient ID (Unique Number) *
                  </label>
                  <input 
                    id="p-add-id"
                    type="number"
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full text-sm font-mono bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-805 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="p-add-age" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Age
                  </label>
                  <input 
                    id="p-add-age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full text-sm font-mono bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-805 transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="p-add-gender" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Gender
                  </label>
                  <select 
                    id="p-add-gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white transition-all text-slate-700"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="p-add-blood" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Blood Group
                  </label>
                  <select 
                    id="p-add-blood"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full text-sm font-mono bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white transition-all text-slate-755"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="p-add-phone" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Contact Phone Number
                </label>
                <input 
                  id="p-add-phone"
                  type="text"
                  placeholder="+1 (555) 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-805 transition-all text-slate-800"
                />
              </div>

              <div>
                <label htmlFor="p-add-address" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Home Address
                </label>
                <textarea 
                  id="p-add-address"
                  rows={2}
                  placeholder="Street, City, State"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-805 transition-all text-slate-850"
                />
              </div>

              <div>
                <label htmlFor="p-add-diseases" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Patient Diseases
                </label>
                <textarea 
                  id="p-add-diseases"
                  rows={2}
                  placeholder="e.g. Hypertension, Diabetes, Asthma (comma-separated)"
                  value={formData.diseases}
                  onChange={(e) => setFormData({ ...formData, diseases: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-805 transition-all text-slate-850"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 text-sm focus:ring-2 focus:ring-slate-400 focus:outline-hidden transition-all"
                  aria-label="Cancel and close dialog"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-hidden transition-all"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PATIENT MODAL */}
      {showEditModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-patient-title"
          aria-describedby="edit-patient-desc"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden focus-visible:ring-2 focus-visible:ring-blue-600">
            <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 id="edit-patient-title" className="font-bold text-lg text-white">Modify Patient Record</h3>
                <p id="edit-patient-desc" className="text-xs text-slate-400 font-mono">_id: {formData._id}</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-slate-400 hover:text-white p-1.5 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-400 focus:bg-slate-800/50 transition-all"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs font-semibold text-slate-600">
              {errorLog && (
                <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200" role="alert">
                  <p className="font-mono text-[11px]">{errorLog}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="p-edit-name" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Patient Name *
                  </label>
                  <input 
                    id="p-edit-name"
                    type="text"
                    required
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full text-sm font-semibold bg-slate-100 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-805 transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="p-edit-id" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Patient ID (Indexed key)
                  </label>
                  <input 
                    id="p-edit-id"
                    type="number"
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full text-sm font-mono bg-slate-100 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-805 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="p-edit-age" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Age
                  </label>
                  <input 
                    id="p-edit-age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full text-sm font-mono bg-slate-100/50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-805 transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="p-edit-gender" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Gender
                  </label>
                  <select 
                    id="p-edit-gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full text-sm bg-slate-100/50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white transition-all text-slate-800"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="p-edit-blood" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Blood Group
                  </label>
                  <select 
                    id="p-edit-blood"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full text-sm font-mono bg-slate-100/50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white transition-all text-slate-800"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="p-edit-phone" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Phone Number
                </label>
                <input 
                  id="p-edit-phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm bg-slate-100/50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-805 transition-all text-slate-800"
                />
              </div>

              <div>
                <label htmlFor="p-edit-address" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Home Address
                </label>
                <textarea 
                  id="p-edit-address"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-sm bg-slate-100/50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white text-slate-805 transition-all text-slate-850"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-sm hover:bg-slate-50 focus:ring-2 focus:ring-slate-400 focus:outline-hidden transition-all"
                  aria-label="Cancel and close dialog"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:outline-hidden transition-all"
                >
                  Confirm Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDICAL HISTORY / DOSSIER MODAL */}
      {showHistoryModal && selectedPatient && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-modal-title"
          aria-describedby="history-modal-desc"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] focus-visible:ring-2 focus-visible:ring-blue-600">
            <div className="bg-blue-600 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <h3 id="history-modal-title" className="font-bold text-lg text-white">Clinical Patient File</h3>
                <p id="history-modal-desc" className="text-xs text-blue-100">Patient Object references database parameters</p>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)} 
                className="text-blue-100 hover:text-white p-1.5 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-200 focus:bg-blue-700/50 transition-all"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Patient fast profile card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{selectedPatient.patientName}</h4>
                  <p className="text-xs text-slate-500 font-medium">Record ID: #{selectedPatient.patientId}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Age/Gender</span>
                    <span className="text-slate-700 font-bold">{selectedPatient.age} yrs / {selectedPatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Blood Type</span>
                    <span className="text-red-600 font-extrabold">{selectedPatient.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Registered</span>
                    <span className="text-slate-700 font-bold">{new Date(selectedPatient.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Phone</span>
                    <span className="text-slate-700 font-bold font-mono">{selectedPatient.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Treatments History (diagnosis & prescription) */}
              <div>
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-200 mb-3">
                  <HeartCrack className="h-4 w-4 text-red-500" />
                  <h5 className="font-bold text-slate-800 text-sm">Treatment History ({medicalHistory.length})</h5>
                </div>

                {medicalHistory.length === 0 ? (
                  <p className="text-xs italic text-slate-400 text-center py-4 bg-slate-50 border border-dashed rounded-lg">
                    No clinical treatments or prescriptions logged on file.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {medicalHistory.map((tr, index) => (
                      <div key={tr._id || index} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50/50 transition">
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <span className="font-bold text-slate-800">Diagnosis:</span>
                            <p className="text-sm font-semibold text-slate-900 bg-blue-50/50 px-2 py-1 rounded inline-block mt-0.5">{tr.diagnosis}</p>
                          </div>
                          <span className="text-slate-400 font-mono text-[10px]">{new Date(tr.treatmentDate).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="font-bold text-slate-500 block uppercase tracking-wider text-[9px]">Prescribed Regimen:</span>
                          <p className="text-slate-700 mt-1 font-mono leading-relaxed">{tr.prescription}</p>
                        </div>
                        {tr.doctor && (
                          <div className="mt-2 text-[10px] text-slate-500 flex items-center space-x-1 justify-end font-medium">
                            <span>Physician:</span>
                            <span className="font-bold text-slate-700">{tr.doctor.doctorName} ({tr.doctor.specialization})</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invoices and Payments History */}
              <div>
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-200 mb-3">
                  <MapPin className="h-4 w-4 text-teal-600" />
                  <h5 className="font-bold text-slate-800 text-sm">Billing Records & Ledger ({billsHistory.length})</h5>
                </div>

                {billsHistory.length === 0 ? (
                  <p className="text-xs italic text-slate-400 text-center py-4 bg-slate-50 border border-dashed rounded-lg">
                    No matching invoices generated.
                  </p>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-lg">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest font-mono text-[9px] border-b border-slate-100">
                          <th className="py-2.5 px-4 font-bold">Ledge ID</th>
                          <th className="py-2.5 px-4 text-right">Amount</th>
                          <th className="py-2.5 px-4 text-center">Status</th>
                          <th className="py-2.5 px-4">Settlement Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billsHistory.map((bill, i) => (
                          <tr key={bill._id || i} className="border-b border-slate-100">
                            <td className="py-2 px-4 font-mono text-[10px] text-slate-500">#{bill._id?.substring(0, 8)}...</td>
                            <td className="py-2 px-4 text-right font-bold text-slate-800">${bill.totalAmount}</td>
                            <td className="py-2 px-4 text-center">
                              <span className={`inline-block font-bold text-[9px] uppercase px-1.5 py-0.5 rounded ${
                                bill.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {bill.paymentStatus}
                              </span>
                            </td>
                            <td className="py-2 px-4 font-mono text-slate-500 text-[10px]">
                              {bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-100 px-6 py-4 flex justify-end">
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-lg focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:outline-hidden transition-all"
                aria-label="Close dossier"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. PATIENT QR CODE VIEW POPUP OVERLAY */}
      {showQRModal && qrPatient && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up animate-duration-150">
            {/* Modal branding header */}
            <div className="bg-blue-600 p-4 text-white text-center relative">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-700 text-blue-100 px-2.5 py-0.5 rounded-full">
                Boston Cross Hospital
              </span>
              <h3 className="text-base font-extrabold mt-1">Check-In Passport</h3>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setQRPatient(null);
                }}
                className="absolute top-3 right-3 text-white/80 hover:text-white p-1 hover:bg-blue-700 rounded transition"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body with QR code */}
            <div className="p-6 flex flex-col items-center">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-inner">
                <QRCodeSVG
                  value={`PATIENT-CHECKIN:${qrPatient.patientId}`}
                  size={180}
                  level="H"
                  includeMargin={true}
                  className="bg-white rounded p-1 dark:border-slate-705"
                />
              </div>

              {/* Patient metadata display */}
              <div className="text-center mt-5 space-y-1 w-full">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">
                  {qrPatient.patientName}
                </h4>
                <div className="flex items-center justify-center space-x-2 text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                  <span>ID: #{qrPatient.patientId}</span>
                  <span>•</span>
                  <span className="text-rose-600 dark:text-rose-400">Group: {qrPatient.bloodGroup}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-left space-y-0.5 mt-4">
                  <p className="flex justify-between">
                    <span className="font-semibold text-slate-400">Gender:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{qrPatient.gender}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold text-slate-400">Phone:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{qrPatient.phone || 'N/A'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Direct arrival desk activation simulator trigger */}
            <div className="bg-slate-50 dark:bg-slate-900/40 px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => {
                  setScannerSelectedPatientId(qrPatient.patientId.toString());
                  setScanStatus({ type: null, message: '', receipt: null });
                  setShowQRModal(false);
                  setShowScannerModal(true);
                  // Auto-trigger simulation immediately for seamless checking
                  handleSimulateScan(qrPatient.patientId.toString());
                }}
                className="w-full bg-emerald-605 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center space-x-1 shadow-sm"
              >
                <Sparkles className="h-3 w-3" />
                <span>Simulate Desk Scan Arrival</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQRModal(false);
                  setQRPatient(null);
                }}
                className="w-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-bold py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-center"
              >
                Close Passport
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. QR CHECK-IN SCANNER DESK SIMULATOR SCREEN */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up animate-duration-150">
            {/* Header branding */}
            <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Arrival Check-In Station</h3>
                  <p className="text-[10px] text-emerald-100 font-mono">Laser Scan Engine v3.2</p>
                </div>
              </div>
              <button
                onClick={() => setShowScannerModal(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-emerald-700 rounded transition"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Viewfinder box & scanning lasers animations */}
            <div className="p-6 space-y-6">
              
              {/* Animated viewport block */}
              <div className="relative bg-slate-950 h-44 rounded-xl border-2 border-slate-800 dark:border-slate-800 overflow-hidden flex flex-col items-center justify-center">
                {/* Simulated framing corner marks */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-500 rounded-tl"></div>
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-500 rounded-tr"></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-500 rounded-bl"></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-500 rounded-br"></div>
                
                {/* Sweeping laser beam line */}
                {scanAnimationActive && (
                  <div className="absolute left-0 right-0 h-[1.5px] bg-red-500 bg-opacity-80 shadow-xs shadow-red-500 animate-bounce" style={{ top: '25%' }}></div>
                )}

                {/* Video text descriptors */}
                {scanAnimationActive ? (
                  <div className="text-center space-y-2 select-none animate-pulse">
                    <div className="inline-block bg-red-950/40 text-red-500 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-red-500/30">
                      ⚡ DECODING MATRIX...
                    </div>
                    <p className="text-emerald-400 font-mono text-[10px]">Lasers aligned. Searching for target ID token...</p>
                  </div>
                ) : scanStatus.type ? (
                  <div className="text-center p-4">
                    {scanStatus.type === 'success' && (
                      <div className="inline-flex bg-emerald-950/40 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 items-center space-x-1.5 animate-bounce">
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        <span>DECODE SUCCESSFUL</span>
                      </div>
                    )}
                    {scanStatus.type === 'warning' && (
                      <div className="inline-flex bg-amber-950/40 text-amber-500 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 items-center space-x-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>WALK-IN AUTH COMPLETE</span>
                      </div>
                    )}
                    {scanStatus.type === 'error' && (
                      <div className="inline-flex bg-rose-950/40 text-rose-500 text-xs font-bold px-3 py-1 rounded-full border border-rose-500/30 items-center space-x-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>DECODE FAIL</span>
                      </div>
                    )}
                    <p className="text-slate-350 font-mono text-[11px] mt-1.5 max-w-[280px] mx-auto leading-relaxed">{scanStatus.message}</p>
                  </div>
                ) : (
                  <div className="text-center space-y-1 max-w-xs px-4 pointer-events-none select-none">
                    <QrCode className="h-10 w-10 text-slate-700 dark:text-slate-600 mx-auto animate-pulse" />
                    <p className="text-slate-500 dark:text-slate-500 font-mono text-[10px]">CAMERA ENGINE ONLINE</p>
                    <p className="text-slate-400 dark:text-slate-400 font-medium text-[11px] font-sans">Aim a patient check-in QR code or choose their identity down below to mock immediate arrival receipt generation.</p>
                  </div>
                )}
              </div>

              {/* Patient Selection trigger panel */}
              <div className="bg-slate-50 dark:bg-slate-900/35 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Select Patient QR Identity to Scan:
                </label>
                <div className="flex gap-2">
                  <select
                    value={scannerSelectedPatientId}
                    onChange={(e) => setScannerSelectedPatientId(e.target.value)}
                    disabled={scanAnimationActive}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-200 text-xs rounded-lg p-2.5 flex-1 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold"
                  >
                    <option value="">-- Choose a Patient --</option>
                    {patients.map(p => (
                      <option key={p._id} value={p.patientId}>
                        {p.patientName} (ID: #{p.patientId})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleSimulateScan(scannerSelectedPatientId)}
                    disabled={scanAnimationActive || !scannerSelectedPatientId}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all flex items-center space-x-1 shadow-sm"
                  >
                    <span>Simulate Beam Scan</span>
                  </button>
                </div>
              </div>

              {/* Arrival Queue Slip printed receipt mockup */}
              {scanStatus.receipt && (
                <div className="border border-dashed border-emerald-500/40 dark:border-emerald-500/30 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/10 p-5 mt-2 animate-scale-up" id="checkin-receipt">
                  <div className="text-center pb-3 border-b border-dashed border-emerald-500/20">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">Admission Ticket</span>
                    <h4 className="text-slate-900 dark:text-slate-100 font-extrabold text-base tracking-tight">{scanStatus.receipt.patientName}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono py-4 text-slate-650 dark:text-slate-350 border-b border-dashed border-emerald-500/20">
                    <div>
                      <span className="text-[9px] block text-slate-400 font-sans font-bold uppercase tracking-wider">Clinician</span>
                      <span className="font-sans font-extrabold text-slate-800 dark:text-slate-100">{scanStatus.receipt.doctorName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] block text-slate-400 font-sans font-bold uppercase tracking-wider">Specialty</span>
                      <span className="font-sans font-medium text-slate-500 dark:text-slate-350">{scanStatus.receipt.specialization}</span>
                    </div>
                    <div>
                      <span className="text-[9px] block text-slate-400 font-sans font-bold uppercase tracking-wider">Arrival Registered</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{scanStatus.receipt.time}</span>
                    </div>
                    <div>
                      <span className="text-[9px] block text-slate-400 font-sans font-bold uppercase tracking-wider">Scheduled Date</span>
                      <span className="font-bold">{scanStatus.receipt.date}</span>
                    </div>
                  </div>

                  <div className="text-center pt-3 text-[10px] text-slate-400 dark:text-slate-400 font-sans font-medium flex items-center justify-center space-x-1">
                    <span>💡 Present confirmation ticket to reception. Take a seat in waiting corridor.</span>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-900/60 px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CUSTOM PORTALED CONFIRMATION DIALOG FOR PATIENTS DELETION */}
      <ConfirmationDialog
        isOpen={deleteConfirmState.isOpen}
        title="Delete Patient Record"
        message={`Are you absolutely sure you want to delete patient "${deleteConfirmState.patientName}"? This is a permanent cascade operation and cannot be undone. All related appointment history, treatment diaries, and unpaid bills will be removed.`}
        confirmLabel="Confirm Deletion"
        cancelLabel="Discard"
        isDestructive={true}
        onConfirm={async () => {
          const id = deleteConfirmState.patientId;
          setDeleteConfirmState({ isOpen: false, patientId: '', patientName: '' });
          try {
            const response = await fetch(`/api/patients/${id}`, {
              method: 'DELETE'
            });
            if (response.ok) {
              fetchPatients();
              onRefreshStats();
            } else {
              const result = await response.json();
              alert(result.error || 'Delete operation failed.');
            }
          } catch (e) {
            alert('Network issue deleting record.');
          }
        }}
        onCancel={() => {
          setDeleteConfirmState({ isOpen: false, patientId: '', patientName: '' });
        }}
      />

    </div>
  );
}
