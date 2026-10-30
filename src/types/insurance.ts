export interface CustomerProfile {
  // Personal information (1-11)
  profile_id: string;
  full_name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  city: string;
  city_tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  residency_status: 'Resident Indian' | 'NRI' | 'PIO' | 'OCI';
  country_of_residence: string;
  marital_status: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  employment_type: 'Salaried' | 'Self-Employed Professional' | 'Business Owner' | 'Gig Worker' | 'Retired';
  occupation: string;

  // Income and financial information (12-15)
  annual_income_inr: number;
  expected_income_growth_pct: number;
  monthly_household_expenses_inr: number;
  monthly_premium_budget_inr: number;

  // Spouse and family information (16-22)
  spouse_age: number;
  spouse_working: boolean;
  spouse_annual_income_inr: number;
  num_children: number;
  children_ages: number[];
  num_dependent_parents: number;
  dependent_parent_ages: number[];

  // Outstanding liabilities (23-38)
  home_loan_outstanding_inr: number;
  home_loan_remaining_months: number;
  home_loan_interest_rate_pct: number;
  home_loan_emi_inr: number;

  car_loan_outstanding_inr: number;
  car_loan_remaining_months: number;
  car_loan_interest_rate_pct: number;
  car_loan_emi_inr: number;

  personal_loan_outstanding_inr: number;
  personal_loan_remaining_months: number;
  personal_loan_interest_rate_pct: number;
  personal_loan_emi_inr: number;

  education_loan_outstanding_inr: number;
  education_loan_remaining_months: number;
  education_loan_interest_rate_pct: number;
  education_loan_emi_inr: number;

  // Existing protection and savings (39-43)
  employer_group_life_cover_inr: number;
  individual_life_cover_inr: number;
  liquid_savings_inr: number;
  market_investments_inr: number;
  retirement_savings_inr: number;

  // Goals and risk profile (44-51)
  num_goals: number;
  smoker_status: 'Smoker' | 'Non-Smoker';
  bmi: number;
  health_conditions: string;
  risk_appetite: 'Conservative' | 'Moderate' | 'Aggressive';
  preferred_policy_term_years: number;
  preferred_language: string;
  profile_date: string;
}

export interface InsuranceProduct {
  product_id: string;
  product_name: string;
  insurer_name: string;
  category: 'Term Life' | 'Whole Life' | 'ULIP' | 'Endowment / Savings' | 'Health & Critical Illness';
  min_entry_age: number;
  max_entry_age: number;
  max_maturity_age: number;
  allowed_policy_terms: number[];
  allowed_ppt: number[]; // Premium paying terms
  premium_payment_options: ('Annual' | 'Monthly' | 'Single')[];
  min_sum_assured_inr: number;
  max_sum_assured_inr: number;
  allowed_smoker_status: ('Smoker' | 'Non-Smoker')[];
  max_bmi_limit: number;
  features: string[];
  key_exclusions: string[];
  dataset_source: string;
}

export interface PremiumRateRecord {
  record_id: string;
  product_id: string;
  premium_payment_option: 'Annual' | 'Monthly' | 'Single';
  premium_paying_term_years: number;
  entry_age: number;
  policy_term_years: number;
  gender: 'Male' | 'Female' | 'Other';
  smoker_status: 'Smoker' | 'Non-Smoker';
  rate_per_1000_sa_inr: number;
}

export interface RiderRecord {
  rider_id: string;
  rider_name: string;
  applicable_product_ids: string[];
  min_entry_age: number;
  max_entry_age: number;
  max_sum_assured_pct_of_base: number; // e.g. 50% or 100%
  rate_basis: 'per_1000_sa' | 'flat_percentage';
  rate_value: number; // Rate in INR per 1000 SA or %
  description: string;
}

export interface UlipFundRecord {
  fund_id: string;
  product_id: string;
  fund_name: string;
  fund_type: 'Equity Growth' | 'Balanced Advantage' | 'Dynamic Debt' | 'Liquid Secure';
  current_nav: number;
  equity_allocation_pct: number;
  debt_allocation_pct: number;
  money_market_pct: number;
  fund_management_charge_pct: number;
  historical_cagr_3yr: number;
}

export interface UlipMortalityChargeRecord {
  age: number;
  gender: 'Male' | 'Female';
  annual_charge_per_1000_sar: number; // Sum at Risk
}

export interface ActuarialAnalysis {
  annualHouseholdIncome: number;
  combinedIncome: number;
  monthlyHouseholdExpenses: number;
  annualHouseholdExpenses: number;
  totalLiabilities: number;
  individualLoans: {
    homeLoan: number;
    carLoan: number;
    personalLoan: number;
    educationLoan: number;
  };
  totalMonthlyEmi: number;
  annualEmiObligation: number;
  existingEmployerLifeCover: number;
  existingIndividualLifeCover: number;
  existingTotalLifeCover: number;
  liquidSavings: number;
  marketInvestments: number;
  retirementSavings: number;
  totalFinancialAssets: number;
  applicableAssets: number;
  humanLifeValue: number;
  hlvWorkingYears: number;
  hlvDiscountRatePct: number;
  hlvPersonalConsumptionPct: number;
  livingExpenseReserve: number;
  goalObligations: number;
  grossNeedsRequirement: number;
  netNeedsProtection: number;
  coverageGap: number;
  familyDependencyScore: number; // 0 - 100
  financialHealthScore: number; // 0 - 100
  emiToIncomePct: number;
  annualPremiumBudget: number;
  affordabilityStatus: 'Comfortable' | 'Balanced' | 'Stretched' | 'High Risk';
  methodologyNotes: string[];
}

export interface PolicyRecommendation {
  product: InsuranceProduct;
  isEligible: boolean;
  ineligibilityReasons: string[];
  recommendedSumAssured: number;
  recommendedPolicyTerm: number;
  recommendedPPT: number;
  premiumPaymentOption: 'Annual' | 'Monthly' | 'Single';
  calculatedBasePremiumAnnual: number | null;
  calculatedBasePremiumMonthly: number | null;
  matchingRateRecordId: string | null;
  premiumCalculationNote: string;
  eligibleRiders: {
    rider: RiderRecord;
    recommendedSA: number;
    annualCost: number;
  }[];
  totalAnnualPremiumWithRiders: number | null;
  affordabilityAssessment: 'Highly Affordable' | 'Within Stated Budget' | 'Exceeds Current Budget';
  strengths: string[];
  limitations: string[];
  recommendationRationale: string[];
  rejectionReasonsAlternative: string[];
  missingDatasetFields: string[];
  dataSourceReference: string;
}

export interface CustomerGoal {
  goal_id: string;
  goal_name: string;
  target_year: number;
  current_cost_inr: number;
  inflation_adjusted_cost_inr: number;
  priority: 'High' | 'Medium' | 'Low';
}

export interface SavedScenario {
  id: string;
  name: string;
  createdAt: string;
  profileDelta: Partial<CustomerProfile>;
  analysisResult: ActuarialAnalysis;
}

export interface SecurityEventLog {
  id: string;
  timestamp: string;
  eventType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  endpoint: string;
  sourceIp: string;
  payloadSummary: string;
  defenseAction: 'BLOCKED' | 'SANITIZED' | 'THROTTLED' | 'QUARANTINED';
  remediationAdvice: string;
}
