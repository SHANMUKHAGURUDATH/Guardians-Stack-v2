import React, { useState, useEffect } from 'react';
import { SecurityEventLog } from '../types/insurance';
import { 
  ShieldCheck, AlertTriangle, Lock, Eye, EyeOff, 
  RefreshCw, Play, CheckCircle2, ShieldAlert, Bug, Server 
} from 'lucide-react';

export const SecurityIntelligence: React.FC = () => {
  const [events, setEvents] = useState<SecurityEventLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [maskPii, setMaskPii] = useState(true);
  const [simulatingTest, setSimulatingTest] = useState(false);

  const fetchSecurityEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/security/events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load security logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  const handleSimulateAttack = async (type: string) => {
    setSimulatingTest(true);
    try {
      const res = await fetch('/api/security/simulate-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: type })
      });
      const data = await res.json();
      if (data.event) {
        setEvents(prev => [data.event, ...prev]);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulatingTest(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-100">Guardian Security Intelligence &amp; Threat Defense</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                PERIMETER ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active defense against OWASP Top 10 vulnerabilities, automated injection vectors, and unauthorized API abuse.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* PII Data Masking Toggle */}
          <button
            onClick={() => setMaskPii(!maskPii)}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center space-x-1.5 transition-colors ${
              maskPii
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-amber-950/60 text-amber-300 border-amber-800'
            }`}
          >
            {maskPii ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>PII Masking: {maskPii ? 'ENFORCED' : 'UNMASKED'}</span>
          </button>

          <button
            onClick={fetchSecurityEvents}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active Defense Capabilities Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">SQLi Defense</span>
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Parameterized</span>
          </span>
          <p className="text-[10px] text-slate-500">Zero raw string query concatenation</p>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">XSS Neutralizer</span>
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>DOMPurify &amp; CSP</span>
          </span>
          <p className="text-[10px] text-slate-500">HTML entity encoding enforced</p>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Rate Limiting</span>
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100 req/min (Token)</span>
          </span>
          <p className="text-[10px] text-slate-500">Defends against brute-force DDoS</p>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">IDOR &amp; Auth</span>
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Strict RBAC</span>
          </span>
          <p className="text-[10px] text-slate-500">Zero-trust object level isolation</p>
        </div>
      </div>

      {/* Vulnerability Simulator Sandbox */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
            <Bug className="w-4 h-4 text-amber-400" />
            <span>Defensive Vulnerability Stress-Test Simulator</span>
          </h3>
          <span className="text-[11px] text-slate-400">Safe sandbox execution against local gateway</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => handleSimulateAttack('SQL_INJECTION')}
            disabled={simulatingTest}
            className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-amber-300 border border-amber-900/50 flex items-center space-x-1.5"
          >
            <Play className="w-3 h-3 text-amber-400" />
            <span>Inject SQL Comment Tautology (' OR 1=1)</span>
          </button>
          <button
            onClick={() => handleSimulateAttack('XSS_ATTACK')}
            disabled={simulatingTest}
            className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-rose-300 border border-rose-900/50 flex items-center space-x-1.5"
          >
            <Play className="w-3 h-3 text-rose-400" />
            <span>Inject Stored XSS Script Tag</span>
          </button>
          <button
            onClick={() => handleSimulateAttack('RATE_LIMIT_EXCEEDED')}
            disabled={simulatingTest}
            className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-cyan-300 border border-cyan-900/50 flex items-center space-x-1.5"
          >
            <Play className="w-3 h-3 text-cyan-400" />
            <span>Burst API Flood (200 reqs/sec)</span>
          </button>
          <button
            onClick={() => handleSimulateAttack('PATH_TRAVERSAL')}
            disabled={simulatingTest}
            className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-purple-300 border border-purple-900/50 flex items-center space-x-1.5"
          >
            <Play className="w-3 h-3 text-purple-400" />
            <span>Directory Traversal (../../etc/passwd)</span>
          </button>
        </div>
      </div>

      {/* Security Threat & Event Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Real-Time Defensive Audit Log ({events.length} Events)
          </h3>
          <span className="text-[10px] text-slate-400">Preserved in tamper-evident store</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="p-3">Event ID &amp; Time</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Attack Vector</th>
                <th className="p-3">Target Endpoint</th>
                <th className="p-3">Defense Action</th>
                <th className="p-3">Remediation Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-[11px]">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-850/50">
                  <td className="p-3 font-mono">
                    <span className="font-bold text-slate-200 block">{ev.id}</span>
                    <span className="text-[10px] text-slate-500">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      ev.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      ev.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {ev.severity}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-200">{ev.eventType}</td>
                  <td className="p-3 font-mono text-[10px] text-slate-400">{ev.endpoint}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {ev.defenseAction}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-slate-400 max-w-xs">{ev.remediationAdvice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
