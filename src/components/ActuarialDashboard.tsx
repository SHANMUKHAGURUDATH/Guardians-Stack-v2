import React from 'react';
import { CustomerProfile, ActuarialAnalysis } from '../types/insurance';
import { 
  ShieldCheck, AlertTriangle, TrendingUp, DollarSign, Home, 
  HeartHandshake, Info, CheckCircle2, AlertOctagon, HelpCircle 
} from 'lucide-react';

interface ActuarialDashboardProps {
  customer: CustomerProfile;
  analysis: ActuarialAnalysis;
}

export const ActuarialDashboard: React.FC<ActuarialDashboardProps> = ({
  customer,
  analysis,
}) => {
  // Format currency in Lakhs or Crores
  const formatInr = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    }
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  // Data completeness calculation
  const fields = Object.values(customer);
  const filledCount = fields.filter(v => v !== undefined && v !== null && v !== '').length;
  const completenessPct = Math.round((filledCount / 51) * 100);

  return (
    <div className="space-y-5">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Human Life Value Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-cyan-400">Human Life Value (HLV)</span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
              PV Method
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {formatInr(analysis.humanLifeValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>{analysis.hlvWorkingYears} productive years</span>
            <span>r = 7.5% | g = {customer.expected_income_growth_pct}%</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-800/80 pt-1.5">
            Economic net income capitalized to retirement age 60.
          </div>
        </div>

        {/* Net Protection Gap Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-rose-400">Net Protection Gap</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
              analysis.coverageGap > 0 ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            }`}>
              {analysis.coverageGap > 0 ? 'Deficit' : 'Adequate'}
            </span>
          </div>
          <div className={`text-2xl font-extrabold mt-1 ${analysis.coverageGap > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formatInr(analysis.coverageGap)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Existing Cover: {formatInr(analysis.existingTotalLifeCover)}</span>
            <span>{analysis.existingTotalLifeCover > 0 ? 'Partial' : 'No Cover'}</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-800/80 pt-1.5">
            Net life insurance sum assured required immediately.
          </div>
        </div>

        {/* Total Outstanding Liabilities Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-amber-400">Total Loan Liabilities</span>
            <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">
              4 Loans
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {formatInr(analysis.totalLiabilities)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Monthly EMI: {formatInr(analysis.totalMonthlyEmi)}</span>
            <span className="text-amber-400 font-semibold">{analysis.emiToIncomePct}% of Income</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-800/80 pt-1.5">
            Mortgage, Auto, Personal &amp; Education obligations.
          </div>
        </div>

        {/* Financial Health & Affordability Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-emerald-400">Financial Health Index</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
              analysis.affordabilityStatus === 'Comfortable'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-amber-950 text-amber-300 border-amber-800'
            }`}>
              {analysis.affordabilityStatus}
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-extrabold text-white">{analysis.financialHealthScore}</span>
            <span className="text-xs text-slate-400">/ 100 Score</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                analysis.financialHealthScore >= 70 ? 'bg-emerald-500' : analysis.financialHealthScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${analysis.financialHealthScore}%` }}
            ></div>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-800/80 pt-1.5 flex justify-between">
            <span>Budget: {formatInr(analysis.annualPremiumBudget)}/yr</span>
            <span>Dependents: {analysis.familyDependencyScore}/100</span>
          </div>
        </div>
      </div>

      {/* Deep-Dive Actuarial Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Net Needs Actuarial Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>Net Needs Protection Waterfall</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                  Actuarial Equation
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gross liabilities + Living fund + Goals − Existing cover − Liquid assets
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Final Gap</span>
              <span className="text-base font-extrabold text-rose-400">{formatInr(analysis.coverageGap)}</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Step 1: Outstanding Loans */}
            <div className="flex items-center justify-between p-3 bg-slate-850 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                  +1
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Total Outstanding Debt Liabilities</div>
                  <div className="text-[11px] text-slate-400">
                    Home ({formatInr(analysis.individualLoans.homeLoan)}) + Car ({formatInr(analysis.individualLoans.carLoan)}) + Personal + Edu
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-amber-400">+{formatInr(analysis.totalLiabilities)}</span>
            </div>

            {/* Step 2: Living Expense Reserve */}
            <div className="flex items-center justify-between p-3 bg-slate-850 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  +2
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Family Living Expense Fund</div>
                  <div className="text-[11px] text-slate-400">
                    Provides {formatInr(analysis.annualHouseholdExpenses)}/year for family sustenance
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-cyan-400">+{formatInr(analysis.livingExpenseReserve)}</span>
            </div>

            {/* Step 3: Future Goal Protection */}
            <div className="flex items-center justify-between p-3 bg-slate-850 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                  +3
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Major Family Milestone Goals</div>
                  <div className="text-[11px] text-slate-400">
                    Higher education &amp; children startup corpus ({customer.num_children} children, {customer.num_goals} goals)
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-purple-400">+{formatInr(analysis.goalObligations)}</span>
            </div>

            {/* Subtotal: Gross Needs */}
            <div className="flex justify-between items-center px-3 py-1 text-xs text-slate-400 border-y border-slate-800 font-mono">
              <span>Gross Protection Requirement</span>
              <span className="font-bold text-slate-200">{formatInr(analysis.grossNeedsRequirement)}</span>
            </div>

            {/* Step 4: Deduct Existing Coverage */}
            <div className="flex items-center justify-between p-3 bg-slate-850 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  −4
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Existing Eligible Life Coverage</div>
                  <div className="text-[11px] text-slate-400">
                    Employer ({formatInr(analysis.existingEmployerLifeCover)}) + Individual ({formatInr(analysis.existingIndividualLifeCover)})
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-400">−{formatInr(analysis.existingTotalLifeCover)}</span>
            </div>

            {/* Step 5: Deduct Applicable Liquid Assets */}
            <div className="flex items-center justify-between p-3 bg-slate-850 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  −5
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Applicable Liquid Assets Buffer</div>
                  <div className="text-[11px] text-slate-400">
                    100% Liquid Savings ({formatInr(analysis.liquidSavings)}) + 50% Market Investments ({formatInr(Math.round(analysis.marketInvestments * 0.5))})
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-400">−{formatInr(analysis.applicableAssets)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Liabilities & Assets Visual Composition (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Liabilities Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Loan Liabilities Distribution</span>
              <span className="font-mono text-amber-400">{formatInr(analysis.totalLiabilities)}</span>
            </h4>

            {analysis.totalLiabilities > 0 ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Home Loan ({customer.home_loan_interest_rate_pct}%)</span>
                    <span>{formatInr(analysis.individualLoans.homeLoan)}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${(analysis.individualLoans.homeLoan / analysis.totalLiabilities) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Car Loan ({customer.car_loan_interest_rate_pct}%)</span>
                    <span>{formatInr(analysis.individualLoans.carLoan)}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${(analysis.individualLoans.carLoan / analysis.totalLiabilities) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Personal Loan ({customer.personal_loan_interest_rate_pct}%)</span>
                    <span>{formatInr(analysis.individualLoans.personalLoan)}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${(analysis.individualLoans.personalLoan / analysis.totalLiabilities) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Education Loan ({customer.education_loan_interest_rate_pct}%)</span>
                    <span>{formatInr(analysis.individualLoans.educationLoan)}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${(analysis.individualLoans.educationLoan / analysis.totalLiabilities) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                Zero outstanding loans recorded. Debt-free profile.
              </div>
            )}
          </div>

          {/* Assets & Longevity Reserves */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Savings &amp; Longevity Assets</span>
              <span className="font-mono text-emerald-400">{formatInr(analysis.totalFinancialAssets)}</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-850">
                <span className="text-slate-400">Liquid Emergency Savings</span>
                <span className="font-bold text-slate-200">{formatInr(analysis.liquidSavings)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-850">
                <span className="text-slate-400">Market Equity &amp; MF</span>
                <span className="font-bold text-slate-200">{formatInr(analysis.marketInvestments)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/50">
                <div>
                  <span className="text-emerald-300 font-semibold block">Retirement Corpus (EPF/PPF)</span>
                  <span className="text-[10px] text-emerald-500">Protected longevity reserve</span>
                </div>
                <span className="font-bold text-emerald-300">{formatInr(analysis.retirementSavings)}</span>
              </div>
            </div>

            {/* Data Completeness Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Data Completeness:</span>
              <span className="font-bold text-cyan-400">{completenessPct}% (51/51 Fields)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actuarial Methodology & Transparent Assumptions Note */}
      <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold">
          <Info className="w-4 h-4 shrink-0" />
          <span>Actuarial Transparency &amp; Non-Arbitrary Assumptions</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
          {analysis.methodologyNotes.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
          <li>
            Zero arbitrary estimation: Every figure dynamically recalculates on slider or input adjustments and mirrors the official downloadable PDF Actuarial Report.
          </li>
        </ul>
      </div>
    </div>
  );
};
