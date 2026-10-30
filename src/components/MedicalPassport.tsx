import React from 'react';
import { CustomerProfile } from '../types/insurance';
import { Activity, Heart, AlertCircle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface MedicalPassportProps {
  customer: CustomerProfile;
}

export const MedicalPassport: React.FC<MedicalPassportProps> = ({ customer }) => {
  // BMI categorization
  let bmiCategory = 'Normal Weight';
  let bmiColor = 'text-emerald-400';
  let underwriterLoading = 'Standard Underwriting Tariff (0% Extra Loading)';

  if (customer.bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-amber-400';
    underwriterLoading = 'Possible +10% Underwriting Loading due to low BMI';
  } else if (customer.bmi >= 25 && customer.bmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-amber-400';
    underwriterLoading = 'Standard Tariff with Lifestyle Advisory';
  } else if (customer.bmi >= 30) {
    bmiCategory = 'Obese (Class I)';
    bmiColor = 'text-rose-400';
    underwriterLoading = 'Classified Underwriting: +25% Medical Loading applied';
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Medical Passport &amp; Underwriting Risk Profile</h2>
            <p className="text-xs text-slate-400">
              Verified clinical markers, underwriter medical loading criteria, and health history for {customer.full_name}.
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-400 block text-[10px]">Smoker Classification</span>
          <span className={`font-bold px-2 py-0.5 rounded border inline-block mt-0.5 ${
            customer.smoker_status === 'Non-Smoker'
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : 'bg-rose-950 text-rose-300 border-rose-800'
          }`}>
            {customer.smoker_status}
          </span>
        </div>
      </div>

      {/* Grid of Medical Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* BMI Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Body Mass Index (BMI)</span>
            <span className={`font-bold ${bmiColor}`}>{bmiCategory}</span>
          </div>
          <div className="text-3xl font-black text-white">{customer.bmi}</div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full ${
                customer.bmi < 25 ? 'bg-emerald-500' : customer.bmi < 30 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (customer.bmi / 40) * 100)}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-slate-500 pt-1">
            Normal benchmark range: 18.5 – 24.9 kg/m²
          </div>
        </div>

        {/* Smoker Tariff Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Mortality Rating Factor</span>
            <span className="text-cyan-400 font-bold">Life Tariff</span>
          </div>
          <div className="text-2xl font-black text-white">
            {customer.smoker_status === 'Non-Smoker' ? '1.00x Base' : '1.55x Loaded'}
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            {customer.smoker_status === 'Non-Smoker'
              ? 'Qualifies for lowest standard premium rates in the premium schedule.'
              : 'Subject to smoker risk rating adjustment per actuarial mortality tables.'}
          </p>
        </div>

        {/* Medical Checkup Requirement */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Underwriter Examination</span>
            <span className="text-emerald-400 font-bold">Schedule</span>
          </div>
          <div className="text-base font-bold text-slate-100">
            {customer.age >= 45 ? 'Tele-MER & Full Blood Profile' : 'Video MER / Declaration'}
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Based on age ({customer.age}) and target Sum Assured over ₹50 Lakhs.
          </p>
        </div>
      </div>

      {/* Disclosed Conditions and Underwriting Evaluation */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Disclosed Medical Conditions &amp; Underwriting Impact
        </h3>

        <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="font-semibold">Recorded Medical Disclosures:</span>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg text-xs text-slate-200 font-mono border border-slate-800">
            "{customer.health_conditions}"
          </div>
          <div className="text-[11px] text-slate-400 flex items-center space-x-2 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Underwriting Verdict: {underwriterLoading}</span>
          </div>
        </div>

        {/* Clinical Checklist Table */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Routine Annual Health Audit Schedule
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-200 block">Fasting Blood Glucose (HbA1c)</span>
              <span className="text-[10px] text-slate-400">Recommended every 6 months</span>
              <span className="text-[10px] text-emerald-400 block mt-1">✓ Cleared</span>
            </div>
            <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-200 block">Lipid Profile &amp; Cholesterol</span>
              <span className="text-[10px] text-slate-400">Annual cardiac benchmark</span>
              <span className="text-[10px] text-emerald-400 block mt-1">✓ Optimal</span>
            </div>
            <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-200 block">Electrocardiogram (ECG)</span>
              <span className="text-[10px] text-slate-400">Treadmill Test for &gt;40y</span>
              <span className="text-[10px] text-cyan-400 block mt-1">Scheduled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
