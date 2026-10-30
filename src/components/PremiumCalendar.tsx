import React, { useState } from 'react';
import { CustomerProfile } from '../types/insurance';
import { Calendar as CalendarIcon, AlertCircle, CheckCircle2, Clock, CreditCard, ChevronRight } from 'lucide-react';

interface PremiumCalendarProps {
  customer: CustomerProfile;
}

export const PremiumCalendar: React.FC<PremiumCalendarProps> = ({ customer }) => {
  const [selectedMonth, setSelectedMonth] = useState('All 2026-2027');

  const upcomingPremiums = [
    {
      id: 'DUE-101',
      policyName: 'Guardian Shield Pure Term',
      policyNo: 'GS-TERM-88412',
      dueDate: '2026-11-15',
      daysRemaining: 16,
      amount: 14200,
      mode: 'Annual',
      gracePeriodEnds: '2026-12-15 (30-day grace)',
      autoDebitStatus: 'Active (HDFC Bank e-Mandate)',
      urgency: 'medium'
    },
    {
      id: 'DUE-102',
      policyName: 'Optima Family Health Floater',
      policyNo: 'HLTH-99214',
      dueDate: '2027-01-20',
      daysRemaining: 82,
      amount: 22400,
      mode: 'Annual',
      gracePeriodEnds: '2027-02-19 (30-day grace)',
      autoDebitStatus: 'Active (ICICI Bank e-Mandate)',
      urgency: 'low'
    },
    {
      id: 'DUE-103',
      policyName: 'Vehicle Bumper-to-Bumper Comprehensive',
      policyNo: 'AUTO-33109',
      dueDate: '2027-04-10',
      daysRemaining: 162,
      amount: 9800,
      mode: 'Annual',
      gracePeriodEnds: '2027-04-10 (No grace on motor)',
      autoDebitStatus: 'Manual Payment Scheduled',
      urgency: 'low'
    }
  ];

  const totalAnnualDue = upcomingPremiums.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Premium Calendar &amp; Grace Period Monitor</h2>
            <p className="text-xs text-slate-400">
              Never let a policy lapse. Tracks statutory grace periods, bank auto-debits, and annual renewal cash outflows.
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Annual Outflow</span>
          <span className="text-base font-extrabold text-cyan-400">
            ₹{totalAnnualDue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Due Timeline List */}
      <div className="space-y-4">
        {upcomingPremiums.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {p.policyNo}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  p.daysRemaining <= 30 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-300'
                }`}>
                  Due in {p.daysRemaining} Days
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-100 pt-0.5">{p.policyName}</h4>
              <div className="text-xs text-slate-400 flex items-center space-x-3 pt-1">
                <span>Due Date: <strong className="text-slate-200">{p.dueDate}</strong></span>
                <span>•</span>
                <span className="text-amber-400 font-medium">Grace Ends: {p.gracePeriodEnds}</span>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end space-x-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
              <div className="text-left md:text-right">
                <span className="text-[10px] text-slate-400 block">Premium Due ({p.mode})</span>
                <span className="text-base font-extrabold text-white">₹{p.amount.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-emerald-400 block flex items-center md:justify-end space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{p.autoDebitStatus}</span>
                </span>
              </div>

              <button
                onClick={() => alert(`Pre-authorized payment flow initialized for ${p.policyName}`)}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Pay Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Advisory Note on Policy Lapse */}
      <div className="p-4 bg-slate-850 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start space-x-3">
        <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-200 block mb-0.5">IRDAI Statutory Grace Period Guidelines</span>
          <span>
            Insurance policies offer 30 days of grace for yearly/half-yearly modes and 15 days for monthly mode. During this grace period, full life coverage remains active. If premium is unpaid beyond the grace window, the policy lapses and requires medical underwriting for reinstatement.
          </span>
        </div>
      </div>
    </div>
  );
};
