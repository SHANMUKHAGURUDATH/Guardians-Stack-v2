import React, { useState } from 'react';
import { CustomerProfile } from '../types/insurance';
import { 
  User, DollarSign, Users, Home, Shield, Target, 
  AlertCircle, CheckCircle2, RotateCcw, Plus, Trash2 
} from 'lucide-react';

interface CustomerEditor51FieldsProps {
  customer: CustomerProfile;
  onChange: (updated: CustomerProfile) => void;
  onResetOriginal: () => void;
}

type TabKey = 'personal' | 'income' | 'family' | 'loans' | 'savings' | 'goals';

export const CustomerEditor51Fields: React.FC<CustomerEditor51FieldsProps> = ({
  customer,
  onChange,
  onResetOriginal,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('personal');

  const updateField = <K extends keyof CustomerProfile>(field: K, value: CustomerProfile[K]) => {
    onChange({
      ...customer,
      [field]: value
    });
  };

  // Validation checks
  const childAgeMismatch = (customer.children_ages?.length || 0) !== (customer.num_children || 0);
  const parentAgeMismatch = (customer.dependent_parent_ages?.length || 0) !== (customer.num_dependent_parents || 0);

  // Dynamic child ages helper
  const handleAddChildAge = () => {
    const current = customer.children_ages || [];
    const newAges = [...current, 5];
    onChange({
      ...customer,
      children_ages: newAges,
      num_children: newAges.length
    });
  };

  const handleRemoveChildAge = (index: number) => {
    const current = customer.children_ages || [];
    const newAges = current.filter((_, i) => i !== index);
    onChange({
      ...customer,
      children_ages: newAges,
      num_children: newAges.length
    });
  };

  const handleUpdateChildAge = (index: number, age: number) => {
    const current = [...(customer.children_ages || [])];
    current[index] = age;
    updateField('children_ages', current);
  };

  // Dynamic parent ages helper
  const handleAddParentAge = () => {
    const current = customer.dependent_parent_ages || [];
    const newAges = [...current, 60];
    onChange({
      ...customer,
      dependent_parent_ages: newAges,
      num_dependent_parents: newAges.length
    });
  };

  const handleRemoveParentAge = (index: number) => {
    const current = customer.dependent_parent_ages || [];
    const newAges = current.filter((_, i) => i !== index);
    onChange({
      ...customer,
      dependent_parent_ages: newAges,
      num_dependent_parents: newAges.length
    });
  };

  const handleUpdateParentAge = (index: number, age: number) => {
    const current = [...(customer.dependent_parent_ages || [])];
    current[index] = age;
    updateField('dependent_parent_ages', current);
  };

  const tabs: { key: TabKey; label: string; icon: any; count?: number; hasError?: boolean }[] = [
    { key: 'personal', label: '1. Personal (1-11)', icon: User },
    { key: 'income', label: '2. Income & Budget (12-15)', icon: DollarSign },
    { key: 'family', label: '3. Family & Dependents (16-22)', icon: Users, hasError: childAgeMismatch || parentAgeMismatch },
    { key: 'loans', label: '4. Liabilities & Loans (23-38)', icon: Home },
    { key: 'savings', label: '5. Cover & Savings (39-43)', icon: Shield },
    { key: 'goals', label: '6. Risk & Goals (44-51)', icon: Target },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white shadow">
            {customer.full_name?.charAt(0) || 'C'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-100 text-sm">{customer.full_name || 'Customer Profile'}</h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                {customer.profile_id}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Editing all 51 Customer Profile parameters in real-time
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onResetOriginal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
            title="Restore original dataset values for this customer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset to Original Dataset Values</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 overflow-x-auto scrollbar-none px-2 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-3 py-2.5 text-xs font-medium rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'bg-slate-850 text-cyan-300 border-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-850/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : ''}`} />
              <span>{tab.label}</span>
              {tab.hasError && (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
              )}
            </button>
          );
        })}
      </div>

      {/* Form Content Body */}
      <div className="p-5">
        {/* TAB 1: PERSONAL INFORMATION (Fields 1-11) */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Personal Demographics</h4>
              <p className="text-[11px] text-slate-400">Fields 1 to 11: Core profile identity and geographic tiering</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">1. Profile ID</label>
                <input
                  type="text"
                  value={customer.profile_id}
                  disabled
                  className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">2. Full Name</label>
                <input
                  type="text"
                  value={customer.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  3. Age: <span className="font-bold text-cyan-400">{customer.age} years</span>
                </label>
                <input
                  type="range"
                  min="18"
                  max="65"
                  value={customer.age}
                  onChange={(e) => updateField('age', Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">4. Gender</label>
                <select
                  value={customer.gender}
                  onChange={(e) => updateField('gender', e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">5. City</label>
                <input
                  type="text"
                  value={customer.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">6. City Tier</label>
                <select
                  value={customer.city_tier}
                  onChange={(e) => updateField('city_tier', e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Tier 1">Tier 1 Metro</option>
                  <option value="Tier 2">Tier 2 City</option>
                  <option value="Tier 3">Tier 3 Town</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">7. Residency Status</label>
                <select
                  value={customer.residency_status}
                  onChange={(e) => updateField('residency_status', e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Resident Indian">Resident Indian</option>
                  <option value="NRI">Non-Resident Indian (NRI)</option>
                  <option value="PIO">Person of Indian Origin (PIO)</option>
                  <option value="OCI">Overseas Citizen of India (OCI)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">8. Country of Residence</label>
                <input
                  type="text"
                  value={customer.country_of_residence}
                  onChange={(e) => updateField('country_of_residence', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">9. Marital Status</label>
                <select
                  value={customer.marital_status}
                  onChange={(e) => updateField('marital_status', e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">10. Employment Type</label>
                <select
                  value={customer.employment_type}
                  onChange={(e) => updateField('employment_type', e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Salaried">Salaried</option>
                  <option value="Self-Employed Professional">Self-Employed Professional</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Gig Worker">Gig Worker</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">11. Occupation / Designation</label>
                <input
                  type="text"
                  value={customer.occupation}
                  onChange={(e) => updateField('occupation', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INCOME AND FINANCIAL INFORMATION (Fields 12-15) */}
        {activeTab === 'income' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Income & Cash Flow</h4>
              <p className="text-[11px] text-slate-400">Fields 12 to 15: Primary income, expected growth, and monthly budgets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">12. Annual Income (INR)</label>
                  <span className="text-xs font-bold text-cyan-400">
                    ₹{(customer.annual_income_inr || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="number"
                  step="50000"
                  value={customer.annual_income_inr}
                  onChange={(e) => updateField('annual_income_inr', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 mb-2"
                />
                <input
                  type="range"
                  min="300000"
                  max="10000000"
                  step="100000"
                  value={customer.annual_income_inr}
                  onChange={(e) => updateField('annual_income_inr', Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">₹{(customer.annual_income_inr / 100000).toFixed(1)} Lakhs / year</p>
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">13. Expected Income Growth (%/yr)</label>
                  <span className="text-xs font-bold text-emerald-400">{customer.expected_income_growth_pct}%</span>
                </div>
                <input
                  type="number"
                  step="0.5"
                  value={customer.expected_income_growth_pct}
                  onChange={(e) => updateField('expected_income_growth_pct', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 mb-2"
                />
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="0.5"
                  value={customer.expected_income_growth_pct}
                  onChange={(e) => updateField('expected_income_growth_pct', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Factor used in dynamic Human Life Value income projection</p>
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">14. Monthly Household Expenses (INR)</label>
                  <span className="text-xs font-bold text-amber-400">
                    ₹{(customer.monthly_household_expenses_inr || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="number"
                  step="5000"
                  value={customer.monthly_household_expenses_inr}
                  onChange={(e) => updateField('monthly_household_expenses_inr', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 mb-2"
                />
                <input
                  type="range"
                  min="15000"
                  max="500000"
                  step="5000"
                  value={customer.monthly_household_expenses_inr}
                  onChange={(e) => updateField('monthly_household_expenses_inr', Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Annual living expenses: ₹{((customer.monthly_household_expenses_inr || 0) * 12).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">15. Monthly Premium Budget (INR)</label>
                  <span className="text-xs font-bold text-cyan-400">
                    ₹{(customer.monthly_premium_budget_inr || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="number"
                  step="500"
                  value={customer.monthly_premium_budget_inr}
                  onChange={(e) => updateField('monthly_premium_budget_inr', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 mb-2"
                />
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="500"
                  value={customer.monthly_premium_budget_inr}
                  onChange={(e) => updateField('monthly_premium_budget_inr', Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Annual premium budget: ₹{((customer.monthly_premium_budget_inr || 0) * 12).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SPOUSE AND FAMILY INFORMATION (Fields 16-22) */}
        {activeTab === 'family' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Family &amp; Dependents</h4>
              <p className="text-[11px] text-slate-400">Fields 16 to 22: Spouse profile, children, and dependent parent ages</p>
            </div>

            {/* Validation alert banners */}
            {childAgeMismatch && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>
                  Validation Error: Child count ({customer.num_children}) does not match entered ages count ({customer.children_ages?.length || 0}). Use the dynamic editor below to synchronize.
                </span>
              </div>
            )}
            {parentAgeMismatch && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>
                  Validation Error: Dependent parent count ({customer.num_dependent_parents}) does not match entered ages count ({customer.dependent_parent_ages?.length || 0}).
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-medium text-slate-300 mb-1">16. Spouse Age</label>
                <input
                  type="number"
                  value={customer.spouse_age}
                  onChange={(e) => updateField('spouse_age', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">17. Spouse Working Status</label>
                  <p className="text-[11px] text-slate-400 mb-2">Is the spouse earning an active income?</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customer.spouse_working}
                    onChange={(e) => updateField('spouse_working', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  <span className="ml-3 text-xs font-semibold text-slate-200">
                    {customer.spouse_working ? 'Earning / Working' : 'Non-Earning / Homemaker'}
                  </span>
                </label>
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-medium text-slate-300 mb-1">18. Spouse Annual Income (INR)</label>
                <input
                  type="number"
                  step="50000"
                  disabled={!customer.spouse_working}
                  value={customer.spouse_annual_income_inr}
                  onChange={(e) => updateField('spouse_annual_income_inr', Number(e.target.value))}
                  className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-xs focus:outline-none ${
                    customer.spouse_working ? 'border-slate-700 text-slate-100 focus:border-cyan-500' : 'border-slate-800 text-slate-500'
                  }`}
                />
                <p className="text-[10px] text-slate-400 mt-1">₹{(customer.spouse_annual_income_inr / 100000).toFixed(1)} Lakhs</p>
              </div>
            </div>

            {/* Dynamic Children Ages List Editor */}
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                    <span>19 &amp; 20. Children Count ({customer.num_children}) &amp; Dynamic Ages</span>
                    {!childAgeMismatch ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Dynamic list editor. Adding or removing child age entries automatically syncs the child count.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddChildAge}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Child</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(customer.children_ages || []).map((age, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <span className="text-[11px] text-slate-400">Child #{idx + 1}:</span>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={age}
                      onChange={(e) => handleUpdateChildAge(idx, Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-slate-100 text-center"
                    />
                    <span className="text-[11px] text-slate-400">yrs</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChildAge(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/30 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {(customer.children_ages || []).length === 0 && (
                  <div className="text-xs text-slate-500 italic py-1">No dependent children recorded.</div>
                )}
              </div>
            </div>

            {/* Dynamic Dependent Parents Ages List Editor */}
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                    <span>21 &amp; 22. Dependent Parents ({customer.num_dependent_parents}) &amp; Dynamic Ages</span>
                    {!parentAgeMismatch ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Dynamic list editor for dependent parents. Synchronizes with dependency score and living fund needs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddParentAge}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Parent</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(customer.dependent_parent_ages || []).map((age, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <span className="text-[11px] text-slate-400">Parent #{idx + 1}:</span>
                    <input
                      type="number"
                      min="40"
                      max="100"
                      value={age}
                      onChange={(e) => handleUpdateParentAge(idx, Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs text-slate-100 text-center"
                    />
                    <span className="text-[11px] text-slate-400">yrs</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParentAge(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/30 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {(customer.dependent_parent_ages || []).length === 0 && (
                  <div className="text-xs text-slate-500 italic py-1">No dependent parents recorded.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: OUTSTANDING LIABILITIES AND LOANS (Fields 23-38) */}
        {activeTab === 'loans' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Outstanding Liabilities (Loans 23-38)</h4>
              <p className="text-[11px] text-slate-400">
                100% of outstanding loan liabilities are factored into Net Needs calculation to prevent debt default.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Home Loan (23-26) */}
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <h5 className="text-xs font-bold text-amber-300">Home Loan (Fields 23-26)</h5>
                  <span className="text-[11px] font-semibold text-slate-300">
                    Outstanding: ₹{(customer.home_loan_outstanding_inr || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400 block text-[10px]">23. Outstanding (INR)</label>
                    <input
                      type="number"
                      step="50000"
                      value={customer.home_loan_outstanding_inr}
                      onChange={(e) => updateField('home_loan_outstanding_inr', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px]">24. Remaining Months</label>
                    <input
                      type="number"
                      value={customer.home_loan_remaining_months}
                      onChange={(e) => updateField('home_loan_remaining_months', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px]">25. Interest Rate (% p.a.)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customer.home_loan_interest_rate_pct}
                      onChange={(e) => updateField('home_loan_interest_rate_pct', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px]">26. Monthly EMI (INR)</label>
                    <input
                      type="number"
                      step="1000"
                      value={customer.home_loan_emi_inr}
                      onChange={(e) => updateField('home_loan_emi_inr', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Car Loan (27-30) */}
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <h5 className="text-xs font-bold text-amber-300">Car Loan (Fields 27-30)</h5>
                  <span className="text-[11px] font-semibold text-slate-300">
                    Outstanding: ₹{(customer.car_loan_outstanding_inr || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400 block text-[10px]">27. Outstanding (INR)</label>
                    <input
                      type="number"
                      step="25000"
                      value={customer.car_loan_outstanding_inr}
                      onChange={(e) => updateField('car_loan_outstanding_inr', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px]">28. Remaining Months</label>
                    <input
                      type="number"
                      value={customer.car_loan_remaining_months}
                      onChange={(e) => updateField('car_loan_remaining_months', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px]">29. Interest Rate (% p.a.)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customer.car_loan_interest_rate_pct}
                      onChange={(e) => updateField('car_loan_interest_rate_pct', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px]">30. Monthly EMI (INR)</label>
                    <input
                      type="number"
                      step="500"
                      value={customer.car_loan_emi_inr}
                      onChange={(e) => updateField('car_loan_emi_inr', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Loan (31-34) */}
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <h5 className="text-xs font-bold text-amber-300">Personal Loan (Fields 31-34)</h5>
                  <span className="text-[11px] font-semibold text-slate-300">
                    Outstanding: ₹{(customer.personal_loan_outstanding_inr || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400 block text-[10px]">31. Outstanding (INR)</label>
                    <input
                      type="number"
                      step="10000"
                      value={customer.personal_loan_outstanding_inr}
                      onChange={(e) => updateField('personal_loan_outstanding_inr', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px]">32. Remaining Months</label>
                    <input
                      type="number"
                      value={customer.personal_loan_remaining_months}
                      onChange={(e) => updateField('personal_loan_remaining_months', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px]">33. Interest Rate (% p.a.)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customer.personal_loan_interest_rate_pct}
                      onChange={(e) => updateField('personal_loan_interest_rate_pct', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px]">34. Monthly EMI (INR)</label>
                    <input
                      type="number"
                      step="500"
                      value={customer.personal_loan_emi_inr}
                      onChange={(e) => updateField('personal_loan_emi_inr', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Education Loan (35-38) */}
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <h5 className="text-xs font-bold text-amber-300">Education Loan (Fields 35-38)</h5>
                  <span className="text-[11px] font-semibold text-slate-300">
                    Outstanding: ₹{(customer.education_loan_outstanding_inr || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400 block text-[10px]">35. Outstanding (INR)</label>
                    <input
                      type="number"
                      step="25000"
                      value={customer.education_loan_outstanding_inr}
                      onChange={(e) => updateField('education_loan_outstanding_inr', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px]">36. Remaining Months</label>
                    <input
                      type="number"
                      value={customer.education_loan_remaining_months}
                      onChange={(e) => updateField('education_loan_remaining_months', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px]">37. Interest Rate (% p.a.)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customer.education_loan_interest_rate_pct}
                      onChange={(e) => updateField('education_loan_interest_rate_pct', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px]">38. Monthly EMI (INR)</label>
                    <input
                      type="number"
                      step="500"
                      value={customer.education_loan_emi_inr}
                      onChange={(e) => updateField('education_loan_emi_inr', Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EXISTING PROTECTION AND SAVINGS (Fields 39-43) */}
        {activeTab === 'savings' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Existing Protection &amp; Assets (Fields 39-43)</h4>
              <p className="text-[11px] text-slate-400">
                Transparent asset recognition: We distinguish liquid emergency funds from long-term retirement savings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-medium text-slate-300 mb-1">39. Employer Group Life Cover (INR)</label>
                <input
                  type="number"
                  step="100000"
                  value={customer.employer_group_life_cover_inr}
                  onChange={(e) => updateField('employer_group_life_cover_inr', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 mb-1"
                />
                <p className="text-[10px] text-slate-400">
                  ₹{(customer.employer_group_life_cover_inr / 100000).toFixed(1)} Lakhs (Expires upon job resignation)
                </p>
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-medium text-slate-300 mb-1">40. Individual Life Cover (INR)</label>
                <input
                  type="number"
                  step="100000"
                  value={customer.individual_life_cover_inr}
                  onChange={(e) => updateField('individual_life_cover_inr', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 mb-1"
                />
                <p className="text-[10px] text-slate-400">
                  ₹{(customer.individual_life_cover_inr / 100000).toFixed(1)} Lakhs personal term/endowment policies
                </p>
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-medium text-slate-300 mb-1">41. Liquid Savings (FD, Savings Bank) (INR)</label>
                <input
                  type="number"
                  step="25000"
                  value={customer.liquid_savings_inr}
                  onChange={(e) => updateField('liquid_savings_inr', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 mb-1"
                />
                <p className="text-[10px] text-slate-400">
                  ₹{(customer.liquid_savings_inr / 100000).toFixed(1)} Lakhs (Immediately available emergency cushion)
                </p>
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-medium text-slate-300 mb-1">42. Market Investments (Equities, MF) (INR)</label>
                <input
                  type="number"
                  step="50000"
                  value={customer.market_investments_inr}
                  onChange={(e) => updateField('market_investments_inr', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 mb-1"
                />
                <p className="text-[10px] text-slate-400">
                  ₹{(customer.market_investments_inr / 100000).toFixed(1)} Lakhs (50% allocated to net needs buffer)
                </p>
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">43. Retirement Savings (EPF, PPF, NPS) (INR)</label>
                <input
                  type="number"
                  step="50000"
                  value={customer.retirement_savings_inr}
                  onChange={(e) => updateField('retirement_savings_inr', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 mb-1"
                />
                <p className="text-[10px] text-emerald-400">
                  ₹{(customer.retirement_savings_inr / 100000).toFixed(1)} Lakhs. Note: Preserved exclusively for spouse longevity; never double-counted against the life protection gap.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: GOALS AND RISK PROFILE (Fields 44-51) */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Risk, Health &amp; Preferences (Fields 44-51)</h4>
              <p className="text-[11px] text-slate-400">Underwriting boundaries, smoker rating, health disclosures, and term targets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">44. Number of Major Financial Goals</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={customer.num_goals}
                  onChange={(e) => updateField('num_goals', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">45. Smoker Status</label>
                <select
                  value={customer.smoker_status}
                  onChange={(e) => updateField('smoker_status', e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Non-Smoker">Non-Smoker (Standard Tariff)</option>
                  <option value="Smoker">Smoker (Higher Tariff Category)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  46. BMI: <span className="font-bold text-cyan-400">{customer.bmi}</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="16"
                  max="45"
                  value={customer.bmi}
                  onChange={(e) => updateField('bmi', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">47. Health Conditions &amp; Medical Disclosures</label>
                <textarea
                  rows={2}
                  value={customer.health_conditions}
                  onChange={(e) => updateField('health_conditions', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Disclose any pre-existing ailments, surgeries, diabetes, or hypertension..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">48. Risk Appetite</label>
                <select
                  value={customer.risk_appetite}
                  onChange={(e) => updateField('risk_appetite', e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Conservative">Conservative (Capital Safety)</option>
                  <option value="Moderate">Moderate (Balanced)</option>
                  <option value="Aggressive">Aggressive (Wealth Maximization)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">49. Preferred Policy Term (Years)</label>
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={customer.preferred_policy_term_years}
                  onChange={(e) => updateField('preferred_policy_term_years', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">50. Preferred Language</label>
                <input
                  type="text"
                  value={customer.preferred_language}
                  onChange={(e) => updateField('preferred_language', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">51. Profile Record Date</label>
                <input
                  type="date"
                  value={customer.profile_date}
                  onChange={(e) => updateField('profile_date', e.target.value)}
                  className="w-full md:w-64 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
