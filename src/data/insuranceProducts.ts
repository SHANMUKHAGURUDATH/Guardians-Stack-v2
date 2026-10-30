import { InsuranceProduct, PremiumRateRecord, RiderRecord, UlipFundRecord, UlipMortalityChargeRecord } from '../types/insurance';

export const INSURANCE_PRODUCTS: InsuranceProduct[] = [
  {
    product_id: 'PROD-TERM-01',
    product_name: 'Guardian Shield Pure Term',
    insurer_name: 'Guardian Life Assurance',
    category: 'Term Life',
    min_entry_age: 18,
    max_entry_age: 65,
    max_maturity_age: 85,
    allowed_policy_terms: [15, 20, 25, 30, 35, 40],
    allowed_ppt: [10, 15, 20, 25, 30, 35, 40],
    premium_payment_options: ['Annual', 'Monthly'],
    min_sum_assured_inr: 5000000, // 50 Lakhs
    max_sum_assured_inr: 100000000, // 10 Crores
    allowed_smoker_status: ['Smoker', 'Non-Smoker'],
    max_bmi_limit: 32.5,
    features: [
      'Pure income replacement death benefit paid as lump sum or monthly income',
      'Life stage cover increment on marriage (50%) and birth of children (25% each)',
      'Terminal Illness benefit with 100% accelerated payout up to ₹2 Crores',
      'Zero surrender penalty under special exit value clause at age 60'
    ],
    key_exclusions: [
      'Suicide within first 12 months from policy inception',
      'Hazardous adventure sports unless specifically underwritten'
    ],
    dataset_source: 'Official Guardian Stack Actuarial Schedule 2026-Q1'
  },
  {
    product_id: 'PROD-TERM-02',
    product_name: 'Guardian FlexiCare Return of Premium (TROP)',
    insurer_name: 'Guardian Life Assurance',
    category: 'Term Life',
    min_entry_age: 21,
    max_entry_age: 55,
    max_maturity_age: 75,
    allowed_policy_terms: [20, 25, 30],
    allowed_ppt: [10, 15, 20, 25, 30],
    premium_payment_options: ['Annual', 'Monthly'],
    min_sum_assured_inr: 2500000,
    max_sum_assured_inr: 50000000,
    allowed_smoker_status: ['Smoker', 'Non-Smoker'],
    max_bmi_limit: 31.0,
    features: [
      '100% of total base premiums refunded at policy maturity if life assured survives',
      'Substantial death benefit protection throughout the entire policy term',
      'Flexible limited premium payment terms of 10 or 15 years'
    ],
    key_exclusions: [
      'Suicide clause in Year 1',
      'Rider premiums and underwriting extra charges not refundable at maturity'
    ],
    dataset_source: 'Guardian TROP Actuarial Table Rate Rev-3'
  },
  {
    product_id: 'PROD-WHOLE-01',
    product_name: 'Guardian Heritage Whole Life Protection',
    insurer_name: 'Guardian Life Assurance',
    category: 'Whole Life',
    min_entry_age: 18,
    max_entry_age: 60,
    max_maturity_age: 100,
    allowed_policy_terms: [35, 40, 45, 50],
    allowed_ppt: [10, 15, 20, 25],
    premium_payment_options: ['Annual', 'Monthly'],
    min_sum_assured_inr: 2500000,
    max_sum_assured_inr: 75000000,
    allowed_smoker_status: ['Non-Smoker', 'Smoker'],
    max_bmi_limit: 30.0,
    features: [
      'Lifelong protection guaranteeing death benefit payout up to 100 years of age',
      'Guaranteed legacy transfer across generations free from debt claims under MWP Act',
      'Paid-up option available after completing minimum 3 years premium payments'
    ],
    key_exclusions: [
      'Self-inflicted injuries and active military service in hostile zones'
    ],
    dataset_source: 'Guardian Whole Life Actuarial Schedule'
  },
  {
    product_id: 'PROD-ULIP-01',
    product_name: 'Guardian WealthBuilder Future ULIP',
    insurer_name: 'Guardian Life Assurance',
    category: 'ULIP',
    min_entry_age: 18,
    max_entry_age: 55,
    max_maturity_age: 75,
    allowed_policy_terms: [15, 20, 25],
    allowed_ppt: [5, 7, 10, 15, 20],
    premium_payment_options: ['Annual', 'Monthly'],
    min_sum_assured_inr: 1500000,
    max_sum_assured_inr: 30000000,
    allowed_smoker_status: ['Non-Smoker', 'Smoker'],
    max_bmi_limit: 33.0,
    features: [
      'Market-linked growth with 4 customizable equity and debt asset funds',
      '100% Return of Mortality Charges (ROMC) credited to fund value at maturity',
      'Free systematic fund switching up to 12 times per policy year',
      'Loyalty units added starting from 6th policy year'
    ],
    key_exclusions: [
      'Investment risk in investment portfolio is borne entirely by the policyholder',
      'Fund management charges deducted from NAV'
    ],
    dataset_source: 'Guardian ULIP Fund Architecture Master 2026'
  },
  {
    product_id: 'PROD-SAV-01',
    product_name: 'Guardian Guaranteed Income & Savings',
    insurer_name: 'Guardian Life Assurance',
    category: 'Endowment / Savings',
    min_entry_age: 18,
    max_entry_age: 55,
    max_maturity_age: 75,
    allowed_policy_terms: [12, 15, 20],
    allowed_ppt: [6, 8, 10, 12],
    premium_payment_options: ['Annual', 'Monthly'],
    min_sum_assured_inr: 1000000,
    max_sum_assured_inr: 25000000,
    allowed_smoker_status: ['Non-Smoker', 'Smoker'],
    max_bmi_limit: 34.0,
    features: [
      'Completely guaranteed annual cash flow stream for 10-25 years post PPT',
      'Zero market risk; guaranteed additions accrue every policy year',
      'Life cover of 10x annualized premium throughout the policy tenure'
    ],
    key_exclusions: [
      'Early surrender before 2 full policy years yields zero guaranteed surrender value'
    ],
    dataset_source: 'Guardian Guaranteed Non-Par Product Sheet'
  },
  {
    product_id: 'PROD-HEALTH-01',
    product_name: 'Guardian Comprehensive Critical Illness Shield',
    insurer_name: 'Guardian Life Assurance',
    category: 'Health & Critical Illness',
    min_entry_age: 18,
    max_entry_age: 60,
    max_maturity_age: 75,
    allowed_policy_terms: [10, 15, 20, 25, 30],
    allowed_ppt: [10, 15, 20, 25, 30],
    premium_payment_options: ['Annual', 'Monthly'],
    min_sum_assured_inr: 1000000,
    max_sum_assured_inr: 15000000,
    allowed_smoker_status: ['Non-Smoker', 'Smoker'],
    max_bmi_limit: 32.0,
    features: [
      'Lump-sum payout upon diagnosis of any of 64 specified critical illnesses',
      'No hospitalization bill submission required; direct claim settlement on clinical diagnosis',
      'Multi-claim benefit for up to 3 unrelated critical illnesses'
    ],
    key_exclusions: [
      '90-day initial waiting period from inception',
      'Pre-existing conditions undisclosed at proposal stage'
    ],
    dataset_source: 'Guardian Health Actuarial Table H-64'
  }
];

export const RIDERS_DATA: RiderRecord[] = [
  {
    rider_id: 'RIDER-CI-01',
    rider_name: 'Comprehensive Critical Illness Benefit Rider',
    applicable_product_ids: ['PROD-TERM-01', 'PROD-TERM-02', 'PROD-WHOLE-01', 'PROD-ULIP-01'],
    min_entry_age: 18,
    max_entry_age: 60,
    max_sum_assured_pct_of_base: 50, // max 50% of base SA
    rate_basis: 'per_1000_sa',
    rate_value: 3.2, // INR 3.2 per 1000 SA
    description: 'Provides upfront accelerated lump sum payout on diagnosis of 36 critical conditions.'
  },
  {
    rider_id: 'RIDER-ADDB-02',
    rider_name: 'Accidental Death & Dismemberment Benefit Rider',
    applicable_product_ids: ['PROD-TERM-01', 'PROD-TERM-02', 'PROD-WHOLE-01', 'PROD-ULIP-01', 'PROD-SAV-01'],
    min_entry_age: 18,
    max_entry_age: 65,
    max_sum_assured_pct_of_base: 100,
    rate_basis: 'per_1000_sa',
    rate_value: 0.65, // INR 0.65 per 1000 SA
    description: 'Double benefit paid in case of accidental demise or permanent partial/total disability.'
  },
  {
    rider_id: 'RIDER-WOP-03',
    rider_name: 'Waiver of Premium on Critical Illness or Disability',
    applicable_product_ids: ['PROD-TERM-01', 'PROD-TERM-02', 'PROD-WHOLE-01', 'PROD-ULIP-01', 'PROD-SAV-01'],
    min_entry_age: 18,
    max_entry_age: 55,
    max_sum_assured_pct_of_base: 100,
    rate_basis: 'flat_percentage',
    rate_value: 4.5, // 4.5% of base policy premium
    description: 'All future payable premiums waived while policy coverage continues undisturbed.'
  },
  {
    rider_id: 'RIDER-HOSP-04',
    rider_name: 'Hospital Daily Cash & ICU Benefit Rider',
    applicable_product_ids: ['PROD-TERM-01', 'PROD-HEALTH-01', 'PROD-SAV-01'],
    min_entry_age: 18,
    max_entry_age: 55,
    max_sum_assured_pct_of_base: 20,
    rate_basis: 'per_1000_sa',
    rate_value: 1.15,
    description: 'Fixed daily cash allowance of ₹5,000/day during hospitalization plus 2x for ICU care.'
  }
];

export const ULIP_FUNDS_DATA: UlipFundRecord[] = [
  {
    fund_id: 'ULIP-FUND-EQ',
    product_id: 'PROD-ULIP-01',
    fund_name: 'Bluechip Equity Growth Fund',
    fund_type: 'Equity Growth',
    current_nav: 48.72,
    equity_allocation_pct: 92.5,
    debt_allocation_pct: 5.0,
    money_market_pct: 2.5,
    fund_management_charge_pct: 1.35,
    historical_cagr_3yr: 16.4
  },
  {
    fund_id: 'ULIP-FUND-BAL',
    product_id: 'PROD-ULIP-01',
    fund_name: 'Dynamic Balanced Advantage Fund',
    fund_type: 'Balanced Advantage',
    current_nav: 32.18,
    equity_allocation_pct: 60.0,
    debt_allocation_pct: 35.0,
    money_market_pct: 5.0,
    fund_management_charge_pct: 1.20,
    historical_cagr_3yr: 12.8
  },
  {
    fund_id: 'ULIP-FUND-DEBT',
    product_id: 'PROD-ULIP-01',
    fund_name: 'Corporate Bond & Sovereign Debt Fund',
    fund_type: 'Dynamic Debt',
    current_nav: 24.65,
    equity_allocation_pct: 0.0,
    debt_allocation_pct: 95.0,
    money_market_pct: 5.0,
    fund_management_charge_pct: 0.85,
    historical_cagr_3yr: 7.9
  },
  {
    fund_id: 'ULIP-FUND-LIQ',
    product_id: 'PROD-ULIP-01',
    fund_name: 'Liquid Capital Protection Fund',
    fund_type: 'Liquid Secure',
    current_nav: 18.90,
    equity_allocation_pct: 0.0,
    debt_allocation_pct: 20.0,
    money_market_pct: 80.0,
    fund_management_charge_pct: 0.50,
    historical_cagr_3yr: 6.2
  }
];

export const ULIP_MORTALITY_CHARGES: UlipMortalityChargeRecord[] = [
  { age: 20, gender: 'Male', annual_charge_per_1000_sar: 0.82 },
  { age: 25, gender: 'Male', annual_charge_per_1000_sar: 0.94 },
  { age: 30, gender: 'Male', annual_charge_per_1000_sar: 1.15 },
  { age: 35, gender: 'Male', annual_charge_per_1000_sar: 1.62 },
  { age: 40, gender: 'Male', annual_charge_per_1000_sar: 2.45 },
  { age: 45, gender: 'Male', annual_charge_per_1000_sar: 3.88 },
  { age: 50, gender: 'Male', annual_charge_per_1000_sar: 6.12 },
  { age: 55, gender: 'Male', annual_charge_per_1000_sar: 9.80 },
  { age: 20, gender: 'Female', annual_charge_per_1000_sar: 0.68 },
  { age: 25, gender: 'Female', annual_charge_per_1000_sar: 0.76 },
  { age: 30, gender: 'Female', annual_charge_per_1000_sar: 0.95 },
  { age: 35, gender: 'Female', annual_charge_per_1000_sar: 1.30 },
  { age: 40, gender: 'Female', annual_charge_per_1000_sar: 1.95 },
  { age: 45, gender: 'Female', annual_charge_per_1000_sar: 3.10 },
  { age: 50, gender: 'Female', annual_charge_per_1000_sar: 4.90 },
  { age: 55, gender: 'Female', annual_charge_per_1000_sar: 7.85 },
];

// Generate authentic premium rate records
export function generatePremiumRates(): PremiumRateRecord[] {
  const records: PremiumRateRecord[] = [];
  const ages = [20, 22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 42, 45, 48, 50, 52, 55, 58, 60];
  const terms = [15, 20, 25, 30, 35, 40];
  const genders: ('Male' | 'Female' | 'Other')[] = ['Male', 'Female', 'Other'];
  const smokerStatuses: ('Smoker' | 'Non-Smoker')[] = ['Non-Smoker', 'Smoker'];

  let counter = 1;

  for (const product of INSURANCE_PRODUCTS) {
    for (const age of ages) {
      if (age < product.min_entry_age || age > product.max_entry_age) continue;

      for (const term of product.allowed_policy_terms) {
        if (age + term > product.max_maturity_age) continue;

        for (const gender of genders) {
          for (const smoker of smokerStatuses) {
            if (!product.allowed_smoker_status.includes(smoker)) continue;

            for (const option of product.premium_payment_options) {
              const ppt = term; // Regular pay default

              // Actuarial base rate calculation per 1000 SA
              let baseRate = 0.85;

              if (product.category === 'Term Life') {
                // Age mortality curve
                baseRate = 0.75 + Math.pow(Math.max(0, age - 20) / 7.5, 1.85);
                if (smoker === 'Smoker') baseRate *= 1.55;
                if (gender === 'Female') baseRate *= 0.88;
                if (term >= 30) baseRate *= 1.15;
                if (product.product_id === 'PROD-TERM-02') baseRate *= 1.85; // TROP refund loading
              } else if (product.category === 'Whole Life') {
                baseRate = 2.4 + Math.pow(Math.max(0, age - 20) / 6.2, 1.7);
                if (smoker === 'Smoker') baseRate *= 1.45;
                if (gender === 'Female') baseRate *= 0.90;
              } else if (product.category === 'ULIP') {
                baseRate = 1.25 + (age - 20) * 0.08; // ULIP premium contribution benchmark
              } else if (product.category === 'Endowment / Savings') {
                baseRate = 48.0 + (age - 20) * 0.45; // Endowment savings accumulation
              } else if (product.category === 'Health & Critical Illness') {
                baseRate = 2.8 + Math.pow(Math.max(0, age - 20) / 8, 2.1);
                if (smoker === 'Smoker') baseRate *= 1.7;
              }

              if (option === 'Monthly') {
                baseRate = (baseRate / 12) * 1.03; // 3% loading for monthly processing
              }

              records.push({
                record_id: `RATE-REC-${String(counter++).padStart(6, '0')}`,
                product_id: product.product_id,
                premium_payment_option: option,
                premium_paying_term_years: ppt,
                entry_age: age,
                policy_term_years: term,
                gender,
                smoker_status: smoker,
                rate_per_1000_sa_inr: Math.round(baseRate * 100) / 100
              });
            }
          }
        }
      }
    }
  }

  return records;
}

export const INITIAL_PREMIUM_RATES = generatePremiumRates();
