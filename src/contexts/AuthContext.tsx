import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  verifyBeforeUpdateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  deleteUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import {
  AppUser,
  UserPrivateProfile,
  UserSettings,
  ThemePreference,
  VALIDATION_LIMITS,
  sanitizeText,
} from '../types/accountFeatures';

const DEMO_SESSION_KEY = 'guardian_stack_demo_active_v1';
const DEMO_PROFILE_KEY = 'guardian_stack_demo_profile_v1';
const DEMO_SETTINGS_KEY = 'guardian_stack_demo_settings_v1';
const DEMO_DATA_KEY = 'guardian_stack_demo_records_v1';
const PENDING_PROFILE_PREFIX = 'guardian_pending_profile_';

const DEFAULT_SETTINGS = (ownerId: string): UserSettings => ({
  ownerId,
  theme: 'dark',
  language: 'English',
  notifyPremiumAlerts: true,
  notifyPolicyUpdates: true,
  notifyNomineeReminders: true,
  notifySecurityAlerts: true,
  notifySupportUpdates: true,
  maskSensitiveData: false,
  sessionPersistence: 'local',
  activityAuditEnabled: true,
});

const DEFAULT_PROFILE = (ownerId: string, email: string): UserPrivateProfile => ({
  ownerId,
  email: email || 'user@guardianstack.in',
  phone: '',
  dateOfBirth: '',
  city: 'Bengaluru',
  occupation: '',
  bio: '',
});

export interface ProfileUpdatePayload {
  displayName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  city: string;
  occupation: string;
  bio: string;
  currentPasswordForEmailChange?: string;
}

interface AuthContextValue {
  user: AppUser | null;
  firebaseUser: User | null;
  isDemoMode: boolean;
  isAuthReady: boolean;
  profile: UserPrivateProfile;
  settings: UserSettings;
  emailProviderSetupRequired: boolean;
  clearEmailProviderNotice: () => void;
  registerWithEmail: (fullName: string, email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  loginWithGoogle: (rememberMe: boolean) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  confirmResetWithCode: (oobCode: string, newPassword: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshVerificationStatus: () => Promise<boolean>;
  enterDemoMode: () => void;
  logout: () => Promise<void>;
  updateUserProfile: (payload: ProfileUpdatePayload) => Promise<string | void>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserSettings: (updates: Partial<UserSettings>) => Promise<void>;
  deleteUserAccount: (currentPassword?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function applyDocumentTheme(theme: ThemePreference) {
  const root = document.documentElement;
  const prefersLight =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches;
  const useLight = theme === 'light' || (theme === 'system' && prefersLight);

  if (useLight) {
    root.classList.add('theme-light');
  } else {
    root.classList.remove('theme-light');
  }
}

export function formatFirebaseAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials and try again.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters including letters and numbers.';
    case 'auth/too-many-requests':
      return 'Too many attempts detected. Please wait a moment before trying again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing authentication.';
    case 'auth/requires-recent-login':
      return 'For security, please enter your current password or sign in again before performing this sensitive action.';
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return 'Email/Password sign-in must be enabled in your Firebase Console (Authentication → Sign-in method → Email/Password), or continue immediately with Google Sign-In or Demo Mode.';
    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return 'The password reset code is invalid or has expired. Please request a new reset email.';
    default:
      return error?.message || 'Authentication error occurred. Please try again.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DEMO_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [emailProviderSetupRequired, setEmailProviderSetupRequired] = useState<boolean>(false);

  const [demoDisplayName, setDemoDisplayName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(DEMO_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.displayName) return parsed.displayName;
      }
    } catch {
      // ignore
    }
    return 'Aarav Mehta (Demo)';
  });

  const [profile, setProfile] = useState<UserPrivateProfile>(() =>
    DEFAULT_PROFILE('demo_user', 'aarav.demo@guardianstack.in')
  );
  const [settings, setSettings] = useState<UserSettings>(() => DEFAULT_SETTINGS('demo_user'));

  // Apply theme whenever settings.theme changes
  useEffect(() => {
    applyDocumentTheme(settings.theme);
  }, [settings.theme]);

  // Bootstrap or load Firestore documents for verified Firebase user
  const syncVerifiedUserFirestoreDocs = useCallback(async (fbUser: User) => {
    const uid = fbUser.uid;
    const providerId =
      fbUser.providerData[0]?.providerId === 'google.com' ? 'google.com' : 'password';
    const safeEmail = sanitizeText(
      fbUser.email || `${uid}@guardianstack.in`,
      VALIDATION_LIMITS.EMAIL_MAX
    );

    // Check if pending registration profile exists in localStorage
    let pendingName = '';
    try {
      const pendingRaw = localStorage.getItem(`${PENDING_PROFILE_PREFIX}${uid}`);
      if (pendingRaw) {
        const parsed = JSON.parse(pendingRaw);
        pendingName = parsed.displayName || '';
      }
    } catch {
      // ignore
    }

    const displayName = sanitizeText(
      fbUser.displayName || pendingName || safeEmail.split('@')[0] || 'Policyholder',
      VALIDATION_LIMITS.DISPLAY_NAME_MAX
    );

    // 1. Ensure /users/{uid} exists FIRST (required by Master Gate)
    const userDocPath = `users/${uid}`;
    const userRef = doc(db, 'users', uid);
    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid,
          displayName,
          authProvider: providerId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userDocPath);
    }

    // 2. Ensure /users/{uid}/private/profile exists
    const privPath = `users/${uid}/private/profile`;
    const privRef = doc(db, 'users', uid, 'private', 'profile');
    try {
      const privSnap = await getDoc(privRef);
      if (!privSnap.exists()) {
        const initialProfile = {
          ownerId: uid,
          email: safeEmail,
          phone: '',
          dateOfBirth: '',
          city: 'Bengaluru',
          occupation: '',
          bio: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(privRef, initialProfile);
        setProfile({
          ownerId: uid,
          email: safeEmail,
          phone: '',
          dateOfBirth: '',
          city: 'Bengaluru',
          occupation: '',
          bio: '',
        });
      } else {
        const data = privSnap.data();
        setProfile({
          ownerId: uid,
          email: data.email || safeEmail,
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          city: data.city || '',
          occupation: data.occupation || '',
          bio: data.bio || '',
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, privPath);
    }

    // 3. Ensure /users/{uid}/settings/preferences exists
    const settingsPath = `users/${uid}/settings/preferences`;
    const settingsRef = doc(db, 'users', uid, 'settings', 'preferences');
    try {
      const setSnap = await getDoc(settingsRef);
      if (!setSnap.exists()) {
        const defaults = DEFAULT_SETTINGS(uid);
        await setDoc(settingsRef, {
          ...defaults,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setSettings(defaults);
      } else {
        const d = setSnap.data();
        setSettings({
          ownerId: uid,
          theme: d.theme || 'dark',
          language: d.language || 'English',
          notifyPremiumAlerts: Boolean(d.notifyPremiumAlerts ?? true),
          notifyPolicyUpdates: Boolean(d.notifyPolicyUpdates ?? true),
          notifyNomineeReminders: Boolean(d.notifyNomineeReminders ?? true),
          notifySecurityAlerts: Boolean(d.notifySecurityAlerts ?? true),
          notifySupportUpdates: Boolean(d.notifySupportUpdates ?? true),
          maskSensitiveData: Boolean(d.maskSensitiveData ?? false),
          sessionPersistence: d.sessionPersistence || 'local',
          activityAuditEnabled: Boolean(d.activityAuditEnabled ?? true),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, settingsPath);
    }

    try {
      localStorage.removeItem(`${PENDING_PROFILE_PREFIX}${uid}`);
    } catch {
      // ignore
    }
  }, []);

  // Load demo profile & settings when in demo mode
  useEffect(() => {
    if (isDemoMode && !firebaseUser) {
      try {
        const savedProf = localStorage.getItem(DEMO_PROFILE_KEY);
        if (savedProf) {
          const parsed = JSON.parse(savedProf);
          setDemoDisplayName(parsed.displayName || 'Aarav Mehta (Demo)');
          setProfile({
            ownerId: 'demo_user',
            email: parsed.email || 'aarav.demo@guardianstack.in',
            phone: parsed.phone ?? '+91 98450 11223',
            dateOfBirth: parsed.dateOfBirth ?? '1990-05-14',
            city: parsed.city ?? 'Bengaluru',
            occupation: parsed.occupation ?? 'Principal Systems Architect',
            bio:
              parsed.bio ??
              'Exploring Guardian Stack actuarial protection, family vault, and nominee management.',
          });
        } else {
          const initialDemo = {
            displayName: 'Aarav Mehta (Demo)',
            ownerId: 'demo_user',
            email: 'aarav.demo@guardianstack.in',
            phone: '+91 98450 11223',
            dateOfBirth: '1990-05-14',
            city: 'Bengaluru',
            occupation: 'Principal Systems Architect',
            bio: 'Exploring Guardian Stack actuarial protection, family vault, and nominee management.',
          };
          localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(initialDemo));
          setDemoDisplayName(initialDemo.displayName);
          setProfile(initialDemo);
        }

        const savedSet = localStorage.getItem(DEMO_SETTINGS_KEY);
        if (savedSet) {
          setSettings({ ...DEFAULT_SETTINGS('demo_user'), ...JSON.parse(savedSet) });
        } else {
          const initialSet = DEFAULT_SETTINGS('demo_user');
          localStorage.setItem(DEMO_SETTINGS_KEY, JSON.stringify(initialSet));
          setSettings(initialSet);
        }
      } catch {
        // fallback defaults
      }
    }
  }, [isDemoMode, firebaseUser]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Real Firebase login supersedes demo mode
        setIsDemoMode(false);
        try {
          localStorage.removeItem(DEMO_SESSION_KEY);
        } catch {
          // ignore
        }

        if (fbUser.emailVerified) {
          try {
            await syncVerifiedUserFirestoreDocs(fbUser);
          } catch (err) {
            console.error('Error syncing verified user docs:', err);
          }
        } else {
          // Unverified email user: stage local profile until verified
          const safeEmail = fbUser.email || '';
          setProfile(DEFAULT_PROFILE(fbUser.uid, safeEmail));
          setSettings(DEFAULT_SETTINGS(fbUser.uid));
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, [syncVerifiedUserFirestoreDocs]);

  const user: AppUser | null = React.useMemo(() => {
    if (firebaseUser) {
      const providerId =
        firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google.com' : 'password';
      return {
        uid: firebaseUser.uid,
        displayName:
          firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Policyholder',
        email: firebaseUser.email || profile.email,
        emailVerified: firebaseUser.emailVerified,
        authProvider: providerId,
        createdAtIso: firebaseUser.metadata.creationTime || new Date().toISOString(),
        lastLoginIso: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
      };
    }
    if (isDemoMode) {
      return {
        uid: 'demo_user',
        displayName: demoDisplayName,
        email: profile.email || 'aarav.demo@guardianstack.in',
        emailVerified: true,
        authProvider: 'demo',
        createdAtIso: '2026-01-15T09:00:00.000Z',
        lastLoginIso: new Date().toISOString(),
      };
    }
    return null;
  }, [firebaseUser, isDemoMode, demoDisplayName, profile.email]);

  const registerWithEmail = useCallback(
    async (fullName: string, email: string, password: string) => {
      const cleanName = sanitizeText(fullName, VALIDATION_LIMITS.DISPLAY_NAME_MAX);
      const cleanEmail = sanitizeText(email, VALIDATION_LIMITS.EMAIL_MAX);
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateProfile(cred.user, { displayName: cleanName });
        try {
          localStorage.setItem(
            `${PENDING_PROFILE_PREFIX}${cred.user.uid}`,
            JSON.stringify({ displayName: cleanName, email: cleanEmail })
          );
        } catch {
          // ignore
        }
        await sendEmailVerification(cred.user);
        setFirebaseUser({ ...cred.user, displayName: cleanName } as User);
      } catch (err: any) {
        if (
          err?.code === 'auth/operation-not-allowed' ||
          err?.code === 'auth/configuration-not-found'
        ) {
          setEmailProviderSetupRequired(true);
        }
        throw new Error(formatFirebaseAuthError(err));
      }
    },
    []
  );

  const loginWithEmail = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      try {
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch (err: any) {
        if (
          err?.code === 'auth/operation-not-allowed' ||
          err?.code === 'auth/configuration-not-found'
        ) {
          setEmailProviderSetupRequired(true);
        }
        throw new Error(formatFirebaseAuthError(err));
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async (rememberMe: boolean) => {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      throw new Error(formatFirebaseAuthError(err));
    }
  }, []);

  const sendPasswordReset = useCallback(
    async (email: string) => {
      const cleanEmail = email.trim();
      if (isDemoMode || cleanEmail.toLowerCase() === 'aarav.demo@guardianstack.in') {
        return;
      }
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
      } catch (err: any) {
        if (
          err?.code === 'auth/operation-not-allowed' ||
          err?.code === 'auth/configuration-not-found'
        ) {
          setEmailProviderSetupRequired(true);
        }
        throw new Error(formatFirebaseAuthError(err));
      }
    },
    [isDemoMode]
  );

  const confirmResetWithCode = useCallback(async (oobCode: string, newPassword: string) => {
    try {
      await verifyPasswordResetCode(auth, oobCode.trim());
      await confirmPasswordReset(auth, oobCode.trim(), newPassword);
    } catch (err: any) {
      throw new Error(formatFirebaseAuthError(err));
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    if (!auth.currentUser) throw new Error('No signed-in user found.');
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (err: any) {
      throw new Error(formatFirebaseAuthError(err));
    }
  }, []);

  const refreshVerificationStatus = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    const refreshed = auth.currentUser;
    setFirebaseUser({ ...refreshed } as User);
    if (refreshed.emailVerified) {
      await syncVerifiedUserFirestoreDocs(refreshed);
      return true;
    }
    return false;
  }, [syncVerifiedUserFirestoreDocs]);

  const enterDemoMode = useCallback(() => {
    try {
      localStorage.setItem(DEMO_SESSION_KEY, 'true');
    } catch {
      // ignore
    }
    setIsDemoMode(true);
  }, []);

  const logout = useCallback(async () => {
    if (firebaseUser) {
      await signOut(auth);
    }
    try {
      localStorage.removeItem(DEMO_SESSION_KEY);
    } catch {
      // ignore
    }
    setIsDemoMode(false);
    setFirebaseUser(null);
    applyDocumentTheme('dark');
  }, [firebaseUser]);

  const updateUserProfile = useCallback(
    async (payload: ProfileUpdatePayload): Promise<string | void> => {
      const cleanName = sanitizeText(payload.displayName, VALIDATION_LIMITS.DISPLAY_NAME_MAX);
      const cleanEmail = sanitizeText(payload.email, VALIDATION_LIMITS.EMAIL_MAX);
      const cleanPhone = sanitizeText(payload.phone, VALIDATION_LIMITS.PHONE_MAX);
      const cleanDob = sanitizeText(payload.dateOfBirth, VALIDATION_LIMITS.DOB_MAX);
      const cleanCity = sanitizeText(payload.city, VALIDATION_LIMITS.CITY_MAX);
      const cleanOcc = sanitizeText(payload.occupation, VALIDATION_LIMITS.OCCUPATION_MAX);
      const cleanBio = sanitizeText(payload.bio, VALIDATION_LIMITS.BIO_MAX);

      if (!cleanName) throw new Error('Full name is required.');

      if (isDemoMode && !firebaseUser) {
        const nextProf: UserPrivateProfile & { displayName: string } = {
          displayName: cleanName,
          ownerId: 'demo_user',
          email: cleanEmail,
          phone: cleanPhone,
          dateOfBirth: cleanDob,
          city: cleanCity,
          occupation: cleanOcc,
          bio: cleanBio,
        };
        localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(nextProf));
        setDemoDisplayName(cleanName);
        setProfile(nextProf);
        return;
      }

      if (!auth.currentUser) throw new Error('You must be signed in to update your profile.');
      const fbUser = auth.currentUser;

      let emailNotice: string | undefined;
      if (cleanName !== fbUser.displayName) {
        await updateProfile(fbUser, { displayName: cleanName });
      }

      if (cleanEmail && fbUser.email && cleanEmail.toLowerCase() !== fbUser.email.toLowerCase()) {
        try {
          if (payload.currentPasswordForEmailChange && fbUser.email) {
            const cred = EmailAuthProvider.credential(
              fbUser.email,
              payload.currentPasswordForEmailChange
            );
            await reauthenticateWithCredential(fbUser, cred);
          }
          await verifyBeforeUpdateEmail(fbUser, cleanEmail);
          emailNotice = `A verification link was sent to ${cleanEmail} to finalize your email change.`;
        } catch (err: any) {
          throw new Error(formatFirebaseAuthError(err));
        }
      }

      if (fbUser.emailVerified) {
        const uid = fbUser.uid;
        try {
          await updateDoc(doc(db, 'users', uid), {
            displayName: cleanName,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
        }

        try {
          await updateDoc(doc(db, 'users', uid, 'private', 'profile'), {
            email: cleanEmail,
            phone: cleanPhone,
            dateOfBirth: cleanDob,
            city: cleanCity,
            occupation: cleanOcc,
            bio: cleanBio,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/private/profile`);
        }
      }

      setProfile({
        ownerId: fbUser.uid,
        email: cleanEmail,
        phone: cleanPhone,
        dateOfBirth: cleanDob,
        city: cleanCity,
        occupation: cleanOcc,
        bio: cleanBio,
      });
      setFirebaseUser({ ...fbUser, displayName: cleanName } as User);

      return emailNotice;
    },
    [isDemoMode, firebaseUser]
  );

  const changeUserPassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (isDemoMode && !firebaseUser) {
        if (newPassword.length < 8) {
          throw new Error('New password must be at least 8 characters long.');
        }
        return;
      }
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('Password change requires an active email-based account.');
      }
      try {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
      } catch (err: any) {
        throw new Error(formatFirebaseAuthError(err));
      }
    },
    [isDemoMode, firebaseUser]
  );

  const updateUserSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      const next: UserSettings = {
        ...settings,
        ...updates,
        ownerId: user?.uid || settings.ownerId,
      };
      setSettings(next);
      applyDocumentTheme(next.theme);

      if (updates.sessionPersistence && auth.currentUser) {
        await setPersistence(
          auth,
          updates.sessionPersistence === 'local'
            ? browserLocalPersistence
            : browserSessionPersistence
        );
      }

      if (isDemoMode && !firebaseUser) {
        localStorage.setItem(DEMO_SETTINGS_KEY, JSON.stringify(next));
        return;
      }

      if (auth.currentUser && auth.currentUser.emailVerified) {
        const uid = auth.currentUser.uid;
        try {
          await updateDoc(doc(db, 'users', uid, 'settings', 'preferences'), {
            theme: next.theme,
            language: next.language,
            notifyPremiumAlerts: next.notifyPremiumAlerts,
            notifyPolicyUpdates: next.notifyPolicyUpdates,
            notifyNomineeReminders: next.notifyNomineeReminders,
            notifySecurityAlerts: next.notifySecurityAlerts,
            notifySupportUpdates: next.notifySupportUpdates,
            maskSensitiveData: next.maskSensitiveData,
            sessionPersistence: next.sessionPersistence,
            activityAuditEnabled: next.activityAuditEnabled,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/settings/preferences`);
        }
      }
    },
    [settings, user?.uid, isDemoMode, firebaseUser]
  );

  const deleteUserAccount = useCallback(
    async (currentPassword?: string) => {
      if (isDemoMode && !firebaseUser) {
        localStorage.removeItem(DEMO_SESSION_KEY);
        localStorage.removeItem(DEMO_PROFILE_KEY);
        localStorage.removeItem(DEMO_SETTINGS_KEY);
        localStorage.removeItem(DEMO_DATA_KEY);
        setIsDemoMode(false);
        applyDocumentTheme('dark');
        return;
      }

      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error('No authenticated user found.');

      // Re-authenticate before sensitive account deletion
      try {
        const isGoogle = fbUser.providerData[0]?.providerId === 'google.com';
        if (isGoogle) {
          await reauthenticateWithPopup(fbUser, googleProvider);
        } else if (currentPassword && fbUser.email) {
          const cred = EmailAuthProvider.credential(fbUser.email, currentPassword);
          await reauthenticateWithCredential(fbUser, cred);
        }
      } catch (err: any) {
        throw new Error(formatFirebaseAuthError(err));
      }

      const uid = fbUser.uid;
      if (fbUser.emailVerified) {
        // Delete subcollections FIRST while parent /users/{uid} exists (satisfies Master Gate)
        const subcollections = ['nominees', 'familyMembers', 'supportTickets'];
        for (const sub of subcollections) {
          const subPath = `users/${uid}/${sub}`;
          try {
            const q = query(collection(db, 'users', uid, sub), where('ownerId', '==', uid));
            const snap = await getDocs(q);
            for (const d of snap.docs) {
              await deleteDoc(doc(db, 'users', uid, sub, d.id));
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, subPath);
          }
        }

        // Delete settings/preferences & private/profile
        try {
          const setRef = doc(db, 'users', uid, 'settings', 'preferences');
          const setSnap = await getDoc(setRef);
          if (setSnap.exists()) await deleteDoc(setRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${uid}/settings/preferences`);
        }

        try {
          const privRef = doc(db, 'users', uid, 'private', 'profile');
          const privSnap = await getDoc(privRef);
          if (privSnap.exists()) await deleteDoc(privRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${uid}/private/profile`);
        }

        // Finally delete root /users/{uid}
        try {
          const userRef = doc(db, 'users', uid);
          const uSnap = await getDoc(userRef);
          if (uSnap.exists()) await deleteDoc(userRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
        }
      }

      try {
        await deleteUser(fbUser);
      } catch (err: any) {
        throw new Error(formatFirebaseAuthError(err));
      }

      setFirebaseUser(null);
      applyDocumentTheme('dark');
    },
    [isDemoMode, firebaseUser]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isDemoMode,
        isAuthReady,
        profile,
        settings,
        emailProviderSetupRequired,
        clearEmailProviderNotice: () => setEmailProviderSetupRequired(false),
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        sendPasswordReset,
        confirmResetWithCode,
        resendVerificationEmail,
        refreshVerificationStatus,
        enterDemoMode,
        logout,
        updateUserProfile,
        changeUserPassword,
        updateUserSettings,
        deleteUserAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
