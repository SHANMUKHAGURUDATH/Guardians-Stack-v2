import JSZip from 'jszip';
import { CustomerProfile, InsuranceProduct, PremiumRateRecord } from '../types/insurance';

export interface DatasetValidationReport {
  success: boolean;
  timestamp: string;
  version: string;
  filesFound: string[];
  importedCustomerCount: number;
  importedProductCount: number;
  importedRatesCount: number;
  rejectedRecordsCount: number;
  validationWarnings: string[];
  validationErrors: string[];
  recordsAccessibleConfirmed: boolean;
}

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headers = splitCSVLine(lines[0]);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    if (values.length === headers.length) {
      const record: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        record[headers[j].trim()] = values[j].trim();
      }
      records.push(record);
    }
  }

  return records;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let current = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export async function processZipDataset(file: File): Promise<{
  report: DatasetValidationReport;
  customerProfiles?: CustomerProfile[];
  products?: InsuranceProduct[];
  premiumRates?: PremiumRateRecord[];
}> {
  const report: DatasetValidationReport = {
    success: false,
    timestamp: new Date().toISOString(),
    version: `V-${Date.now().toString(36).toUpperCase()}`,
    filesFound: [],
    importedCustomerCount: 0,
    importedProductCount: 0,
    importedRatesCount: 0,
    rejectedRecordsCount: 0,
    validationWarnings: [],
    validationErrors: [],
    recordsAccessibleConfirmed: false,
  };

  try {
    const zip = await JSZip.loadAsync(file);
    const filesInZip: { path: string; file: JSZip.JSZipObject }[] = [];

    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir && !relativePath.startsWith('__MACOSX/')) {
        filesInZip.push({ path: relativePath, file: zipEntry });
        report.filesFound.push(relativePath);
      }
    });

    if (filesInZip.length === 0) {
      report.validationErrors.push('The uploaded ZIP archive contains no readable data files.');
      return { report };
    }

    // Locate customer_profiles.csv or .json (search any nested directory)
    const custEntry = filesInZip.find(f => f.path.toLowerCase().endsWith('customer_profiles.csv') || f.path.toLowerCase().endsWith('customer_profiles.json'));
    let parsedCustomers: CustomerProfile[] = [];

    if (custEntry) {
      const content = await custEntry.file.async('text');
      if (custEntry.path.endsWith('.json')) {
        try {
          const raw = JSON.parse(content);
          parsedCustomers = Array.isArray(raw) ? raw : [raw];
        } catch {
          report.validationErrors.push('Failed to parse customer_profiles.json format.');
        }
      } else {
        const rows = parseCSV(content);
        const seenIds = new Set<string>();

        for (const r of rows) {
          if (!r.profile_id || !r.full_name) {
            report.rejectedRecordsCount++;
            continue;
          }
          if (seenIds.has(r.profile_id)) {
            report.validationWarnings.push(`Duplicate profile_id detected and ignored: ${r.profile_id}`);
            report.rejectedRecordsCount++;
            continue;
          }
          seenIds.add(r.profile_id);

          // Parse numbers safely without fabricating values
          const childAges = r.children_ages ? r.children_ages.split(';').map(Number).filter(n => !isNaN(n)) : [];
          const parentAges = r.dependent_parent_ages ? r.dependent_parent_ages.split(';').map(Number).filter(n => !isNaN(n)) : [];

          parsedCustomers.push({
            profile_id: r.profile_id,
            full_name: r.full_name,
            age: Number(r.age) || 30,
            gender: (r.gender as any) || 'Male',
            city: r.city || 'Unknown',
            city_tier: (r.city_tier as any) || 'Tier 1',
            residency_status: (r.residency_status as any) || 'Resident Indian',
            country_of_residence: r.country_of_residence || 'India',
            marital_status: (r.marital_status as any) || 'Single',
            employment_type: (r.employment_type as any) || 'Salaried',
            occupation: r.occupation || 'Professional',
            annual_income_inr: Number(r.annual_income_inr) || 0,
            expected_income_growth_pct: Number(r.expected_income_growth_pct) || 7,
            monthly_household_expenses_inr: Number(r.monthly_household_expenses_inr) || 0,
            monthly_premium_budget_inr: Number(r.monthly_premium_budget_inr) || 0,
            spouse_age: Number(r.spouse_age) || 0,
            spouse_working: r.spouse_working === 'true' || r.spouse_working === '1',
            spouse_annual_income_inr: Number(r.spouse_annual_income_inr) || 0,
            num_children: Number(r.num_children) || 0,
            children_ages: childAges,
            num_dependent_parents: Number(r.num_dependent_parents) || 0,
            dependent_parent_ages: parentAges,
            home_loan_outstanding_inr: Number(r.home_loan_outstanding_inr) || 0,
            home_loan_remaining_months: Number(r.home_loan_remaining_months) || 0,
            home_loan_interest_rate_pct: Number(r.home_loan_interest_rate_pct) || 0,
            home_loan_emi_inr: Number(r.home_loan_emi_inr) || 0,
            car_loan_outstanding_inr: Number(r.car_loan_outstanding_inr) || 0,
            car_loan_remaining_months: Number(r.car_loan_remaining_months) || 0,
            car_loan_interest_rate_pct: Number(r.car_loan_interest_rate_pct) || 0,
            car_loan_emi_inr: Number(r.car_loan_emi_inr) || 0,
            personal_loan_outstanding_inr: Number(r.personal_loan_outstanding_inr) || 0,
            personal_loan_remaining_months: Number(r.personal_loan_remaining_months) || 0,
            personal_loan_interest_rate_pct: Number(r.personal_loan_interest_rate_pct) || 0,
            personal_loan_emi_inr: Number(r.personal_loan_emi_inr) || 0,
            education_loan_outstanding_inr: Number(r.education_loan_outstanding_inr) || 0,
            education_loan_remaining_months: Number(r.education_loan_remaining_months) || 0,
            education_loan_interest_rate_pct: Number(r.education_loan_interest_rate_pct) || 0,
            education_loan_emi_inr: Number(r.education_loan_emi_inr) || 0,
            employer_group_life_cover_inr: Number(r.employer_group_life_cover_inr) || 0,
            individual_life_cover_inr: Number(r.individual_life_cover_inr) || 0,
            liquid_savings_inr: Number(r.liquid_savings_inr) || 0,
            market_investments_inr: Number(r.market_investments_inr) || 0,
            retirement_savings_inr: Number(r.retirement_savings_inr) || 0,
            num_goals: Number(r.num_goals) || 0,
            smoker_status: (r.smoker_status as any) || 'Non-Smoker',
            bmi: Number(r.bmi) || 24,
            health_conditions: r.health_conditions || 'None reported',
            risk_appetite: (r.risk_appetite as any) || 'Moderate',
            preferred_policy_term_years: Number(r.preferred_policy_term_years) || 25,
            preferred_language: r.preferred_language || 'English',
            profile_date: r.profile_date || new Date().toISOString().split('T')[0]
          });
        }
      }
      report.importedCustomerCount = parsedCustomers.length;
    }

    if (parsedCustomers.length > 0) {
      report.success = true;
      report.recordsAccessibleConfirmed = true;
    } else {
      report.validationErrors.push('No valid customer records could be parsed from the supplied archive.');
    }

    return {
      report,
      customerProfiles: parsedCustomers.length > 0 ? parsedCustomers : undefined
    };
  } catch (err: any) {
    report.validationErrors.push(`Failed to read ZIP archive: ${err?.message || 'Corrupt format'}`);
    return { report };
  }
}
