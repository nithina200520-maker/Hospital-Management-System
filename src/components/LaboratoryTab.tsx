import React, { useState } from 'react';
import { 
  FlaskConical, 
  Search, 
  Plus, 
  FileText, 
  Download, 
  Share2, 
  CheckCircle, 
  ClipboardList, 
  Loader2 
} from 'lucide-react';

interface LabTest {
  _id: string;
  patientName: string;
  testName: string;
  department: string;
  status: 'Pending' | 'Sample Collected' | 'Completed' | 'Cancelled';
  assignedDoctor: string;
  requestedDate: string;
  results?: {
    parameter: string;
    value: string;
    normalRange: string;
    unit: string;
    flag: 'Normal' | 'High' | 'Low';
  }[];
}

export function LaboratoryTab({ userRole }: { userRole: string }) {
  const [search, setSearch] = useState('');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [tests, setTests] = useState<LabTest[]>([
    {
      _id: 'L01',
      patientName: 'John Doe',
      testName: 'Complete Blood Count (CBC)',
      department: 'Hematology',
      status: 'Completed',
      assignedDoctor: 'Dr. Elizabeth Blackwell',
      requestedDate: '2026-05-28',
      results: [
        { parameter: 'White Blood Cell (WBC)', value: '7.2', normalRange: '4.5 - 11.0', unit: 'x10^3/µL', flag: 'Normal' },
        { parameter: 'Red Blood Cell (RBC)', value: '4.8', normalRange: '4.3 - 5.9', unit: 'x10^6/µL', flag: 'Normal' },
        { parameter: 'Hemoglobin (Hgb)', value: '11.8', normalRange: '13.5 - 17.5', unit: 'g/dL', flag: 'Low' },
        { parameter: 'Platelets', value: '250', normalRange: '150 - 450', unit: 'x10^3/µL', flag: 'Normal' }
      ]
    },
    {
      _id: 'L02',
      patientName: 'Jane Smith',
      testName: 'Lipid Profile',
      department: 'Biochemistry',
      status: 'Sample Collected',
      assignedDoctor: 'Dr. Edward Jenner',
      requestedDate: '2026-05-30'
    },
    {
      _id: 'L03',
      patientName: 'Michael Johnson',
      testName: 'HbA1c (Glycated Hemoglobin)',
      department: 'Endocrinology',
      status: 'Pending',
      assignedDoctor: 'Dr. René Laennec',
      requestedDate: '2026-05-31'
    },
    {
      _id: 'L04',
      patientName: 'Emily Davis',
      testName: 'MRI Brain Contrast',
      department: 'Radiology',
      status: 'Completed',
      assignedDoctor: 'Dr. Sigmund Freud',
      requestedDate: '2026-05-25',
      results: [
        { parameter: 'Brain Parenchyma', value: 'Normal outline, no infarct sign', normalRange: 'Unremarkable', unit: 'String', flag: 'Normal' },
        { parameter: 'Ventricular Organs', value: 'Symmetric, standard size', normalRange: 'Unremarkable', unit: 'String', flag: 'Normal' }
      ]
    },
    {
      _id: 'L05',
      patientName: 'William Brown',
      testName: 'Renal Function Test (RFT)',
      department: 'Biochemistry',
      status: 'Pending',
      assignedDoctor: 'Dr. Edward Jenner',
      requestedDate: '2026-05-31'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    patientName: '',
    testName: 'Complete Blood Count (CBC)',
    department: 'Hematology',
    assignedDoctor: 'Dr. Elizabeth Blackwell'
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

  const handleCollectSample = (id: string) => {
    setTests(prev => prev.map(t => {
      if (t._id === id) {
        return { ...t, status: 'Sample Collected' };
      }
      return t;
    }));
  };

  const handleCompleteTest = (id: string) => {
    setTests(prev => prev.map(t => {
      if (t._id === id) {
        return {
          ...t,
          status: 'Completed',
          results: [
            { parameter: 'Glucose Fasting', value: '142', normalRange: '70 - 100', unit: 'mg/dL', flag: 'High' },
            { parameter: 'Creatinine Serum', value: '1.1', normalRange: '0.6 - 1.2', unit: 'mg/dL', flag: 'Normal' },
            { parameter: 'Urea Kidney', value: '18', normalRange: '7 - 20', unit: 'mg/dL', flag: 'Normal' }
          ]
        };
      }
      return t;
    }));
  };

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.patientName) return;

    const test: LabTest = {
      _id: 'L' + String(tests.length + 1).padStart(2, '0'),
      patientName: newRequest.patientName,
      testName: newRequest.testName,
      department: newRequest.department,
      status: 'Pending',
      assignedDoctor: newRequest.assignedDoctor,
      requestedDate: new Date().toISOString().slice(0, 10)
    };

    setTests([test, ...tests]);
    setShowAddModal(false);
    setNewRequest({
      patientName: '',
      testName: 'Complete Blood Count (CBC)',
      department: 'Hematology',
      assignedDoctor: 'Dr. Elizabeth Blackwell'
    });
  };

  const filteredTests = tests.filter(t => 
    t.patientName.toLowerCase().includes(search.toLowerCase()) || 
    t.testName.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" id="lab-tab-section">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Pathology Laboratory & Diagnostics</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Coordinate test requests, record specimen samples, and review high-integrity bio-results on-screen.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg inline-flex items-center space-x-2 shadow-xs transition cursor-pointer"
          id="btn-order-lab-test"
        >
          <Plus className="h-4 w-4" />
          <span>Request Diagnostic Test</span>
        </button>
      </div>

      {/* Grid Layout containing test list and dynamic report visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="laboratory-split-layout">
        
        {/* Left 2 columns - Tests list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by patient name, diagnostics test or unit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none w-full"
                id="lab-search-inp"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-700" id="lab-items-box">
              {filteredTests.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No laboratory records matched matching keys.
                </div>
              ) : (
                filteredTests.map((test) => {
                  const isPending = test.status === 'Pending';
                  const isSample = test.status === 'Sample Collected';
                  const isCompleted = test.status === 'Completed';

                  return (
                    <div 
                      key={test._id} 
                      onClick={() => test.status === 'Completed' && setSelectedTest(test)}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition select-none ${isCompleted ? 'cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-700/30' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className={`p-2 rounded-xl mt-0.5 ${isCompleted ? 'bg-emerald-50 text-emerald-600' : isSample ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-500'}`}>
                          <FlaskConical className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-sm text-slate-950 dark:text-slate-50">{test.patientName}</span>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.2 rounded text-slate-500 font-mono">#{test._id}</span>
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs block mt-1">{test.testName}</span>
                          <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">Dept: {test.department} | Req: {test.assignedDoctor}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {/* Status badge */}
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                          isCompleted ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400' : 
                          isSample ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400' : 
                          'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400'
                        }`}>
                          {test.status}
                        </span>

                        {/* Interactive flow actions */}
                        <div className="flex space-x-1.5" onClick={e => e.stopPropagation()}>
                          {isPending && (
                            <button
                              onClick={() => handleCollectSample(test._id)}
                              className="px-2.5 py-1 text-[10px] font-black bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded cursor-pointer transition select-none"
                            >
                              Collect Specimen
                            </button>
                          )}
                          {isSample && (
                            <button
                              onClick={() => handleCompleteTest(test._id)}
                              className="px-2.5 py-1 text-[10px] font-black bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded cursor-pointer transition select-none"
                            >
                              Log Results
                            </button>
                          )}
                          {isCompleted && (
                            <button
                              onClick={() => setSelectedTest(test)}
                              className="px-2.5 py-1 text-[10px] font-black bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded border cursor-pointer transition select-none flex items-center space-x-1"
                              title="Review medical diagnostic document"
                            >
                              <FileText className="h-3 w-3" />
                              <span>View Report</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 column - Report Viewer Preview (Real-time dynamic display) */}
        <div className="space-y-4" id="lab-report-viewer-panel">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 overflow-hidden relative">
            <div className="p-3 bg-blue-50 dark:bg-slate-900 border-b dark:border-slate-700 -mx-6 -mt-6 mb-4 flex items-center space-x-2">
              <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">Interactive Report Board</span>
            </div>

            {selectedTest ? (
              <div className="space-y-6 animate-fade-in" id="report-view-doc">
                {/* Header info */}
                <div className="text-center border-b pb-4 space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-tight">Nithin diagnostic cluster</h4>
                  <p className="text-[10px] font-mono text-slate-400">Pathology Labs, ISO 9001 Alignment</p>
                  <div className="text-[11px] font-semibold text-slate-500 pt-1 flex justify-between">
                    <span>Patient: <strong>{selectedTest.patientName}</strong></span>
                    <span>No: <strong>#{selectedTest._id}</strong></span>
                  </div>
                </div>

                {/* Patient specifics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold border-b pb-3 text-slate-500">
                  <div>Test: <span className="text-slate-800 dark:text-slate-200 font-bold block">{selectedTest.testName}</span></div>
                  <div>Date: <span className="text-slate-800 dark:text-slate-200 font-bold block">{selectedTest.requestedDate}</span></div>
                  <div>MD: <span className="text-slate-800 dark:text-slate-200 font-bold block">{selectedTest.assignedDoctor}</span></div>
                  <div>Unit: <span className="text-slate-800 dark:text-slate-200 font-bold block">Certified BioLabs</span></div>
                </div>

                {/* Parameter details */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Observed Bio-Parameters:</p>
                  <div className="space-y-2">
                    {selectedTest.results?.map((res, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{res.parameter}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Normal range: {res.normalRange} ({res.unit})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-50 block">{res.value}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            res.flag === 'High' ? 'bg-red-100 text-red-600' : 
                            res.flag === 'Low' ? 'bg-amber-100 text-amber-600' : 
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            {res.flag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t flex gap-2">
                  <button 
                    onClick={() => {
                      alert("Successfully simulated report compile to PDF! Ready to download.");
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs py-2 rounded-lg inline-flex items-center justify-center space-x-1 cursor-pointer transition select-none"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download (PDF)</span>
                  </button>
                  <button
                    onClick={() => {
                      alert(`Mock Shared! Copied report details for ${selectedTest.patientName} to clipboard!`);
                      navigator.clipboard.writeText(`Lab Report For ${selectedTest.patientName} (${selectedTest.testName}): Completed on ${selectedTest.requestedDate}.`);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-900 dark:text-white border px-3 py-2 rounded-lg inline-flex items-center justify-center cursor-pointer transition"
                    title="Copy details link"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-3" id="blank-report-viewer">
                <FileText className="h-10 w-10 text-slate-350 mx-auto" strokeWidth={1.5} />
                <p className="text-xs leading-relaxed">No completed diagnostic report selected. Click "<strong>View Report</strong>" on any completed test record to render diagnostic detail logs.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 popup-backdrop-panel transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lab-modal-title"
          aria-describedby="lab-modal-desc"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border dark:border-slate-700 overflow-hidden shadow-2xl animate-scale-up focus-visible:ring-2 focus-visible:ring-blue-600">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FlaskConical className="h-5 w-5 text-blue-400" />
                <h3 id="lab-modal-title" className="font-extrabold text-sm">Order Pathology Test</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-white transition cursor-pointer p-1.5 focus:outline-hidden focus:ring-2 focus:ring-slate-400 rounded-lg"
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <p id="lab-modal-desc" className="sr-only">Form to place a new pathology laboratory test order</p>

            <form onSubmit={handleAddRequest} className="p-6 space-y-4">
              <div>
                <label htmlFor="lab-patient-name" className="block text-xs font-bold text-slate-500 uppercase mb-1">Patient Name</label>
                <input
                  id="lab-patient-name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newRequest.patientName}
                  onChange={e => setNewRequest({ ...newRequest, patientName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-800"
                />
              </div>

              <div>
                <label htmlFor="lab-test-profile" className="block text-xs font-bold text-slate-500 uppercase mb-1">Test Panel Profile</label>
                <select
                  id="lab-test-profile"
                  value={newRequest.testName}
                  onChange={e => {
                    let dept = 'Biochemistry';
                    if (e.target.value.includes('Count')) dept = 'Hematology';
                    if (e.target.value.includes('MRI') || e.target.value.includes('Ray')) dept = 'Radiology';
                    if (e.target.value.includes('HbA1c')) dept = 'Endocrinology';
                    setNewRequest({ ...newRequest, testName: e.target.value, department: dept });
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-800"
                >
                  <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                  <option value="Lipid Profile">Lipid Profile</option>
                  <option value="HbA1c (Glycated Hemoglobin)">HbA1c (Glycated Hemoglobin)</option>
                  <option value="Renal Function Test (RFT)">Renal Function Test (RFT)</option>
                  <option value="MRI Brain Contrast">MRI Brain Contrast</option>
                  <option value="Unilateral Chest Chest X-Ray">Unilateral Chest Chest X-Ray</option>
                </select>
              </div>

              <div>
                <label htmlFor="lab-dept" className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Laboratory Department</label>
                <input
                  id="lab-dept"
                  type="text"
                  disabled
                  value={newRequest.department}
                  className="w-full px-3 py-2 border bg-slate-50 dark:bg-slate-900 rounded-lg text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="lab-physician" className="block text-xs font-bold text-slate-500 uppercase mb-1">Referencing Staff Physician</label>
                <select
                  id="lab-physician"
                  value={newRequest.assignedDoctor}
                  onChange={e => setNewRequest({ ...newRequest, assignedDoctor: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-800"
                >
                  <option value="Dr. Elizabeth Blackwell">Dr. Elizabeth Blackwell (Cardiology)</option>
                  <option value="Dr. René Laennec">Dr. René Laennec (Pediatrics)</option>
                  <option value="Dr. Edward Jenner">Dr. Edward Jenner (General Medicine)</option>
                  <option value="Dr. Sigmund Freud">Dr. Sigmund Freud (Neurology)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t dark:border-slate-700 text-right">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold border rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer focus:ring-2 focus:ring-slate-400 focus:outline-hidden transition-all"
                  aria-label="Cancel and close dialog"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-hidden transition-all"
                >
                  Issue Order Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
