import { CustomerProfile, ActuarialAnalysis, InsuranceProduct, PremiumRateRecord, PolicyRecommendation, RiderRecord } from '../types/insurance';

export function calculateActuarialMetrics(customer: CustomerProfile): ActuarialAnalysis {
  const combinedIncome = customer.annual_income_inr + (customer.spouse_working ? (customer.spouse_annual_income_inr || 0) : 0);
  const monthlyExpenses = customer.monthly_household_expenses_inr || 0;
  const annualExpenses = monthlyExpenses * 12;

  const homeLoan = customer.home_loan_outstanding_inr || 0;
  const carLoan = customer.car_loan_outstanding_inr || 0;
  const personalLoan = customer.personal_loan_outstanding_inr || 0;
  const eduLoan = customer.education_loan_outstanding_inr || 0;
  const totalLiabilities = homeLoan + carLoan + personalLoan + eduLoan;

  const totalMonthlyEmi = (customer.home_loan_emi_inr || 0) +
    (customer.car_loan_emi_inr || 0) +
    (customer.personal_loan_emi_inr || 0) +
    (customer.education_loan_emi_inr || 0);
  const annualEmiObligation = totalMonthlyEmi * 12;

  const employerCover = customer.employer_group_life_cover_inr || 0;
  const individualCover = customer.individual_life_cover_inr || 0;
  const existingTotalLifeCover = employerCover + individualCover;

  const liquidSavings = customer.liquid_savings_inr || 0;
  const marketInvestments = customer.market_investments_inr || 0;
  const retirementSavings = customer.retirement_savings_inr || 0;
  const totalFinancialAssets = liquidSavings + marketInvestments + retirementSavings;

  // Asset allocation protection policy: 
  // We exclude retirement savings from offsetting the death protection gap,
  // as retirement corpus must remain dedicated for surviving spouse longevity.
  // We offset 100% of liquid savings and 50% of market investments.
  const applicableAssets = liquidSavings + Math.round(marketInvestments * 0.5);

  // 1. Human Life Value (Income Replacement Present Value Method)
  const retirementAge = 60;
  const workingYears = Math.max(1, retirementAge - customer.age);
  const personalConsumptionPct = 0.30; // 30% of earned income spent by the individual on themselves
  const netAnnualEarningsForFamily = customer.annual_income_inr * (1 - personalConsumptionPct);
  const discountRate = 0.075; // 7.5% nominal actuarial discount rate
  const growthRate = (customer.expected_income_growth_pct || 8) / 100;

  let hlvSum = 0;
  for (let t = 1; t <= workingYears; t++) {
    const futureEarnings = netAnnualEarningsForFamily * Math.pow(1 + growthRate, t);
    const presentValue = futureEarnings / Math.pow(1 + discountRate, t);
    hlvSum += presentValue;
  }
  const humanLifeValue = Math.round(hlvSum / 100000) * 100000;

  // 2. Net Needs Analysis
  // Calculate family dependency timeline: if children exist, protect until youngest reaches age 23
  let dependencyYears = 12;
  if (customer.children_ages && customer.children_ages.length > 0) {
    const youngestAge = Math.min(...customer.children_ages);
    dependencyYears = Math.max(10, Math.min(22, 23 - youngestAge));
  } else if (customer.num_dependent_parents > 0) {
    dependencyYears = 15;
  }

  // Living expense fund: multiple of current household annual expenses
  const livingExpenseReserve = Math.round(annualExpenses * dependencyYears);

  // Goal obligations: Education & Marriage milestones
  let goalObligations = 0;
  if (customer.num_children > 0) {
    goalObligations = customer.num_children * 2500000; // 25 Lakhs per child higher education & startup fund
  } else if (customer.num_goals > 0) {
    goalObligations = customer.num_goals * 1500000;
  }

  const grossNeedsRequirement = totalLiabilities + livingExpenseReserve + goalObligations;
  const netNeedsProtection = Math.max(0, grossNeedsRequirement - existingTotalLifeCover - applicableAssets);
  const coverageGap = Math.round(netNeedsProtection / 100000) * 100000;

  // Family Dependency Score (0 - 100)
  let depScore = 20;
  if (customer.marital_status === 'Married') depScore += 20;
  depScore += (customer.num_children || 0) * 20;
  depScore += (customer.num_dependent_parents || 0) * 10;
  if (!customer.spouse_working && customer.marital_status === 'Married') depScore += 15;
  const familyDependencyScore = Math.min(100, depScore);

  // EMI to Income percentage
  const emiToIncomePct = combinedIncome > 0 ? Math.round((annualEmiObligation / combinedIncome) * 100) : 0;

  // Financial Health Score (0 - 100)
  let healthScore = 70;
  if (emiToIncomePct > 45) healthScore -= 25;
  else if (emiToIncomePct > 30) healthScore -= 12;
  else healthScore += 10;

  // Savings buffer check (at least 6 months expenses)
  const emergencyFundTarget = monthlyExpenses * 6;
  if (liquidSavings >= emergencyFundTarget) healthScore += 12;
  else healthScore -= 10;

  // Existing insurance cover adequacy check
  if (existingTotalLifeCover >= annualExpenses * 8) healthScore += 15;
  else if (existingTotalLifeCover === 0) healthScore -= 20;

  const financialHealthScore = Math.max(10, Math.min(98, healthScore));

  // Affordability assessment
  const annualPremiumBudget = (customer.monthly_premium_budget_inr || 0) * 12;
  const disposableAnnual = combinedIncome - annualExpenses - annualEmiObligation;
  let affordabilityStatus: 'Comfortable' | 'Balanced' | 'Stretched' | 'High Risk' = 'Comfortable';
  if (disposableAnnual < annualPremiumBudget) {
    affordabilityStatus = 'High Risk';
  } else if (annualPremiumBudget > disposableAnnual * 0.4) {
    affordabilityStatus = 'Stretched';
  } else if (annualPremiumBudget > disposableAnnual * 0.2) {
    affordabilityStatus = 'Balanced';
  }

  const methodologyNotes = [
    `HLV calculated using Income Replacement Method: ${workingYears} working years to age 60, ${customer.expected_income_growth_pct || 8}% annual wage progression, 7.5% actuarial discount rate, and 30% personal consumption deduction.`,
    `Net Needs computes 100% outstanding loans (₹${totalLiabilities.toLocaleString('en-IN')}) + ${dependencyYears} years living expense reserve (₹${livingExpenseReserve.toLocaleString('en-IN')}) + family goal obligations (₹${goalObligations.toLocaleString('en-IN')}).`,
    `Double-counting prevention: Existing life cover of ₹${existingTotalLifeCover.toLocaleString('en-IN')} and liquid financial assets of ₹${applicableAssets.toLocaleString('en-IN')} deducted. Retirement savings preserved strictly for retirement.`
  ];

  return {
    annualHouseholdIncome: customer.annual_income_inr,
    combinedIncome,
    monthlyHouseholdExpenses: monthlyExpenses,
    annualHouseholdExpenses: annualExpenses,
    totalLiabilities,
    individualLoans: {
      homeLoan,
      carLoan,
      personalLoan: personalLoan,
      educationLoan: eduLoan
    },
    totalMonthlyEmi,
    annualEmiObligation,
    existingEmployerLifeCover: employerCover,
    existingIndividualLifeCover: individualCover,
    existingTotalLifeCover,
    liquidSavings,
    marketInvestments,
    retirementSavings,
    totalFinancialAssets,
    applicableAssets,
    humanLifeValue,
    hlvWorkingYears: workingYears,
    hlvDiscountRatePct: discountRate * 100,
    hlvPersonalConsumptionPct: personalConsumptionPct * 100,
    livingExpenseReserve,
    goalObligations,
    grossNeedsRequirement,
    netNeedsProtection,
    coverageGap,
    familyDependencyScore,
    financialHealthScore,
    emiToIncomePct,
    annualPremiumBudget,
    affordabilityStatus,
    methodologyNotes
  };
}

export function evaluatePolicyRecommendations(
  customer: CustomerProfile,
  analysis: ActuarialAnalysis,
  products: InsuranceProduct[],
  rateRecords: PremiumRateRecord[],
  riders: RiderRecord[]
): PolicyRecommendation[] {
  const recommendations: PolicyRecommendation[] = [];

  for (const product of products) {
    const ineligibilityReasons: string[] = [];

    // 1. Entry age check
    if (customer.age < product.min_entry_age) {
      ineligibilityReasons.push(`Customer age (${customer.age}) is below minimum entry age (${product.min_entry_age} years).`);
    }
    if (customer.age > product.max_entry_age) {
      ineligibilityReasons.push(`Customer age (${customer.age}) exceeds maximum entry age (${product.max_entry_age} years).`);
    }

    // 2. BMI check
    if (customer.bmi > product.max_bmi_limit) {
      ineligibilityReasons.push(`Customer BMI (${customer.bmi}) exceeds underwriter threshold (${product.max_bmi_limit}).`);
    }

    // 3. Smoker status check
    if (!product.allowed_smoker_status.includes(customer.smoker_status)) {
      ineligibilityReasons.push(`Product does not accept ${customer.smoker_status} applicants under standard tariff.`);
    }

    // Determine target Sum Assured:
    // Round to nearest 5 Lakhs, constrained by min & max SA of product
    let targetSA = analysis.coverageGap > 0 ? analysis.coverageGap : analysis.humanLifeValue;
    if (product.category === 'Health & Critical Illness') {
      targetSA = Math.min(2500000, Math.max(1000000, Math.round(customer.annual_income_inr * 0.75 / 100000) * 100000));
    } else if (product.category === 'Endowment / Savings') {
      targetSA = Math.min(5000000, Math.max(1000000, Math.round(customer.annual_income_inr * 2 / 100000) * 100000));
    }
    targetSA = Math.max(product.min_sum_assured_inr, Math.min(product.max_sum_assured_inr, targetSA));

    // Determine policy term:
    // Match customer preferred term or closest allowed term
    const validTerms = product.allowed_policy_terms.filter(t => (customer.age + t) <= product.max_maturity_age);
    if (validTerms.length === 0) {
      ineligibilityReasons.push(`No allowed policy terms available before product max maturity age (${product.max_maturity_age} years).`);
    }

    const recommendedTerm = validTerms.length > 0 
      ? validTerms.reduce((prev, curr) => Math.abs(curr - customer.preferred_policy_term_years) < Math.abs(prev - customer.preferred_policy_term_years) ? curr : prev, validTerms[0])
      : product.allowed_policy_terms[0];

    const recommendedPPT = recommendedTerm; // Regular payment default

    const isEligible = ineligibilityReasons.length === 0;

    // Premium Calculation via exact dataset lookup
    // Find closest entry age in dataset table
    let matchingRecord: PremiumRateRecord | null = null;
    let premiumCalcNote = '';
    let calculatedBaseAnnual: number | null = null;
    let calculatedBaseMonthly: number | null = null;

    if (isEligible) {
      // Find matching record with exact or nearest available age
      const exactCandidate = rateRecords.find(r => 
        r.product_id === product.product_id &&
        r.entry_age === customer.age &&
        r.policy_term_years === recommendedTerm &&
        r.smoker_status === customer.smoker_status &&
        (r.gender === customer.gender || r.gender === 'Other') &&
        r.premium_payment_option === 'Annual'
      );

      if (exactCandidate) {
        matchingRecord = exactCandidate;
      } else {
        // Find closest age entry in rate records
        const productRecords = rateRecords.filter(r => 
          r.product_id === product.product_id &&
          r.smoker_status === customer.smoker_status &&
          r.premium_payment_option === 'Annual'
        );
        if (productRecords.length > 0) {
          matchingRecord = productRecords.reduce((prev, curr) => {
            const prevDiff = Math.abs(prev.entry_age - customer.age) + Math.abs(prev.policy_term_years - recommendedTerm);
            const currDiff = Math.abs(curr.entry_age - customer.age) + Math.abs(curr.policy_term_years - recommendedTerm);
            return currDiff < prevDiff ? curr : prev;
          });
        }
      }

      if (matchingRecord) {
        // Base premium = (Sum Assured / 1,000) * rate_per_1000_sa_inr
        calculatedBaseAnnual = Math.round((targetSA / 1000) * matchingRecord.rate_per_1000_sa_inr);
        calculatedBaseMonthly = Math.round((calculatedBaseAnnual / 12) * 1.03); // 3% monthly loading
        premiumCalcNote = `Rate record ${matchingRecord.record_id} applied: ₹${matchingRecord.rate_per_1000_sa_inr} per ₹1,000 SA for age ${matchingRecord.entry_age}, term ${matchingRecord.policy_term_years}y.`;
      } else {
        premiumCalcNote = "Premium calculation unavailable for this combination because the supplied dataset does not contain a matching rate record.";
      }
    } else {
      premiumCalcNote = "Product is ineligible based on underwriting parameters.";
    }

    // Riders evaluation
    const eligibleRiders: { rider: RiderRecord; recommendedSA: number; annualCost: number }[] = [];
    let riderAnnualTotal = 0;

    if (isEligible && calculatedBaseAnnual !== null) {
      for (const rider of riders) {
        if (rider.applicable_product_ids.includes(product.product_id)) {
          if (customer.age >= rider.min_entry_age && customer.age <= rider.max_entry_age) {
            const riderSA = Math.min(targetSA * (rider.max_sum_assured_pct_of_base / 100), 2500000);
            let annualCost = 0;
            if (rider.rate_basis === 'per_1000_sa') {
              annualCost = Math.round((riderSA / 1000) * rider.rate_value);
            } else if (rider.rate_basis === 'flat_percentage') {
              annualCost = Math.round(calculatedBaseAnnual * (rider.rate_value / 100));
            }
            eligibleRiders.push({
              rider,
              recommendedSA: riderSA,
              annualCost
            });
            riderAnnualTotal += annualCost;
          }
        }
      }
    }

    const totalAnnualWithRiders = calculatedBaseAnnual !== null ? calculatedBaseAnnual + riderAnnualTotal : null;

    // Affordability
    let affordabilityAssessment: 'Highly Affordable' | 'Within Stated Budget' | 'Exceeds Current Budget' = 'Within Stated Budget';
    if (totalAnnualWithRiders !== null) {
      if (totalAnnualWithRiders <= analysis.annualPremiumBudget * 0.7) {
        affordabilityAssessment = 'Highly Affordable';
      } else if (totalAnnualWithRiders <= analysis.annualPremiumBudget) {
        affordabilityAssessment = 'Within Stated Budget';
      } else {
        affordabilityAssessment = 'Exceeds Current Budget';
      }
    }

    // Rationale & Strengths
    const strengths: string[] = [...product.features];
    const limitations: string[] = [...product.key_exclusions];
    const recommendationRationale: string[] = [];
    const rejectionReasonsAlternative: string[] = [];

    if (product.category === 'Term Life') {
      recommendationRationale.push(`High sum assured (₹${(targetSA / 100000).toFixed(1)} Lakhs) directly offsets calculated net protection gap of ₹${(analysis.coverageGap / 100000).toFixed(1)} Lakhs.`);
      recommendationRationale.push(`Cost-effective premium rate per 1,000 ensures protection fits comfortably within customer's monthly budget.`);
    } else if (product.category === 'ULIP') {
      recommendationRationale.push(`Aligns with customer's ${customer.risk_appetite} risk profile seeking market-linked wealth generation while maintaining baseline death benefit.`);
      limitations.push('Market volatility risks are borne by policyholder; NAV fluctuates daily.');
    } else if (product.category === 'Health & Critical Illness') {
      recommendationRationale.push(`Essential living benefit protection ensuring medical emergencies do not deplete household emergency savings.`);
    } else if (product.category === 'Endowment / Savings') {
      if (customer.risk_appetite === 'Conservative') {
        recommendationRationale.push('Guaranteed returns and capital preservation match customer conservative risk orientation.');
      } else {
        rejectionReasonsAlternative.push('Lower internal rate of return compared to mutual funds/ULIPs for aggressive risk profile.');
      }
    }

    recommendations.push({
      product,
      isEligible,
      ineligibilityReasons,
      recommendedSumAssured: targetSA,
      recommendedPolicyTerm: recommendedTerm,
      recommendedPPT,
      premiumPaymentOption: 'Annual',
      calculatedBasePremiumAnnual: calculatedBaseAnnual,
      calculatedBasePremiumMonthly: calculatedBaseMonthly,
      matchingRateRecordId: matchingRecord ? matchingRecord.record_id : null,
      premiumCalculationNote: premiumCalcNote,
      eligibleRiders,
      totalAnnualPremiumWithRiders: totalAnnualWithRiders,
      affordabilityAssessment,
      strengths,
      limitations,
      recommendationRationale,
      rejectionReasonsAlternative,
      missingDatasetFields: [],
      dataSourceReference: product.dataset_source
    });
  }

  // Sort: Eligible first, then Term Life priority for high coverage gap, then affordability
  return recommendations.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    if (a.product.category === 'Term Life' && b.product.category !== 'Term Life') return -1;
    if (b.product.category === 'Term Life' && a.product.category !== 'Term Life') return 1;
    return (a.totalAnnualPremiumWithRiders || 9999999) - (b.totalAnnualPremiumWithRiders || 9999999);
  });
}
