import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageSquarePlus,
  Ticket,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Lock,
  AlertCircle,
  FileText,
  X,
  Send,
  Trash2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  SupportCategory,
  SUPPORT_CATEGORIES,
  SupportPriority,
  SUPPORT_PRIORITIES,
  SupportStatus,
  SupportTicket,
  EMAIL_REGEX,
  VALIDATION_LIMITS,
} from '../types/accountFeatures';

type SupportSubTab = 'articles' | 'faqs' | 'contact' | 'tickets';

interface HelpArticleItem {
  id: string;
  title: string;
  category: 'Account' | 'Technical' | 'General' | 'Other';
  readTime: string;
  summary: string;
  sections: { heading: string; body: string }[];
}

interface UserGuideItem {
  id: string;
  title: string;
  audience: string;
  steps: string[];
}

interface FaqEntry {
  id: string;
  category: 'Account' | 'Technical' | 'General' | 'Other';
  question: string;
  answer: string;
}

const HELP_ARTICLES: HelpArticleItem[] = [
  {
    id: 'art-hlv-methodology',
    title: 'How Human Life Value (HLV) & Net Protection Needs Are Calculated',
    category: 'General',
    readTime: '4 min read',
    summary:
      'Detailed walkthrough of the Income Replacement Method, discount rates, liability offsets, and goal reserves used across Guardian Stack.',
    sections: [
      {
        heading: 'Income Replacement Formula (HLV)',
        body: 'Human Life Value estimates the present value of your future net earnings up to age 60 after deducting personal living consumption (~30%), discounted using actuarial growth and inflation assumptions.',
      },
      {
        heading: 'Net Needs & Coverage Gap',
        body: 'Net Needs sums all outstanding loans (Home, Car, Personal, Education), a 10-year household expense reserve, and inflation-adjusted family milestones, then subtracts existing employer/individual life cover and liquid financial assets.',
      },
    ],
  },
  {
    id: 'art-nominee-100-cap',
    title: 'Managing Policy Nominees & Enforcing 100% Allocation Shares',
    category: 'General',
    readTime: '3 min read',
    summary:
      'Learn how to link beneficiaries to insured family members and policies, split benefit percentages, and appoint guardians for minor nominees.',
    sections: [
      {
        heading: 'Why Total Allocation Cannot Exceed 100%',
        body: 'Under insurance nomination rules, the sum of beneficiary shares on any single policy for an insured member must never exceed 100%. Guardian Stack validates remaining available share in real time before saving.',
      },
      {
        heading: 'Minor Nominees (< 18 Years)',
        body: 'When a nominee is under 18 years old based on their Date of Birth, an adult Appointee / Legal Guardian must be recorded to receive claim proceeds in trust during minority.',
      },
    ],
  },
  {
    id: 'art-account-security',
    title: 'Zero-Trust Account Security, PII Masking & Password Recovery',
    category: 'Account',
    readTime: '3 min read',
    summary:
      'Configure password resets, Google OAuth, email verification, PII masking, and portable JSON/CSV backups in Settings.',
    sections: [
      {
        heading: 'Email Verification & Cloud Isolation',
        body: 'Every record in Guardian Stack is isolated under your authenticated UID with strict server-timestamped Firestore security rules. Enabling PII Masking hides phone numbers and emails until revealed.',
      },
      {
        heading: 'Data Portability & Account Deletion',
        body: 'Use Settings → Data Export & Danger Zone at any time to download a complete JSON archive or CSV schedule, or permanently erase your account.',
      },
    ],
  },
  {
    id: 'art-dataset-import',
    title: 'Importing Custom CSV / ZIP Actuarial Datasets & Running Scenarios',
    category: 'Technical',
    readTime: '5 min read',
    summary:
      'Format guidelines for importing custom 51-field customer profiles and testing stress scenarios in the What-If Sandbox.',
    sections: [
      {
        heading: '51-Field Customer Schema',
        body: 'Click Datasets in the top bar to upload CSV or ZIP bundles matching the 51-field schema. You can reset individual or all profiles back to original dataset baselines at any time.',
      },
      {
        heading: 'What-If Sandbox & PDF Reports',
        body: 'Simulate income shifts, new loans, or additional dependents without altering your baseline record, then export a printable Actuarial PDF Report from the header.',
      },
    ],
  },
];

const USER_GUIDES: UserGuideItem[] = [
  {
    id: 'guide-onboarding',
    title: 'Quick Start: Complete Family Protection Setup',
    audience: 'New Policyholders',
    steps: [
      'Complete your personal contact details and preferences in Settings → Account & Profile.',
      'Open Family Members and add your spouse, children, and dependent parents with accurate Dates of Birth.',
      'Open Nominees, select each active policy, and allocate beneficiary shares totaling 100%.',
      'Review the Intelligence Hub Dashboard to verify your Net Coverage Gap and eligible term plans.',
    ],
  },
  {
    id: 'guide-claims-readiness',
    title: 'Emergency Claims Readiness Checklist',
    audience: 'Household Administrators',
    steps: [
      'Designate at least one adult household member as an Emergency SOS Contact in Family Members.',
      'Ensure minor beneficiaries (<18 years) have a named adult Appointee in Nominee Management.',
      'Verify policy numbers and renewal dates in Family Vault & Premium Calendar.',
      'Export a periodic CSV/JSON backup from Settings for your family records.',
    ],
  },
];

const FAQ_LIST: FaqEntry[] = [
  {
    id: 'faq-1',
    category: 'Account',
    question: 'How do I reset my password if I cannot sign in?',
    answer:
      'On the Sign In screen, click "Forgot password?", enter your registered email address, and click "Send Password Reset Link". Follow the link in your inbox or paste the reset action code directly in the Set New Password screen.',
  },
  {
    id: 'faq-2',
    category: 'General',
    question: 'Can I assign multiple nominees to the same insurance policy?',
    answer:
      'Yes. You can add multiple nominees (for example, 70% to Spouse and 30% to Child) to the same policy and insured member. The platform automatically enforces that combined shares never exceed 100%.',
  },
  {
    id: 'faq-3',
    category: 'Account',
    question: 'What is the difference between Demo Mode and a Cloud Account?',
    answer:
      'Demo Mode lets you explore all features immediately using browser storage with sample data. Signing in with Google or a verified Email/Password account stores your records in Zero-Trust Cloud Firestore across sessions.',
  },
  {
    id: 'faq-4',
    category: 'Technical',
    question: 'Why can a Closed support ticket no longer be edited?',
    answer:
      'For audit and compliance integrity, tickets marked as "Closed" are locked in a terminal state. If a new question arises later, simply submit a fresh support request referencing the previous ticket number.',
  },
  {
    id: 'faq-5',
    category: 'Other',
    question: 'How do I export my family members and nominee allocations?',
    answer:
      'Navigate to Settings → Data Export & Danger Zone. You can download either a complete JSON archive of your account or a spreadsheet-ready CSV file of all family members and nominees.',
  },
];

export const HelpSupportCentre: React.FC = () => {
  const {
    supportTickets,
    createSupportTicket,
    updateSupportTicketDetails,
    transitionSupportTicketStatus,
    deleteSupportTicket,
  } = useUserData();
  const { user } = useAuth();
  const { notify } = useToast();

  const [activeTab, setActiveTab] = useState<SupportSubTab>('articles');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [readingArticle, setReadingArticle] = useState<HelpArticleItem | null>(null);

  // Support ticket submission form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportCategory>('General');
  const [priority, setPriority] = useState<SupportPriority>('Medium');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [relatedPolicyId, setRelatedPolicyId] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [submittedConfirmation, setSubmittedConfirmation] = useState<SupportTicket | null>(null);

  // Ticket tracker filter & inspector state
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('ALL');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return HELP_ARTICLES.filter((art) => {
      const catOk = categoryFilter === 'ALL' || art.category === categoryFilter;
      const searchOk =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.sections.some(
          (s) => s.heading.toLowerCase().includes(q) || s.body.toLowerCase().includes(q)
        );
      return catOk && searchOk;
    });
  }, [searchQuery, categoryFilter]);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FAQ_LIST.filter((f) => {
      const catOk = categoryFilter === 'ALL' || f.category === categoryFilter;
      const searchOk =
        !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [searchQuery, categoryFilter]);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return supportTickets.filter((t) => {
      const stOk = ticketStatusFilter === 'ALL' || t.status === ticketStatusFilter;
      const catOk = ticketCategoryFilter === 'ALL' || t.category === ticketCategoryFilter;
      const qOk =
        !q ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
      return stOk && catOk && qOk;
    });
  }, [supportTickets, ticketStatusFilter, ticketCategoryFilter, searchQuery]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (subject.trim().length < VALIDATION_LIMITS.TICKET_SUBJECT_MIN) {
      setFormError('Please enter a clear subject (at least 3 characters).');
      return;
    }
    if (!EMAIL_REGEX.test(contactEmail.trim())) {
      setFormError('Please provide a valid contact email address.');
      return;
    }
    if (description.trim().length < VALIDATION_LIMITS.TICKET_DESC_MIN) {
      setFormError('Please describe your issue in detail (at least 5 characters).');
      return;
    }

    setIsSubmittingTicket(true);
    try {
      const created = await createSupportTicket({
        subject: subject.trim(),
        category,
        priority,
        contactEmail: contactEmail.trim(),
        relatedPolicyId: relatedPolicyId.trim(),
        description: description.trim(),
      });
      setSubmittedConfirmation(created);
      setSubject('');
      setRelatedPolicyId('');
      setDescription('');
      notify(
        'success',
        `Support Ticket ${created.ticketNumber} Submitted`,
        `Category: ${created.category} • Status: Open`
      );
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit support request.';
      setFormError(msg);
      notify('error', 'Submission Error', msg);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleSaveTicketNote = async () => {
    if (!selectedTicket) return;
    setIsUpdatingTicket(true);
    try {
      await updateSupportTicketDetails(selectedTicket.id, {
        subject: selectedTicket.subject,
        category: selectedTicket.category,
        priority: selectedTicket.priority,
        description: selectedTicket.description,
        contactEmail: selectedTicket.contactEmail,
        relatedPolicyId: selectedTicket.relatedPolicyId,
        resolutionNote: noteDraft,
      });
      setSelectedTicket({ ...selectedTicket, resolutionNote: noteDraft });
      notify('success', 'Follow-Up Note Saved', `Updated ${selectedTicket.ticketNumber}.`);
    } catch (err: any) {
      notify('error', 'Update Failed', err?.message || 'Unable to update ticket.');
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  const handleChangeTicketStatus = async (nextStatus: SupportStatus) => {
    if (!selectedTicket) return;
    setIsUpdatingTicket(true);
    try {
      await transitionSupportTicketStatus(selectedTicket.id, nextStatus, noteDraft);
      setSelectedTicket({
        ...selectedTicket,
        status: nextStatus,
        resolutionNote: noteDraft,
      });
      notify(
        'success',
        `Ticket Marked ${nextStatus}`,
        `${selectedTicket.ticketNumber} status is now ${nextStatus}.`
      );
    } catch (err: any) {
      notify('error', 'Status Update Failed', err?.message || 'Could not change status.');
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  const getStatusBadge = (status: SupportStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'In Progress':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Resolved':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Closed':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Search */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-100">Help &amp; Support Centre</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  24x7 ASSISTANCE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Searchable documentation, FAQs, user guides, support ticket submission, and live
                ticket status tracking.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSubmittedConfirmation(null);
              setActiveTab('contact');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-600/20"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Submit Support Ticket</span>
          </button>
        </div>

        {/* Global Help Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles, user guides, FAQs, or ticket numbers..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          {(activeTab === 'articles' || activeTab === 'faqs') && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Topics</option>
              {SUPPORT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Sub-Navigation */}
        <div className="flex space-x-1 bg-slate-850 p-1 rounded-xl border border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeTab === 'articles'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Help Articles &amp; Guides ({filteredArticles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeTab === 'faqs'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQs ({filteredFaqs.length})</span>
          </button>

          <button
            onClick={() => {
              setSubmittedConfirmation(null);
              setActiveTab('contact');
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeTab === 'contact'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Contact Support</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeTab === 'tickets'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Ticket Status Tracker ({supportTickets.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SEARCHABLE ARTICLES & USER GUIDES */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-lg flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                      {art.category}
                    </span>
                    <span className="text-slate-400">{art.readTime}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{art.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{art.summary}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setReadingArticle(art)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Read Full Documentation →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Step-by-Step User Guides */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Step-by-Step User Guides &amp; Documentation</span>
              </h3>
              <p className="text-xs text-slate-400">
                Structured walkthroughs for configuring household protection and policy governance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {USER_GUIDES.map((guide) => (
                <div
                  key={guide.id}
                  className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-100">{guide.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {guide.audience}
                    </span>
                  </div>
                  <ol className="space-y-2">
                    {guide.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-[11px] leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FAQS */}
      {activeTab === 'faqs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h3 className="text-base font-bold text-slate-100 mb-2">
            Frequently Asked Questions ({filteredFaqs.length})
          </h3>
          {filteredFaqs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No FAQs matched your current search query.
            </p>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl bg-slate-850 border border-slate-800 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full p-4 flex items-center justify-between text-left gap-3 hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 shrink-0">
                        {faq.category}
                      </span>
                      <span className="text-xs font-bold text-slate-100">{faq.question}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: CONTACT SUPPORT & SUBMIT TICKET */}
      {activeTab === 'contact' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto">
          {submittedConfirmation ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Support Request Confirmed
                </span>
                <h3 className="text-lg font-extrabold text-slate-100 pt-1">
                  Ticket Reference: {submittedConfirmation.ticketNumber}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your <strong>{submittedConfirmation.category}</strong> request ("
                  {submittedConfirmation.subject}") has been logged with status{' '}
                  <strong className="text-cyan-300">{submittedConfirmation.status}</strong>.
                  Confirmation updates will be sent to{' '}
                  <strong>{submittedConfirmation.contactEmail}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ticket ID:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {submittedConfirmation.ticketNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Issue Category:</span>
                  <span className="font-semibold text-slate-200">
                    {submittedConfirmation.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Priority SLA:</span>
                  <span className="font-semibold text-slate-200">
                    {submittedConfirmation.priority} (Response within 4–24 hrs)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const tkt = submittedConfirmation;
                    setSubmittedConfirmation(null);
                    setSelectedTicket(tkt);
                    setNoteDraft(tkt.resolutionNote || '');
                    setActiveTab('tickets');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Track Ticket Status →
                </button>
                <button
                  type="button"
                  onClick={() => setSubmittedConfirmation(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100">
                  Contact Support &amp; Submit a Ticket
                </h3>
                <p className="text-xs text-slate-400">
                  Select an issue category and describe how our actuarial or technical support desk
                  can help.
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Subject <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={VALIDATION_LIMITS.TICKET_SUBJECT_MAX}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your question or issue"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Issue Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SupportCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {SUPPORT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Priority Level <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as SupportPriority)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {SUPPORT_PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contact Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={VALIDATION_LIMITS.EMAIL_MAX}
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Related Policy ID (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={VALIDATION_LIMITS.ID_MAX}
                    value={relatedPolicyId}
                    onChange={(e) => setRelatedPolicyId(e.target.value)}
                    placeholder="e.g. POL-IND-88219"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex justify-between mb-1">
                    <label className="font-semibold text-slate-300">
                      Detailed Description <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500">
                      {description.length} / {VALIDATION_LIMITS.TICKET_DESC_MAX}
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    required
                    maxLength={VALIDATION_LIMITS.TICKET_DESC_MAX}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe steps, policy context, or account assistance needed..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold flex items-center space-x-2 shadow-lg shadow-cyan-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingTicket ? 'Submitting Request...' : 'Submit Support Request'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 4: TICKET STATUS TRACKING */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap gap-2">
              <select
                value={ticketStatusFilter}
                onChange={(e) => setTicketStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-200"
              >
                <option value="ALL">All Statuses ({supportTickets.length})</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={ticketCategoryFilter}
                onChange={(e) => setTicketCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-200"
              >
                <option value="ALL">All Categories</option>
                {SUPPORT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-[11px] text-slate-400">
              Showing {filteredTickets.length} support request(s)
            </span>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <Ticket className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-200">No Support Tickets Found</h3>
              <p className="text-xs text-slate-400">
                Submit a support request anytime to track its resolution status here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredTickets.map((tkt) => (
                <div
                  key={tkt.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-all"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-slate-850 border border-slate-800">
                        {tkt.ticketNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] border ${getStatusBadge(
                          tkt.status
                        )}`}
                      >
                        {tkt.status}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-850 text-slate-300 border border-slate-800 text-[10px] font-semibold">
                        {tkt.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Priority: <strong>{tkt.priority}</strong>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100">{tkt.subject}</h4>
                    <p className="text-slate-400 line-clamp-2">{tkt.description}</p>
                    <div className="text-[10px] text-slate-500 flex items-center space-x-3 pt-0.5">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Created {new Date(tkt.createdAtIso).toLocaleString()}</span>
                      </span>
                      {tkt.relatedPolicyId && (
                        <span>Policy: {tkt.relatedPolicyId}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedTicket(tkt);
                        setNoteDraft(tkt.resolutionNote || '');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold"
                    >
                      Inspect &amp; Track
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await deleteSupportTicket(tkt.id);
                          notify('info', 'Ticket Removed', `${tkt.ticketNumber} deleted.`);
                        } catch (err: any) {
                          notify('error', 'Delete Error', err?.message);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-850 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800"
                      title="Delete ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ARTICLE READER MODAL */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {readingArticle.category} • {readingArticle.readTime}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-2">{readingArticle.title}</h3>
              </div>
              <button
                onClick={() => setReadingArticle(null)}
                className="p-1.5 rounded-lg bg-slate-850 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {readingArticle.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-1.5"
                >
                  <h4 className="font-bold text-cyan-300 text-sm">{sec.heading}</h4>
                  <p className="text-slate-300 leading-relaxed">{sec.body}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setReadingArticle(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TICKET INSPECTOR & STATUS TRACKER MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-cyan-400">
                    {selectedTicket.ticketNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] border ${getStatusBadge(
                      selectedTicket.status
                    )}`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mt-1">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg bg-slate-850 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lifecycle Stepper */}
            <div className="grid grid-cols-4 gap-2">
              {(['Open', 'In Progress', 'Resolved', 'Closed'] as SupportStatus[]).map((st) => {
                const active = selectedTicket.status === st;
                return (
                  <div
                    key={st}
                    className={`p-2 rounded-lg text-center font-bold border text-[11px] ${
                      active
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                        : 'bg-slate-850 text-slate-500 border-slate-800'
                    }`}
                  >
                    {st}
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
              <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-400">
                <span>
                  Category: <strong className="text-slate-200">{selectedTicket.category}</strong>
                </span>
                <span>
                  Priority: <strong className="text-slate-200">{selectedTicket.priority}</strong>
                </span>
                <span>
                  Contact: <strong className="text-slate-200">{selectedTicket.contactEmail}</strong>
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed pt-2 border-t border-slate-800">
                {selectedTicket.description}
              </p>
            </div>

            {selectedTicket.status === 'Closed' ? (
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-700 flex items-center space-x-2.5 text-slate-300">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  This ticket is <strong>Closed</strong> and locked for audit integrity. Resolution
                  note: <em>{selectedTicket.resolutionNote || 'Closed by policyholder.'}</em>
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Follow-Up / Resolution Notes
                  </label>
                  <textarea
                    rows={3}
                    maxLength={VALIDATION_LIMITS.TICKET_RESOLUTION_MAX}
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Add additional context or resolution confirmation..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.status !== 'In Progress' && (
                      <button
                        type="button"
                        disabled={isUpdatingTicket}
                        onClick={() => handleChangeTicketStatus('In Progress')}
                        className="px-3 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/70 text-amber-200 border border-amber-800 font-semibold"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {selectedTicket.status !== 'Resolved' && (
                      <button
                        type="button"
                        disabled={isUpdatingTicket}
                        onClick={() => handleChangeTicketStatus('Resolved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-200 border border-emerald-800 font-semibold"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isUpdatingTicket}
                      onClick={() => handleChangeTicketStatus('Closed')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold"
                    >
                      Close Ticket (Lock)
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isUpdatingTicket}
                    onClick={handleSaveTicketNote}
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
