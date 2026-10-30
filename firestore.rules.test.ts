import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import fs from 'fs';

/**
 * Guardian Stack — Firestore Security Rules Adversarial Test Suite
 * Verifies all "Dirty Dozen" payloads return PERMISSION_DENIED.
 */
export async function runDirtyDozenSecuritySuite() {
  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: 'guardian-stack-security-test',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });

  try {
    const aliceCtx = testEnv.authenticatedContext('user_alice', {
      email: 'alice@example.com',
      email_verified: true,
    });
    const unverifiedCtx = testEnv.authenticatedContext('user_unverified', {
      email: 'unverified@example.com',
      email_verified: false,
    });
    const bobCtx = testEnv.authenticatedContext('user_bob', {
      email: 'bob@example.com',
      email_verified: true,
    });

    const aliceDb = aliceCtx.firestore();
    const unverifiedDb = unverifiedCtx.firestore();
    const bobDb = bobCtx.firestore();

    // 1. Identity Spoofing on User Create
    await assertFails(
      setDoc(doc(aliceDb, 'users', 'user_alice'), {
        uid: 'user_bob',
        displayName: 'Alice',
        authProvider: 'password',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 2. Unverified Email Write
    await assertFails(
      setDoc(doc(unverifiedDb, 'users', 'user_unverified'), {
        uid: 'user_unverified',
        displayName: 'Unverified',
        authProvider: 'password',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 5. Orphaned Subcollection Write BEFORE parent /users/user_alice exists
    await assertFails(
      setDoc(doc(aliceDb, 'users', 'user_alice', 'familyMembers', 'mem_1'), {
        ownerId: 'user_alice',
        fullName: 'Rajesh Sharma',
        relationship: 'Father',
        dateOfBirth: '1965-04-12',
        gender: 'Male',
        phone: '+91 9876543210',
        email: 'rajesh@example.com',
        address: 'Bengaluru',
        bloodGroup: 'O+',
        occupation: 'Retired',
        isDependent: true,
        emergencyContact: true,
        medicalNotes: 'None',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // Setup valid root user & private profile for remaining tests
    await assertSucceeds(
      setDoc(doc(aliceDb, 'users', 'user_alice'), {
        uid: 'user_alice',
        displayName: 'Alice Verma',
        authProvider: 'google.com',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    await assertSucceeds(
      setDoc(doc(aliceDb, 'users', 'user_alice', 'private', 'profile'), {
        ownerId: 'user_alice',
        email: 'alice@example.com',
        phone: '+91 9811122233',
        dateOfBirth: '1992-08-19',
        city: 'Mumbai',
        occupation: 'Actuary',
        bio: 'Primary policyholder',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 3. Shadow / Ghost Field Injection
    await assertFails(
      setDoc(doc(aliceDb, 'users', 'user_alice', 'familyMembers', 'mem_shadow'), {
        ownerId: 'user_alice',
        fullName: 'Shadow Member',
        relationship: 'Spouse',
        dateOfBirth: '1993-02-10',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        bloodGroup: '',
        occupation: '',
        isDependent: false,
        emergencyContact: true,
        medicalNotes: '',
        isAdmin: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 4. Cross-Tenant PII Read
    await assertFails(getDoc(doc(bobDb, 'users', 'user_alice', 'private', 'profile')));

    // 6. ID Poisoning Attack (invalid chars in document ID)
    await assertFails(
      setDoc(doc(aliceDb, 'users', 'user_alice', 'familyMembers', 'bad$id!spaces'), {
        ownerId: 'user_alice',
        fullName: 'Valid Name',
        relationship: 'Brother',
        dateOfBirth: '1995-01-01',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        bloodGroup: '',
        occupation: '',
        isDependent: false,
        emergencyContact: false,
        medicalNotes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // Create valid family member for subsequent update & nominee tests
    await assertSucceeds(
      setDoc(doc(aliceDb, 'users', 'user_alice', 'familyMembers', 'mem_valid'), {
        ownerId: 'user_alice',
        fullName: 'Rohan Verma',
        relationship: 'Spouse',
        dateOfBirth: '1991-06-15',
        gender: 'Male',
        phone: '+91 9800011122',
        email: 'rohan@example.com',
        address: 'Mumbai',
        bloodGroup: 'B+',
        occupation: 'Architect',
        isDependent: false,
        emergencyContact: true,
        medicalNotes: 'Healthy',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 7. Resource / Value Poisoning (Oversized String > 100 chars on fullName)
    await assertFails(
      updateDoc(doc(aliceDb, 'users', 'user_alice', 'familyMembers', 'mem_valid'), {
        fullName: 'X'.repeat(250),
        updatedAt: serverTimestamp(),
      })
    );

    // 8. Nominee Allocation Out-of-Bounds (allocationPct > 100)
    await assertFails(
      setDoc(doc(aliceDb, 'users', 'user_alice', 'nominees', 'nom_over'), {
        ownerId: 'user_alice',
        nomineeName: 'Rohan Verma',
        relationship: 'Spouse',
        dateOfBirth: '1991-06-15',
        phone: '+91 9800011122',
        email: 'rohan@example.com',
        address: 'Mumbai',
        linkedMemberId: 'SELF',
        linkedMemberName: 'Alice Verma',
        policyId: 'POL-IND-88219',
        policyName: 'Max Protect Pure Term Plan',
        allocationPct: 150,
        guardianName: '',
        notes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 9. Dangling Relational Nominee Reference (non-existent familyMember)
    await assertFails(
      setDoc(doc(aliceDb, 'users', 'user_alice', 'nominees', 'nom_orphan'), {
        ownerId: 'user_alice',
        nomineeName: 'Ghost Nominee',
        relationship: 'Brother',
        dateOfBirth: '1995-03-10',
        phone: '',
        email: '',
        address: '',
        linkedMemberId: 'mem_does_not_exist',
        linkedMemberName: 'Nobody',
        policyId: 'POL-IND-88219',
        policyName: 'Max Protect Pure Term Plan',
        allocationPct: 50,
        guardianName: '',
        notes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 11. Client-Forged Timestamp on SupportTicket
    await assertFails(
      setDoc(doc(aliceDb, 'users', 'user_alice', 'supportTickets', 'tkt_forged'), {
        ownerId: 'user_alice',
        ticketNumber: 'TKT-2026-1001',
        subject: 'Forged time test',
        category: 'Technical',
        priority: 'Medium',
        status: 'Open',
        description: 'Testing forged client timestamp rejection.',
        contactEmail: 'alice@example.com',
        relatedPolicyId: '',
        resolutionNote: '',
        createdAt: Timestamp.fromMillis(1600000000000),
        updatedAt: serverTimestamp(),
      })
    );

    // Create valid ticket for tests 10 & 12
    await assertSucceeds(
      setDoc(doc(aliceDb, 'users', 'user_alice', 'supportTickets', 'tkt_valid'), {
        ownerId: 'user_alice',
        ticketNumber: 'TKT-2026-1002',
        subject: 'Question on nominee share',
        category: 'General',
        priority: 'Low',
        status: 'Open',
        description: 'Need clarification on minor nominee appointee rules.',
        contactEmail: 'alice@example.com',
        relatedPolicyId: 'POL-IND-88219',
        resolutionNote: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // 10. Immortal Field Mutation (changing ticketNumber)
    await assertFails(
      updateDoc(doc(aliceDb, 'users', 'user_alice', 'supportTickets', 'tkt_valid'), {
        ticketNumber: 'TKT-9999-HACK',
        updatedAt: serverTimestamp(),
      })
    );

    // Transition ticket to terminal Closed state
    await assertSucceeds(
      updateDoc(doc(aliceDb, 'users', 'user_alice', 'supportTickets', 'tkt_valid'), {
        status: 'Closed',
        resolutionNote: 'Confirmed resolved by user.',
        updatedAt: serverTimestamp(),
      })
    );

    // 12. Terminal State Re-Opening (updating after status == 'Closed')
    await assertFails(
      updateDoc(doc(aliceDb, 'users', 'user_alice', 'supportTickets', 'tkt_valid'), {
        status: 'Open',
        resolutionNote: 'Attempting to reopen locked closed ticket.',
        updatedAt: serverTimestamp(),
      })
    );
  } finally {
    await testEnv.cleanup();
  }
}
