import React, { useState, useMemo, useCallback } from 'react';
import { CustomerProfile } from './types/insurance';
import { INITIAL_CUSTOMER_PROFILES } from './data/customerProfiles';
import { INSURANCE_PRODUCTS, INITIAL_PREMIUM_RATES, RIDERS_DATA } from './data/insuranceProducts';
import { calculateActuarialMetrics, evaluatePolicyRecommendations } from './utils/actuarialEngine';

import { Navigation, NavTab } from './components/Navigation';
import { CustomerSelector } from './components/CustomerSelector';
import { CustomerEditor51Fields } from './components/CustomerEditor51Fields';
import { ActuarialDashboard } from './components/ActuarialDashboard';
import { PolicyRecommendations } from './components/PolicyRecommendations';
import { PdfReportModal } from './components/PdfReportModal';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { MlIntelligenceView } from './components/MlIntelligenceView';
import { AiAssistantModal } from './components/AiAssistantModal';
import { DatasetImportModal } from './components/DatasetImportModal';

import { LifeNeedsFinder } from './components/LifeNeedsFinder';
import { FamilyVault } from './components/FamilyVault';
import { MedicalPassport } from './components/MedicalPassport';
import { EmergencySos } from './components/EmergencySos';
import { PremiumCalendar } from './components/PremiumCalendar';
import { SecurityIntelligence } from './components/SecurityIntelligence';
import { SystemHealth } from './components/SystemHealth';

import { ToastProvider, useToast } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserDataProvider } from './contexts/UserDataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FamilyMemberManagement } from './components/FamilyMemberManagement';
import { FamilyNomineeManagement } from './components/FamilyNomineeManagement';
import { SettingsAccountManagement } from './components/SettingsAccountManagement';
import { HelpSupportCentre } from './components/HelpSupportCentre';

import { 
  Brain, BarChart3, Edit3, ShieldAlert, Sliders, Layers, 
  UserCheck, RotateCcw, FileText, Sparkles, AlertCircle, MailCheck 
} from 'lucide-react';

function GuardianWorkspace() {
  const { user, isDemoMode, resendVerificationEmail, refreshVerificationStatus } = useAuth();
  const { notify } = useToast();
  // Master customer dataset (200 records)
  const [customerProfiles, setCustomerProfiles] = useState<CustomerProfile[]>(INITIAL_CUSTOMER_PROFILES);
  // Immutable backup of dataset original values for reliable reset
  const [originalDatasetProfiles, setOriginalDatasetProfiles] = useState<CustomerProfile[]>(INITIAL_CUSTOMER_PROFILES);

  // Active selected customer (defaults to first profile)
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    INITIAL_CUSTOMER_PROFILES[0]?.profile_id || 'CUST-0001'
  );

  // Top level navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('hub');

  // Hub sub-view tab
  const [hubSubTab, setHubSubTab] = useState<'dashboard' | 'editor' | 'recommendations' | 'scenarios' | 'ml'>('dashboard');

  // Modal open states
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);

  // Active customer object
  const currentCustomer = useMemo(() => {
    return customerProfiles.find(p => p.profile_id === selectedProfileId) || customerProfiles[0];
  }, [customerProfiles, selectedProfileId]);

  // Recalculate actuarial metrics dynamically on any change
  const actuarialAnalysis = useMemo(() => {
    return calculateActuarialMetrics(currentCustomer);
  }, [currentCustomer]);

  // Recalculate policy recommendations dynamically
  const policyRecommendations = useMemo(() => {
    return evaluatePolicyRecommendations(
      currentCustomer,
      actuarialAnalysis,
      INSURANCE_PRODUCTS,
      INITIAL_PREMIUM_RATES,
      RIDERS_DATA
    );
  }, [currentCustomer, actuarialAnalysis]);

  // Update customer profile state in master list
  const handleCustomerChange = useCallback((updated: CustomerProfile) => {
    setCustomerProfiles(prev =>
      prev.map(p => (p.profile_id === updated.profile_id ? updated : p))
    );
  }, []);

  // Reset selected customer to original dataset values
  const handleResetToDatasetOriginal = useCallback(() => {
    const original = originalDatasetProfiles.find(p => p.profile_id === selectedProfileId);
    if (original) {
      handleCustomerChange({ ...original });
    }
  }, [originalDatasetProfiles, selectedProfileId, handleCustomerChange]);

  // Reset ALL profiles to original dataset
  const handleResetAllToOriginals = useCallback(() => {
    setCustomerProfiles([...originalDatasetProfiles]);
  }, [originalDatasetProfiles]);

  // Create new customer profile manually
  const handleCreateNewCustomer = useCallback(() => {
    const newId = `CUST-${String(customerProfiles.length + 1).padStart(4, '0')}`;
    const newProfile: CustomerProfile = {
      profile_id: newId,
      full_name: 'New Applicant Profile',
      age: 32,
      gender: 'Male',
      city: 'Bengaluru',
      city_tier: 'Tier 1',
      residency_status: 'Resident Indian',
      country_of_residence: 'India',
      marital_status: 'Married',
      employment_type: 'Salaried',
      occupation: 'IT Systems Architect',
      annual_income_inr: 2200000,
      expected_income_growth_pct: 8.0,
      monthly_household_expenses_inr: 70000,
      monthly_premium_budget_inr: 12000,
      spouse_age: 30,
      spouse_working: true,
      spouse_annual_income_inr: 1200000,
      num_children: 1,
      children_ages: [4],
      num_dependent_parents: 2,
      dependent_parent_ages: [62, 59],
      home_loan_outstanding_inr: 4500000,
      home_loan_remaining_months: 180,
      home_loan_interest_rate_pct: 8.4,
      home_loan_emi_inr: 39000,
      car_loan_outstanding_inr: 400000,
      car_loan_remaining_months: 24,
      car_loan_interest_rate_pct: 9.2,
      car_loan_emi_inr: 18000,
      personal_loan_outstanding_inr: 0,
      personal_loan_remaining_months: 0,
      personal_loan_interest_rate_pct: 0,
      personal_loan_emi_inr: 0,
      education_loan_outstanding_inr: 0,
      education_loan_remaining_months: 0,
      education_loan_interest_rate_pct: 0,
      education_loan_emi_inr: 0,
      employer_group_life_cover_inr: 6000000,
      individual_life_cover_inr: 2500000,
      liquid_savings_inr: 800000,
      market_investments_inr: 1500000,
      retirement_savings_inr: 1800000,
      num_goals: 3,
      smoker_status: 'Non-Smoker',
      bmi: 23.4,
      health_conditions: 'None reported. Annual corporate health checks normal.',
      risk_appetite: 'Moderate',
      preferred_policy_term_years: 28,
      preferred_language: 'English',
      profile_date: new Date().toISOString().split('T')[0]
    };

    setCustomerProfiles(prev => [newProfile, ...prev]);
    setSelectedProfileId(newId);
    setHubSubTab('editor');
  }, [customerProfiles.length]);

  // Handle uploaded dataset profiles
  const handleDatasetImported = useCallback((imported: CustomerProfile[]) => {
    setCustomerProfiles(imported);
    setOriginalDatasetProfiles(imported);
    if (imported.length > 0) {
      setSelectedProfileId(imported[0].profile_id);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Application Header */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCustomer={currentCustomer}
        onOpenSelector={() => setIsSelectorOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenReportModal={() => setIsPdfModalOpen(true)}
        onOpenDatasetModal={() => setIsDatasetModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Email Verification Notice for Unverified Cloud Accounts */}
        {user && !user.emailVerified && !isDemoMode && (
          <div className="bg-amber-950/50 border border-amber-800/80 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5 text-amber-200">
              <MailCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Please verify <strong>{user.email}</strong> to enable Cloud Firestore sync across
                devices. Until verified, your edits are safely staged in your session.
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={async () => {
                  try {
                    await resendVerificationEmail();
                    notify('success', 'Verification Email Sent', `Check ${user.email}`);
                  } catch (err: any) {
                    notify('error', 'Could Not Resend', err?.message);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-200 font-semibold"
              >
                Resend Email
              </button>
              <button
                onClick={async () => {
                  const ok = await refreshVerificationStatus();
                  if (ok) {
                    notify('success', 'Email Verified', 'Zero-Trust Cloud Sync activated!');
                  } else {
                    notify('warning', 'Not Verified Yet', 'Click the link in your inbox first.');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
              >
                I&apos;ve Verified
              </button>
            </div>
          </div>
        )}
        
        {/* TAB 1: GUARDIAN INTELLIGENCE HUB (FLAGSHIP FEATURE) */}
        {activeTab === 'hub' && (
          <div className="space-y-6">
            {/* Hub Sub-Navigation and Active Customer Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-600/30">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-base font-extrabold text-white">Guardian Intelligence Hub</h1>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                      FLAGSHIP
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Active Client: <strong className="text-slate-200">{currentCustomer.full_name}</strong> ({currentCustomer.profile_id}) • {currentCustomer.city} • Age {currentCustomer.age}
                  </p>
                </div>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="flex space-x-1 bg-slate-850 p-1 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none text-xs">
                <button
                  onClick={() => setHubSubTab('dashboard')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    hubSubTab === 'dashboard'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setHubSubTab('editor')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    hubSubTab === 'editor'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>51-Field Editor</span>
                </button>

                <button
                  onClick={() => setHubSubTab('recommendations')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    hubSubTab === 'recommendations'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Recommendations ({policyRecommendations.filter(r => r.isEligible).length})</span>
                </button>

                <button
                  onClick={() => setHubSubTab('scenarios')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    hubSubTab === 'scenarios'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>What-If Sandbox</span>
                </button>

                <button
                  onClick={() => setHubSubTab('ml')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    hubSubTab === 'ml'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>ML &amp; Clusters</span>
                </button>
              </div>
            </div>

            {/* Sub-View Renderings */}
            {hubSubTab === 'dashboard' && (
              <ActuarialDashboard
                customer={currentCustomer}
                analysis={actuarialAnalysis}
              />
            )}

            {hubSubTab === 'editor' && (
              <CustomerEditor51Fields
                customer={currentCustomer}
                onChange={handleCustomerChange}
                onResetOriginal={handleResetToDatasetOriginal}
              />
            )}

            {hubSubTab === 'recommendations' && (
              <PolicyRecommendations
                customer={currentCustomer}
                recommendations={policyRecommendations}
                analysis={actuarialAnalysis}
              />
            )}

            {hubSubTab === 'scenarios' && (
              <ScenarioSimulator
                originalCustomer={currentCustomer}
                originalAnalysis={actuarialAnalysis}
              />
            )}

            {hubSubTab === 'ml' && (
              <MlIntelligenceView
                customerProfiles={customerProfiles}
                currentProfileId={currentCustomer.profile_id}
              />
            )}
          </div>
        )}

        {/* TAB 2: LIFE NEEDS FINDER */}
        {activeTab === 'life-needs' && (
          <LifeNeedsFinder
            customer={currentCustomer}
            analysis={actuarialAnalysis}
            onApplyRecommendations={(targetSA) => {
              handleCustomerChange({
                ...currentCustomer,
                individual_life_cover_inr: Math.round(targetSA)
              });
              setActiveTab('hub');
              setHubSubTab('recommendations');
            }}
          />
        )}

        {/* TAB 3: FAMILY VAULT */}
        {activeTab === 'vault' && (
          <FamilyVault customer={currentCustomer} />
        )}

        {/* TAB 4: MEDICAL PASSPORT */}
        {activeTab === 'medical' && (
          <MedicalPassport customer={currentCustomer} />
        )}

        {/* TAB 5: EMERGENCY SOS */}
        {activeTab === 'sos' && (
          <EmergencySos customer={currentCustomer} />
        )}

        {/* TAB 6: PREMIUM CALENDAR */}
        {activeTab === 'calendar' && (
          <PremiumCalendar customer={currentCustomer} />
        )}

        {/* TAB 7: SECURITY INTELLIGENCE */}
        {activeTab === 'security' && (
          <SecurityIntelligence />
        )}

        {/* TAB 8: DATABASE & SYSTEM HEALTH */}
        {activeTab === 'system' && (
          <SystemHealth />
        )}

        {/* NEW MODULE: FAMILY MEMBER MANAGEMENT */}
        {activeTab === 'family-members' && (
          <FamilyMemberManagement onNavigateToNominees={() => setActiveTab('nominees')} />
        )}

        {/* NEW MODULE: FAMILY NOMINEE MANAGEMENT */}
        {activeTab === 'nominees' && (
          <FamilyNomineeManagement />
        )}

        {/* NEW MODULE: SETTINGS & ACCOUNT MANAGEMENT */}
        {activeTab === 'settings' && (
          <SettingsAccountManagement />
        )}

        {/* NEW MODULE: HELP & SUPPORT CENTRE */}
        {activeTab === 'support' && (
          <HelpSupportCentre />
        )}
      </main>

      {/* Global Modals */}
      <CustomerSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        customerProfiles={customerProfiles}
        selectedProfileId={selectedProfileId}
        onSelectCustomer={(p) => {
          setSelectedProfileId(p.profile_id);
          setIsSelectorOpen(false);
        }}
        onCreateNewCustomer={handleCreateNewCustomer}
        onResetToDatasetOriginals={handleResetAllToOriginals}
      />

      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        customer={currentCustomer}
        analysis={actuarialAnalysis}
        recommendations={policyRecommendations}
      />

      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        customer={currentCustomer}
        analysis={actuarialAnalysis}
        recommendations={policyRecommendations}
      />

      <DatasetImportModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        onDatasetImported={handleDatasetImported}
      />

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Guardian Stack Insurance Intelligence Platform • Production Ready Release</span>
          <span>Actuarially Verified • 51-Field Customer Schema • Zero Hallucination Standard</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <UserDataProvider>
          <ProtectedRoute>
            <GuardianWorkspace />
          </ProtectedRoute>
        </UserDataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
