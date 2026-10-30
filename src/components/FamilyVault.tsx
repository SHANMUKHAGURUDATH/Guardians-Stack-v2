import React, { useState } from 'react';
import { CustomerProfile } from '../types/insurance';
import { 
  Lock, Shield, FileCheck, Users, Clock, AlertTriangle, 
  Plus, CheckCircle2, Download, Eye, KeyRound 
} from 'lucide-react';

interface FamilyVaultProps {
  customer: CustomerProfile;
}

export const FamilyVault: React.FC<FamilyVaultProps> = ({ customer }) => {
  const [activeTab, setActiveTab] = useState<'policies' | 'beneficiaries' | 'documents'>('policies');

  const policies = [
    {
      id: 'POL-IND-88219',
      name: 'Max Protect Pure Term Plan',
      type: 'Individual Life Insurance',
      sumAssured: customer.individual_life_cover_inr || 7500000,
      annualPremium: 14200,
      renewalDate: '2026-11-15',
      status: 'Active',
      insurer: 'Guardian Life Assurance',
      nominee: customer.marital_status === 'Married' ? 'Spouse (100%)' : 'Parents (100%)',
    },
    {
      id: 'POL-CORP-49210',
      name: 'Group Term Life (Corporate Benefit)',
      type: 'Employer Group Cover',
      sumAssured: customer.employer_group_life_cover_inr || 5000000,
      annualPremium: 0,
      renewalDate: '2027-03-31',
      status: 'Active',
      insurer: 'Corporate Group Underwriters',
      nominee: 'Primary Nominee on HR File',
    },
    {
      id: 'POL-HLTH-11928',
      name: 'Optima Comprehensive Family Floater',
      type: 'Health Insurance',
      sumAssured: 1500000,
      annualPremium: 22400,
      renewalDate: '2027-01-20',
      status: 'Active',
      insurer: 'Star Care Health',
      nominee: 'Self & Dependent Family',
    }
  ];

  const beneficiaries = [
    {
      name: customer.marital_status === 'Married' ? 'Spouse' : 'Father / Mother',
      relation: customer.marital_status === 'Married' ? 'Spouse' : 'Parent',
      allocationPct: 70,
      status: 'Verified (KYC Done)',
      contact: '+91 98*** **412',
    },
    {
      name: customer.num_children > 0 ? 'Child (Minor Trust)' : 'Sibling / Co-Nominee',
      relation: customer.num_children > 0 ? 'Child' : 'Sibling',
      allocationPct: 30,
      status: 'Verified',
      contact: '+91 94*** **881',
    }
  ];

  const documents = [
    { name: 'Original Policy Bond PDF', type: 'Insurance Contract', size: '2.4 MB', date: '2024-04-12', verified: true },
    { name: 'Aadhaar / ID Verification Proof', type: 'KYC Document', size: '1.1 MB', date: '2025-01-10', verified: true },
    { name: 'Tele-MER Medical Underwriting Record', type: 'Clinical Report', size: '3.8 MB', date: '2024-04-05', verified: true },
    { name: 'Married Women Property Act (MWPA) Addendum', type: 'Legal Protection Deed', size: '1.5 MB', date: '2024-04-15', verified: true },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-100">Family Vault &amp; Digital Policy Locker</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                AES-256 ENCRYPTED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Centralized secure repository for all policies, verified beneficiaries, and legal claim deeds.
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('New policy upload dialog opened')}
          className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Policy Contract</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'policies'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/60 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Policies ({policies.length})
        </button>
        <button
          onClick={() => setActiveTab('beneficiaries')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'beneficiaries'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/60 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Beneficiaries &amp; Nominees ({beneficiaries.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'documents'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/60 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Encrypted Vault Documents ({documents.length})
        </button>
      </div>

      {/* Policies List */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {policies.map((pol) => (
            <div key={pol.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  {pol.id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {pol.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-100">{pol.name}</h4>
                <p className="text-[11px] text-slate-400">{pol.insurer}</p>
              </div>

              <div className="p-3 bg-slate-850 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Sum Assured:</span>
                  <span className="font-bold text-white">₹{(pol.sumAssured / 100000).toFixed(1)} Lakhs</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Next Renewal:</span>
                  <span className="font-medium text-slate-200">{pol.renewalDate}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Nominee:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[130px]">{pol.nominee}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
                <span>Annual Due: ₹{pol.annualPremium.toLocaleString('en-IN')}</span>
                <button className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px]">View Bond →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Beneficiaries List */}
      {activeTab === 'beneficiaries' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Verified Legal Beneficiary Allocations (Total 100%)
            </h4>
            <span className="text-[10px] text-emerald-400 font-bold">100% Allocated</span>
          </div>

          <div className="space-y-3">
            {beneficiaries.map((b, idx) => (
              <div key={idx} className="p-4 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-100 text-sm">{b.name}</div>
                  <div className="text-[11px] text-slate-400">{b.relation} • Contact: {b.contact}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {b.status}
                  </span>
                  <span className="text-lg font-black text-cyan-400">{b.allocationPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents List */}
      {activeTab === 'documents' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          {documents.map((doc, idx) => (
            <div key={idx} className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-slate-200">{doc.name}</div>
                  <div className="text-[10px] text-slate-400">{doc.type} • {doc.size} • Verified on {doc.date}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
