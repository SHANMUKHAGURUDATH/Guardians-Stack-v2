import React, { useState, useMemo } from 'react';
import { CustomerProfile } from '../types/insurance';
import { Search, Plus, Filter, UserCheck, X, Sparkles, AlertCircle } from 'lucide-react';

interface CustomerSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  customerProfiles: CustomerProfile[];
  selectedProfileId: string;
  onSelectCustomer: (profile: CustomerProfile) => void;
  onCreateNewCustomer: () => void;
  onResetToDatasetOriginals: () => void;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  isOpen,
  onClose,
  customerProfiles,
  selectedProfileId,
  onSelectCustomer,
  onCreateNewCustomer,
  onResetToDatasetOriginals,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedEmployment, setSelectedEmployment] = useState<string>('ALL');

  const filteredProfiles = useMemo(() => {
    return customerProfiles.filter((p) => {
      const matchesSearch =
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.profile_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.occupation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTier = selectedTier === 'ALL' || p.city_tier === selectedTier;
      const matchesEmp = selectedEmployment === 'ALL' || p.employment_type === selectedEmployment;

      return matchesSearch && matchesTier && matchesEmp;
    });
  }, [customerProfiles, searchTerm, selectedTier, selectedEmployment]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>Customer Intelligence Profile Selector</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  {customerProfiles.length} Total Records
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Select from verified benchmark dataset profiles or create custom client profiles.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, ID (e.g. CUST-0012), city, or occupation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All City Tiers</option>
              <option value="Tier 1">Tier 1 Metros</option>
              <option value="Tier 2">Tier 2 Cities</option>
              <option value="Tier 3">Tier 3 Towns</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedEmployment}
              onChange={(e) => setSelectedEmployment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Employment Types</option>
              <option value="Salaried">Salaried</option>
              <option value="Self-Employed Professional">Self-Employed Professional</option>
              <option value="Business Owner">Business Owner</option>
              <option value="Gig Worker">Gig Worker</option>
            </select>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="px-5 py-2.5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="text-slate-400">
            Showing <span className="font-semibold text-slate-200">{filteredProfiles.length}</span> profiles
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onResetToDatasetOriginals();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium transition-colors flex items-center space-x-1.5"
              title="Restores original dataset records"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset to Dataset Originals</span>
            </button>
            <button
              onClick={() => {
                onCreateNewCustomer();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Profile</span>
            </button>
          </div>
        </div>

        {/* Profile List Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredProfiles.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-slate-500">
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No profiles found matching search filters.</p>
            </div>
          ) : (
            filteredProfiles.map((p) => {
              const isSelected = p.profile_id === selectedProfileId;
              const totalLiabilities =
                (p.home_loan_outstanding_inr || 0) +
                (p.car_loan_outstanding_inr || 0) +
                (p.personal_loan_outstanding_inr || 0) +
                (p.education_loan_outstanding_inr || 0);

              return (
                <div
                  key={p.profile_id}
                  onClick={() => {
                    onSelectCustomer(p);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative text-left ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-850 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950">
                      ACTIVE
                    </span>
                  )}
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-cyan-400 shrink-0">
                      {p.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 pr-12">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-100 truncate">{p.full_name}</h4>
                        <span className="text-[10px] font-mono text-slate-400">({p.profile_id})</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {p.occupation} • {p.city} ({p.city_tier})
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px] pt-2 border-t border-slate-800">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Income</span>
                          <span className="font-semibold text-slate-200">
                            ₹{(p.annual_income_inr / 100000).toFixed(1)}L
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Liabilities</span>
                          <span className={`font-semibold ${totalLiabilities > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                            ₹{(totalLiabilities / 100000).toFixed(1)}L
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Dependents</span>
                          <span className="font-semibold text-slate-200">
                            {(p.num_children || 0) + (p.num_dependent_parents || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
