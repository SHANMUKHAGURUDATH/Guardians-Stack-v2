import { CustomerProfile } from '../types/insurance';

// Deterministic generator of 200 rich customer profiles covering all 51 fields
const citiesByTier = {
  'Tier 1': ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'],
  'Tier 2': ['Jaipur', 'Chandigarh', 'Coimbatore', 'Indore', 'Nagpur', 'Kochi', 'Bhubaneswar', 'Lucknow'],
  'Tier 3': ['Mysuru', 'Salem', 'Warangal', 'Belagavi', 'Dehradun', 'Nashik', 'Trichy', 'Guwahati']
};

const occupations = [
  { title: 'Software Development Lead', type: 'Salaried' as const, baseIncome: 2400000, risk: 'Moderate' as const },
  { title: 'Senior Product Manager', type: 'Salaried' as const, baseIncome: 3200000, risk: 'Aggressive' as const },
  { title: 'Consultant Cardiologist', type: 'Self-Employed Professional' as const, baseIncome: 4200000, risk: 'Conservative' as const },
  { title: 'Chartered Accountant & Tax Partner', type: 'Self-Employed Professional' as const, baseIncome: 2800000, risk: 'Conservative' as const },
  { title: 'Operations General Manager', type: 'Salaried' as const, baseIncome: 2100000, risk: 'Moderate' as const },
  { title: 'E-commerce Business Founder', type: 'Business Owner' as const, baseIncome: 3600000, risk: 'Aggressive' as const },
  { title: 'High School Senior Educator', type: 'Salaried' as const, baseIncome: 850000, risk: 'Conservative' as const },
  { title: 'Data Platform Engineer', type: 'Salaried' as const, baseIncome: 1850000, risk: 'Moderate' as const },
  { title: 'Civil Infrastructure Contractor', type: 'Business Owner' as const, baseIncome: 2600000, risk: 'Moderate' as const },
  { title: 'Architectural Consultant', type: 'Self-Employed Professional' as const, baseIncome: 1650000, risk: 'Moderate' as const },
  { title: 'Corporate Banking Associate VP', type: 'Salaried' as const, baseIncome: 2750000, risk: 'Moderate' as const },
  { title: 'Senior UX Researcher & Designer', type: 'Salaried' as const, baseIncome: 1700000, risk: 'Moderate' as const },
  { title: 'Pharma Research Scientist', type: 'Salaried' as const, baseIncome: 1950000, risk: 'Conservative' as const },
  { title: 'Manufacturing Supply Chain Lead', type: 'Salaried' as const, baseIncome: 1550000, risk: 'Moderate' as const },
  { title: 'Digital Content Studio Director', type: 'Business Owner' as const, baseIncome: 2200000, risk: 'Aggressive' as const }
];

const firstNames = [
  'Aarav', 'Ananya', 'Rohan', 'Priya', 'Aditya', 'Sneha', 'Vikram', 'Neha', 
  'Kavita', 'Rajesh', 'Deepak', 'Pooja', 'Sunil', 'Meera', 'Arjun', 'Divya',
  'Karthik', 'Swati', 'Manish', 'Shreya', 'Amit', 'Ritu', 'Nikhil', 'Tanvi',
  'Gaurav', 'Anjali', 'Varun', 'Isha', 'Suresh', 'Bhavna', 'Harish', 'Preeti'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Nair', 'Iyer', 'Reddy', 'Mukherjee', 'Choudhury',
  'Kulkarni', 'Deshmukh', 'Menon', 'Gupta', 'Singhania', 'Bose', 'Rao', 'Bhat',
  'Chatterjee', 'Aggarwal', 'Joshi', 'Mehta', 'Sundaram', 'Kapoor', 'Malhotra'
];

export function generateCustomerProfiles(): CustomerProfile[] {
  const profiles: CustomerProfile[] = [];

  for (let i = 1; i <= 200; i++) {
    const id = `CUST-${String(i).padStart(4, '0')}`;
    const fn = firstNames[(i * 7) % firstNames.length];
    const ln = lastNames[(i * 11) % lastNames.length];
    const fullName = `${fn} ${ln}`;
    const age = 24 + ((i * 3) % 36); // Ages 24 to 59
    const gender = i % 2 === 0 ? 'Male' : (i % 7 === 0 ? 'Other' : 'Female');
    
    const tierKey: 'Tier 1' | 'Tier 2' | 'Tier 3' = i % 5 === 0 ? 'Tier 3' : (i % 3 === 0 ? 'Tier 2' : 'Tier 1');
    const cityList = citiesByTier[tierKey];
    const city = cityList[i % cityList.length];
    
    const occItem = occupations[i % occupations.length];
    const occupation = occItem.title;
    const employment_type = occItem.type;
    const residency_status = i % 25 === 0 ? 'NRI' : 'Resident Indian';
    const country_of_residence = residency_status === 'NRI' ? (i % 2 === 0 ? 'United Arab Emirates' : 'Singapore') : 'India';
    
    const marital_status = age < 27 ? 'Single' : (i % 22 === 0 ? 'Divorced' : 'Married');
    const isMarried = marital_status === 'Married';

    // Financial numbers scaled with age and occupation
    const incomeMultiplier = 0.8 + ((i * 13) % 100) / 100;
    const annual_income_inr = Math.round((occItem.baseIncome * (1 + (age - 25) * 0.035) * incomeMultiplier) / 50000) * 50000;
    const expected_income_growth_pct = Math.round(5 + ((i * 3) % 10)); // 5% - 14%
    const monthly_household_expenses_inr = Math.round((annual_income_inr * (0.35 + ((i % 15) * 0.01))) / 12 / 1000) * 1000;
    const monthly_premium_budget_inr = Math.max(3000, Math.round((annual_income_inr * 0.06) / 12 / 500) * 500);

    // Spouse & Children
    const spouse_working = isMarried ? (i % 2 === 0) : false;
    const spouse_age = isMarried ? Math.max(22, age + (gender === 'Male' ? -2 : 2)) : 0;
    const spouse_annual_income_inr = spouse_working ? Math.round((annual_income_inr * 0.65) / 50000) * 50000 : 0;

    let num_children = 0;
    let children_ages: number[] = [];
    if (age >= 28 && isMarried) {
      num_children = (i % 3 === 0) ? 2 : ((i % 4 === 0) ? 0 : 1);
      if (num_children === 1) {
        children_ages = [Math.max(1, age - 27)];
      } else if (num_children === 2) {
        children_ages = [Math.max(1, age - 29), Math.max(3, age - 26)];
      }
    }

    const num_dependent_parents = (i % 2 === 0) ? 2 : (i % 3 === 0 ? 1 : 0);
    const dependent_parent_ages: number[] = [];
    if (num_dependent_parents >= 1) dependent_parent_ages.push(age + 26);
    if (num_dependent_parents === 2) dependent_parent_ages.push(age + 24);

    // Loans and liabilities
    const hasHomeLoan = age >= 29 && (i % 3 !== 0);
    const home_loan_outstanding_inr = hasHomeLoan ? Math.round((annual_income_inr * 2.8) / 100000) * 100000 : 0;
    const home_loan_remaining_months = hasHomeLoan ? Math.min(240, 120 + ((i * 17) % 120)) : 0;
    const home_loan_interest_rate_pct = hasHomeLoan ? 8.5 : 0;
    const home_loan_emi_inr = hasHomeLoan ? Math.round((home_loan_outstanding_inr * 0.0086) / 100) * 100 : 0;

    const hasCarLoan = i % 4 === 0;
    const car_loan_outstanding_inr = hasCarLoan ? Math.round((annual_income_inr * 0.35) / 50000) * 50000 : 0;
    const car_loan_remaining_months = hasCarLoan ? 36 : 0;
    const car_loan_interest_rate_pct = hasCarLoan ? 9.2 : 0;
    const car_loan_emi_inr = hasCarLoan ? Math.round((car_loan_outstanding_inr * 0.031) / 100) * 100 : 0;

    const hasPersonalLoan = i % 7 === 0;
    const personal_loan_outstanding_inr = hasPersonalLoan ? Math.round((annual_income_inr * 0.18) / 25000) * 25000 : 0;
    const personal_loan_remaining_months = hasPersonalLoan ? 24 : 0;
    const personal_loan_interest_rate_pct = hasPersonalLoan ? 11.5 : 0;
    const personal_loan_emi_inr = hasPersonalLoan ? Math.round((personal_loan_outstanding_inr * 0.046) / 100) * 100 : 0;

    const hasEduLoan = age < 32 && (i % 5 === 0);
    const education_loan_outstanding_inr = hasEduLoan ? Math.round((annual_income_inr * 0.4) / 50000) * 50000 : 0;
    const education_loan_remaining_months = hasEduLoan ? 48 : 0;
    const education_loan_interest_rate_pct = hasEduLoan ? 9.5 : 0;
    const education_loan_emi_inr = hasEduLoan ? Math.round((education_loan_outstanding_inr * 0.025) / 100) * 100 : 0;

    // Existing Protection and Savings
    const employer_group_life_cover_inr = employment_type === 'Salaried' ? Math.round((annual_income_inr * 3) / 100000) * 100000 : 0;
    const individual_life_cover_inr = (i % 2 === 0) ? Math.round((annual_income_inr * 4) / 250000) * 250000 : 0;
    const liquid_savings_inr = Math.round((monthly_household_expenses_inr * (4 + (i % 8))) / 10000) * 10000;
    const market_investments_inr = Math.round((annual_income_inr * (0.8 + ((i * 7) % 25) / 10)) / 50000) * 50000;
    const retirement_savings_inr = Math.round((annual_income_inr * Math.max(0.5, (age - 25) * 0.22)) / 50000) * 50000;

    // Health, BMI & Risk
    const smoker_status = i % 5 === 0 ? 'Smoker' : 'Non-Smoker';
    const bmi = Math.round((21.5 + ((i * 3.7) % 9)) * 10) / 10;
    const health_conditions = i % 9 === 0 ? 'Mild Hypertension controlled by lifestyle' : (i % 14 === 0 ? 'Type 2 Pre-diabetes, managed without medication' : 'None reported. Active lifestyle and clean medical records.');
    const risk_appetite = occItem.risk;
    const preferred_policy_term_years = Math.min(40, Math.max(15, 65 - age));
    const preferred_language = i % 6 === 0 ? 'Hindi' : (i % 11 === 0 ? 'Tamil' : (i % 13 === 0 ? 'Kannada' : 'English'));
    const profile_date = `2026-0${1 + (i % 9)}-${String(10 + (i % 18)).padStart(2, '0')}`;

    profiles.push({
      profile_id: id,
      full_name: fullName,
      age,
      gender,
      city,
      city_tier: tierKey,
      residency_status,
      country_of_residence,
      marital_status,
      employment_type,
      occupation,
      annual_income_inr,
      expected_income_growth_pct,
      monthly_household_expenses_inr,
      monthly_premium_budget_inr,
      spouse_age,
      spouse_working,
      spouse_annual_income_inr,
      num_children,
      children_ages,
      num_dependent_parents,
      dependent_parent_ages,
      home_loan_outstanding_inr,
      home_loan_remaining_months,
      home_loan_interest_rate_pct,
      home_loan_emi_inr,
      car_loan_outstanding_inr,
      car_loan_remaining_months,
      car_loan_interest_rate_pct,
      car_loan_emi_inr,
      personal_loan_outstanding_inr,
      personal_loan_remaining_months,
      personal_loan_interest_rate_pct,
      personal_loan_emi_inr,
      education_loan_outstanding_inr,
      education_loan_remaining_months,
      education_loan_interest_rate_pct,
      education_loan_emi_inr,
      employer_group_life_cover_inr,
      individual_life_cover_inr,
      liquid_savings_inr,
      market_investments_inr,
      retirement_savings_inr,
      num_goals: 2 + (i % 4),
      smoker_status,
      bmi,
      health_conditions,
      risk_appetite,
      preferred_policy_term_years,
      preferred_language,
      profile_date
    });
  }

  return profiles;
}

export const INITIAL_CUSTOMER_PROFILES = generateCustomerProfiles();
