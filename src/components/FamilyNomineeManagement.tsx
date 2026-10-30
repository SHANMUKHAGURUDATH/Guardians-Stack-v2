import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Edit3,
  Trash2,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Phone,
  Mail,
  Calendar,
  FileText,
  Users,
  Eye,
  EyeOff,
  Percent,
} from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { INSURANCE_PRODUCTS } from '../data/insuranceProducts';
import {
  FamilyNominee,
  FamilyNomineeInput,
  NomineeRelationship,
  NOMINEE_RELATIONSHIPS,
  EMAIL_REGEX,
  PHONE_REGEX,
  ID_PATTERN_REGEX,
  VALIDATION_LIMITS,
  calculateAgeFromDob,
  maskPhone,
  maskEmail,
} from '../types/accountFeatures';

interface PolicyOption {
  id: string;
  name: string;
}

const DEFAULT_VAULT_POLICIES: PolicyOption[] = [
  { id: 'POL-IND-88219', name: 'Max Protect Pure Term Plan' },
  { id: 'POL-CORP-49210', name: 'Group Term Life (Corporate Benefit)' },
  { id: 'POL-HLTH-11928', name: 'Optima Comprehensive Family Floater' },
];

const EMPTY_NOMINEE_FORM: FamilyNomineeInput = {
  nomineeName: '',
  relationship: 'Spouse',
  dateOfBirth: '',
  phone: '',
  email: '',
  address: '',
  linkedMemberId: 'SELF',
  linkedMemberName: 'Self (Primary Policyholder)',
  policyId: 'POL-IND-88219',
  policyName: 'Max Protect Pure Term Plan',
  allocationPct: 100,
  guardianName: '',
  notes: '',
};

export const FamilyNomineeManagement: React.FC = () => {
  const {
    nominees,
    familyMembers,
    getPolicyAllocatedPct,
    addNominee,
    updateNominee,
    deleteNominee,
  } = useUserData();
  const { user, settings } = useAuth();
  const { notify } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [memberFilter, setMemberFilter] = useState<string>('ALL');
  const [policyFilter, setPolicyFilter] = useState<string>('ALL');
  const [revealIds, setRevealIds] = useState<Record<string, boolean>>({});

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNominee, setEditingNominee] = useState<FamilyNominee | null>(null);
  const [formData, setFormData] = useState<FamilyNomineeInput>(EMPTY_NOMINEE_FORM);
  const [useCustomPolicy, setUseCustomPolicy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation modal
  const [deletingNominee, setDeletingNominee] = useState<FamilyNominee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const policyCatalog: PolicyOption[] = useMemo(() => {
    const map = new Map<string, string>();
    DEFAULT_VAULT_POLICIES.forEach((p) => map.set(p.id, p.name));
    INSURANCE_PRODUCTS.slice(0, 8).forEach((prod) => {
      const cleanId = prod.product_id.replace(/[^a-zA-Z0-9_\-]/g, '-');
      if (!map.has(cleanId)) {
        map.set(cleanId, `${prod.product_name} (${prod.insurer_name})`);
      }
    });
    nominees.forEach((n) => {
      if (!map.has(n.policyId)) map.set(n.policyId, n.policyName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [nominees]);

  const insuredMemberOptions = useMemo(() => {
    const primaryLabel = user?.displayName
      ? `Self (${user.displayName})`
      : 'Self (Primary Policyholder)';
    return [
      { id: 'SELF', name: primaryLabel },
      ...familyMembers.map((m) => ({
        id: m.id,
        name: `${m.fullName} (${m.relationship})`,
      })),
    ];
  }, [user?.displayName, familyMembers]);

  // Group allocation summaries per (linkedMemberId + policyId)
  const allocationGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        linkedMemberId: string;
        linkedMemberName: string;
        policyId: string;
        policyName: string;
        totalPct: number;
        count: number;
      }
    >();

    nominees.forEach((n) => {
      const key = `${n.linkedMemberId}::${n.policyId}`;
      const existing = groups.get(key);
      if (existing) {
        existing.totalPct = Math.round((existing.totalPct + n.allocationPct) * 100) / 100;
        existing.count += 1;
      } else {
        groups.set(key, {
          key,
          linkedMemberId: n.linkedMemberId,
          linkedMemberName: n.linkedMemberName,
          policyId: n.policyId,
          policyName: n.policyName,
          totalPct: Math.round(n.allocationPct * 100) / 100,
          count: 1,
        });
      }
    });

    return Array.from(groups.values());
  }, [nominees]);

  const filteredNominees = useMemo(() => {
    return nominees.filter((n) => {
      const matchesMember = memberFilter === 'ALL' || n.linkedMemberId === memberFilter;
      const matchesPolicy = policyFilter === 'ALL' || n.policyId === policyFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        n.nomineeName.toLowerCase().includes(q) ||
        n.relationship.toLowerCase().includes(q) ||
        n.policyId.toLowerCase().includes(q) ||
        n.policyName.toLowerCase().includes(q) ||
        n.linkedMemberName.toLowerCase().includes(q);
      return matchesMember && matchesPolicy && matchesSearch;
    });
  }, [nominees, memberFilter, policyFilter, searchQuery]);

  const fullyAllocatedCount = useMemo(
    () => allocationGroups.filter((g) => Math.abs(g.totalPct - 100) < 0.01).length,
    [allocationGroups]
  );

  const minorNomineesCount = useMemo(
    () =>
      nominees.filter((n) => {
        const age = calculateAgeFromDob(n.dateOfBirth);
        return age !== null && age < 18;
      }).length,
    [nominees]
  );

  // Live allocation math inside modal
  const activePolicyIdClean = formData.policyId.trim().replace(/[^a-zA-Z0-9_\-]/g, '-');
  const alreadyAllocatedOnSelected = getPolicyAllocatedPct(
    formData.linkedMemberId,
    activePolicyIdClean,
    editingNominee?.id
  );
  const remainingAvailablePct = Math.max(
    0,
    Math.round((100 - alreadyAllocatedOnSelected) * 100) / 100
  );
  const projectedTotalPct =
    Math.round((alreadyAllocatedOnSelected + (Number(formData.allocationPct) || 0)) * 100) / 100;

  const nomineeAgeInForm = calculateAgeFromDob(formData.dateOfBirth);
  const isMinorInForm = nomineeAgeInForm !== null && nomineeAgeInForm < 18;

  const openAddModal = () => {
    setEditingNominee(null);
    setUseCustomPolicy(false);
    const defaultMember = insuredMemberOptions[0];
    const defaultPolicy = policyCatalog[0] || DEFAULT_VAULT_POLICIES[0];
    const used = getPolicyAllocatedPct(defaultMember.id, defaultPolicy.id);
    const avail = Math.max(1, Math.min(100, Math.round((100 - used) * 100) / 100));

    setFormData({
      ...EMPTY_NOMINEE_FORM,
      linkedMemberId: defaultMember.id,
      linkedMemberName: defaultMember.name,
      policyId: defaultPolicy.id,
      policyName: defaultPolicy.name,
      allocationPct: avail,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (nominee: FamilyNominee) => {
    setEditingNominee(nominee);
    const isKnownPolicy = policyCatalog.some((p) => p.id === nominee.policyId);
    setUseCustomPolicy(!isKnownPolicy);
    setFormData({
      nomineeName: nominee.nomineeName,
      relationship: nominee.relationship,
      dateOfBirth: nominee.dateOfBirth,
      phone: nominee.phone,
      email: nominee.email,
      address: nominee.address,
      linkedMemberId: nominee.linkedMemberId,
      linkedMemberName: nominee.linkedMemberName,
      policyId: nominee.policyId,
      policyName: nominee.policyName,
      allocationPct: nominee.allocationPct,
      guardianName: nominee.guardianName,
      notes: nominee.notes,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleQuickFillFromFamilyMember = (memberId: string) => {
    if (!memberId) return;
    const found = familyMembers.find((m) => m.id === memberId);
    if (!found) return;
    const mappedRel: NomineeRelationship = (NOMINEE_RELATIONSHIPS.includes(
      found.relationship as NomineeRelationship
    )
      ? found.relationship
      : 'Other') as NomineeRelationship;

    setFormData((prev) => ({
      ...prev,
      nomineeName: found.fullName,
      relationship: mappedRel,
      dateOfBirth: found.dateOfBirth,
      phone: found.phone,
      email: found.email,
      address: found.address,
    }));
  };

  const handleSelectInsuredMember = (memberId: string) => {
    const option = insuredMemberOptions.find((o) => o.id === memberId);
    const used = getPolicyAllocatedPct(memberId, activePolicyIdClean, editingNominee?.id);
    const avail = Math.max(0, Math.round((100 - used) * 100) / 100);
    setFormData((prev) => ({
      ...prev,
      linkedMemberId: memberId,
      linkedMemberName: option?.name || 'Self (Primary Policyholder)',
      allocationPct: prev.allocationPct > avail && avail > 0 ? avail : prev.allocationPct,
    }));
  };

  const handleSelectPolicy = (policyId: string) => {
    const pol = policyCatalog.find((p) => p.id === policyId);
    const used = getPolicyAllocatedPct(formData.linkedMemberId, policyId, editingNominee?.id);
    const avail = Math.max(0, Math.round((100 - used) * 100) / 100);
    setFormData((prev) => ({
      ...prev,
      policyId,
      policyName: pol?.name || prev.policyName,
      allocationPct: prev.allocationPct > avail && avail > 0 ? avail : prev.allocationPct,
    }));
  };

  const validateNomineeForm = (): string | null => {
    if (!formData.nomineeName.trim() || formData.nomineeName.trim().length < 2) {
      return 'Nominee full name is required (at least 2 characters).';
    }
    if (!formData.dateOfBirth) {
      return 'Nominee date of birth is required.';
    }
    const dob = new Date(formData.dateOfBirth);
    if (Number.isNaN(dob.getTime()) || dob > new Date()) {
      return 'Nominee date of birth must be a valid date in the past.';
    }
    if (formData.phone.trim() && !PHONE_REGEX.test(formData.phone.trim())) {
      return 'Please enter a valid contact phone number.';
    }
    if (formData.email.trim() && !EMAIL_REGEX.test(formData.email.trim())) {
      return 'Please enter a valid nominee email address.';
    }
    if (!activePolicyIdClean || !ID_PATTERN_REGEX.test(activePolicyIdClean)) {
      return 'Policy ID must contain only letters, numbers, hyphens, or underscores.';
    }
    if (!formData.policyName.trim()) {
      return 'Policy name is required.';
    }
    const pct = Number(formData.allocationPct);
    if (Number.isNaN(pct) || pct <= 0) {
      return 'Allocation percentage must be greater than 0%.';
    }
    if (alreadyAllocatedOnSelected + pct > 100.0001) {
      return `Total allocation exceeds 100% (${projectedTotalPct}%). Maximum available share on this policy for ${formData.linkedMemberName} is ${remainingAvailablePct}%.`;
    }
    if (isMinorInForm && !formData.guardianName.trim()) {
      return 'Appointee / Legal Guardian name is required when the nominee is under 18 years old.';
    }
    return null;
  };

  const handleSaveNominee = async (e: React.FormEvent) => {
    e.preventDefault();
    const errMsg = validateNomineeForm();
    if (errMsg) {
      setFormError(errMsg);
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      const payload: FamilyNomineeInput = {
        ...formData,
        policyId: activePolicyIdClean,
      };
      if (editingNominee) {
        await updateNominee(editingNominee.id, payload);
        notify(
          'success',
          'Nominee Updated',
          `${payload.nomineeName} now holds ${payload.allocationPct}% on ${payload.policyId}.`
        );
      } else {
        await addNominee(payload);
        notify(
          'success',
          'Nominee Added',
          `${payload.nomineeName} assigned ${payload.allocationPct}% share on ${payload.policyId}.`
        );
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err?.message || 'Failed to save nominee.';
      setFormError(msg);
      notify('error', 'Nominee Save Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingNominee) return;
    setIsDeleting(true);
    try {
      await deleteNominee(deletingNominee.id);
      notify(
        'success',
        'Nominee Record Deleted',
        `Removed ${deletingNominee.nomineeName} (${deletingNominee.allocationPct}%) from ${deletingNominee.policyId}.`
      );
      setDeletingNominee(null);
    } catch (err: any) {
      notify('error', 'Delete Failed', err?.message || 'Unable to delete nominee.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-100">Family Nominee Management</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                100% CAP ENFORCED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Assign beneficiaries to insured family members and policies, manage percentage
              allocations up to 100%, and record minor nominee appointees.
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Policy Nominee</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block">Active Nominee Records</span>
          <div className="text-2xl font-black text-white mt-1">{nominees.length}</div>
          <span className="text-[10px] text-cyan-400 font-semibold">
            Across {allocationGroups.length} policy scope(s)
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block">100% Fully Allocated</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {fullyAllocatedCount} / {allocationGroups.length}
          </div>
          <span className="text-[10px] text-slate-400">Policies with complete share split</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block">Partial Allocations (&lt;100%)</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {Math.max(0, allocationGroups.length - fullyAllocatedCount)}
          </div>
          <span className="text-[10px] text-slate-400">Unassigned beneficiary shares</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block">Minor Nominees (&lt;18y)</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">{minorNomineesCount}</div>
          <span className="text-[10px] text-slate-400">Protected with guardian appointee</span>
        </div>
      </div>

      {/* Policy Allocation Progress Matrix */}
      {allocationGroups.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
              <Percent className="w-4 h-4 text-cyan-400" />
              <span>Policy &amp; Insured Member Allocation Ledger (Max 100% Per Policy)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Real-time share verification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allocationGroups.map((group) => {
              const isComplete = Math.abs(group.totalPct - 100) < 0.01;
              return (
                <div
                  key={group.key}
                  className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-100 truncate">{group.policyName}</div>
                      <div className="text-[10px] text-slate-400">
                        Policy <span className="font-mono text-cyan-400">{group.policyId}</span> •
                        Insured: <strong className="text-slate-300">{group.linkedMemberName}</strong>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 border ${
                        isComplete
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {group.totalPct}% / 100%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isComplete ? 'bg-emerald-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, group.totalPct)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{group.count} nominee(s) assigned</span>
                    {isComplete ? (
                      <span className="text-emerald-400 font-semibold">
                        ✓ 100% Fully Allocated
                      </span>
                    ) : (
                      <span className="text-amber-300 font-semibold">
                        {Math.round((100 - group.totalPct) * 100) / 100}% unallocated remaining
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by nominee name, relationship, policy ID, or insured member..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Insured Members</option>
          {insuredMemberOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={policyFilter}
          onChange={(e) => setPolicyFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Insurance Policies</option>
          {policyCatalog.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id} — {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Nominee Cards List */}
      {filteredNominees.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">
            {nominees.length === 0 ? 'No Nominees Assigned Yet' : 'No Matching Nominees'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {nominees.length === 0
              ? 'Assign verified nominees to your life and health policies with exact percentage allocations.'
              : 'Adjust your filters or search query to view nominee records.'}
          </p>
          {nominees.length === 0 && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold inline-flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Nominee</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNominees.map((nom) => {
            const age = calculateAgeFromDob(nom.dateOfBirth);
            const isMinor = age !== null && age < 18;
            const shouldMask = settings.maskSensitiveData && !revealIds[nom.id];

            return (
              <div
                key={nom.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-lg flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-sm font-bold text-slate-100">{nom.nomineeName}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {nom.relationship}
                        </span>
                        {isMinor && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                            Minor ({age}y)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        DOB: {nom.dateOfBirth} {age !== null ? `(${age} yrs)` : ''}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-cyan-400 leading-none">
                        {nom.allocationPct}%
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Benefit Share
                      </span>
                    </div>
                  </div>

                  {/* Policy & Insured Mapping */}
                  <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Policy:</span>
                      </span>
                      <span className="font-bold text-slate-100 truncate">
                        {nom.policyName}{' '}
                        <span className="font-mono text-[10px] text-cyan-400">({nom.policyId})</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Insured Member:</span>
                      </span>
                      <span className="font-semibold text-slate-200">{nom.linkedMemberName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400 flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{maskPhone(nom.phone, shouldMask)}</span>
                      </span>
                      <span className="text-slate-400 truncate max-w-[180px]">
                        {maskEmail(nom.email, shouldMask)}
                      </span>
                    </div>
                  </div>

                  {nom.guardianName && (
                    <div className="px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-200">
                      <strong>Appointee / Guardian:</strong> {nom.guardianName}
                    </div>
                  )}

                  {nom.notes && (
                    <p className="text-[11px] text-slate-400 italic">"{nom.notes}"</p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Allocation Verified</span>
                    </span>
                    {settings.maskSensitiveData && (
                      <button
                        onClick={() =>
                          setRevealIds((prev) => ({ ...prev, [nom.id]: !prev[nom.id] }))
                        }
                        className="text-slate-400 hover:text-cyan-300 p-1"
                        title="Toggle contact visibility"
                      >
                        {shouldMask ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => openEditModal(nom)}
                      className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingNominee(nom)}
                      className="p-1.5 rounded-lg bg-slate-850 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800"
                      title="Delete nominee"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT NOMINEE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  {editingNominee ? 'Edit Policy Nominee' : 'Add New Policy Nominee'}
                </h3>
                <p className="text-xs text-slate-400">
                  Link beneficiary to insured family member and policy with verified share split.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNominee} className="space-y-4 text-xs">
              {/* Quick-fill helper from existing Family Members */}
              {!editingNominee && familyMembers.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300 font-semibold">
                    Quick-fill nominee details from Family Registry:
                  </span>
                  <select
                    defaultValue=""
                    onChange={(e) => handleQuickFillFromFamilyMember(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select a saved family member...</option>
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.relationship})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Policy & Insured Member Association */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Insured Family Member <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.linkedMemberId}
                    onChange={(e) => handleSelectInsuredMember(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {insuredMemberOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-300">
                      Associated Policy <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseCustomPolicy(!useCustomPolicy)}
                      className="text-[10px] text-cyan-400 hover:underline font-semibold"
                    >
                      {useCustomPolicy ? 'Choose from catalog' : 'Enter custom policy'}
                    </button>
                  </div>
                  {!useCustomPolicy ? (
                    <select
                      value={formData.policyId}
                      onChange={(e) => handleSelectPolicy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      {policyCatalog.map((pol) => (
                        <option key={pol.id} value={pol.id}>
                          {pol.id} — {pol.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="POL-2026-001"
                        value={formData.policyId}
                        onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
                        className="px-2.5 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 font-mono text-[11px]"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Policy Name"
                        value={formData.policyName}
                        onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
                        className="px-2.5 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 text-[11px]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Allocation Percentage Guard Box */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-200">
                    Nominee Benefit Allocation (%) <span className="text-rose-400">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-bold ${
                      projectedTotalPct > 100
                        ? 'text-rose-400'
                        : projectedTotalPct === 100
                        ? 'text-emerald-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    Other Nominees: {alreadyAllocatedOnSelected}% • Available:{' '}
                    {remainingAvailablePct}%
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min={1}
                    max={Math.max(1, remainingAvailablePct || 100)}
                    step={1}
                    value={Math.min(100, Number(formData.allocationPct) || 0)}
                    onChange={(e) =>
                      setFormData({ ...formData, allocationPct: Number(e.target.value) })
                    }
                    className="flex-1 accent-cyan-500"
                  />
                  <div className="relative w-24">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      step="0.5"
                      required
                      value={formData.allocationPct}
                      onChange={(e) =>
                        setFormData({ ...formData, allocationPct: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 pr-6 rounded-lg bg-slate-900 border border-slate-700 text-right font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                      %
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      projectedTotalPct > 100
                        ? 'bg-rose-500'
                        : projectedTotalPct === 100
                        ? 'bg-emerald-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(100, projectedTotalPct)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Projected policy total after saving:{' '}
                  <strong
                    className={projectedTotalPct > 100 ? 'text-rose-400' : 'text-slate-200'}
                  >
                    {projectedTotalPct}% / 100%
                  </strong>
                  {projectedTotalPct > 100 && ' — Cannot exceed 100%!'}
                </p>
              </div>

              {/* Nominee Personal & Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Nominee Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={VALIDATION_LIMITS.DISPLAY_NAME_MAX}
                    value={formData.nomineeName}
                    onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                    placeholder="Full legal name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Relationship <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        relationship: e.target.value as NomineeRelationship,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {NOMINEE_RELATIONSHIPS.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Date of Birth <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    maxLength={VALIDATION_LIMITS.PHONE_MAX}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    maxLength={VALIDATION_LIMITS.EMAIL_MAX}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nominee@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Appointee / Guardian {isMinorInForm && <span className="text-rose-400">*</span>}
                  </label>
                  <input
                    type="text"
                    required={isMinorInForm}
                    maxLength={VALIDATION_LIMITS.GUARDIAN_NAME_MAX}
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder={isMinorInForm ? 'Required for minor (<18y)' : 'Optional if adult'}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-850 border text-slate-100 focus:outline-none focus:border-cyan-500 ${
                      isMinorInForm ? 'border-amber-600' : 'border-slate-700'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Postal Address</label>
                  <input
                    type="text"
                    maxLength={VALIDATION_LIMITS.ADDRESS_MAX}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="City / Postal address"
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    KYC / Nomination Notes
                  </label>
                  <input
                    type="text"
                    maxLength={VALIDATION_LIMITS.NOMINEE_NOTES_MAX}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. MWPA addendum beneficiary"
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || projectedTotalPct > 100}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold shadow-md"
                >
                  {isSaving
                    ? 'Saving...'
                    : editingNominee
                    ? 'Update Nominee'
                    : 'Save Nominee Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingNominee && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/70 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Delete Nominee Record?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This will remove{' '}
                  <strong className="text-slate-200">{deletingNominee.nomineeName}</strong> (
                  {deletingNominee.allocationPct}% share on{' '}
                  <span className="font-mono text-cyan-300">{deletingNominee.policyId}</span>). You
                  can re-allocate the freed percentage to another beneficiary afterward.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingNominee(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Delete Nominee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
