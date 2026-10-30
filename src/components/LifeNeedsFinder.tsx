import React, { useState } from 'react';
import { CustomerProfile, ActuarialAnalysis } from '../types/insurance';
import { 
  CheckCircle, ArrowRight, ArrowLeft, Shield, 
  HelpCircle, Target, Users, DollarSign, Home, Sparkles 
} from 'lucide-react';

interface LifeNeedsFinderProps {
  customer: CustomerProfile;
  analysis: ActuarialAnalysis;
  onApplyRecommendations: (sumAssured: number) => void;
}

export const LifeNeedsFinder: React.FC<LifeNeedsFinderProps> = ({
  customer,
  analysis,
  onApplyRecommendations,
}) => {
  const [step, setStep] = useState(1);

  // Guided questionnaire responses
  const [lifeStage, setLifeStage] = useState('married_with_kids');
  const [primaryPriority, setPrimaryPriority] = useState('debt_protection');
  const [desiredIncomeReplacementYears, setDesiredIncomeReplacementYears] = useState(12);
  const [childHigherEduTarget, setChildHigherEduTarget] = useState(3000000);
  const [parentMedicalReserve, setParentMedicalReserve] = useState(1500000);

  const calculatedTotalNeed = 
    analysis.totalLiabilities + 
    (analysis.annualHouseholdExpenses * desiredIncomeReplacementYears) + 
    (customer.num_children * childHigherEduTarget) +
    (customer.num_dependent_parents > 0 ? parentMedicalReserve : 0);

  const calculatedNetGap = Math.max(0, calculatedTotalNeed - analysis.existingTotalLifeCover - analysis.applicableAssets);

  const formatInr = (amt: number) => `₹${(amt / 100000).toFixed(1)} Lakhs`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Interactive Guided Wizard</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Step {step} of 4
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 mt-1">Life Needs &amp; Financial Protection Finder</h2>
          <p className="text-xs text-slate-400">
            A question-by-question guided assessment tailored for {customer.full_name}.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Container */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl min-h-[380px] flex flex-col justify-between">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Step 1: Current Life Stage &amp; Core Family Dependency</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select the milestone archetype that best describes your household responsibility:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { id: 'young_professional', title: 'Early Career / Self-Sustaining', desc: 'No financial dependents yet; focusing on building an early safety net and loan coverage.' },
                { id: 'young_couple', title: 'Recently Married / Dual Earner', desc: 'Joint household responsibilities; planning future asset creation and mortgage security.' },
                { id: 'married_with_kids', title: 'Growing Family with Children', desc: 'High economic dependency; need to safeguard children education and spouse living fund.' },
                { id: 'sandwich_generation', title: 'Supporting Kids & Aging Parents', desc: 'Multiple generational obligations; requires robust life and living health coverage.' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLifeStage(item.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    lifeStage === item.id
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Step 2: Primary Financial Protection Objective</span>
            </h3>
            <p className="text-xs text-slate-400">
              What is the single most critical risk you must eliminate for your family?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { id: 'debt_protection', title: 'Mortgage & Loan Elimination', desc: `Ensure your ₹${(analysis.totalLiabilities / 100000).toFixed(1)}L in outstanding loans are 100% extinguished without evicting family.` },
                { id: 'income_replacement', title: 'Long-Term Household Income Replacement', desc: `Provide guaranteed monthly living expenses of ₹${(analysis.monthlyHouseholdExpenses).toLocaleString('en-IN')}/mo to maintain living standards.` },
                { id: 'child_education', title: 'Children Higher Education Corpus', desc: 'Lock in guaranteed funds for university tuition regardless of unforeseen life events.' },
                { id: 'legacy_wealth', title: 'Generational Wealth Transfer', desc: 'Create an unassailable financial legacy protected under the Married Women Property Act.' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setPrimaryPriority(item.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    primaryPriority === item.id
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>Step 3: Horizon Customization &amp; Milestone Funds</span>
            </h3>
            <p className="text-xs text-slate-400">
              Adjust your desired protection buffer years and education corpus parameters:
            </p>

            <div className="space-y-4 pt-2">
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="text-slate-300 font-medium">Income Replacement Horizon</span>
                  <span className="font-bold text-cyan-400">{desiredIncomeReplacementYears} Years of Living Expenses</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={desiredIncomeReplacementYears}
                  onChange={(e) => setDesiredIncomeReplacementYears(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Living Expense Reserve: {formatInr(analysis.annualHouseholdExpenses * desiredIncomeReplacementYears)}
                </div>
              </div>

              {customer.num_children > 0 && (
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-slate-300 font-medium">Target Higher Education Fund per Child</span>
                    <span className="font-bold text-emerald-400">{formatInr(childHigherEduTarget)}</span>
                  </div>
                  <input
                    type="range"
                    min="1000000"
                    max="6000000"
                    step="500000"
                    value={childHigherEduTarget}
                    onChange={(e) => setChildHigherEduTarget(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="text-[11px] text-slate-400 mt-1">
                    Total for {customer.num_children} children: {formatInr(customer.num_children * childHigherEduTarget)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Step 4: Customized Protection Blueprint &amp; Summary</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Gross Needs Target</span>
                <div className="text-2xl font-black text-white">{formatInr(calculatedTotalNeed)}</div>
                <ul className="text-[11px] text-slate-400 space-y-1 pt-1">
                  <li>• Outstanding Debt Liabilities: {formatInr(analysis.totalLiabilities)}</li>
                  <li>• {desiredIncomeReplacementYears} Years Living Fund: {formatInr(analysis.annualHouseholdExpenses * desiredIncomeReplacementYears)}</li>
                  <li>• Children Education Reserve: {formatInr(customer.num_children * childHigherEduTarget)}</li>
                </ul>
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-rose-400 uppercase">Recommended Incremental Cover</span>
                <div className="text-2xl font-black text-rose-400">{formatInr(calculatedNetGap)}</div>
                <ul className="text-[11px] text-slate-400 space-y-1 pt-1">
                  <li>• Existing Life Cover: −{formatInr(analysis.existingTotalLifeCover)}</li>
                  <li>• Liquid Emergency Buffer: −{formatInr(analysis.applicableAssets)}</li>
                  <li>• Target Recommended Policy: Pure Term Life for ₹{(calculatedNetGap / 100000).toFixed(1)}L</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-xl text-xs text-cyan-300 flex items-center justify-between">
              <span>Ready to match this requirement against the live product rate dataset.</span>
              <button
                onClick={() => onApplyRecommendations(calculatedNetGap)}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
              >
                Apply to Recommendations →
              </button>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center space-x-1"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              Restart Wizard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
