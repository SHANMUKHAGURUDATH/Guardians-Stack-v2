import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import {
  FamilyMember,
  FamilyMemberInput,
  FamilyNominee,
  FamilyNomineeInput,
  SupportTicket,
  CreateSupportTicketInput,
  SupportStatus,
  VALIDATION_LIMITS,
  ID_PATTERN_REGEX,
  sanitizeText,
  generateSafeId,
} from '../types/accountFeatures';

const DEMO_DATA_KEY = 'guardian_stack_demo_records_v1';
const UNVERIFIED_STAGE_PREFIX = 'guardian_stage_records_';

interface StoredRecordsBundle {
  familyMembers: FamilyMember[];
  nominees: FamilyNominee[];
  supportTickets: SupportTicket[];
}

function getInitialDemoBundle(): StoredRecordsBundle {
  const now = new Date().toISOString();
  return {
    familyMembers: [
      {
        id: 'mem_demo_spouse',
        ownerId: 'demo_user',
        fullName: 'Ananya Mehta',
        relationship: 'Spouse',
        dateOfBirth: '1992-08-21',
        gender: 'Female',
        phone: '+91 98450 44556',
        email: 'ananya.mehta@example.com',
        address: 'Indiranagar, Bengaluru, Karnataka',
        bloodGroup: 'O+',
        occupation: 'Product Design Lead',
        isDependent: false,
        emergencyContact: true,
        medicalNotes: 'No chronic conditions. Annual wellness checkup normal.',
        createdAtIso: now,
        updatedAtIso: now,
      },
      {
        id: 'mem_demo_father',
        ownerId: 'demo_user',
        fullName: 'Suresh Mehta',
        relationship: 'Father',
        dateOfBirth: '1962-03-11',
        gender: 'Male',
        phone: '+91 98112 77889',
        email: 'suresh.mehta@example.com',
        address: 'Indiranagar, Bengaluru, Karnataka',
        bloodGroup: 'B+',
        occupation: 'Retired Civil Engineer',
        isDependent: true,
        emergencyContact: true,
        medicalNotes: 'Mild controlled hypertension on routine medication.',
        createdAtIso: now,
        updatedAtIso: now,
      },
      {
        id: 'mem_demo_child',
        ownerId: 'demo_user',
        fullName: 'Vivaan Mehta',
        relationship: 'Son',
        dateOfBirth: '2019-11-04',
        gender: 'Male',
        phone: '+91 98450 44556',
        email: '',
        address: 'Indiranagar, Bengaluru, Karnataka',
        bloodGroup: 'O+',
        occupation: 'Primary School Student',
        isDependent: true,
        emergencyContact: false,
        medicalNotes: 'Immunizations up to date.',
        createdAtIso: now,
        updatedAtIso: now,
      },
    ],
    nominees: [
      {
        id: 'nom_demo_1',
        ownerId: 'demo_user',
        nomineeName: 'Ananya Mehta',
        relationship: 'Spouse',
        dateOfBirth: '1992-08-21',
        phone: '+91 98450 44556',
        email: 'ananya.mehta@example.com',
        address: 'Indiranagar, Bengaluru, Karnataka',
        linkedMemberId: 'SELF',
        linkedMemberName: 'Self (Primary Policyholder)',
        policyId: 'POL-IND-88219',
        policyName: 'Max Protect Pure Term Plan',
        allocationPct: 70,
        guardianName: '',
        notes: 'Primary KYC verified beneficiary under MWPA.',
        createdAtIso: now,
        updatedAtIso: now,
      },
      {
        id: 'nom_demo_2',
        ownerId: 'demo_user',
        nomineeName: 'Vivaan Mehta',
        relationship: 'Son',
        dateOfBirth: '2019-11-04',
        phone: '+91 98450 44556',
        email: '',
        address: 'Indiranagar, Bengaluru, Karnataka',
        linkedMemberId: 'SELF',
        linkedMemberName: 'Self (Primary Policyholder)',
        policyId: 'POL-IND-88219',
        policyName: 'Max Protect Pure Term Plan',
        allocationPct: 30,
        guardianName: 'Ananya Mehta (Mother)',
        notes: 'Minor beneficiary share protected with appointee.',
        createdAtIso: now,
        updatedAtIso: now,
      },
    ],
    supportTickets: [
      {
        id: 'tkt_demo_1',
        ownerId: 'demo_user',
        ticketNumber: 'TKT-2026-1042',
        subject: 'MWPA Addendum endorsement verification on Term Policy',
        category: 'General',
        priority: 'Medium',
        status: 'In Progress',
        description:
          'Requesting confirmation that the Married Women Property Act (MWPA) addendum uploaded to Family Vault is reflected on POL-IND-88219.',
        contactEmail: 'aarav.demo@guardianstack.in',
        relatedPolicyId: 'POL-IND-88219',
        resolutionNote: 'Underwriting legal desk is verifying deed registration.',
        createdAtIso: now,
        updatedAtIso: now,
      },
    ],
  };
}

function toIsoString(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string' && val) return val;
  return new Date().toISOString();
}

interface UserDataContextValue {
  familyMembers: FamilyMember[];
  nominees: FamilyNominee[];
  supportTickets: SupportTicket[];
  isLoadingData: boolean;
  addFamilyMember: (input: FamilyMemberInput) => Promise<FamilyMember>;
  updateFamilyMember: (id: string, input: FamilyMemberInput) => Promise<void>;
  deleteFamilyMember: (id: string, removeLinkedNominees?: boolean) => Promise<void>;
  getPolicyAllocatedPct: (
    linkedMemberId: string,
    policyId: string,
    excludeNomineeId?: string
  ) => number;
  addNominee: (input: FamilyNomineeInput) => Promise<FamilyNominee>;
  updateNominee: (id: string, input: FamilyNomineeInput) => Promise<void>;
  deleteNominee: (id: string) => Promise<void>;
  createSupportTicket: (input: CreateSupportTicketInput) => Promise<SupportTicket>;
  updateSupportTicketDetails: (
    id: string,
    updates: Pick<
      SupportTicket,
      | 'subject'
      | 'category'
      | 'priority'
      | 'description'
      | 'contactEmail'
      | 'relatedPolicyId'
      | 'resolutionNote'
    >
  ) => Promise<void>;
  transitionSupportTicketStatus: (
    id: string,
    status: SupportStatus,
    resolutionNote: string
  ) => Promise<void>;
  deleteSupportTicket: (id: string) => Promise<void>;
  exportAllDataJson: () => void;
  exportFamilyAndNomineesCsv: () => void;
  resetDemoRecords: () => void;
}

const UserDataContext = createContext<UserDataContextValue | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, firebaseUser, isDemoMode, isAuthReady, profile, settings } = useAuth();

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [nominees, setNominees] = useState<FamilyNominee[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const isCloudSynced = Boolean(firebaseUser && firebaseUser.emailVerified);
  const localStoreKey = isDemoMode
    ? DEMO_DATA_KEY
    : firebaseUser
    ? `${UNVERIFIED_STAGE_PREFIX}${firebaseUser.uid}`
    : null;

  const persistLocalBundle = useCallback(
    (bundle: StoredRecordsBundle) => {
      if (!localStoreKey) return;
      try {
        localStorage.setItem(localStoreKey, JSON.stringify(bundle));
      } catch {
        // ignore storage quota errors
      }
    },
    [localStoreKey]
  );

  // Attach Firestore listeners for verified cloud users, or load local bundle for Demo / Unverified
  useEffect(() => {
    if (!isAuthReady || !user) {
      setFamilyMembers([]);
      setNominees([]);
      setSupportTickets([]);
      return;
    }

    if (isCloudSynced && firebaseUser) {
      setIsLoadingData(true);
      const uid = firebaseUser.uid;

      const membersPath = `users/${uid}/familyMembers`;
      const membersQuery = query(
        collection(db, 'users', uid, 'familyMembers'),
        where('ownerId', '==', uid)
      );
      const unsubMembers = onSnapshot(
        membersQuery,
        (snap) => {
          const list: FamilyMember[] = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ownerId: data.ownerId,
              fullName: data.fullName,
              relationship: data.relationship,
              dateOfBirth: data.dateOfBirth,
              gender: data.gender,
              phone: data.phone || '',
              email: data.email || '',
              address: data.address || '',
              bloodGroup: data.bloodGroup || '',
              occupation: data.occupation || '',
              isDependent: Boolean(data.isDependent),
              emergencyContact: Boolean(data.emergencyContact),
              medicalNotes: data.medicalNotes || '',
              createdAtIso: toIsoString(data.createdAt),
              updatedAtIso: toIsoString(data.updatedAt),
            };
          });
          list.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
          setFamilyMembers(list);
          setIsLoadingData(false);
        },
        (err) => {
          setIsLoadingData(false);
          handleFirestoreError(err, OperationType.LIST, membersPath);
        }
      );

      const nomineesPath = `users/${uid}/nominees`;
      const nomineesQuery = query(
        collection(db, 'users', uid, 'nominees'),
        where('ownerId', '==', uid)
      );
      const unsubNominees = onSnapshot(
        nomineesQuery,
        (snap) => {
          const list: FamilyNominee[] = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ownerId: data.ownerId,
              nomineeName: data.nomineeName,
              relationship: data.relationship,
              dateOfBirth: data.dateOfBirth,
              phone: data.phone || '',
              email: data.email || '',
              address: data.address || '',
              linkedMemberId: data.linkedMemberId,
              linkedMemberName: data.linkedMemberName,
              policyId: data.policyId,
              policyName: data.policyName,
              allocationPct: Number(data.allocationPct) || 0,
              guardianName: data.guardianName || '',
              notes: data.notes || '',
              createdAtIso: toIsoString(data.createdAt),
              updatedAtIso: toIsoString(data.updatedAt),
            };
          });
          list.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
          setNominees(list);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, nomineesPath);
        }
      );

      const ticketsPath = `users/${uid}/supportTickets`;
      const ticketsQuery = query(
        collection(db, 'users', uid, 'supportTickets'),
        where('ownerId', '==', uid)
      );
      const unsubTickets = onSnapshot(
        ticketsQuery,
        (snap) => {
          const list: SupportTicket[] = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ownerId: data.ownerId,
              ticketNumber: data.ticketNumber,
              subject: data.subject,
              category: data.category,
              priority: data.priority,
              status: data.status,
              description: data.description,
              contactEmail: data.contactEmail,
              relatedPolicyId: data.relatedPolicyId || '',
              resolutionNote: data.resolutionNote || '',
              createdAtIso: toIsoString(data.createdAt),
              updatedAtIso: toIsoString(data.updatedAt),
            };
          });
          list.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
          setSupportTickets(list);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, ticketsPath);
        }
      );

      return () => {
        unsubMembers();
        unsubNominees();
        unsubTickets();
      };
    }

    // Demo Mode or Unverified Email staging
    if (localStoreKey) {
      try {
        const raw = localStorage.getItem(localStoreKey);
        if (raw) {
          const parsed: StoredRecordsBundle = JSON.parse(raw);
          setFamilyMembers(parsed.familyMembers || []);
          setNominees(parsed.nominees || []);
          setSupportTickets(parsed.supportTickets || []);
        } else if (isDemoMode) {
          const seeded = getInitialDemoBundle();
          localStorage.setItem(localStoreKey, JSON.stringify(seeded));
          setFamilyMembers(seeded.familyMembers);
          setNominees(seeded.nominees);
          setSupportTickets(seeded.supportTickets);
        } else {
          setFamilyMembers([]);
          setNominees([]);
          setSupportTickets([]);
        }
      } catch {
        setFamilyMembers([]);
        setNominees([]);
        setSupportTickets([]);
      }
    }
  }, [isAuthReady, user, isCloudSynced, firebaseUser, localStoreKey, isDemoMode]);

  // =========================================================================
  // Family Member CRUD
  // =========================================================================

  const addFamilyMember = useCallback(
    async (input: FamilyMemberInput): Promise<FamilyMember> => {
      if (!user) throw new Error('Authentication required.');
      const id = generateSafeId('mem');
      const now = new Date().toISOString();

      const sanitized = {
        ownerId: user.uid,
        fullName: sanitizeText(input.fullName, VALIDATION_LIMITS.DISPLAY_NAME_MAX),
        relationship: input.relationship,
        dateOfBirth: sanitizeText(input.dateOfBirth, VALIDATION_LIMITS.DOB_MAX),
        gender: input.gender,
        phone: sanitizeText(input.phone, VALIDATION_LIMITS.PHONE_MAX),
        email: sanitizeText(input.email, VALIDATION_LIMITS.EMAIL_MAX),
        address: sanitizeText(input.address, VALIDATION_LIMITS.ADDRESS_MAX),
        bloodGroup: sanitizeText(input.bloodGroup, VALIDATION_LIMITS.BLOOD_GROUP_MAX),
        occupation: sanitizeText(input.occupation, VALIDATION_LIMITS.OCCUPATION_MAX),
        isDependent: Boolean(input.isDependent),
        emergencyContact: Boolean(input.emergencyContact),
        medicalNotes: sanitizeText(input.medicalNotes, VALIDATION_LIMITS.MEDICAL_NOTES_MAX),
      };

      if (!sanitized.fullName || sanitized.dateOfBirth.length < 4) {
        throw new Error('Full name and valid date of birth are required.');
      }

      if (isCloudSynced && firebaseUser) {
        const path = `users/${firebaseUser.uid}/familyMembers/${id}`;
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid, 'familyMembers', id), {
            ...sanitized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      } else {
        const created: FamilyMember = {
          id,
          ...sanitized,
          createdAtIso: now,
          updatedAtIso: now,
        };
        const nextMembers = [created, ...familyMembers];
        setFamilyMembers(nextMembers);
        persistLocalBundle({ familyMembers: nextMembers, nominees, supportTickets });
      }

      return {
        id,
        ...sanitized,
        createdAtIso: now,
        updatedAtIso: now,
      };
    },
    [user, isCloudSynced, firebaseUser, familyMembers, nominees, supportTickets, persistLocalBundle]
  );

  const updateFamilyMember = useCallback(
    async (id: string, input: FamilyMemberInput): Promise<void> => {
      if (!user) throw new Error('Authentication required.');
      const sanitized = {
        fullName: sanitizeText(input.fullName, VALIDATION_LIMITS.DISPLAY_NAME_MAX),
        relationship: input.relationship,
        dateOfBirth: sanitizeText(input.dateOfBirth, VALIDATION_LIMITS.DOB_MAX),
        gender: input.gender,
        phone: sanitizeText(input.phone, VALIDATION_LIMITS.PHONE_MAX),
        email: sanitizeText(input.email, VALIDATION_LIMITS.EMAIL_MAX),
        address: sanitizeText(input.address, VALIDATION_LIMITS.ADDRESS_MAX),
        bloodGroup: sanitizeText(input.bloodGroup, VALIDATION_LIMITS.BLOOD_GROUP_MAX),
        occupation: sanitizeText(input.occupation, VALIDATION_LIMITS.OCCUPATION_MAX),
        isDependent: Boolean(input.isDependent),
        emergencyContact: Boolean(input.emergencyContact),
        medicalNotes: sanitizeText(input.medicalNotes, VALIDATION_LIMITS.MEDICAL_NOTES_MAX),
      };

      if (!sanitized.fullName || sanitized.dateOfBirth.length < 4) {
        throw new Error('Full name and valid date of birth are required.');
      }

      if (isCloudSynced && firebaseUser) {
        const path = `users/${firebaseUser.uid}/familyMembers/${id}`;
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid, 'familyMembers', id), {
            ...sanitized,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      } else {
        const now = new Date().toISOString();
        const nextMembers = familyMembers.map((m) =>
          m.id === id ? { ...m, ...sanitized, updatedAtIso: now } : m
        );
        setFamilyMembers(nextMembers);
        persistLocalBundle({ familyMembers: nextMembers, nominees, supportTickets });
      }
    },
    [user, isCloudSynced, firebaseUser, familyMembers, nominees, supportTickets, persistLocalBundle]
  );

  const deleteFamilyMember = useCallback(
    async (id: string, removeLinkedNominees = true): Promise<void> => {
      if (!user) throw new Error('Authentication required.');

      if (isCloudSynced && firebaseUser) {
        if (removeLinkedNominees) {
          const linked = nominees.filter((n) => n.linkedMemberId === id);
          for (const nom of linked) {
            const nomPath = `users/${firebaseUser.uid}/nominees/${nom.id}`;
            try {
              await deleteDoc(doc(db, 'users', firebaseUser.uid, 'nominees', nom.id));
            } catch (err) {
              handleFirestoreError(err, OperationType.DELETE, nomPath);
            }
          }
        }
        const path = `users/${firebaseUser.uid}/familyMembers/${id}`;
        try {
          await deleteDoc(doc(db, 'users', firebaseUser.uid, 'familyMembers', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      } else {
        const nextMembers = familyMembers.filter((m) => m.id !== id);
        const nextNominees = removeLinkedNominees
          ? nominees.filter((n) => n.linkedMemberId !== id)
          : nominees;
        setFamilyMembers(nextMembers);
        setNominees(nextNominees);
        persistLocalBundle({ familyMembers: nextMembers, nominees: nextNominees, supportTickets });
      }
    },
    [user, isCloudSynced, firebaseUser, familyMembers, nominees, supportTickets, persistLocalBundle]
  );

  // =========================================================================
  // Family Nominee CRUD & 100% Allocation Guard
  // =========================================================================

  const getPolicyAllocatedPct = useCallback(
    (linkedMemberId: string, policyId: string, excludeNomineeId?: string): number => {
      return nominees
        .filter(
          (n) =>
            n.linkedMemberId === linkedMemberId &&
            n.policyId === policyId &&
            n.id !== excludeNomineeId
        )
        .reduce((sum, n) => sum + Number(n.allocationPct || 0), 0);
    },
    [nominees]
  );

  const addNominee = useCallback(
    async (input: FamilyNomineeInput): Promise<FamilyNominee> => {
      if (!user) throw new Error('Authentication required.');

      const cleanPolicyId = input.policyId
        .trim()
        .replace(/[^a-zA-Z0-9_\-]/g, '-')
        .slice(0, VALIDATION_LIMITS.ID_MAX);

      if (!cleanPolicyId || !ID_PATTERN_REGEX.test(cleanPolicyId)) {
        throw new Error('Please select or enter a valid policy identifier.');
      }

      const pct = Math.round(Number(input.allocationPct) * 100) / 100;
      if (Number.isNaN(pct) || pct <= 0 || pct > 100) {
        throw new Error('Allocation percentage must be greater than 0% and at most 100%.');
      }

      const existingAllocated = getPolicyAllocatedPct(input.linkedMemberId, cleanPolicyId);
      if (existingAllocated + pct > 100.0001) {
        const remaining = Math.max(0, Math.round((100 - existingAllocated) * 100) / 100);
        throw new Error(
          `Total nominee allocation for this member and policy cannot exceed 100%. Currently allocated: ${existingAllocated}%, available: ${remaining}%.`
        );
      }

      const id = generateSafeId('nom');
      const now = new Date().toISOString();

      const sanitized = {
        ownerId: user.uid,
        nomineeName: sanitizeText(input.nomineeName, VALIDATION_LIMITS.DISPLAY_NAME_MAX),
        relationship: input.relationship,
        dateOfBirth: sanitizeText(input.dateOfBirth, VALIDATION_LIMITS.DOB_MAX),
        phone: sanitizeText(input.phone, VALIDATION_LIMITS.PHONE_MAX),
        email: sanitizeText(input.email, VALIDATION_LIMITS.EMAIL_MAX),
        address: sanitizeText(input.address, VALIDATION_LIMITS.ADDRESS_MAX),
        linkedMemberId: sanitizeText(input.linkedMemberId, VALIDATION_LIMITS.ID_MAX),
        linkedMemberName: sanitizeText(input.linkedMemberName, VALIDATION_LIMITS.DISPLAY_NAME_MAX),
        policyId: cleanPolicyId,
        policyName: sanitizeText(input.policyName, VALIDATION_LIMITS.POLICY_NAME_MAX),
        allocationPct: pct,
        guardianName: sanitizeText(input.guardianName, VALIDATION_LIMITS.GUARDIAN_NAME_MAX),
        notes: sanitizeText(input.notes, VALIDATION_LIMITS.NOMINEE_NOTES_MAX),
      };

      if (!sanitized.nomineeName || sanitized.dateOfBirth.length < 4) {
        throw new Error('Nominee name and valid date of birth are required.');
      }

      if (isCloudSynced && firebaseUser) {
        const path = `users/${firebaseUser.uid}/nominees/${id}`;
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid, 'nominees', id), {
            ...sanitized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      } else {
        const created: FamilyNominee = {
          id,
          ...sanitized,
          createdAtIso: now,
          updatedAtIso: now,
        };
        const nextNominees = [created, ...nominees];
        setNominees(nextNominees);
        persistLocalBundle({ familyMembers, nominees: nextNominees, supportTickets });
      }

      return {
        id,
        ...sanitized,
        createdAtIso: now,
        updatedAtIso: now,
      };
    },
    [
      user,
      getPolicyAllocatedPct,
      isCloudSynced,
      firebaseUser,
      familyMembers,
      nominees,
      supportTickets,
      persistLocalBundle,
    ]
  );

  const updateNominee = useCallback(
    async (id: string, input: FamilyNomineeInput): Promise<void> => {
      if (!user) throw new Error('Authentication required.');

      const cleanPolicyId = input.policyId
        .trim()
        .replace(/[^a-zA-Z0-9_\-]/g, '-')
        .slice(0, VALIDATION_LIMITS.ID_MAX);

      const pct = Math.round(Number(input.allocationPct) * 100) / 100;
      if (Number.isNaN(pct) || pct <= 0 || pct > 100) {
        throw new Error('Allocation percentage must be greater than 0% and at most 100%.');
      }

      const existingAllocated = getPolicyAllocatedPct(input.linkedMemberId, cleanPolicyId, id);
      if (existingAllocated + pct > 100.0001) {
        const remaining = Math.max(0, Math.round((100 - existingAllocated) * 100) / 100);
        throw new Error(
          `Total nominee allocation for this member and policy cannot exceed 100%. Other nominees hold ${existingAllocated}%, max available for this nominee: ${remaining}%.`
        );
      }

      const sanitized = {
        nomineeName: sanitizeText(input.nomineeName, VALIDATION_LIMITS.DISPLAY_NAME_MAX),
        relationship: input.relationship,
        dateOfBirth: sanitizeText(input.dateOfBirth, VALIDATION_LIMITS.DOB_MAX),
        phone: sanitizeText(input.phone, VALIDATION_LIMITS.PHONE_MAX),
        email: sanitizeText(input.email, VALIDATION_LIMITS.EMAIL_MAX),
        address: sanitizeText(input.address, VALIDATION_LIMITS.ADDRESS_MAX),
        linkedMemberId: sanitizeText(input.linkedMemberId, VALIDATION_LIMITS.ID_MAX),
        linkedMemberName: sanitizeText(input.linkedMemberName, VALIDATION_LIMITS.DISPLAY_NAME_MAX),
        policyId: cleanPolicyId,
        policyName: sanitizeText(input.policyName, VALIDATION_LIMITS.POLICY_NAME_MAX),
        allocationPct: pct,
        guardianName: sanitizeText(input.guardianName, VALIDATION_LIMITS.GUARDIAN_NAME_MAX),
        notes: sanitizeText(input.notes, VALIDATION_LIMITS.NOMINEE_NOTES_MAX),
      };

      if (isCloudSynced && firebaseUser) {
        const path = `users/${firebaseUser.uid}/nominees/${id}`;
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid, 'nominees', id), {
            ...sanitized,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      } else {
        const now = new Date().toISOString();
        const nextNominees = nominees.map((n) =>
          n.id === id ? { ...n, ...sanitized, updatedAtIso: now } : n
        );
        setNominees(nextNominees);
        persistLocalBundle({ familyMembers, nominees: nextNominees, supportTickets });
      }
    },
    [
      user,
      getPolicyAllocatedPct,
      isCloudSynced,
      firebaseUser,
      familyMembers,
      nominees,
      supportTickets,
      persistLocalBundle,
    ]
  );

  const deleteNominee = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error('Authentication required.');
      if (isCloudSynced && firebaseUser) {
        const path = `users/${firebaseUser.uid}/nominees/${id}`;
        try {
          await deleteDoc(doc(db, 'users', firebaseUser.uid, 'nominees', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      } else {
        const nextNominees = nominees.filter((n) => n.id !== id);
        setNominees(nextNominees);
        persistLocalBundle({ familyMembers, nominees: nextNominees, supportTickets });
      }
    },
    [user, isCloudSynced, firebaseUser, familyMembers, nominees, supportTickets, persistLocalBundle]
  );

  // =========================================================================
  // Support Tickets CRUD
  // =========================================================================

  const createSupportTicket = useCallback(
    async (input: CreateSupportTicketInput): Promise<SupportTicket> => {
      if (!user) throw new Error('Authentication required.');
      const id = generateSafeId('tkt');
      const ticketNumber = `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date().toISOString();

      const sanitized = {
        ownerId: user.uid,
        ticketNumber,
        subject: sanitizeText(input.subject, VALIDATION_LIMITS.TICKET_SUBJECT_MAX),
        category: input.category,
        priority: input.priority,
        status: 'Open' as SupportStatus,
        description: sanitizeText(input.description, VALIDATION_LIMITS.TICKET_DESC_MAX),
        contactEmail: sanitizeText(
          input.contactEmail || user.email,
          VALIDATION_LIMITS.EMAIL_MAX
        ),
        relatedPolicyId: sanitizeText(input.relatedPolicyId, VALIDATION_LIMITS.ID_MAX),
        resolutionNote: '',
      };

      if (sanitized.subject.length < VALIDATION_LIMITS.TICKET_SUBJECT_MIN) {
        throw new Error('Ticket subject must be at least 3 characters.');
      }
      if (sanitized.description.length < VALIDATION_LIMITS.TICKET_DESC_MIN) {
        throw new Error('Please provide a detailed description (at least 5 characters).');
      }

      if (isCloudSynced && firebaseUser) {
        const path = `users/${firebaseUser.uid}/supportTickets/${id}`;
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid, 'supportTickets', id), {
            ...sanitized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      } else {
        const created: SupportTicket = {
          id,
          ...sanitized,
          createdAtIso: now,
          updatedAtIso: now,
        };
        const nextTickets = [created, ...supportTickets];
        setSupportTickets(nextTickets);
        persistLocalBundle({ familyMembers, nominees, supportTickets: nextTickets });
      }

      return {
        id,
        ...sanitized,
        createdAtIso: now,
        updatedAtIso: now,
      };
    },
    [user, isCloudSynced, firebaseUser, familyMembers, nominees, supportTickets, persistLocalBundle]
  );

  const updateSupportTicketDetails = useCallback(
    async (
      id: string,
      updates: Pick<
        SupportTicket,
        | 'subject'
        | 'category'
        | 'priority'
        | 'description'
        | 'contactEmail'
        | 'relatedPolicyId'
        | 'resolutionNote'
      >
    ): Promise<void> => {
      if (!user) throw new Error('Authentication required.');
      const existingTicket = supportTickets.find((t) => t.id === id);
      if (existingTicket?.status === 'Closed') {
        throw new Error('Closed tickets are locked for audit integrity and cannot be modified.');
      }

      const sanitized = {
        subject: sanitizeText(updates.subject, VALIDATION_LIMITS.TICKET_SUBJECT_MAX),
        category: updates.category,
        priority: updates.priority,
        description: sanitizeText(updates.description, VALIDATION_LIMITS.TICKET_DESC_MAX),
        contactEmail: sanitizeText(updates.contactEmail, VALIDATION_LIMITS.EMAIL_MAX),
        relatedPolicyId: sanitizeText(updates.relatedPolicyId, VALIDATION_LIMITS.ID_MAX),
        resolutionNote: sanitizeText(updates.resolutionNote, VALIDATION_LIMITS.TICKET_RESOLUTION_MAX),
      };

      if (isCloudSynced && firebaseUser) {
        const path = `users/${firebaseUser.uid}/supportTickets/${id}`;
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid, 'supportTickets', id), {
            ...sanitized,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      } else {
        const now = new Date().toISOString();
        const nextTickets = supportTickets.map((t) =>
          t.id === id ? { ...t, ...sanitized, updatedAtIso: now } : t
        );
        setSupportTickets(nextTickets);
        persistLocalBundle({ familyMembers, nominees, supportTickets: nextTickets });
      }
    },
    [user, isCloudSynced, firebaseUser, familyMembers, nominees, supportTickets, persistLocalBundle]
  );

  const transitionSupportTicketStatus = useCallback(
    async (id: string, status: SupportStatus, resolutionNote: string): Promise<void> => {
      if (!user) throw new Error('Authentication required.');
      const existingTicket = supportTickets.find((t) => t.id === id);
      if (existingTicket?.status === 'Closed') {
        throw new Error('Closed tickets are locked and cannot transition to another status.');
      }

      const cleanNote = sanitizeText(resolutionNote, VALIDATION_LIMITS.TICKET_RESOLUTION_MAX);

      if (isCloudSynced && firebaseUser) {
        const path = `users/${firebaseUser.uid}/supportTickets/${id}`;
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid, 'supportTickets', id), {
            status,
            resolutionNote: cleanNote,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      } else {
        const now = new Date().toISOString();
        const nextTickets = supportTickets.map((t) =>
          t.id === id ? { ...t, status, resolutionNote: cleanNote, updatedAtIso: now } : t
        );
        setSupportTickets(nextTickets);
        persistLocalBundle({ familyMembers, nominees, supportTickets: nextTickets });
      }
    },
    [user, isCloudSynced, firebaseUser, familyMembers, nominees, supportTickets, persistLocalBundle]
  );

  const deleteSupportTicket = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error('Authentication required.');
      if (isCloudSynced && firebaseUser) {
        const path = `users/${firebaseUser.uid}/supportTickets/${id}`;
        try {
          await deleteDoc(doc(db, 'users', firebaseUser.uid, 'supportTickets', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      } else {
        const nextTickets = supportTickets.filter((t) => t.id !== id);
        setSupportTickets(nextTickets);
        persistLocalBundle({ familyMembers, nominees, supportTickets: nextTickets });
      }
    },
    [user, isCloudSynced, firebaseUser, familyMembers, nominees, supportTickets, persistLocalBundle]
  );

  // =========================================================================
  // Data Export Utilities
  // =========================================================================

  const exportAllDataJson = useCallback(() => {
    if (!user) return;
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      platform: 'Guardian Stack Insurance Intelligence Platform',
      account: {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        authProvider: user.authProvider,
        emailVerified: user.emailVerified,
      },
      profile,
      settings,
      familyMembers,
      nominees,
      supportTickets,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guardian-stack-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [user, profile, settings, familyMembers, nominees, supportTickets]);

  const exportFamilyAndNomineesCsv = useCallback(() => {
    const escapeCsv = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows: string[] = [];

    rows.push(
      [
        'Record Type',
        'Name',
        'Relationship',
        'Date of Birth',
        'Gender / Policy',
        'Phone',
        'Email',
        'Allocation % / Dependent',
        'Notes',
      ]
        .map(escapeCsv)
        .join(',')
    );

    familyMembers.forEach((m) => {
      rows.push(
        [
          'Family Member',
          m.fullName,
          m.relationship,
          m.dateOfBirth,
          m.gender,
          m.phone,
          m.email,
          m.isDependent ? 'Dependent' : 'Independent',
          m.medicalNotes,
        ]
          .map(escapeCsv)
          .join(',')
      );
    });

    nominees.forEach((n) => {
      rows.push(
        [
          'Policy Nominee',
          n.nomineeName,
          n.relationship,
          n.dateOfBirth,
          `${n.policyId} (${n.policyName}) — Insured: ${n.linkedMemberName}`,
          n.phone,
          n.email,
          `${n.allocationPct}%`,
          n.notes,
        ]
          .map(escapeCsv)
          .join(',')
      );
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guardian-family-nominees-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [familyMembers, nominees]);

  const resetDemoRecords = useCallback(() => {
    if (!isDemoMode) return;
    const seeded = getInitialDemoBundle();
    localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(seeded));
    setFamilyMembers(seeded.familyMembers);
    setNominees(seeded.nominees);
    setSupportTickets(seeded.supportTickets);
  }, [isDemoMode]);

  return (
    <UserDataContext.Provider
      value={{
        familyMembers,
        nominees,
        supportTickets,
        isLoadingData,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        getPolicyAllocatedPct,
        addNominee,
        updateNominee,
        deleteNominee,
        createSupportTicket,
        updateSupportTicketDetails,
        transitionSupportTicketStatus,
        deleteSupportTicket,
        exportAllDataJson,
        exportFamilyAndNomineesCsv,
        resetDemoRecords,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export function useUserData(): UserDataContextValue {
  const ctx = useContext(UserDataContext);
  if (!ctx) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return ctx;
}
