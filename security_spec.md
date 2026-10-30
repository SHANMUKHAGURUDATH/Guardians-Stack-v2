# Guardian Stack — Firestore Zero-Trust Security Specification

## 1. Data Invariants

1. **Root Identity Invariant**: A `/users/{userId}` document can only be read, created, updated, or deleted by the authenticated user whose `request.auth.uid == userId`, with `uid == userId`, and `request.auth.token.email_verified == true` for all writes.
2. **Master Gate Parent Invariant**: No subcollection document (`private`, `settings`, `familyMembers`, `nominees`, `supportTickets`) can be created, read (`get`), updated, or deleted unless the parent `/users/{userId}` document exists and its `uid == request.auth.uid`.
3. **PII Split-Collection Isolation**: Sensitive PII (`email`, `phone`, `dateOfBirth`, `city`, `occupation`, `bio`) is isolated inside `/users/{userId}/private/{profileId}` and is never readable by any other authenticated user.
4. **Relational Nominee Invariant**: A `FamilyNominee` record must either set `linkedMemberId == 'SELF'` or reference an existing `/users/{userId}/familyMembers/{linkedMemberId}` document owned by the same user, with `allocationPct > 0 && allocationPct <= 100`.
5. **Temporal & Immortal Invariants**: `createdAt` and `updatedAt` must strictly equal `request.time` on creation; `updatedAt == request.time` on updates; `ownerId`, `uid`, `createdAt`, and `ticketNumber` are strictly immutable after creation.
6. **Terminal State Locking**: Once a `SupportTicket` reaches `status == 'Closed'`, all subsequent client updates are strictly rejected.
7. **Zero Client Query Delegation**: Every `allow list` rule enforces `request.auth.uid == userId && resource.data.ownerId == request.auth.uid` without `get()`/`exists()` inside `list`.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 — Identity Spoofing on User Create**: Authenticated `userA` attempts to create `/users/userA` with `{ uid: "userB", displayName: "Spoof", authProvider: "password", createdAt: SERVER_TIME, updatedAt: SERVER_TIME }`.
2. **Payload 2 — Unverified Email Write**: Authenticated `userA` with `email_verified: false` attempts to create `/users/userA`.
3. **Payload 3 — Shadow / Ghost Field Injection**: `userA` sends valid `FamilyMember` fields plus `{ isAdmin: true }` to `/users/userA/familyMembers/mem_1`.
4. **Payload 4 — Cross-Tenant PII Read**: Authenticated `userB` attempts `get` on `/users/userA/private/profile`.
5. **Payload 5 — Orphaned Subcollection Write (Bypassing Master Gate)**: `userA` attempts to create `/users/userA/familyMembers/mem_1` before `/users/userA` exists.
6. **Payload 6 — ID Poisoning Attack**: `userA` attempts to create `/users/userA/familyMembers/bad id with spaces$!` with invalid path characters.
7. **Payload 7 — Resource / Value Poisoning (Oversized String)**: `userA` updates `FamilyMember.fullName` with a 5,000-character string exceeding `maxLength: 100`.
8. **Payload 8 — Nominee Allocation Out-of-Bounds**: `userA` creates a `FamilyNominee` with `allocationPct: 150` (or `-10`).
9. **Payload 9 — Dangling Relational Nominee Reference**: `userA` creates a `FamilyNominee` with `linkedMemberId: "non_existent_member"`.
10. **Payload 10 — Immortal Field Mutation**: `userA` updates `SupportTicket` while mutating `createdAt` or `ticketNumber` or `ownerId`.
11. **Payload 11 — Client-Forged Timestamp**: `userA` creates `SupportTicket` with a past/future hardcoded timestamp instead of `request.time`.
12. **Payload 12 — Terminal State Re-Opening**: `userA` attempts to update a `SupportTicket` whose existing `status` is already `'Closed'`.
