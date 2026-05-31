import React, { useState, useEffect } from 'react';
import { Billing, Patient } from '../types';
import { 
  IndianRupee, 
  Plus, 
  User, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2,
  CalendarCheck
} from 'lucide-react';

interface BillingTabProps {
  userRole: 'Admin' | 'Doctor' | 'Receptionist';
  onRefreshStats: () => void;
}

export function BillingTab({ userRole, onRefreshStats }: BillingTabProps) {
  const [bills, setBills] = useState<Billing[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPending, setFilterPending] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    patientId: '',
    totalAmount: '120',
    paymentStatus: 'Pending'
  });
  const [errorLog, setErrorLog] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showGenerateModal) {
        setShowGenerateModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGenerateModal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch billing, support filtering pending
      const url = filterPending ? '/api/billing/pending' : '/api/billing';
      const billRes = await fetch(url);
      if (billRes.ok) {
        setBills(await billRes.json());
      }

      // Fetch patients for generator dropdown
      const pRes = await fetch('/api/patients');
      if (pRes.ok) {
        setPatients(await pRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterPending]);

  const handleOpenGenerate = () => {
    setFormData({
      patientId: patients[0]?._id || '',
      totalAmount: '150',
      paymentStatus: 'Pending'
    });
    setErrorLog('');
    setShowGenerateModal(true);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLog('');

    if (!formData.patientId || !formData.totalAmount) {
      setErrorLog("Validation Error: Patient reference and totalAmount are required inputs.");
      return;
    }

    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: formData.patientId,
          totalAmount: Number(formData.totalAmount),
          paymentStatus: formData.paymentStatus
        })
      });
      const result = await response.json();
      if (!response.ok) {
        setErrorLog(result.error || 'Failed to generate invoice.');
      } else {
        setShowGenerateModal(false);
        fetchData();
        onRefreshStats();
      }
    } catch (err: any) {
      setErrorLog(err.message || 'Server error.');
    }
  };

  const handleSettlePayment = async (id: string) => {
    try {
      const response = await fetch(`/api/billing/${id}/pay`, {
        method: 'PUT'
      });
      if (response.ok) {
        fetchData();
        onRefreshStats();
      } else {
        const result = await response.json();
        alert(result.error || 'Settle payment failed.');
      }
    } catch (e) {
      alert('Network issue settling billing item.');
    }
  };

  // Stats calculation on the current filter
  const pendingTotal = bills.filter(b => b.paymentStatus === 'Pending').reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="space-y-6" id="billing-module">
      
      {/* Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Billing System & Invoices Directory</h2>
          <p className="text-sm text-slate-500 font-medium font-semibold">Generate new patient accounts, trace invoice parameters, or settle pending charges.</p>
        </div>

        <button 
          onClick={handleOpenGenerate}
          disabled={patients.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm px-4 py-2.5 rounded-lg inline-flex items-center space-x-2 shadow-sm transition"
          id="btn-generate-bill"
        >
          <IndianRupee className="h-4 w-4" />
          <span>Generate Invoice</span>
        </button>
      </div>

      {/* Filter and Pending Sum alert widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Toggle Filter Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between col-span-1 md:col-span-2">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Status Filtration</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">Showing {filterPending ? 'outstanding Pending bills' : 'all database billing ledger items'}</p>
            </div>
          </div>
          
          <button
            onClick={() => setFilterPending(!filterPending)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
              filterPending 
                ? 'bg-amber-50 border-amber-200 text-amber-700 font-extrabold shadow-sm' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
            id="toggle-pending-bills"
          >
            {filterPending ? 'Show All Bills' : 'Filter Pending Payments'}
          </button>
        </div>

        {/* Outstanding Total Balance */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Outstanding Total</p>
            <h3 className="text-2xl font-extrabold text-amber-900 mt-1">₹{pendingTotal}</h3>
          </div>
          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
        </div>

      </div>

      {/* Main Billing Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="billing-table-container">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-mono">Running aggregation billing search...</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <IndianRupee className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold">No invoices matched the current filtration criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-mono">Invoice reference</th>
                  <th className="py-4 px-6">Patient Reference</th>
                  <th className="py-4 px-6 text-right">Invoiced Amount</th>
                  <th className="py-4 px-6 text-center">Settlement Status</th>
                  <th className="py-2 px-6 text-center">Settlement Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {bills.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-6 font-mono text-xs font-bold text-slate-500">
                      #{b._id?.substring(0, 12)}...
                    </td>

                    <td className="py-3 px-6">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-400" />
                        <div>
                          <p className="font-bold text-slate-800">{b.patient?.patientName || 'Deleted Patient'}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">ID: #{b.patient?.patientId || 'N/A'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-6 text-right font-extrabold text-slate-950 font-mono">
                      ₹{b.totalAmount}
                    </td>

                    <td className="py-3 px-6 text-center">
                      {b.paymentStatus === 'Paid' ? (
                        <span className="inline-flex items-center space-x-1 font-bold text-[10px] uppercase tracking-wider bg-green-50 border border-green-200 text-green-800 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span>settled</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSettlePayment(b._id)}
                          className="inline-flex items-center space-x-1 font-bold text-[10px] uppercase tracking-wider bg-amber-50 border border-amber-200 hover:bg-amber-100/70 text-amber-800 px-3 py-1.5 rounded-lg shadow-xs transition"
                          title="Click here to lodge transaction details"
                        >
                          <AlertCircle className="h-3 w-3 text-amber-600" />
                          <span>pending pay</span>
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-6 text-center font-mono text-xs text-slate-500">
                      {b.paymentDate ? (
                        <div className="flex items-center justify-center space-x-1">
                          <CalendarCheck className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(b.paymentDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unresolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GENERATE BILL MODAL */}
      {showGenerateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="billing-modal-title"
          aria-describedby="billing-modal-desc"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden focus-visible:ring-2 focus-visible:ring-blue-600">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 id="billing-modal-title" className="font-bold text-lg text-white">Generate Patient Bill</h3>
                <p id="billing-modal-desc" className="text-xs text-slate-400 font-mono">Collection Name: billing</p>
              </div>
              <button 
                onClick={() => setShowGenerateModal(false)} 
                className="text-slate-400 hover:text-white p-1.5 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-400 focus:bg-slate-800/50 transition-all"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-6 space-y-4 text-xs font-semibold text-slate-600">
              {errorLog && (
                <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200" role="alert">
                  <p className="font-mono text-[11px] leading-relaxed">{errorLog}</p>
                </div>
              )}

              <div>
                <label htmlFor="bill-recipient-id" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Recipient Patient Record *
                </label>
                <select 
                  id="bill-recipient-id"
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
                <label htmlFor="bill-total-amount" className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Invoiced Total Amount (₹) *
                </label>
                <input 
                  id="bill-total-amount"
                  type="number"
                  required
                  placeholder="e.g. 150"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  className="w-full text-sm font-mono bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden focus:bg-white transition-all"
                />
              </div>

              <div>
                <span className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Initial Settlement Status
                </span>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="paymentStatus" 
                      value="Pending" 
                      checked={formData.paymentStatus === 'Pending'}
                      onChange={() => setFormData({ ...formData, paymentStatus: 'Pending' })}
                      className="text-blue-600 focus:ring-2 focus:ring-blue-600 cursor-pointer"
                    />
                    <span>Pending Pay</span>
                  </label>

                  <label className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="paymentStatus" 
                      value="Paid" 
                      checked={formData.paymentStatus === 'Paid'}
                      onChange={() => setFormData({ ...formData, paymentStatus: 'Paid' })}
                      className="text-emerald-600 focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    />
                    <span className="text-emerald-700">Paid immediately</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-sm hover:bg-slate-50 focus:ring-2 focus:ring-slate-400 focus:outline-hidden transition-all"
                  aria-label="Cancel and close dialog"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-hidden transition-all"
                >
                  Submit Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
