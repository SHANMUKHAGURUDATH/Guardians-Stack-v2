import React, { useState } from 'react';
import { CustomerProfile } from '../types/insurance';
import { 
  AlertTriangle, PhoneCall, Hospital, Bell, FileText, 
  CheckCircle, ShieldAlert, MapPin, Send, Check 
} from 'lucide-react';

interface EmergencySosProps {
  customer: CustomerProfile;
}

export const EmergencySos: React.FC<EmergencySosProps> = ({ customer }) => {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const hospitalsInCity = [
    { name: 'Apollo Multispecialty Super-Care', distance: '3.2 km', cashless: true, bedStatus: '24 ICU Beds Available', phone: '+91 80 2699 9999' },
    { name: 'Fortis Hospital & Trauma Centre', distance: '5.8 km', cashless: true, bedStatus: '16 Beds Available', phone: '+91 80 6621 4444' },
    { name: 'Manipal Hospital & Emergency Unit', distance: '7.1 km', cashless: true, bedStatus: 'Available', phone: '+91 80 2502 4444' },
    { name: 'Max Super Speciality Hospital', distance: '9.4 km', cashless: true, bedStatus: 'Available', phone: '+91 80 4011 5200' },
  ];

  const claimChecklist = [
    { title: 'Death Certificate / Hospital Intimation', mandatory: true, desc: 'Issued by local municipal corporation or hospital attending physician.' },
    { title: 'Original Policy Bond Document', mandatory: true, desc: 'Digital copy in Guardian Vault is pre-authenticated with IRDAI.' },
    { title: 'Nominee Identity & Bank Passbook', mandatory: true, desc: 'Aadhaar / PAN and cancelled cheque for instant RTGS/NEFT settlement.' },
    { title: 'Medical Case Summary / FIR (if accidental)', mandatory: false, desc: 'Discharge summary, post-mortem, and police panchnama if accident occurred.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Urgent Alert Banner */}
      <div className="bg-gradient-to-r from-rose-950/80 via-red-900/60 to-slate-900 border border-rose-800/80 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="flex items-start justify-between flex-wrap gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-rose-400 font-extrabold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span>Emergency SOS &amp; Instant Claim Dispatch Unit</span>
            </div>
            <h2 className="text-xl font-black text-white">
              One-Tap Immediate Claim Assistance &amp; Hospital Cashless
            </h2>
            <p className="text-xs text-rose-200/80 max-w-xl">
              24/7 dedicated priority response unit. Triggers instantaneous emergency alert broadcast to registered nominees and dispatches a dedicated claims concierge officer.
            </p>
          </div>

          <button
            onClick={() => {
              setSosTriggered(true);
              setTimeout(() => setBroadcastSent(true), 1200);
            }}
            className={`px-5 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl flex items-center space-x-2 ${
              sosTriggered
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 hover:scale-105 active:scale-95'
            }`}
          >
            {sosTriggered ? (
              <>
                <Check className="w-4 h-4" />
                <span>Concierge Dispatched!</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5 animate-bounce" />
                <span>Trigger Emergency SOS</span>
              </>
            )}
          </button>
        </div>

        {broadcastSent && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center space-x-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              Emergency broadcast sent via SMS to Nominees ({customer.full_name} Family Vault). Concierge case ticket #SOS-{Date.now().toString().slice(-5)} logged with emergency helpline.
            </span>
          </div>
        )}
      </div>

      {/* 24x7 Helpline Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-4 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Toll-Free Priority Claims Hotline</span>
            <div className="text-base font-extrabold text-white">1800-482-7342 (1800-GUARDIAN)</div>
            <span className="text-[10px] text-emerald-400">Average answer time &lt; 15 seconds</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-4 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Dedicated Hospital Desk</span>
            <div className="text-base font-extrabold text-white">TPA-CASHLESS-DIRECT</div>
            <span className="text-[10px] text-cyan-400">Pre-authorization approval in &lt; 45 mins</span>
          </div>
        </div>
      </div>

      {/* Cashless Network Hospitals in City */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
            <Hospital className="w-4 h-4 text-cyan-400" />
            <span>Cashless Network Hospitals in {customer.city}</span>
          </h3>
          <span className="text-[11px] text-cyan-400 font-semibold">4 Verified Facilities</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {hospitalsInCity.map((hosp, idx) => (
            <div key={idx} className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex justify-between items-start">
              <div>
                <div className="font-bold text-slate-100">{hosp.name}</div>
                <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{hosp.distance} from registered address</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
                  ✓ 100% Cashless TPA Desk Active
                </div>
              </div>
              <a
                href={`tel:${hosp.phone}`}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700"
              >
                Call Desk
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Required Claim Documentation Checklist */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Statutory 4-Step Claim Documentation Checklist</span>
        </h3>

        <div className="space-y-2 text-xs">
          {claimChecklist.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200 flex items-center space-x-2">
                  <span>{idx + 1}. {item.title}</span>
                  {item.mandatory && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      MANDATORY
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
              </div>
              <span className="text-emerald-400 text-xs font-bold">In Vault ✓</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
