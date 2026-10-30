import React from 'react';
import { 
  Shield, Brain, Search, Lock, Activity, AlertTriangle, 
  Calendar, ShieldCheck, Database, FileText, User,
  Users, UserCheck, Settings, HelpCircle, LogOut
} from 'lucide-react';
import { CustomerProfile } from '../types/insurance';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export type NavTab = 
  | 'hub' 
  | 'life-needs' 
  | 'vault' 
  | 'family-members'
  | 'nominees'
  | 'medical' 
  | 'sos' 
  | 'calendar' 
  | 'security' 
  | 'system'
  | 'settings'
  | 'support';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedCustomer: CustomerProfile | null;
  onOpenSelector: () => void;
  onOpenAiAssistant: () => void;
  onOpenReportModal: () => void;
  onOpenDatasetModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  selectedCustomer,
  onOpenSelector,
  onOpenAiAssistant,
  onOpenReportModal,
  onOpenDatasetModal,
}) => {
  const { user, isDemoMode, logout } = useAuth();
  const { notify } = useToast();

  const tabs: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
    highlight?: boolean;
  }[] = [
    { id: 'hub', label: 'Intelligence Hub', icon: Brain, badge: 'Flagship' },
    { id: 'life-needs', label: 'Life Needs Finder', icon: Search },
    { id: 'vault', label: 'Family Vault', icon: Lock },
    { id: 'family-members', label: 'Family Members', icon: Users },
    { id: 'nominees', label: 'Nominees', icon: UserCheck },
    { id: 'medical', label: 'Medical Passport', icon: Activity },
    { id: 'sos', label: 'Emergency SOS', icon: AlertTriangle, highlight: true },
    { id: 'calendar', label: 'Premium Calendar', icon: Calendar },
    { id: 'security', label: 'Security Intelligence', icon: ShieldCheck },
    { id: 'system', label: 'DB & System', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
  ];

  const handleSignOut = async () => {
    await logout();
    notify('info', 'Signed Out', 'You have logged out of Guardian Stack.');
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('hub')}>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  GUARDIAN STACK
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  ENTERPRISE
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400 -mt-0.5 font-medium">Actuarial Intelligence &amp; Protection Engine</p>
            </div>
          </div>

          {/* Right Quick Actions & Authenticated Session Bar */}
          <div className="flex items-center space-x-2">
            {/* Quick Active Customer Chip (Desktop) */}
            <div className="hidden xl:flex items-center">
              {selectedCustomer ? (
                <button
                  onClick={onOpenSelector}
                  className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-xs transition-colors group"
                  title="Click to switch or edit customer profile"
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px] group-hover:bg-cyan-500/30">
                    {selectedCustomer.full_name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors flex items-center space-x-1.5">
                      <span className="max-w-[130px] truncate">{selectedCustomer.full_name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({selectedCustomer.profile_id})</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Age {selectedCustomer.age} • {selectedCustomer.city} • ₹{(selectedCustomer.annual_income_inr / 100000).toFixed(1)}L/yr
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 group-hover:bg-cyan-900 group-hover:text-cyan-200">
                    Switch
                  </span>
                </button>
              ) : (
                <button
                  onClick={onOpenSelector}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 font-medium"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Select Profile</span>
                </button>
              )}
            </div>

            {/* Compact Customer Switcher for Tablet/Mobile */}
            <button
              onClick={onOpenSelector}
              className="xl:hidden flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200"
              title="Switch Customer Profile"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Client</span>
            </button>

            {/* AI Assistant Quick Trigger */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all shadow-cyan-600/20"
              title="Open AI Insurance Copilot"
            >
              <Brain className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* PDF Report Quick Trigger */}
            <button
              onClick={onOpenReportModal}
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 transition-colors"
              title="Generate comprehensive Actuarial PDF Report"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden lg:inline">PDF Report</span>
            </button>

            {/* Dataset Importer */}
            <button
              onClick={onOpenDatasetModal}
              className="hidden md:flex items-center space-x-1.5 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
              title="Upload custom ZIP or CSV datasets"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Datasets</span>
            </button>

            {/* Authenticated User Profile & Logout Controls */}
            {user && (
              <div className="flex items-center space-x-1.5 pl-1 border-l border-slate-800">
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                  title="Account Profile & Settings"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline max-w-[96px] truncate font-semibold">
                    {user.displayName}
                  </span>
                  {isDemoMode && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                      DEMO
                    </span>
                  )}
                </button>

                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg bg-slate-850 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none py-1 border-t border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                } ${tab.highlight ? 'text-amber-400 hover:text-amber-300' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : ''}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/20">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

