import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Lock,
  Palette,
  Bell,
  Download,
  Trash2,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  Globe,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  FileJson,
  FileSpreadsheet,
  RefreshCw,
  MailCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { useToast } from '../contexts/ToastContext';
import {
  ThemePreference,
  SupportedLanguage,
  EMAIL_REGEX,
  PHONE_REGEX,
  VALIDATION_LIMITS,
} from '../types/accountFeatures';

type SettingsSection = 'profile' | 'security' | 'appearance' | 'notifications' | 'data';

const LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: 'English', label: 'English (Default)' },
  { value: 'Hindi', label: 'Hindi — हिन्दी' },
  { value: 'Telugu', label: 'Telugu — తెలుగు' },
  { value: 'Tamil', label: 'Tamil — தமிழ்' },
  { value: 'Kannada', label: 'Kannada — ಕನ್ನಡ' },
  { value: 'Marathi', label: 'Marathi — मराठी' },
  { value: 'Bengali', label: 'Bengali — বাংলা' },
];

export const SettingsAccountManagement: React.FC = () => {
  const {
    user,
    isDemoMode,
    profile,
    settings,
    updateUserProfile,
    changeUserPassword,
    updateUserSettings,
    deleteUserAccount,
    resendVerificationEmail,
    refreshVerificationStatus,
    logout,
  } = useAuth();

  const {
    familyMembers,
    nominees,
    supportTickets,
    exportAllDataJson,
    exportFamilyAndNomineesCsv,
    resetDemoRecords,
  } = useUserData();

  const { notify } = useToast();

  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  // Profile form state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(profile.email || user?.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth || '');
  const [city, setCity] = useState(profile.city || '');
  const [occupation, setOccupation] = useState(profile.occupation || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [passwordForEmailChange, setPasswordForEmailChange] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
    setEmail(profile.email || user?.email || '');
    setPhone(profile.phone || '');
    setDateOfBirth(profile.dateOfBirth || '');
    setCity(profile.city || '');
    setOccupation(profile.occupation || '');
    setBio(profile.bio || '');
  }, [user?.displayName, user?.email, profile]);

  const emailChanged =
    Boolean(user?.email) && email.trim().toLowerCase() !== user?.email.toLowerCase();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.trim().length < 2) {
      notify('error', 'Validation Error', 'Full name must be at least 2 characters.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      notify('error', 'Validation Error', 'Please provide a valid email address.');
      return;
    }
    if (phone.trim() && !PHONE_REGEX.test(phone.trim())) {
      notify('error', 'Validation Error', 'Please enter a valid phone number.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const notice = await updateUserProfile({
        displayName: displayName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth,
        city: city.trim(),
        occupation: occupation.trim(),
        bio: bio.trim(),
        currentPasswordForEmailChange: passwordForEmailChange || undefined,
      });
      setPasswordForEmailChange('');
      notify(
        'success',
        'Profile Updated',
        notice || 'Your account details and personal profile have been saved.'
      );
    } catch (err: any) {
      notify('error', 'Profile Update Failed', err?.message || 'Unable to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDemoMode && user?.authProvider === 'google.com') {
      notify(
        'info',
        'Google Managed Account',
        'Your account signs in with Google OAuth. Manage your Google password in your Google Account settings.'
      );
      return;
    }
    if (!isDemoMode && !currentPassword) {
      notify('error', 'Current Password Required', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      notify(
        'error',
        'Weak Password',
        'New password must be at least 8 characters with letters and numbers.'
      );
      return;
    }
    if (newPassword !== confirmNewPassword) {
      notify('error', 'Password Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changeUserPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      notify('success', 'Password Updated', 'Your account password has been changed securely.');
    } catch (err: any) {
      notify('error', 'Password Change Failed', err?.message || 'Could not update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggleSetting = async (key: keyof typeof settings, value: any, label: string) => {
    try {
      await updateUserSettings({ [key]: value });
      notify('success', 'Preference Saved', `${label} updated.`);
    } catch (err: any) {
      notify('error', 'Settings Error', err?.message || 'Could not save setting.');
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE') {
      notify('error', 'Confirmation Required', 'Please type DELETE in uppercase to confirm.');
      return;
    }
    if (!isDemoMode && user?.authProvider === 'password' && !deletePassword) {
      notify('error', 'Password Required', 'Enter your password to authorize account deletion.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      await deleteUserAccount(deletePassword || undefined);
      setIsDeleteModalOpen(false);
      notify(
        'info',
        'Account Deleted',
        'Your account and associated personal records have been permanently removed.'
      );
    } catch (err: any) {
      notify('error', 'Account Deletion Failed', err?.message || 'Unable to delete account.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const navItems: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Account & Profile', icon: User },
    { id: 'security', label: 'Password & Privacy', icon: Lock },
    { id: 'appearance', label: 'Theme & Language', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data Export & Danger Zone', icon: Download },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-100">
                Settings &amp; Account Management
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                {isDemoMode ? 'DEMO SESSION' : 'CLOUD ACCOUNT'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage your personal profile, security credentials, theme &amp; language preferences,
              notifications, and portable data exports.
            </p>
          </div>
        </div>

        <button
          onClick={async () => {
            await logout();
            notify('info', 'Signed Out', 'Your session has been closed securely.');
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Account Summary Snapshot */}
          {user && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-extrabold text-sm">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-100 truncate">{user.displayName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Auth Method:</span>
                  <span className="font-semibold text-slate-200 capitalize">
                    {user.authProvider}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verification:</span>
                  <span
                    className={`font-semibold ${
                      user.emailVerified ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {user.emailVerified ? 'Verified' : 'Pending Email'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stored Records:</span>
                  <span className="font-semibold text-cyan-400">
                    {familyMembers.length + nominees.length + supportTickets.length} items
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-9 space-y-6">
          {/* SECTION 1: ACCOUNT & PROFILE */}
          {activeSection === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Account Information &amp; Personal Profile
                  </h3>
                  <p className="text-xs text-slate-400">
                    Update your name, email address, phone number, city, and policyholder details.
                  </p>
                </div>
                {user && (
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-850 border border-slate-800 text-slate-400">
                    UID: {user.uid.slice(0, 16)}
                  </span>
                )}
              </div>

              {user && !user.emailVerified && !isDemoMode && (
                <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-2.5">
                    <MailCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-200">Verify Your Email for Cloud Sync</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Zero-Trust Firestore rules require a verified email before persisting
                        changes to the cloud database.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await resendVerificationEmail();
                          notify('success', 'Verification Sent', `Sent to ${user.email}`);
                        } catch (err: any) {
                          notify('error', 'Send Failed', err?.message);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-200 font-semibold text-[11px]"
                    >
                      Resend Link
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const verified = await refreshVerificationStatus();
                        if (verified) {
                          notify('success', 'Email Verified!', 'Cloud sync is now active.');
                        } else {
                          notify(
                            'warning',
                            'Still Unverified',
                            'Click the link in your email first, then click Refresh.'
                          );
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px]"
                    >
                      Refresh Status
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={VALIDATION_LIMITS.DISPLAY_NAME_MAX}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      maxLength={VALIDATION_LIMITS.EMAIL_MAX}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {emailChanged && !isDemoMode && user?.authProvider === 'password' && (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-slate-850 border border-cyan-800/60">
                      <label className="block font-semibold text-cyan-300 mb-1">
                        Confirm Current Password to Change Email
                      </label>
                      <input
                        type="password"
                        value={passwordForEmailChange}
                        onChange={(e) => setPasswordForEmailChange(e.target.value)}
                        placeholder="Enter current password to authorize email update"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      maxLength={VALIDATION_LIMITS.PHONE_MAX}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98450 11223"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      maxLength={VALIDATION_LIMITS.CITY_MAX}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Bengaluru"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Occupation</label>
                    <input
                      type="text"
                      maxLength={VALIDATION_LIMITS.OCCUPATION_MAX}
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="e.g. Financial Analyst"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Policyholder Notes / Bio
                  </label>
                  <textarea
                    rows={3}
                    maxLength={VALIDATION_LIMITS.BIO_MAX}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Personal financial protection goals or household notes..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-cyan-600/20 flex items-center space-x-2"
                  >
                    {isSavingProfile ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>{isSavingProfile ? 'Saving...' : 'Save Profile Details'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECTION 2: PASSWORD & PRIVACY */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              {/* Change Password Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100">Change Account Password</h3>
                  <p className="text-xs text-slate-400">
                    Rotate your password regularly to protect household and policy records.
                  </p>
                </div>

                {!isDemoMode && user?.authProvider === 'google.com' ? (
                  <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 text-xs text-slate-300 flex items-center space-x-3">
                    <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                    <span>
                      You are authenticated via <strong>Google Sign-In</strong>. Password and 2FA
                      credentials are managed directly by Google Identity.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4 text-xs max-w-lg">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required={!isDemoMode}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={isDemoMode ? 'Optional in Demo Mode' : 'Enter current password'}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 chars with letters & numbers"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold"
                    >
                      {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </form>
                )}
              </div>

              {/* Privacy & Security Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100">
                    Privacy &amp; Session Security Controls
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control PII masking across family cards and configure session persistence.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-100">
                        Mask Sensitive Contact Information (PII) by Default
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Obscures phone numbers and emails in Family &amp; Nominee views until
                        explicitly revealed.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maskSensitiveData}
                      onChange={(e) =>
                        handleToggleSetting(
                          'maskSensitiveData',
                          e.target.checked,
                          'PII Data Masking'
                        )
                      }
                      className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-100">
                        Account Security Activity Audit Trail
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Maintain timestamped security metadata for profile and nominee changes.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.activityAuditEnabled}
                      onChange={(e) =>
                        handleToggleSetting(
                          'activityAuditEnabled',
                          e.target.checked,
                          'Activity Audit Logging'
                        )
                      }
                      className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-100">Browser Session Persistence</div>
                      <div className="text-[11px] text-slate-400">
                        Choose whether your login persists across browser restarts or clears when
                        the tab closes.
                      </div>
                    </div>
                    <select
                      value={settings.sessionPersistence}
                      onChange={(e) =>
                        handleToggleSetting(
                          'sessionPersistence',
                          e.target.value,
                          'Session Persistence'
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200"
                    >
                      <option value="local">Keep Signed In (Local)</option>
                      <option value="session">Current Tab Only (Session)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: THEME & LANGUAGE */}
          {activeSection === 'appearance' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-xs">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100">
                  Theme &amp; Language Preferences
                </h3>
                <p className="text-xs text-slate-400">
                  Customize Guardian Stack visual appearance and regional language preference.
                </p>
              </div>

              {/* Theme Cards */}
              <div className="space-y-2.5">
                <label className="block font-bold text-slate-200">Interface Theme</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        id: 'dark',
                        title: 'Enterprise Dark',
                        desc: 'High-contrast slate night palette',
                        icon: Moon,
                      },
                      {
                        id: 'light',
                        title: 'Daylight Crisp',
                        desc: 'Bright surface mode for daytime review',
                        icon: Sun,
                      },
                      {
                        id: 'system',
                        title: 'System Automatic',
                        desc: 'Syncs with OS appearance setting',
                        icon: Monitor,
                      },
                    ] as {
                      id: ThemePreference;
                      title: string;
                      desc: string;
                      icon: React.ElementType;
                    }[]
                  ).map((opt) => {
                    const Icon = opt.icon;
                    const active = settings.theme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleSetting('theme', opt.id, `Theme (${opt.title})`)}
                        className={`p-4 rounded-xl border text-left space-y-2 transition-all ${
                          active
                            ? 'bg-cyan-950/50 border-cyan-500 ring-1 ring-cyan-500/40'
                            : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon
                            className={`w-5 h-5 ${active ? 'text-cyan-400' : 'text-slate-400'}`}
                          />
                          {active && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100">{opt.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Preference */}
              <div className="space-y-2 max-w-md">
                <label className="block font-bold text-slate-200 flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Preferred Advisory &amp; Portal Language</span>
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    handleToggleSetting(
                      'language',
                      e.target.value as SupportedLanguage,
                      `Language (${e.target.value})`
                    )
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Active preference: <strong className="text-cyan-400">{settings.language}</strong>.
                  Stored with your account for communications and advisory reports.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 4: NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100">Notification Preferences</h3>
                <p className="text-xs text-slate-400">
                  Choose which alerts and reminders you want to receive.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'notifyPremiumAlerts' as const,
                    title: 'Premium Due & Renewal Reminders',
                    desc: 'Advance reminders 30, 15, and 3 days prior to annual or monthly policy due dates.',
                  },
                  {
                    key: 'notifyPolicyUpdates' as const,
                    title: 'Underwriting & Policy Recommendations',
                    desc: 'Alerts when life-stage changes impact your calculated Human Life Value or Net Needs.',
                  },
                  {
                    key: 'notifyNomineeReminders' as const,
                    title: 'Nominee Allocation & KYC Verification Prompts',
                    desc: 'Periodic reminders if any policy has less than 100% beneficiary allocation.',
                  },
                  {
                    key: 'notifySecurityAlerts' as const,
                    title: 'Security & New Device Sign-In Alerts',
                    desc: 'Immediate notifications for password changes, email updates, and new logins.',
                  },
                  {
                    key: 'notifySupportUpdates' as const,
                    title: 'Help & Support Ticket Updates',
                    desc: 'Status updates when support specialists reply to or resolve your tickets.',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-100">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settings[item.key])}
                      onChange={(e) =>
                        handleToggleSetting(item.key, e.target.checked, item.title)
                      }
                      className="w-4 h-4 rounded accent-cyan-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: DATA EXPORT & ACCOUNT DELETION */}
          {activeSection === 'data' && (
            <div className="space-y-6 text-xs">
              {/* Data Export Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100">
                    Portable Data Export &amp; Backup
                  </h3>
                  <p className="text-xs text-slate-400">
                    Download a complete copy of your profile, settings, family members, nominees,
                    and support tickets.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                        <FileJson className="w-4 h-4" />
                        <span>Full Account Archive (JSON)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Includes profile, preferences, {familyMembers.length} family member(s),{' '}
                        {nominees.length} nominee(s), and {supportTickets.length} ticket(s).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        exportAllDataJson();
                        notify('success', 'JSON Export Downloaded', 'Saved complete archive file.');
                      }}
                      className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JSON Archive</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Family &amp; Nominee Schedule (CSV)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Spreadsheet-compatible CSV summary of all household members and policy
                        beneficiary percentages.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        exportFamilyAndNomineesCsv();
                        notify('success', 'CSV Schedule Downloaded', 'Saved family & nominee CSV.');
                      }}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold flex items-center justify-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download CSV Report</span>
                    </button>
                  </div>
                </div>

                {isDemoMode && (
                  <div className="pt-2 flex items-center justify-between p-3.5 rounded-xl bg-slate-850 border border-slate-800">
                    <div>
                      <span className="font-bold text-slate-200 block">
                        Reset Demo Sample Records
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Restore default sample family members, nominees, and support ticket.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        resetDemoRecords();
                        notify('info', 'Demo Data Restored', 'Sample records have been reset.');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold"
                    >
                      Reset Demo Data
                    </button>
                  </div>
                )}
              </div>

              {/* Danger Zone: Account Deletion */}
              <div className="bg-slate-900 border border-rose-900/60 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-rose-400 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Danger Zone — Permanent Account Deletion</span>
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xl">
                      Permanently delete your user account along with all stored family member
                      profiles, nominee allocations, preferences, and support tickets. This action
                      cannot be undone.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmText('');
                      setDeletePassword('');
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center space-x-1.5 shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete My Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACCOUNT DELETION CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-slate-100">Confirm Account Deletion</h3>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1 rounded-lg bg-slate-850 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              This will permanently erase your profile,{' '}
              <strong>{familyMembers.length} family member(s)</strong>,{' '}
              <strong>{nominees.length} nominee allocation(s)</strong>, and{' '}
              <strong>{supportTickets.length} support ticket(s)</strong>.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Type <code className="text-rose-400 font-bold">DELETE</code> to confirm
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              {!isDemoMode && user?.authProvider === 'password' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Current Account Password
                  </label>
                  <input
                    type="password"
                    required
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter password to authorize deletion"
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeletingAccount || deleteConfirmText !== 'DELETE'}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold"
                >
                  {isDeletingAccount ? 'Deleting Account...' : 'Permanently Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
