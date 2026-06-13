import React, { useState } from 'react';
import { 
  Droplet, 
  Plus, 
  Search, 
  Phone, 
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';

interface BloodDonor {
  _id: string;
  donorName: string;
  donorId: number;
  bloodType: string;
  phone: string;
  lastDonationDate: string;
  donationCount: number;
  status: 'Available' | 'Not Available';
  cost: number;
}

export function BloodDonorTab({ userRole }: { userRole: string }) {
  const [donors, setDonors] = useState<BloodDonor[]>([
    { _id: '1', donorName: 'Rajesh Kumar', donorId: 501, bloodType: 'O+', phone: '+91 9876543210', lastDonationDate: '2026-05-15', donationCount: 8, status: 'Available', cost: 500 },
    { _id: '2', donorName: 'Priya Singh', donorId: 502, bloodType: 'B+', phone: '+91 9876543211', lastDonationDate: '2026-04-20', donationCount: 5, status: 'Available', cost: 500 },
    { _id: '3', donorName: 'Amit Patel', donorId: 503, bloodType: 'AB+', phone: '+91 9876543212', lastDonationDate: '2026-06-01', donationCount: 3, status: 'Not Available', cost: 500 },
    { _id: '4', donorName: 'Neha Sharma', donorId: 504, bloodType: 'A+', phone: '+91 9876543213', lastDonationDate: '2026-03-10', donationCount: 12, status: 'Available', cost: 500 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    donorName: '',
    donorId: '',
    bloodType: 'O+',
    phone: '',
    lastDonationDate: new Date().toISOString().split('T')[0],
    donationCount: '1',
    status: 'Available'
  });

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.donorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          donor.bloodType.includes(searchTerm);
    const matchesBloodType = !filterBloodType || donor.bloodType === filterBloodType;
    return matchesSearch && matchesBloodType;
  });

  const handleAddDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.donorName || !formData.donorId) return;

    const newDonor: BloodDonor = {
      _id: String(Date.now()),
      donorName: formData.donorName,
      donorId: Number(formData.donorId),
      bloodType: formData.bloodType,
      phone: formData.phone,
      lastDonationDate: formData.lastDonationDate,
      donationCount: Number(formData.donationCount),
      status: formData.status as 'Available' | 'Not Available',
      cost: 500
    };

    setDonors([newDonor, ...donors]);
    setShowAddModal(false);
    setFormData({
      donorName: '',
      donorId: '',
      bloodType: 'O+',
      phone: '',
      lastDonationDate: new Date().toISOString().split('T')[0],
      donationCount: '1',
      status: 'Available'
    });
  };

  const handleDeleteDonor = (id: string) => {
    setDonors(prev => prev.filter(d => d._id !== id));
  };

  const getBloodTypeColor = (bloodType: string) => {
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="space-y-6" id="blood-donor-module">
      {/* Page Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Blood Donor Registry</h2>
          <p className="text-sm text-slate-500 font-medium">Manage blood donor information with affordable costs, track availability and donation history.</p>
        </div>

        {userRole === 'Admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg inline-flex items-center space-x-2 shadow-sm transition"
            id="btn-add-donor"
          >
            <Plus className="h-4 w-4" />
            <span>Add Blood Donor</span>
          </button>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1">
          <Search className="h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by donor name or blood type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none w-full"
            id="blood-donor-search"
          />
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <select
            value={filterBloodType}
            onChange={(e) => setFilterBloodType(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            id="blood-type-filter"
          >
            <option value="">All Blood Types</option>
            {bloodTypes.map(bt => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Donors Grid */}
      {filteredDonors.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center text-slate-400">
          <Droplet className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold">No blood donors match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="blood-donors-grid">
          {filteredDonors.map((donor) => (
            <div key={donor._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              {/* Blood Type Header */}
              <div className="p-5 bg-gradient-to-r from-red-50 to-pink-50 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block bg-red-100 text-red-800 text-2xl font-bold px-3 py-1 rounded-lg border border-red-300 font-mono">
                      {donor.bloodType}
                    </span>
                    <h3 className="font-bold text-slate-950 text-base mt-2">{donor.donorName}</h3>
                    <p className="text-xs text-slate-500 font-semibold">Donor ID: #{donor.donorId}</p>
                  </div>
                </div>
              </div>

              {/* Donor Details */}
              <div className="p-5 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2.5">
                  <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact</span>
                    <span className="font-mono text-slate-700 font-semibold">{donor.phone}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <Calendar className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Donation</span>
                    <span className="font-semibold text-slate-700">{donor.lastDonationDate}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Donations</span>
                    <span className="font-bold text-slate-800">{donor.donationCount}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Cost (₹)</span>
                    <span className="font-bold text-slate-800">{donor.cost}</span>
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              <div className="px-5 py-3.5 bg-white border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {donor.status === 'Available' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold text-emerald-600 text-xs">Available</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold text-amber-600 text-xs">Not Available</span>
                    </>
                  )}
                </div>
                {userRole === 'Admin' && (
                  <button
                    onClick={() => handleDeleteDonor(donor._id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete donor"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD DONOR MODAL */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 transition-opacity"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">Add Blood Donor</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-200 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddDonor} className="p-6 space-y-4 text-xs font-semibold text-slate-600">
              <div>
                <label className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Donor Name *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Donor ID *
                  </label>
                  <input 
                    type="number"
                    required
                    value={formData.donorId}
                    onChange={(e) => setFormData({ ...formData, donorId: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Blood Type *
                  </label>
                  <select 
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  >
                    {bloodTypes.map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Phone Number
                </label>
                <input 
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                  Last Donation Date
                </label>
                <input 
                  type="date"
                  value={formData.lastDonationDate}
                  onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Total Donations
                  </label>
                  <input 
                    type="number"
                    value={formData.donationCount}
                    onChange={(e) => setFormData({ ...formData, donationCount: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Status
                  </label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm"
                >
                  Add Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
