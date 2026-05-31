import React, { useState } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  AlertTriangle, 
  ArrowUpRight, 
  RotateCcw,
  Sparkles,
  PackageCheck
} from 'lucide-react';

interface Medicine {
  _id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  expiryDate: string;
  supplier: string;
  price: number;
}

export function PharmacyTab({ userRole }: { userRole: string }) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([
    { _id: '1', name: 'Paracetamol 500mg', category: 'Analgesics', stock: 120, minStock: 20, expiryDate: '2027-12-15', supplier: 'Astra Biotech', price: 15 },
    { _id: '2', name: 'Amoxicillin 250mg', category: 'Antibiotics', stock: 8, minStock: 15, expiryDate: '2026-08-20', supplier: 'Biocon Labs', price: 45 },
    { _id: '3', name: 'Lisinopril 10mg', category: 'Cardiovascular', stock: 65, minStock: 10, expiryDate: '2026-03-10', supplier: 'Sun Pharma', price: 30 },
    { _id: '4', name: 'Metformin 500mg', category: 'Antidiabetics', stock: 140, minStock: 25, expiryDate: '2027-01-05', supplier: 'Dr. Reddy Labs', price: 20 },
    { _id: '5', name: 'Atorvastatin 20mg', category: 'Cardiovascular', stock: 3, minStock: 12, expiryDate: '2025-10-30', supplier: 'Cipla Medicines', price: 50 },
    { _id: '6', name: 'Cetirizine 10mg', category: 'Antihistamines', stock: 95, minStock: 15, expiryDate: '2028-04-11', supplier: 'Alembic Ltd', price: 12 },
    { _id: '7', name: 'Clopidogrel 75mg', category: 'Anticoagulants', stock: 0, minStock: 15, expiryDate: '2026-11-20', supplier: 'Torrent Pharma', price: 60 }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    category: 'Analgesics',
    stock: '50',
    minStock: '15',
    expiryDate: '2027-06-30',
    supplier: 'Generic Distr',
    price: '25'
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

  const handleDispense = (id: string) => {
    setMedicines(prev => prev.map(m => {
      if (m._id === id) {
        const nextStock = Math.max(0, m.stock - 1);
        return { ...m, stock: nextStock };
      }
      return m;
    }));
  };

  const handleRestock = (id: string) => {
    setMedicines(prev => prev.map(m => {
      if (m._id === id) {
        return { ...m, stock: m.stock + 20 };
      }
      return m;
    }));
  };

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name) return;
    const med: Medicine = {
      _id: String(Date.now()),
      name: newMed.name,
      category: newMed.category,
      stock: Number(newMed.stock) || 0,
      minStock: Number(newMed.minStock) || 0,
      expiryDate: newMed.expiryDate,
      supplier: newMed.supplier,
      price: Number(newMed.price) || 0
    };
    setMedicines([med, ...medicines]);
    setShowAddModal(false);
    setNewMed({
      name: '',
      category: 'Analgesics',
      stock: '50',
      minStock: '15',
      expiryDate: '2027-06-30',
      supplier: 'Generic Distr',
      price: '25'
    });
  };

  // Compute widgets
  const totalMeds = medicines.length;
  const lowStockMeds = medicines.filter(m => m.stock < m.minStock).length;
  const criticalOutOfStock = medicines.filter(m => m.stock === 0).length;

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory ? m.category === filterCategory : true;
    return matchesSearch && matchesCat;
  });

  const uniqueCategories = Array.from(new Set(medicines.map(m => m.category)));

  return (
    <div className="space-y-6" id="pharmacy-meds-section">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Pharmacy & Medical Stock Inventory</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Keep logs on pharmaceutical supply chain metrics, low stock limits, and expiry dates.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg inline-flex items-center space-x-2 shadow-xs transition cursor-pointer"
          id="btn-add-medicine"
        >
          <Plus className="h-4 w-4" />
          <span>Register Medicine</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="pharmacy-metrics-grid">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Inventory Medications</p>
            <h3 className="text-2xl font-black text-slate-950 dark:text-slate-50 mt-1">{totalMeds} Products</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <Pill className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Alerts: Stock Deficits</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{lowStockMeds} Low Stock</h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Critical Empty Stock</p>
            <h3 className="text-2xl font-black text-red-600 mt-1">{criticalOutOfStock} Depleted</h3>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-600">
            <PackageCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg w-full sm:max-w-md">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicine brand or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none w-full"
            id="pharmacy-search-inp"
          />
        </div>

        <div className="flex gap-2 items-center w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Filter Class:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none"
            id="pharmacy-class-select"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="pharmacy-meds-table">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Medicine Description</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Category Category</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Unit Cost</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Current Stock Range</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Expiration Date</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Roster Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No pharmacological records matched search keyword.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const isLow = med.stock < med.minStock;
                  const isOut = med.stock === 0;

                  return (
                    <tr key={med._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <span className={`p-1.5 rounded-lg ${isOut ? 'bg-red-100 text-red-600' : isLow ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            <Pill className="h-4 w-4" />
                          </span>
                          <div>
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">{med.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">SUP: {med.supplier}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 dark:bg-slate-900 border text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium font-mono">
                          {med.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-sm text-slate-800 dark:text-slate-200">
                        ₹{med.price}
                      </td>
                      <td className="p-4">
                        <div className="w-36">
                          <div className="flex justify-between items-center text-[10px] mb-1">
                            <span className={`font-bold ${isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-slate-500'}`}>
                              {med.stock} Units
                            </span>
                            <span className="text-slate-400">Min: {med.minStock}</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${Math.min(100, (med.stock / 150) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-mono font-medium ${new Date(med.expiryDate) < new Date() ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                          📅 {med.expiryDate}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleDispense(med._id)}
                            disabled={isOut}
                            className={`px-2 py-1 text-[11px] font-black rounded transition cursor-pointer select-none ${isOut ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border text-slate-700 dark:text-slate-300'}`}
                            title="Dispense 1 prescription unit"
                          >
                            Dispense
                          </button>
                          <button
                            onClick={() => handleRestock(med._id)}
                            className="px-2 py-1 text-[11px] font-black bg-blue-50 dark:bg-blue-900/20 border border-blue-200 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded transition cursor-pointer select-none"
                            title="Restock bulk 20 units"
                          >
                            Restock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 popup-backdrop-panel transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pharm-modal-title"
          aria-describedby="pharm-modal-desc"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full border dark:border-slate-700 overflow-hidden shadow-2xl animate-scale-up focus-visible:ring-2 focus-visible:ring-blue-600">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-blue-400" />
                <h3 id="pharm-modal-title" className="font-extrabold text-sm">Register Medicine Entry</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1.5 focus:outline-hidden focus:ring-2 focus:ring-slate-400 rounded-lg"
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            <p id="pharm-modal-desc" className="sr-only">Form to register a new medicine entry in the billing collection</p>

            <form onSubmit={handleAddMed} className="p-6 space-y-4">
              <div>
                <label htmlFor="med-name" className="block text-xs font-bold text-slate-500 uppercase mb-1">Brand Name / Chemical Formula</label>
                <input
                  id="med-name"
                  type="text"
                  required
                  placeholder="e.g. Ibuprofen 400mg"
                  value={newMed.name}
                  onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="med-category" className="block text-xs font-bold text-slate-500 uppercase mb-1">Category Category</label>
                  <select
                    id="med-category"
                    value={newMed.category}
                    onChange={e => setNewMed({ ...newMed, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-800"
                  >
                    <option value="Analgesics">Analgesics</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Antidiabetics">Antidiabetics</option>
                    <option value="Antihistamines">Antihistamines</option>
                    <option value="Anticoagulants">Anticoagulants</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="med-price" className="block text-xs font-bold text-slate-500 uppercase mb-1">Roster Price (₹)</label>
                  <input
                    id="med-price"
                    type="number"
                    value={newMed.price}
                    onChange={e => setNewMed({ ...newMed, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="med-stock" className="block text-xs font-bold text-slate-500 uppercase mb-1">Opening Stock</label>
                  <input
                    id="med-stock"
                    type="number"
                    value={newMed.stock}
                    onChange={e => setNewMed({ ...newMed, stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="med-min" className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Threshold</label>
                  <input
                    id="med-min"
                    type="number"
                    value={newMed.minStock}
                    onChange={e => setNewMed({ ...newMed, minStock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="med-expiry" className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                  <input
                    id="med-expiry"
                    type="date"
                    value={newMed.expiryDate}
                    onChange={e => setNewMed({ ...newMed, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label htmlFor="med-supplier" className="block text-xs font-bold text-slate-500 uppercase mb-1">Chemical Supplier</label>
                  <input
                    id="med-supplier"
                    type="text"
                    value={newMed.supplier}
                    onChange={e => setNewMed({ ...newMed, supplier: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold border rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer focus:ring-2 focus:ring-slate-400 focus:outline-hidden transition-all"
                  aria-label="Discard and close dialog"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-hidden transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
