import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  LayoutGrid,
  List,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  ShieldAlert,
  CheckCircle2,
  X,
  AlertTriangle,
  UserCheck,
  Briefcase,
} from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  FamilyMember,
  FamilyMemberInput,
  FamilyRelationship,
  FAMILY_RELATIONSHIPS,
  GenderOption,
  EMAIL_REGEX,
  PHONE_REGEX,
  VALIDATION_LIMITS,
  calculateAgeFromDob,
  maskPhone,
  maskEmail,
} from '../types/accountFeatures';

interface FamilyMemberManagementProps {
  onNavigateToNominees?: () => void;
}

const EMPTY_FORM: FamilyMemberInput = {
  fullName: '',
  relationship: 'Spouse',
  dateOfBirth: '',
  gender: 'Female',
  phone: '',
  email: '',
  address: '',
  bloodGroup: 'O+',
  occupation: '',
  isDependent: true,
  emergencyContact: false,
  medicalNotes: '',
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export const FamilyMemberManagement: React.FC<FamilyMemberManagementProps> = ({
  onNavigateToNominees,
}) => {
  const { familyMembers, nominees, addFamilyMember, updateFamilyMember, deleteFamilyMember } =
    useUserData();
  const { settings } = useAuth();
  const { notify } = useToast();

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState<string>('ALL');
  const [revealContactIds, setRevealContactIds] = useState<Record<string, boolean>>({});

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState<FamilyMemberInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // View details modal
  const [viewingMember, setViewingMember] = useState<FamilyMember | null>(null);

  // Delete confirmation modal
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);
  const [alsoRemoveNominees, setAlsoRemoveNominees] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredMembers = useMemo(() => {
    return familyMembers.filter((m) => {
      const matchesRelation =
        relationshipFilter === 'ALL' || m.relationship === relationshipFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        m.fullName.toLowerCase().includes(q) ||
        m.relationship.toLowerCase().includes(q) ||
        m.occupation.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q);
      return matchesRelation && matchesQuery;
    });
  }, [familyMembers, relationshipFilter, searchQuery]);

  const dependentCount = useMemo(
    () => familyMembers.filter((m) => m.isDependent).length,
    [familyMembers]
  );
  const emergencyCount = useMemo(
    () => familyMembers.filter((m) => m.emergencyContact).length,
    [familyMembers]
  );

  const toggleReveal = (id: string) => {
    setRevealContactIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateModal = () => {
    setEditingMember(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName,
      relationship: member.relationship,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      phone: member.phone,
      email: member.email,
      address: member.address,
      bloodGroup: member.bloodGroup || 'Unknown',
      occupation: member.occupation,
      isDependent: member.isDependent,
      emergencyContact: member.emergencyContact,
      medicalNotes: member.medicalNotes,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const validateMemberForm = (): string | null => {
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      return 'Full name is required (at least 2 characters).';
    }
    if (!formData.dateOfBirth) {
      return 'Date of birth is required.';
    }
    const dobDate = new Date(formData.dateOfBirth);
    if (Number.isNaN(dobDate.getTime()) || dobDate > new Date()) {
      return 'Date of birth must be a valid date in the past.';
    }
    if (formData.phone.trim() && !PHONE_REGEX.test(formData.phone.trim())) {
      return 'Please enter a valid contact phone number (7–25 digits/characters).';
    }
    if (formData.email.trim() && !EMAIL_REGEX.test(formData.email.trim())) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErr = validateMemberForm();
    if (validationErr) {
      setFormError(validationErr);
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      if (editingMember) {
        await updateFamilyMember(editingMember.id, formData);
        notify(
          'success',
          'Family Member Updated',
          `${formData.fullName} (${formData.relationship}) profile has been updated.`
        );
      } else {
        await addFamilyMember(formData);
        notify(
          'success',
          'Family Member Added',
          `${formData.fullName} (${formData.relationship}) has been added to your family registry.`
        );
      }
      setIsFormOpen(false);
    } catch (err: any) {
      const msg = err?.message || 'Could not save family member.';
      setFormError(msg);
      notify('error', 'Failed to Save Member', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMember) return;
    setIsDeleting(true);
    try {
      await deleteFamilyMember(deletingMember.id, alsoRemoveNominees);
      notify(
        'success',
        'Family Member Removed',
        `${deletingMember.fullName} has been removed from your family directory.`
      );
      if (viewingMember?.id === deletingMember.id) {
        setViewingMember(null);
      }
      setDeletingMember(null);
    } catch (err: any) {
      notify('error', 'Deletion Failed', err?.message || 'Unable to delete family member.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getLinkedNomineesForMember = (memberId: string) =>
    nominees.filter((n) => n.linkedMemberId === memberId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-100">Family Member Management</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                HOUSEHOLD REGISTRY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Maintain individual profiles, relationships, dates of birth, contact details, and
              underwriting notes for your household members.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-600/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block">Registered Members</span>
          <div className="text-2xl font-black text-white mt-1">{familyMembers.length}</div>
          <span className="text-[10px] text-cyan-400 font-semibold">Individual profiles stored</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block">Financial Dependents</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{dependentCount}</div>
          <span className="text-[10px] text-slate-400">Protected under household cover</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block">Emergency Contacts</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{emergencyCount}</div>
          <span className="text-[10px] text-slate-400">Designated rapid-response contacts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block">Linked Policy Nominees</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">{nominees.length}</div>
          {onNavigateToNominees ? (
            <button
              onClick={onNavigateToNominees}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold underline"
            >
              Manage Nominee Shares →
            </button>
          ) : (
            <span className="text-[10px] text-slate-400">Active beneficiary mappings</span>
          )}
        </div>
      </div>

      {/* Filter, Search & Layout Toggle Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by member name, relationship, phone, email, or occupation..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={relationshipFilter}
            onChange={(e) => setRelationshipFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Relationships ({familyMembers.length})</option>
            {FAMILY_RELATIONSHIPS.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center space-x-1 bg-slate-850 p-1 rounded-xl border border-slate-800 self-start md:self-auto text-xs">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'cards'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">
            {familyMembers.length === 0
              ? 'No Family Members Added Yet'
              : 'No Matching Family Members Found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {familyMembers.length === 0
              ? 'Start building your household registry by adding your spouse, parents, children, or siblings with their birth dates and contact information.'
              : 'Try adjusting your search text or relationship filter.'}
          </p>
          {familyMembers.length === 0 && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold inline-flex items-center space-x-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add First Family Member</span>
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* CARD LAYOUT */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const age = calculateAgeFromDob(member.dateOfBirth);
            const shouldMask = settings.maskSensitiveData && !revealContactIds[member.id];
            const memberNominees = getLinkedNomineesForMember(member.id);

            return (
              <div
                key={member.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-lg flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  {/* Top Identity Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-extrabold text-sm shrink-0">
                        {member.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-100 truncate">
                          {member.fullName}
                        </h3>
                        <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {member.relationship}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {member.gender} {age !== null ? `• ${age} yrs` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {settings.maskSensitiveData && (
                      <button
                        onClick={() => toggleReveal(member.id)}
                        title={shouldMask ? 'Reveal contact info' : 'Mask contact info'}
                        className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800"
                      >
                        {shouldMask ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Metadata Box */}
                  <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-slate-400">DOB:</span>
                      <span className="font-medium">{member.dateOfBirth}</span>
                      {member.bloodGroup && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/60 font-bold">
                          {member.bloodGroup}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{maskPhone(member.phone, shouldMask)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{maskEmail(member.email, shouldMask)}</span>
                    </div>
                    {member.address && (
                      <div className="flex items-center space-x-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate text-[11px]">{member.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Flags */}
                  <div className="flex flex-wrap gap-1.5">
                    {member.isDependent && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-semibold">
                        Dependent
                      </span>
                    )}
                    {member.emergencyContact && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-semibold">
                        Emergency Contact
                      </span>
                    )}
                    {memberNominees.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-semibold">
                        {memberNominees.length} Policy Nominee(s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => setViewingMember(member)}
                    className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-cyan-400 border border-slate-800 font-semibold flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => openEditModal(member)}
                      className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                      title="Edit member"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setAlsoRemoveNominees(true);
                        setDeletingMember(member);
                      }}
                      className="p-1.5 rounded-lg bg-slate-850 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800"
                      title="Delete member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LAYOUT */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-850 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="p-3.5">Member Name</th>
                  <th className="p-3.5">Relationship</th>
                  <th className="p-3.5">DOB &amp; Gender</th>
                  <th className="p-3.5">Contact Information</th>
                  <th className="p-3.5">Flags</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredMembers.map((member) => {
                  const age = calculateAgeFromDob(member.dateOfBirth);
                  const shouldMask = settings.maskSensitiveData && !revealContactIds[member.id];
                  return (
                    <tr key={member.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{member.fullName}</div>
                        {member.occupation && (
                          <div className="text-[10px] text-slate-400">{member.occupation}</div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[10px]">
                          {member.relationship}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-200">
                          {member.dateOfBirth} {age !== null ? `(${age}y)` : ''}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {member.gender} {member.bloodGroup ? `• Blood: ${member.bloodGroup}` : ''}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div>{maskPhone(member.phone, shouldMask)}</div>
                        <div className="text-[10px] text-slate-400">
                          {maskEmail(member.email, shouldMask)}
                        </div>
                      </td>
                      <td className="p-3.5 space-x-1">
                        {member.isDependent && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 text-[10px]">
                            Dependent
                          </span>
                        )}
                        {member.emergencyContact && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-[10px]">
                            SOS
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            onClick={() => setViewingMember(member)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px]"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setAlsoRemoveNominees(true);
                              setDeletingMember(member);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  {editingMember ? 'Edit Family Member Profile' : 'Add New Family Member'}
                </h3>
                <p className="text-xs text-slate-400">
                  Capture accurate personal, relationship, and contact information.
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={VALIDATION_LIMITS.DISPLAY_NAME_MAX}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g.Kavitha Sharma"
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
                        relationship: e.target.value as FamilyRelationship,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {FAMILY_RELATIONSHIPS.map((rel) => (
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
                  <label className="block font-semibold text-slate-300 mb-1">
                    Gender <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as GenderOption })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
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
                  <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    maxLength={VALIDATION_LIMITS.EMAIL_MAX}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="member@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Occupation / Role
                  </label>
                  <input
                    type="text"
                    maxLength={VALIDATION_LIMITS.OCCUPATION_MAX}
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="e.g. Teacher, Student, Homemaker"
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Residential Address / City
                </label>
                <input
                  type="text"
                  maxLength={VALIDATION_LIMITS.ADDRESS_MAX}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, Locality, City, State"
                  className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Health / Underwriting Notes
                </label>
                <textarea
                  rows={2}
                  maxLength={VALIDATION_LIMITS.MEDICAL_NOTES_MAX}
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                  placeholder="Optional allergies, chronic conditions, or policy notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDependent}
                    onChange={(e) => setFormData({ ...formData, isDependent: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                  />
                  <div>
                    <span className="font-bold text-slate-200 block">Financially Dependent</span>
                    <span className="text-[10px] text-slate-400">
                      Include in household dependency profile
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emergencyContact}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyContact: e.target.checked })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                  />
                  <div>
                    <span className="font-bold text-slate-200 block">Emergency SOS Contact</span>
                    <span className="text-[10px] text-slate-400">
                      Prioritize for urgent claim notifications
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold shadow-md"
                >
                  {isSaving
                    ? 'Saving...'
                    : editingMember
                    ? 'Save Member Changes'
                    : 'Add Family Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INDIVIDUAL MEMBER DETAILS MODAL */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-black text-lg">
                  {viewingMember.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{viewingMember.fullName}</h3>
                  <div className="flex items-center space-x-2 mt-0.5 text-xs">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[10px]">
                      {viewingMember.relationship}
                    </span>
                    <span className="text-slate-400">
                      {viewingMember.gender} •{' '}
                      {calculateAgeFromDob(viewingMember.dateOfBirth) ?? '—'} years old
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Date of Birth</span>
                <span className="font-bold text-slate-100">{viewingMember.dateOfBirth}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Blood Group</span>
                <span className="font-bold text-rose-300">
                  {viewingMember.bloodGroup || 'Not specified'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Phone Number</span>
                <span className="font-bold text-slate-100">
                  {viewingMember.phone || 'Not provided'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Email Address</span>
                <span className="font-bold text-slate-100 break-all">
                  {viewingMember.email || 'Not provided'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 sm:col-span-2">
                <span className="text-[10px] text-slate-400 block">Occupation &amp; Address</span>
                <span className="font-semibold text-slate-200 block">
                  <Briefcase className="w-3 h-3 inline mr-1 text-cyan-400" />
                  {viewingMember.occupation || 'Not specified'}
                </span>
                <span className="text-slate-400 text-[11px] block mt-0.5">
                  {viewingMember.address || 'No residential address recorded'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 sm:col-span-2">
                <span className="text-[10px] text-slate-400 block">
                  Medical &amp; Underwriting Notes
                </span>
                <span className="text-slate-200 block mt-0.5">
                  <Heart className="w-3 h-3 inline mr-1 text-rose-400" />
                  {viewingMember.medicalNotes || 'No medical notes recorded.'}
                </span>
              </div>
            </div>

            {/* Associated Nominees for this Member */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Nominees Assigned to {viewingMember.fullName}'s Policies
                </h4>
                <span className="text-[10px] text-cyan-400 font-semibold">
                  {getLinkedNomineesForMember(viewingMember.id).length} Record(s)
                </span>
              </div>

              {getLinkedNomineesForMember(viewingMember.id).length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>No policy nominees specifically linked as insured for this member yet.</span>
                  {onNavigateToNominees && (
                    <button
                      onClick={() => {
                        setViewingMember(null);
                        onNavigateToNominees();
                      }}
                      className="text-cyan-400 hover:underline font-semibold ml-2 shrink-0"
                    >
                      Assign →
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {getLinkedNomineesForMember(viewingMember.id).map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-100">{n.nomineeName}</span>
                        <span className="text-slate-400 text-[11px] block">
                          {n.relationship} • {n.policyName} ({n.policyId})
                        </span>
                      </div>
                      <span className="text-sm font-black text-cyan-400">{n.allocationPct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs">
              <span className="text-[10px] text-slate-500">
                Updated {new Date(viewingMember.updatedAtIso).toLocaleDateString()}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const m = viewingMember;
                    setViewingMember(null);
                    openEditModal(m);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => setViewingMember(null)}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/70 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Remove {deletingMember.fullName}?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-slate-200">{deletingMember.fullName}</strong> (
                  {deletingMember.relationship}) from your Family Member registry?
                </p>
              </div>
            </div>

            {getLinkedNomineesForMember(deletingMember.id).length > 0 && (
              <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-800/70 text-xs space-y-2">
                <p className="text-amber-200 font-semibold">
                  {getLinkedNomineesForMember(deletingMember.id).length} nominee record(s) are
                  linked to policies insured under this family member.
                </p>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alsoRemoveNominees}
                    onChange={(e) => setAlsoRemoveNominees(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                  />
                  <span>Also delete linked nominee allocations</span>
                </label>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingMember(null)}
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
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
