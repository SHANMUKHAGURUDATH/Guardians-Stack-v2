import React, { useState } from 'react';
import { CustomerProfile } from '../types/insurance';
import { processZipDataset, DatasetValidationReport } from '../utils/datasetImporter';
import { 
  Database, UploadCloud, CheckCircle2, AlertTriangle, 
  X, FileText, Download, FolderArchive, RefreshCw 
} from 'lucide-react';

interface DatasetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetImported: (profiles: CustomerProfile[]) => void;
}

export const DatasetImportModal: React.FC<DatasetImportModalProps> = ({
  isOpen,
  onClose,
  onDatasetImported,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<DatasetValidationReport | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setReport(null);

    try {
      const result = await processZipDataset(file);
      setReport(result.report);

      if (result.report.success && result.customerProfiles && result.customerProfiles.length > 0) {
        onDatasetImported(result.customerProfiles);
      }
    } catch (err: any) {
      setReport({
        success: false,
        timestamp: new Date().toISOString(),
        version: 'ERR',
        filesFound: [],
        importedCustomerCount: 0,
        importedProductCount: 0,
        importedRatesCount: 0,
        rejectedRecordsCount: 0,
        validationWarnings: [],
        validationErrors: [`Import processing failed: ${err?.message || 'Unknown error'}`],
        recordsAccessibleConfirmed: false,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSampleDataset = () => {
    // Generate a downloadable CSV template with all 51 headers
    const sampleHeaders = [
      'profile_id', 'full_name', 'age', 'gender', 'city', 'city_tier', 'residency_status', 'country_of_residence',
      'marital_status', 'employment_type', 'occupation', 'annual_income_inr', 'expected_income_growth_pct',
      'monthly_household_expenses_inr', 'monthly_premium_budget_inr', 'spouse_age', 'spouse_working',
      'spouse_annual_income_inr', 'num_children', 'children_ages', 'num_dependent_parents', 'dependent_parent_ages',
      'home_loan_outstanding_inr', 'home_loan_remaining_months', 'home_loan_interest_rate_pct', 'home_loan_emi_inr',
      'car_loan_outstanding_inr', 'car_loan_remaining_months', 'car_loan_interest_rate_pct', 'car_loan_emi_inr',
      'personal_loan_outstanding_inr', 'personal_loan_remaining_months', 'personal_loan_interest_rate_pct', 'personal_loan_emi_inr',
      'education_loan_outstanding_inr', 'education_loan_remaining_months', 'education_loan_interest_rate_pct', 'education_loan_emi_inr',
      'employer_group_life_cover_inr', 'individual_life_cover_inr', 'liquid_savings_inr', 'market_investments_inr',
      'retirement_savings_inr', 'num_goals', 'smoker_status', 'bmi', 'health_conditions', 'risk_appetite',
      'preferred_policy_term_years', 'preferred_language', 'profile_date'
    ].join(',');

    const sampleRow = [
      'CUST-9999', 'Arun Kumar', '34', 'Male', 'Bengaluru', 'Tier 1', 'Resident Indian', 'India',
      'Married', 'Salaried', 'Staff Architect', '2800000', '9.0',
      '85000', '15000', '32', 'true',
      '1400000', '2', '6;3', '2', '62;59',
      '6500000', '180', '8.4', '56000',
      '600000', '36', '9.2', '19000',
      '0', '0', '0', '0',
      '0', '0', '0', '0',
      '7500000', '5000000', '1200000', '3500000',
      '2200000', '3', 'Non-Smoker', '23.8', 'None reported', 'Moderate',
      '30', 'English', '2026-03-15'
    ].join(',');

    const csvContent = `data:text/csv;charset=utf-8,${sampleHeaders}\n${sampleRow}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample_customer_profiles_51_fields.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Dataset Archive Importer &amp; Validator</h3>
              <p className="text-xs text-slate-400">
                Upload custom ZIP or CSV datasets. Supports nested directories and validates 51 schema fields.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Drop Zone */}
        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 text-center bg-slate-950/40 transition-colors">
            <FolderArchive className="w-10 h-10 text-cyan-400 mx-auto mb-2 opacity-80" />
            <div className="text-sm font-semibold text-slate-200">
              Drag &amp; drop your Insurance Dataset ZIP or CSV
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Extracts customer_profiles.csv, products.csv/json, and premium_rates.csv from nested or root directories.
            </p>

            <div className="mt-4 flex items-center justify-center space-x-3">
              <label className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-sm">
                <span>Browse Local Files</span>
                <input
                  type="file"
                  accept=".zip,.csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isProcessing}
                />
              </label>

              <button
                type="button"
                onClick={handleDownloadSampleDataset}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download 51-Field Template</span>
              </button>
            </div>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 flex items-center space-x-3 text-xs text-cyan-400">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>Scanning archive structure, resolving nested folders, and validating 51-field schemas...</span>
            </div>
          )}

          {/* Validation Report Card */}
          {report && (
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {report.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="font-bold text-slate-200">
                    {report.success ? 'Dataset Validation Succeeded' : 'Import Validation Failed'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Batch {report.version}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Imported Profiles</span>
                  <span className="text-sm font-bold text-emerald-400">{report.importedCustomerCount}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Rejected Records</span>
                  <span className="text-sm font-bold text-rose-400">{report.rejectedRecordsCount}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Files Located</span>
                  <span className="text-sm font-bold text-cyan-400">{report.filesFound.length}</span>
                </div>
              </div>

              {report.validationErrors.length > 0 && (
                <div className="p-2.5 rounded bg-rose-950/30 border border-rose-900/50 text-rose-300 space-y-1">
                  <span className="font-bold block">Errors:</span>
                  <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                    {report.validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.validationWarnings.length > 0 && (
                <div className="p-2.5 rounded bg-amber-950/30 border border-amber-900/50 text-amber-300 space-y-1">
                  <span className="font-bold block">Warnings:</span>
                  <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                    {report.validationWarnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.success && (
                <div className="text-[11px] text-emerald-400 flex items-center justify-between pt-1">
                  <span>✓ Verified: Imported records are now accessible to the calculation engine.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
