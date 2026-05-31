import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  AlertOctagon, 
  Navigation, 
  PhoneCall, 
  MapPin, 
  BellRing, 
  Activity, 
  BatteryCharging, 
  Plus, 
  Clock 
} from 'lucide-react';

interface EmergencyPatient {
  id: string;
  name: string;
  condition: string;
  vitals: string;
  triageColor: 'Red' | 'Yellow' | 'Green';
  location: string;
  eta: string;
}

interface Ambulance {
  code: string;
  driverName: string;
  status: 'In Transit' | 'Standby' | 'Arrived';
  targetLocation: string;
  distanceLeft: number; // in km
}

export function EmergencyTab({ userRole }: { userRole: string }) {
  const [criticalPatients, setCriticalPatients] = useState<EmergencyPatient[]>([
    { id: 'ER01', name: 'James Anderson', condition: 'Acute Cardiac Arrhythmia', vitals: 'HR: 142 | BP: 90/60', triageColor: 'Red', location: 'Everett High-Street', eta: '3 mins' },
    { id: 'ER02', name: 'Sophia Thomas', condition: 'Multiple Trauma & Fracture', vitals: 'SpO2: 92% | RR: 28', triageColor: 'Red', location: 'Highway Exit 15', eta: '8 mins' },
    { id: 'ER03', name: 'Oliver Twist', condition: 'Severe Asthma Flare-up', vitals: 'HR: 110 | SpO2: 89%', triageColor: 'Yellow', location: 'Broadpark Apts', eta: 'Arrived' }
  ]);

  const [ambulances, setAmbulances] = useState<Ambulance[]>([
    { code: 'AMB-01', driverName: 'Robert Lang', status: 'In Transit', targetLocation: 'Everett High-Street', distanceLeft: 2.4 },
    { code: 'AMB-02', driverName: 'Gary Miller', status: 'In Transit', targetLocation: 'Highway Exit 15', distanceLeft: 6.8 },
    { code: 'AMB-03', driverName: 'Sara Connor', status: 'Arrived', targetLocation: 'Broadpark Apts', distanceLeft: 0 },
    { code: 'AMB-04', driverName: 'John Hicks', status: 'Standby', targetLocation: 'Hospital Base', distanceLeft: 0 }
  ]);

  // Ambulance simulator clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setAmbulances(prev => prev.map(amb => {
        if (amb.status === 'In Transit' && amb.distanceLeft > 0.1) {
          const nextDist = Math.max(0, Number((amb.distanceLeft - 0.2).toFixed(1)));
          const nextStatus = nextDist === 0 ? 'Arrived' : 'In Transit';
          return {
            ...amb,
            distanceLeft: nextDist,
            status: nextStatus
          };
        }
        return amb;
      }));
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: 'Anon Patient',
    condition: 'Acute Dyspnea',
    location: 'Central Junction',
    triageColor: 'Red' as 'Red' | 'Yellow' | 'Green'
  });

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddModal) {
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

  const handleRegisterIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const event: EmergencyPatient = {
      id: 'ER' + String(criticalPatients.length + 1).padStart(2, '0'),
      name: newEvent.name,
      condition: newEvent.condition,
      vitals: 'HR: 120 | BP: 100/70',
      triageColor: newEvent.triageColor,
      location: newEvent.location,
      eta: '12 mins'
    };

    // Also dispatch Standby Ambulance if any
    let ambulanceDispatched = false;
    setAmbulances(prev => prev.map(amb => {
      if (amb.status === 'Standby' && !ambulanceDispatched) {
        ambulanceDispatched = true;
        return {
          ...amb,
          status: 'In Transit',
          targetLocation: newEvent.location,
          distanceLeft: 9.5
        };
      }
      return amb;
    }));

    setCriticalPatients([event, ...criticalPatients]);
    setShowAddModal(false);
    setNewEvent({
      name: 'Anon Patient',
      condition: 'Acute Dyspnea',
      location: 'Central Junction',
      triageColor: 'Red'
    });
  };

  const handleArrivePatient = (id: string) => {
    setCriticalPatients(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, eta: 'Arrived' };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in" id="emergency-tab-panel">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2">
            <Flame className="h-5 w-5 animate-pulse" />
            <span>Emergency Medical Response & ICU Command</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Log real-time critical trauma dispatches, coordinate incoming ambulance paths, and update ER beds.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-650 hover:bg-red-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg inline-flex items-center space-x-2 shadow-sm transition bg-red-600 cursor-pointer"
          id="btn-dispatch-emergency"
        >
          <PhoneCall className="h-4 w-4" />
          <span>Dispatch Trauma Team</span>
        </button>
      </div>

      {/* Grid Layout splits: Live active tracker vs Ambulance maps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="emergency-layout-box">
        
        {/* Patient Feed stream */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-700">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
              <AlertOctagon className="h-4 text-red-605 w-4 text-red-600" />
              <span>Severe Trauma Patient Dispatches</span>
            </div>
            <span className="bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
              {criticalPatients.filter(p => p.eta !== 'Arrived').length} INCOMING INCIDENTS
            </span>
          </div>

          <div className="space-y-3" id="critical-patients-stream">
            {criticalPatients.map((p) => {
              const isArrived = p.eta === 'Arrived';
              return (
                <div 
                  key={p.id} 
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition ${isArrived ? 'border-slate-200 bg-slate-50/20' : 'border-red-100 bg-red-50/10'}`}
                  id={`critical-item-${p.id}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${p.triageColor === 'Red' ? 'bg-red-600 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{p.name}</span>
                      <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 px-1 py-0.2 rounded">Triage: {p.triageColor}</span>
                    </div>
                    <p className="text-xs text-red-600 font-bold">{p.condition}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5 text-slate-350" />
                        {p.vitals}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-300" />
                        {p.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <span className={`text-xs font-bold px-2 py-1 rounded inline-flex items-center gap-1 ${isArrived ? 'bg-emerald-100 text-emerald-805' : 'bg-red-50 text-red-700 animate-pulse'}`}>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{p.eta}</span>
                    </span>

                    {!isArrived && (
                      <button
                        onClick={() => handleArrivePatient(p.id)}
                        className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded cursor-pointer select-none"
                      >
                        Log Arrival
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ambulance GPS state block */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-700">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
              <Navigation className="h-4 w-4 text-blue-600" />
              <span>Simulated Ambulance GPS Telemetry</span>
            </div>
            <span className="text-xs text-slate-400 font-bold">Simulated Live 4.5s G-Path</span>
          </div>

          <div className="space-y-5" id="ambulance-list-cards">
            {ambulances.map((amb) => {
              const isInTransit = amb.status === 'In Transit';
              const isArrived = amb.status === 'Arrived';

              return (
                <div key={amb.code} className="bg-slate-50 dark:bg-slate-900 border p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-sm text-slate-955 dark:text-slate-100">{amb.code}</span>
                      <span className="text-[10px] text-slate-400 font-medium block">Driver: {amb.driverName}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isArrived ? 'bg-emerald-100 text-emerald-800' :
                      isInTransit ? 'bg-blue-100 text-blue-800 animate-pulse' :
                      'bg-slate-200 text-slate-800'
                    }`}>
                      {amb.status}
                    </span>
                  </div>

                  {isInTransit ? (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold font-mono">
                        <span>Bound for: {amb.targetLocation}</span>
                        <span>{amb.distanceLeft} km remaining</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-300 animate-pulse" 
                          style={{ width: `${Math.max(10, ((10 - amb.distanceLeft) / 10) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : isArrived ? (
                    <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <span>• Arrived on location: {amb.targetLocation}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-bold">
                      Ambulance is standby inside clinical cluster center base, ready for dispatches.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 popup-backdrop-panel transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="er-modal-title"
          aria-describedby="er-modal-desc"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border dark:border-slate-700 overflow-hidden shadow-2xl animate-scale-up focus-visible:ring-2 focus-visible:ring-red-600">
            <div className="bg-red-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="h-5 w-5 text-red-400" />
                <h3 id="er-modal-title" className="font-extrabold text-sm">Trauma Triage Dispatch</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-white transition cursor-pointer p-1.5 focus:outline-hidden focus:ring-2 focus:ring-red-405 rounded-lg"
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <p id="er-modal-desc" className="sr-only">Form to dispatch a new emergency trauma siren incident</p>

            <form onSubmit={handleRegisterIncident} className="p-6 space-y-4">
              <div>
                <label htmlFor="er-patient-id" className="block text-xs font-bold text-slate-500 uppercase mb-1">Trauma Patient Identifier</label>
                <input
                  id="er-patient-id"
                  type="text"
                  required
                  placeholder="e.g. Adult Male (or Anonymous)"
                  value={newEvent.name}
                  onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-805 text-slate-800"
                />
              </div>

              <div>
                <label htmlFor="er-condition" className="block text-xs font-bold text-slate-500 uppercase mb-1">Clinical Diagnosis Case</label>
                <input
                  id="er-condition"
                  type="text"
                  required
                  placeholder="e.g. Major Highway Collision, Cardiac Collapse"
                  value={newEvent.condition}
                  onChange={e => setNewEvent({ ...newEvent, condition: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-805 text-slate-800"
                />
              </div>

              <div>
                <label htmlFor="er-location" className="block text-xs font-bold text-slate-500 uppercase mb-1">Pick up Coordinates Location</label>
                <input
                  id="er-location"
                  type="text"
                  required
                  placeholder="e.g. Block C Metro Corner"
                  value={newEvent.location}
                  onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-850 text-slate-800"
                />
              </div>

              <div>
                <label htmlFor="er-triage" className="block text-xs font-bold text-slate-500 uppercase mb-1">Triage Protocol</label>
                <select
                  id="er-triage"
                  value={newEvent.triageColor}
                  onChange={e => setNewEvent({ ...newEvent, triageColor: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-red-600 focus:border-red-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-800"
                >
                  <option value="Red">Red (Immediate Life-Threatening)</option>
                  <option value="Yellow">Yellow (Delayed Severe)</option>
                  <option value="Green">Green (Minor Alert)</option>
                </select>
              </div>

              <div className="pt-3 border-t dark:border-slate-700 flex justify-end space-x-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold border rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer focus:ring-2 focus:ring-slate-400 focus:outline-hidden transition-all"
                  aria-label="Discard dispatch and close dialog"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:outline-hidden transition-all"
                >
                  Deploy Siren Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
