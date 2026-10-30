import React, { useState } from 'react';
import { CustomerProfile, ActuarialAnalysis, SavedScenario } from '../types/insurance';
import { calculateActuarialMetrics } from '../utils/actuarialEngine';
import { 
  Sliders, ArrowRight, RotateCcw, Save, Trash2, 
  TrendingUp, TrendingDown, Plus, Minus, AlertCircle, CheckCircle2 
} from 'lucide-react';

interface ScenarioSimulatorProps {
  originalCustomer: CustomerProfile;
  originalAnalysis: ActuarialAnalysis;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  originalCustomer,
  originalAnalysis,
}) => {
  const [simulatedCustomer, setSimulatedCustomer] = useState<CustomerProfile>({ ...originalCustomer });
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [scenarioName, setScenarioName] = useState('Income Growth +20% & New Child');

  const simulatedAnalysis = calculateActuarialMetrics(simulatedCustomer);

  const formatInr = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Quick preset triggers
  const applyPreset = (preset: string) => {
    const updated = { ...simulatedCustomer };
    if (preset === 'INCOME_UP_20') {
      updated.annual_income_inr = Math.round(originalCustomer.annual_income_inr * 1.2 / 50000) * 50000;
    } else if (preset === 'INCOME_DOWN_30') {
      updated.annual_income_inr = Math.round(originalCustomer.annual_income_inr * 0.7 / 50000) * 50000;
    } else if (preset === 'ADD_CHILD') {
      const childCount = (originalCustomer.num_children || 0) + 1;
      const ages = [...(originalCustomer.children_ages || []), 1];
      updated.num_children = childCount;
      updated.children_ages = ages;
    } else if (preset === 'NEW_HOME_LOAN_50L') {
      updated.home_loan_outstanding_inr = (originalCustomer.home_loan_outstanding_inr || 0) + 5000000;
      updated.home_loan_remaining_months = 240;
      updated.home_loan_interest_rate_pct = 8.5;
      updated.home_loan_emi_inr = (originalCustomer.home_loan_emi_inr || 0) + 43400;
    } else if (preset === 'CLEAR_ALL_DEBT') {
      updated.home_loan_outstanding_inr = 0;
      updated.home_loan_emi_inr = 0;
      updated.car_loan_outstanding_inr = 0;
      updated.car_loan_emi_inr = 0;
      updated.personal_loan_outstanding_inr = 0;
      updated.personal_loan_emi_inr = 0;
      updated.education_loan_outstanding_inr = 0;
      updated.education_loan_emi_inr = 0;
    } else if (preset === 'RESET') {
      setSimulatedCustomer({ ...originalCustomer });
      return;
    }
    setSimulatedCustomer(updated);
  };

  const handleSaveScenario = () => {
    const newScenario: SavedScenario = {
      id: `SCEN-${Date.now().toString(36).toUpperCase()}`,
      name: scenarioName || `Scenario #${savedScenarios.length + 1}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      profileDelta: simulatedCustomer,
      analysisResult: simulatedAnalysis,
    };
    setSavedScenarios([...savedScenarios, newScenario]);
    setScenarioName('');
  };

  const handleDeleteScenario = (id: string) => {
    setSavedScenarios(savedScenarios.filter(s => s.id !== id));
  };

  const handleLoadScenario = (s: SavedScenario) => {
    setSimulatedCustomer({ ...originalCustomer, ...s.profileDelta } as CustomerProfile);
  };

  // Compute deltas
  const hlvDelta = simulatedAnalysis.humanLifeValue - originalAnalysis.humanLifeValue;
  const gapDelta = simulatedAnalysis.coverageGap - originalAnalysis.coverageGap;
  const liabDelta = simulatedAnalysis.totalLiabilities - originalAnalysis.totalLiabilities;

  return (
    <div className="space-y-6">
      {/* Header & Quick Simulation Presets */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Actuarial 'What-If' Scenario Simulation Sandbox</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Stress-test financial shocks, salary hikes, new dependents, or major debt acquisitions in real time.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => applyPreset('RESET')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Sandbox</span>
            </button>
          </div>
        </div>

        {/* Preset Buttons Bar */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-slate-400 self-center text-[11px] mr-1">Quick Presets:</span>
          <button
            onClick={() => applyPreset('INCOME_UP_20')}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60"
          >
            +20% Salary Increment
          </button>
          <button
            onClick={() => applyPreset('INCOME_DOWN_30')}
            className="px-2.5 py-1 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60"
          >
            −30% Career Hiatus / Pay Cut
          </button>
          <button
            onClick={() => applyPreset('ADD_CHILD')}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-900/60"
          >
            +1 Newborn Dependent Child
          </button>
          <button
            onClick={() => applyPreset('NEW_HOME_LOAN_50L')}
            className="px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60"
          >
            +₹50L New Home Mortgage
          </button>
          <button
            onClick={() => applyPreset('CLEAR_ALL_DEBT')}
            className="px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 hover:bg-indigo-900/60"
          >
            Extinguish All Loans (Debt-Free)
          </button>
        </div>
      </div>

      {/* Delta Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* HLV Comparison */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="text-xs text-slate-400 uppercase font-semibold">Human Life Value (HLV)</div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] text-slate-500">Baseline</div>
              <div className="text-lg font-bold text-slate-300">{formatInr(originalAnalysis.humanLifeValue)}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div>
              <div className="text-[10px] text-cyan-400">Simulated</div>
              <div className="text-xl font-extrabold text-white">{formatInr(simulatedAnalysis.humanLifeValue)}</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Net Impact:</span>
            <span className={`font-bold flex items-center space-x-0.5 ${
              hlvDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {hlvDelta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{hlvDelta >= 0 ? '+' : ''}{formatInr(hlvDelta)}</span>
            </span>
          </div>
        </div>

        {/* Protection Gap Comparison */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="text-xs text-slate-400 uppercase font-semibold">Net Protection Gap</div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] text-slate-500">Baseline</div>
              <div className="text-lg font-bold text-slate-300">{formatInr(originalAnalysis.coverageGap)}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div>
              <div className="text-[10px] text-rose-400">Simulated</div>
              <div className="text-xl font-extrabold text-rose-400">{formatInr(simulatedAnalysis.coverageGap)}</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Protection Shift:</span>
            <span className={`font-bold flex items-center space-x-0.5 ${
              gapDelta >= 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {gapDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{gapDelta > 0 ? '+' : ''}{formatInr(gapDelta)}</span>
            </span>
          </div>
        </div>

        {/* Debt Liability Comparison */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Debt Liabilities</div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] text-slate-500">Baseline</div>
              <div className="text-lg font-bold text-slate-300">{formatInr(originalAnalysis.totalLiabilities)}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div>
              <div className="text-[10px] text-amber-400">Simulated</div>
              <div className="text-xl font-extrabold text-amber-400">{formatInr(simulatedAnalysis.totalLiabilities)}</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Debt Shift:</span>
            <span className={`font-bold flex items-center space-x-0.5 ${
              liabDelta > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {liabDelta > 0 ? '+' : ''}{formatInr(liabDelta)}
            </span>
          </div>
        </div>
      </div>

      {/* Save Scenario Bar */}
      <div className="bg-slate-850 border border-slate-800 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Name this scenario (e.g., Post-Promotion + Home Purchase)..."
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <button
          onClick={handleSaveScenario}
          className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Scenario</span>
        </button>
      </div>

      {/* Saved Scenarios List */}
      {savedScenarios.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Saved Scenarios ({savedScenarios.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedScenarios.map((s) => (
              <div key={s.id} className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-semibold text-slate-200">{s.name}</div>
                  <div className="text-[10px] text-slate-400">
                    Saved at {s.createdAt} • Gap: {formatInr(s.analysisResult.coverageGap)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLoadScenario(s)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-900 text-cyan-300 border border-slate-700 text-[11px]"
                  >
                    Reopen
                  </button>
                  <button
                    onClick={() => handleDeleteScenario(s.id)}
                    className="p-1 text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
