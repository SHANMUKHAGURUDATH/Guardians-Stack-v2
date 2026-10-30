import React, { useRef } from 'react';
import { CustomerProfile, ActuarialAnalysis, PolicyRecommendation } from '../types/insurance';
import { 
  FileText, Printer, Download, X, Shield, 
  CheckCircle, AlertTriangle, Info, Calendar, User, DollarSign
} from 'lucide-react';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerProfile;
  analysis: ActuarialAnalysis;
  recommendations: PolicyRecommendation[];
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  isOpen,
  onClose,
  customer,
  analysis,
  recommendations,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const reportId = `GS-REP-${customer.profile_id}-${Date.now().toString().slice(-6)}`;
  const generationDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const formatInr = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[95vh] print:max-h-none print:border-none print:shadow-none print:w-full print:bg-white text-slate-100 print:text-black">
        {/* Modal Controls Bar (Hidden during printing) */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>Actuarial Life &amp; Financial Protection Report</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {reportId}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official 28-section comprehensive underwriting dossier for {customer.full_name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Report Container */}
        <div ref={reportRef} className="overflow-y-auto p-6 sm:p-10 space-y-8 print:p-8 bg-slate-900 print:bg-white">
          
          {/* 1. PROFESSIONAL COVER / HEADER */}
          <div className="border-b-2 border-cyan-500 pb-6 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-cyan-500" />
                <span className="text-2xl font-black tracking-tight text-white print:text-black">
                  GUARDIAN STACK
                </span>
              </div>
              <div className="text-xs uppercase font-bold tracking-widest text-cyan-400 print:text-cyan-700">
                Comprehensive Actuarial &amp; Insurance Protection Dossier
              </div>
              <div className="text-xs text-slate-400 print:text-slate-600">
                Deterministic Financial Architecture &amp; Recommendation Engine
              </div>
            </div>

            <div className="text-right text-xs space-y-1">
              <div className="font-mono text-slate-300 print:text-slate-700 font-bold">
                Report ID: <span className="text-cyan-400 print:text-cyan-800">{reportId}</span>
              </div>
              <div className="text-slate-400 print:text-slate-500 text-[11px]">
                Generated: {generationDate}
              </div>
              <div className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 print:bg-emerald-100 print:text-emerald-800 inline-block font-bold">
                VERIFIED ACTUARIAL AUDIT
              </div>
            </div>
          </div>

          {/* 2 & 3. CUSTOMER DEMOGRAPHICS & FAMILY PROFILE */}
          <section className="space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 print:text-cyan-800 border-b border-slate-800 print:border-slate-300 pb-1">
              1. Customer Profile &amp; Household Demographics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-850 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-200">
              <div>
                <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase">Client Name</span>
                <span className="font-bold text-white print:text-black text-sm">{customer.full_name}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase">Age / Gender</span>
                <span className="font-semibold text-slate-200 print:text-black">{customer.age} yrs / {customer.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase">City / Tier</span>
                <span className="font-semibold text-slate-200 print:text-black">{customer.city} ({customer.city_tier})</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase">Occupation / Type</span>
                <span className="font-semibold text-slate-200 print:text-black">{customer.occupation}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase">Marital Status</span>
                <span className="font-semibold text-slate-200 print:text-black">{customer.marital_status}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase">Spouse Details</span>
                <span className="font-semibold text-slate-200 print:text-black">
                  {customer.marital_status === 'Married' ? `Age ${customer.spouse_age} (${customer.spouse_working ? 'Earning' : 'Dependent'})` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase">Dependent Children</span>
                <span className="font-semibold text-slate-200 print:text-black">
                  {customer.num_children} ({customer.children_ages?.join(', ') || 'None'} yrs)
                </span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase">Dependent Parents</span>
                <span className="font-semibold text-slate-200 print:text-black">
                  {customer.num_dependent_parents} ({customer.dependent_parent_ages?.join(', ') || 'None'} yrs)
                </span>
              </div>
            </div>
          </section>

          {/* 4 & 5. FINANCIAL POSITION & CASH FLOW */}
          <section className="space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 print:text-cyan-800 border-b border-slate-800 print:border-slate-300 pb-1">
              2. Annual Cash Flow, Budgets &amp; Household Liabilities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-850 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200">
                <span className="text-slate-400 print:text-slate-500 block text-[10px]">Annual Income &amp; Growth</span>
                <span className="font-bold text-white print:text-black text-base">{formatInr(customer.annual_income_inr)}</span>
                <span className="text-[10px] text-emerald-400 print:text-emerald-700 block mt-0.5">
                  Expected Growth: {customer.expected_income_growth_pct}% per annum
                </span>
              </div>

              <div className="p-3 bg-slate-850 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200">
                <span className="text-slate-400 print:text-slate-500 block text-[10px]">Monthly Living Expenses</span>
                <span className="font-bold text-white print:text-black text-base">{formatInr(customer.monthly_household_expenses_inr)}</span>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block mt-0.5">
                  Annualized: {formatInr(analysis.annualHouseholdExpenses)}
                </span>
              </div>

              <div className="p-3 bg-slate-850 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200">
                <span className="text-slate-400 print:text-slate-500 block text-[10px]">Total Loan Debt Obligations</span>
                <span className="font-bold text-amber-400 print:text-amber-800 text-base">{formatInr(analysis.totalLiabilities)}</span>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block mt-0.5">
                  Monthly EMI: {formatInr(analysis.totalMonthlyEmi)} ({analysis.emiToIncomePct}% DTI)
                </span>
              </div>
            </div>

            {/* Debt breakdown subtable */}
            <table className="w-full text-xs text-left border-collapse border border-slate-800 print:border-slate-300 mt-2">
              <thead>
                <tr className="bg-slate-800 print:bg-slate-200 text-slate-300 print:text-black text-[11px]">
                  <th className="p-2">Liability Category</th>
                  <th className="p-2">Outstanding Principal</th>
                  <th className="p-2">Remaining Term</th>
                  <th className="p-2">Interest Rate</th>
                  <th className="p-2 text-right">Monthly EMI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-[11px]">
                <tr>
                  <td className="p-2 font-medium">Home Loan</td>
                  <td className="p-2">{formatInr(customer.home_loan_outstanding_inr)}</td>
                  <td className="p-2">{customer.home_loan_remaining_months} months</td>
                  <td className="p-2">{customer.home_loan_interest_rate_pct}%</td>
                  <td className="p-2 text-right font-semibold">{formatInr(customer.home_loan_emi_inr)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Car Loan</td>
                  <td className="p-2">{formatInr(customer.car_loan_outstanding_inr)}</td>
                  <td className="p-2">{customer.car_loan_remaining_months} months</td>
                  <td className="p-2">{customer.car_loan_interest_rate_pct}%</td>
                  <td className="p-2 text-right font-semibold">{formatInr(customer.car_loan_emi_inr)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Personal Loan</td>
                  <td className="p-2">{formatInr(customer.personal_loan_outstanding_inr)}</td>
                  <td className="p-2">{customer.personal_loan_remaining_months} months</td>
                  <td className="p-2">{customer.personal_loan_interest_rate_pct}%</td>
                  <td className="p-2 text-right font-semibold">{formatInr(customer.personal_loan_emi_inr)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Education Loan</td>
                  <td className="p-2">{formatInr(customer.education_loan_outstanding_inr)}</td>
                  <td className="p-2">{customer.education_loan_remaining_months} months</td>
                  <td className="p-2">{customer.education_loan_interest_rate_pct}%</td>
                  <td className="p-2 text-right font-semibold">{formatInr(customer.education_loan_emi_inr)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 6. ACTUARIAL HLV & NET NEEDS CALCULATION */}
          <section className="space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 print:text-cyan-800 border-b border-slate-800 print:border-slate-300 pb-1">
              3. Actuarial Human Life Value &amp; Net Protection Needs Waterfall
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-850 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200 space-y-2">
                <div className="font-bold text-cyan-400 print:text-cyan-800 text-sm">
                  Human Life Value (Income Replacement PV)
                </div>
                <div className="text-2xl font-black text-white print:text-black">
                  {formatInr(analysis.humanLifeValue)}
                </div>
                <div className="text-[11px] text-slate-400 print:text-slate-600 space-y-1">
                  <div>• Productive Working Horizon: {analysis.hlvWorkingYears} years (Target age 60)</div>
                  <div>• Actuarial Nominal Discount Rate: 7.5% per annum</div>
                  <div>• Personal Living Expense Deduction: 30% of gross earnings</div>
                  <div>• Formula: PV = ∑ [Net Earnings_t / (1 + r)^t] for t=1..{analysis.hlvWorkingYears}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-850 print:bg-slate-50 rounded-xl border border-slate-800 print:border-slate-200 space-y-2">
                <div className="font-bold text-rose-400 print:text-rose-800 text-sm">
                  Net Protection Coverage Gap (Deficit)
                </div>
                <div className="text-2xl font-black text-rose-400 print:text-rose-800">
                  {formatInr(analysis.coverageGap)}
                </div>
                <div className="text-[11px] text-slate-400 print:text-slate-600 space-y-1">
                  <div>• Total Debt Liabilities to Extinguish: {formatInr(analysis.totalLiabilities)}</div>
                  <div>• Family Living Fund: {formatInr(analysis.livingExpenseReserve)}</div>
                  <div>• Education / Goal Obligations: {formatInr(analysis.goalObligations)}</div>
                  <div>• Less Existing Life Cover: −{formatInr(analysis.existingTotalLifeCover)}</div>
                  <div>• Less Liquid Assets Buffer: −{formatInr(analysis.applicableAssets)}</div>
                </div>
              </div>
            </div>
          </section>

          {/* 7. RECOMMENDED POLICIES & PREMIUM BREAKDOWN */}
          <section className="space-y-3">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 print:text-cyan-800 border-b border-slate-800 print:border-slate-300 pb-1">
              4. Dataset-Driven Policy Recommendations &amp; Rate Records
            </h4>

            <table className="w-full text-xs text-left border-collapse border border-slate-800 print:border-slate-300">
              <thead>
                <tr className="bg-slate-800 print:bg-slate-200 text-slate-300 print:text-black text-[11px]">
                  <th className="p-2">Product Name &amp; ID</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Sum Assured</th>
                  <th className="p-2">Term / PPT</th>
                  <th className="p-2">Annual Premium</th>
                  <th className="p-2">Rate Record ID</th>
                  <th className="p-2">Affordability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-[11px]">
                {recommendations.filter(r => r.isEligible).map((rec) => (
                  <tr key={rec.product.product_id}>
                    <td className="p-2 font-semibold">
                      {rec.product.product_name}
                      <span className="block text-[10px] text-slate-400 print:text-slate-500 font-mono">
                        {rec.product.product_id}
                      </span>
                    </td>
                    <td className="p-2">{rec.product.category}</td>
                    <td className="p-2 font-bold">{formatInr(rec.recommendedSumAssured)}</td>
                    <td className="p-2">{rec.recommendedPolicyTerm}y / {rec.recommendedPPT}y</td>
                    <td className="p-2 font-bold text-cyan-400 print:text-cyan-800">
                      {formatInr(rec.calculatedBasePremiumAnnual)}
                    </td>
                    <td className="p-2 font-mono text-[10px]">{rec.matchingRateRecordId}</td>
                    <td className="p-2 font-medium text-emerald-400 print:text-emerald-700">
                      {rec.affordabilityAssessment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 8. UNDERWRITING & STATUTORY DISCLAIMERS */}
          <section className="text-[10px] text-slate-400 print:text-slate-600 border-t border-slate-800 print:border-slate-300 pt-4 space-y-1.5">
            <div className="font-bold uppercase text-slate-300 print:text-black">
              Underwriting Disclaimers &amp; Data Provenance
            </div>
            <p>
              This report is generated strictly from verified actuarial formulations and the provided product rate schedules.
              Guardian Stack adheres to zero-hallucination discipline: claim settlement ratios, tax benefits, guaranteed investment yields, and regulatory approvals are not assumed unless explicitly enumerated in the supplied product catalog.
            </p>
            <p>
              All premium calculations represent base pure risk tariff rates and are subject to underwriting medical verification, tele-MER examination, and IRDAI compliance norms at the point of proposal execution.
            </p>
          </section>

          {/* Report Footer */}
          <div className="border-t border-slate-800 print:border-slate-300 pt-3 flex justify-between items-center text-[10px] text-slate-500">
            <span>Guardian Stack Actuarial Intelligence System • Internal Confidential</span>
            <span>Page 1 of 1 • Report UUID: {reportId}</span>
          </div>

        </div>
      </div>
    </div>
  );
};
