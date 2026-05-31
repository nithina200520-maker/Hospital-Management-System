import React, { useState } from 'react';
import { 
  Bed, 
  Settings, 
  LayoutList, 
  Flame, 
  DoorClosed, 
  CheckCircle, 
  UserPlus, 
  UserMinus,
  Sparkles
} from 'lucide-react';

interface HospitalBed {
  id: string;
  roomNum: string;
  type: 'ICU' | 'General Ward' | 'Private Room';
  status: 'Available' | 'Occupied' | 'Cleaning';
  assignedPatient?: string;
}

export function BedsTab({ userRole }: { userRole: string }) {
  const [filterType, setFilterType] = useState<string>('');
  const [beds, setBeds] = useState<HospitalBed[]>([
    { id: '101A', roomNum: 'ICU-101', type: 'ICU', status: 'Occupied', assignedPatient: 'John Doe' },
    { id: '101B', roomNum: 'ICU-101', type: 'ICU', status: 'Available' },
    { id: '102A', roomNum: 'ICU-102', type: 'ICU', status: 'Occupied', assignedPatient: 'Michael Johnson' },
    { id: '102B', roomNum: 'ICU-102', type: 'ICU', status: 'Cleaning' },
    
    { id: '201A', roomNum: 'GW-201', type: 'General Ward', status: 'Occupied', assignedPatient: 'Jane Smith' },
    { id: '201B', roomNum: 'GW-201', type: 'General Ward', status: 'Available' },
    { id: '201C', roomNum: 'GW-201', type: 'General Ward', status: 'Available' },
    { id: '201D', roomNum: 'GW-201', type: 'General Ward', status: 'Cleaning' },
    { id: '202A', roomNum: 'GW-202', type: 'General Ward', status: 'Occupied', assignedPatient: 'Emily Davis' },
    { id: '202B', roomNum: 'GW-202', type: 'General Ward', status: 'Available' },
    
    { id: '301A', roomNum: 'PR-301', type: 'Private Room', status: 'Occupied', assignedPatient: 'William Brown' },
    { id: '302A', roomNum: 'PR-302', type: 'Private Room', status: 'Available' },
    { id: '303A', roomNum: 'PR-303', type: 'Private Room', status: 'Available' },
    { id: '304A', roomNum: 'PR-304', type: 'Private Room', status: 'Occupied', assignedPatient: 'Linda Wilson' }
  ]);

  const [selectedBed, setSelectedBed] = useState<HospitalBed | null>(null);
  const [tempPatientName, setTempPatientName] = useState('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBed) {
        setSelectedBed(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBed]);

  const handleBedClick = (bed: HospitalBed) => {
    setSelectedBed(bed);
    setTempPatientName(bed.assignedPatient || '');
  };

  const handleSaveStatus = (status: 'Available' | 'Occupied' | 'Cleaning') => {
    if (!selectedBed) return;
    setBeds(prev => prev.map(b => {
      if (b.id === selectedBed.id) {
        return {
          ...b,
          status,
          assignedPatient: status === 'Occupied' ? (tempPatientName || 'Unknown Patient') : undefined
        };
      }
      return b;
    }));
    setSelectedBed(null);
  };

  // Compute states
  const totalCount = beds.length;
  const icuCount = beds.filter(b => b.type === 'ICU').length;
  const icuOccupied = beds.filter(b => b.type === 'ICU' && b.status === 'Occupied').length;
  const generalCount = beds.filter(b => b.type === 'General Ward').length;
  const generalOccupied = beds.filter(b => b.type === 'General Ward' && b.status === 'Occupied').length;
  const privateCount = beds.filter(b => b.type === 'Private Room').length;
  const privateOccupied = beds.filter(b => b.type === 'Private Room' && b.status === 'Occupied').length;

  const totalOccupiedCount = beds.filter(b => b.status === 'Occupied').length;
  const totalCleaningCount = beds.filter(b => b.status === 'Cleaning').length;
  const totalAvailableCount = beds.filter(b => b.status === 'Available').length;

  const filteredBeds = beds.filter(b => filterType ? b.type === filterType : true);

  return (
    <div className="space-y-6" id="beds-ward-module">
      
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bed className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Bed Allocation & Ward Layout</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Configure ICU ventilation slots, General Wards, Private Suites, and real-time hygienic cleaning statuses.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1 border rounded-lg bg-white dark:bg-slate-800 p-1" id="beds-filter-bar">
          <button
            onClick={() => setFilterType('')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer select-none transition ${!filterType ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            All Beds
          </button>
          <button
            onClick={() => setFilterType('ICU')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer select-none transition ${filterType === 'ICU' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            ICUs
          </button>
          <button
            onClick={() => setFilterType('General Ward')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer select-none transition ${filterType === 'General Ward' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            General Wards
          </button>
          <button
            onClick={() => setFilterType('Private Room')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer select-none transition ${filterType === 'Private Room' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Private Rooms
          </button>
        </div>
      </div>

      {/* Ward aggregate stats widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="bed-aggregate-widgets">
        
        {/* ICU block */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 tracking-wider">Intensive Care Units (ICU)</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">Available: {icuCount - icuOccupied} / {icuCount}</h3>
            </div>
            <span className="bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 p-2 rounded-lg">
              <Flame className="h-4 w-4" />
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: `${(icuOccupied / icuCount) * 100}%` }} />
          </div>
        </div>

        {/* General Ward block */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">General Ward Block</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">Available: {generalCount - generalOccupied} / {generalCount}</h3>
            </div>
            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg">
              <LayoutList className="h-4 w-4" />
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(generalOccupied / generalCount) * 100}%` }} />
          </div>
        </div>

        {/* Private room block */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">Private Suites / Cabins</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">Available: {privateCount - privateOccupied} / {privateCount}</h3>
            </div>
            <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 p-2 rounded-lg">
              <DoorClosed className="h-4 w-4" />
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(privateOccupied / privateCount) * 100}%` }} />
          </div>
        </div>

      </div>

      {/* Main interactive bed grid layout */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 space-y-6">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 flex items-center space-x-1.5">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Interactive Hospital Floor Allocation Model</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Status Legends: <span className="text-emerald-500 font-bold">&#9679; Available</span> | <span className="text-red-500 font-bold">&#9679; Occupied</span> | <span className="text-amber-500 font-bold">&#9679; Sanitizing/Cleaning</span>. Click on any bed slot node to release or assign care patient logs.</p>
        </div>

        {/* Bed Grid Display representation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4" id="bed-interactive-grid-box">
          {filteredBeds.map((bed) => {
            const isAvail = bed.status === 'Available';
            const isCleaning = bed.status === 'Cleaning';
            const isOccupied = bed.status === 'Occupied';

            return (
              <div
                key={bed.id}
                onClick={() => handleBedClick(bed)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition select-none flex flex-col justify-between items-center text-center relative card-layout active:scale-[0.98] ${
                  isOccupied ? 'border-red-200 bg-red-50/10 hover:bg-red-50/30 text-slate-800' :
                  isCleaning ? 'border-amber-200 bg-amber-50/10 hover:bg-amber-50/30 text-slate-850' :
                  'border-emerald-200 bg-emerald-50/10 hover:bg-emerald-50/30 text-slate-800'
                }`}
                title={`Room ${bed.roomNum} | Unit Slot ${bed.id}`}
                id={`bed-card-${bed.id}`}
              >
                <div className={`p-2.5 rounded-full ${
                  isOccupied ? 'bg-red-100 text-red-600' : 
                  isCleaning ? 'bg-amber-100 text-amber-600' : 
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  <Bed className="h-5 w-5" />
                </div>

                <div className="mt-2.5">
                  <span className="font-extrabold text-xs block dark:text-white">Bed {bed.id}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{bed.roomNum}</span>
                </div>

                <span className={`text-[9px] font-black uppercase mt-2 px-2 py-0.5 rounded-full ${
                  isOccupied ? 'bg-red-100 text-red-800' : 
                  isCleaning ? 'bg-amber-100 text-amber-800' : 
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {bed.status}
                </span>

                {bed.assignedPatient && (
                  <span className="text-[10px] font-bold text-slate-500 mt-1 truncate max-w-full">
                    👤 {bed.assignedPatient}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bed Action Popover Panel */}
      {selectedBed && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 popup-backdrop-panel transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bed-modal-title"
          aria-describedby="bed-modal-desc"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border dark:border-slate-700 overflow-hidden shadow-2xl animate-scale-up focus-visible:ring-2 focus-visible:ring-blue-600">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bed className="h-5 w-5 text-blue-400" />
                <h3 id="bed-modal-title" className="font-extrabold text-sm">Bed Allocator: Bed #{selectedBed.id}</h3>
              </div>
              <button 
                onClick={() => setSelectedBed(null)} 
                className="text-slate-400 hover:text-white transition cursor-pointer p-1.5 focus:outline-hidden focus:ring-2 focus:ring-slate-400 rounded-lg"
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <p id="bed-modal-desc" className="sr-only">Configure status and occupant registration details for Bed #{selectedBed.id}</p>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border text-xs leading-normal">
                <p className="font-bold text-slate-800 dark:text-slate-200">Room Location: <strong className="text-blue-600">{selectedBed.roomNum}</strong></p>
                <p className="text-slate-500 mt-0.5">Classification Class: <strong>{selectedBed.type}</strong></p>
              </div>

              {selectedBed.status === 'Occupied' ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase">Assigned occupant</p>
                  <div className="p-3 bg-red-50/40 rounded-lg border border-red-100 text-xs text-red-800 flex items-center justify-between">
                    <span>👤 <strong>{selectedBed.assignedPatient}</strong> is currently logged in this room bed.</span>
                    <button
                      onClick={() => handleSaveStatus('Cleaning')}
                      className="bg-white text-xs border border-red-300 font-bold px-2.5 py-1 text-red-600 rounded-md shadow-xs flex items-center space-x-1 cursor-pointer hover:bg-slate-50 transition focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                    >
                      <UserMinus className="h-3 w-3" />
                      <span>Release Bed</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="bed-occupant-name" className="block text-xs font-bold text-slate-500 uppercase mb-1">Log Patient Name (For occupancy)</label>
                    <input
                      id="bed-occupant-name"
                      type="text"
                      placeholder="e.g. Barbara Taylor (or keep blank to release)"
                      value={tempPatientName}
                      onChange={e => setTempPatientName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-800"
                    />
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-center">
                    <button
                      onClick={() => {
                        if (!tempPatientName) {
                          alert("Clinical Warning: Please provide a target patient log name to register occupancy.");
                          return;
                        }
                        handleSaveStatus('Occupied');
                      }}
                      className="bg-blue-600 text-white font-extrabold text-xs py-2.5 rounded-lg inline-flex items-center justify-center space-x-1 cursor-pointer select-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-hidden transition-all"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Release to Occupied</span>
                    </button>
                    <button
                      onClick={() => handleSaveStatus('Available')}
                      className="bg-emerald-600 text-white font-extrabold text-xs py-2.5 rounded-lg inline-flex items-center justify-center space-x-1 cursor-pointer select-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-hidden transition-all"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Set as Ready (Available)</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Ref: cluster_GW_Occupancy</span>
                <button
                  type="button"
                  onClick={() => handleSaveStatus('Cleaning')}
                  className="text-amber-600 font-bold underline cursor-pointer focus:ring-2 focus:ring-amber-500 rounded px-1"
                >
                  Send to Cleaning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
