// Synchronized verbatim with firebase-blueprint.json & firestore.rules

export const ID_PATTERN_REGEX = /^[a-zA-Z0-9_\-]+$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[0-9+\-\s()]{7,25}$/;

export const VALIDATION_LIMITS = {
  ID_MAX: 128,
  DISPLAY_NAME_MAX: 100,
  EMAIL_MAX: 254,
  PHONE_MAX: 30,
  DOB_MAX: 20,
  CITY_MAX: 100,
  OCCUPATION_MAX: 100,
  BIO_MAX: 500,
  ADDRESS_MAX: 300,
  BLOOD_GROUP_MAX: 10,
  MEDICAL_NOTES_MAX: 500,
  POLICY_NAME_MAX: 150,
  GUARDIAN_NAME_MAX: 100,
  NOMINEE_NOTES_MAX: 400,
  TICKET_SUBJECT_MIN: 3,
  TICKET_SUBJECT_MAX: 150,
  TICKET_DESC_MIN: 5,
  TICKET_DESC_MAX: 2000,
  TICKET_RESOLUTION_MAX: 1000,
};

export type ThemePreference = 'dark' | 'light' | 'system';

export type SupportedLanguage =
  | 'English'
  | 'Hindi'
  | 'Telugu'
  | 'Tamil'
  | 'Kannada'
  | 'Marathi'
  | 'Bengali';

export type SessionPersistenceMode = 'local' | 'session';

export type FamilyRelationship =
  | 'Father'
  | 'Mother'
  | 'Spouse'
  | 'Son'
  | 'Daughter'
  | 'Brother'
  | 'Sister'
  | 'Father-in-Law'
  | 'Mother-in-Law'
  | 'Grandparent'
  | 'Other';

export const FAMILY_RELATIONSHIPS: FamilyRelationship[] = [
  'Spouse',
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Father-in-Law',
  'Mother-in-Law',
  'Grandparent',
  'Other',
];

export type GenderOption = 'Male' | 'Female' | 'Other';

export type NomineeRelationship =
  | 'Spouse'
  | 'Father'
  | 'Mother'
  | 'Son'
  | 'Daughter'
  | 'Brother'
  | 'Sister'
  | 'Grandparent'
  | 'Legal Heir'
  | 'Trust'
  | 'Other';

export const NOMINEE_RELATIONSHIPS: NomineeRelationship[] = [
  'Spouse',
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Grandparent',
  'Legal Heir',
  'Trust',
  'Other',
];

export type SupportCategory = 'Account' | 'Technical' | 'General' | 'Other';
export const SUPPORT_CATEGORIES: SupportCategory[] = ['Account', 'Technical', 'General', 'Other'];

export type SupportPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export const SUPPORT_PRIORITIES: SupportPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export type SupportStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export const SUPPORT_STATUSES: SupportStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];

export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  authProvider: 'password' | 'google.com' | 'demo';
  createdAtIso: string;
  lastLoginIso: string;
}

export interface UserPrivateProfile {
  ownerId: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  city: string;
  occupation: string;
  bio: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSettings {
  ownerId: string;
  theme: ThemePreference;
  language: SupportedLanguage;
  notifyPremiumAlerts: boolean;
  notifyPolicyUpdates: boolean;
  notifyNomineeReminders: boolean;
  notifySecurityAlerts: boolean;
  notifySupportUpdates: boolean;
  maskSensitiveData: boolean;
  sessionPersistence: SessionPersistenceMode;
  activityAuditEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FamilyMember {
  id: string;
  ownerId: string;
  fullName: string;
  relationship: FamilyRelationship;
  dateOfBirth: string;
  gender: GenderOption;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  occupation: string;
  isDependent: boolean;
  emergencyContact: boolean;
  medicalNotes: string;
  createdAtIso: string;
  updatedAtIso: string;
}

export type FamilyMemberInput = Omit<FamilyMember, 'id' | 'ownerId' | 'createdAtIso' | 'updatedAtIso'>;

export interface FamilyNominee {
  id: string;
  ownerId: string;
  nomineeName: string;
  relationship: NomineeRelationship;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  linkedMemberId: string; // 'SELF' or FamilyMember.id
  linkedMemberName: string;
  policyId: string;
  policyName: string;
  allocationPct: number;
  guardianName: string;
  notes: string;
  createdAtIso: string;
  updatedAtIso: string;
}

export type FamilyNomineeInput = Omit<FamilyNominee, 'id' | 'ownerId' | 'createdAtIso' | 'updatedAtIso'>;

export interface SupportTicket {
  id: string;
  ownerId: string;
  ticketNumber: string;
  subject: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  description: string;
  contactEmail: string;
  relatedPolicyId: string;
  resolutionNote: string;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface CreateSupportTicketInput {
  subject: string;
  category: SupportCategory;
  priority: SupportPriority;
  description: string;
  contactEmail: string;
  relatedPolicyId: string;
}

export function sanitizeText(value: string, maxLength: number): string {
  return (value || '').trim().slice(0, maxLength);
}

export function generateSafeId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64);
}

export function calculateAgeFromDob(dob: string): number | null {
  if (!dob) return null;
  const parsed = new Date(dob);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const m = today.getMonth() - parsed.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < parsed.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export function maskPhone(phone: string, shouldMask: boolean): string {
  if (!phone) return 'Not provided';
  if (!shouldMask || phone.length < 6) return phone;
  return `${phone.slice(0, 4)} •••• ${phone.slice(-3)}`;
}

export function maskEmail(email: string, shouldMask: boolean): string {
  if (!email) return 'Not provided';
  if (!shouldMask || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0] || '*'}***@${domain}`;
  return `${local.slice(0, 2)}••••@${domain}`;
}
