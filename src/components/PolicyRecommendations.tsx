import React, { useState } from 'react';
import { CustomerProfile, PolicyRecommendation, ActuarialAnalysis } from '../types/insurance';
import { 
  ShieldCheck, AlertTriangle, CheckCircle, XCircle, 
  Layers, ArrowRight, DollarSign, Zap, FileSpreadsheet, Eye, X
} from 'lucide-react';

interface PolicyRecommendationsProps {
  customer: CustomerProfile;
  recommendations: PolicyRecommendation[];
  analysis: ActuarialAnalysis;
}

export const PolicyRecommendations: React.FC<PolicyRecommendationsProps> = ({
  customer,
  recommendations,
  analysis,
}) => {
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const formatInr = (amt: number | null) => {
    if (amt === null) return 'N/A';
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  const toggleCompare = (productId: string) => {
    if (selectedForComparison.includes(productId)) {
      setSelectedForComparison(selectedForComparison.filter(id => id !== productId));
    } else {
      if (selectedForComparison.length >= 3) {
        alert('You can compare a maximum of 3 policies simultaneously.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, productId]);
    }
  };

  const comparedPolicies = recommendations.filter(r => selectedForComparison.includes(r.product.product_id));

  return (
    <div className="space-y-6">
      {/* Header with Comparison Action */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <span>Dynamic Policy Recommendations &amp; Rate Lookup</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              {recommendations.filter(r => r.isEligible).length} Eligible
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Actuarially matched against customer's age ({customer.age}), term ({customer.preferred_policy_term_years}y), and coverage gap (₹{(analysis.coverageGap / 100000).toFixed(1)}L).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {selectedForComparison.length > 0 && (
            <button
              onClick={() => setShowComparisonModal(true)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-600/30"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Compare Selected ({selectedForComparison.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.map((rec) => {
          const { product, isEligible } = rec;
          const isSelected = selectedForComparison.includes(product.product_id);

          return (
            <div
              key={product.product_id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all relative ${
                isEligible
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-slate-800/60 opacity-70 bg-slate-950/40'
              }`}
            >
              {/* Product Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {product.product_id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {product.category}
                    </span>
                    {isEligible ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                        <CheckCircle className="w-2.5 h-2.5" />
                        <span>ELIGIBLE</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center space-x-1">
                        <XCircle className="w-2.5 h-2.5" />
                        <span>INELIGIBLE</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-100 mt-1.5">{product.product_name}</h4>
                  <p className="text-xs text-slate-400">{product.insurer_name}</p>
                </div>

                <button
                  onClick={() => toggleCompare(product.product_id)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                    isSelected
                      ? 'bg-cyan-600 text-white border-cyan-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {isSelected ? '✓ Selected' : '+ Compare'}
                </button>
              </div>

              {/* Financial Quotation Section */}
              {isEligible ? (
                <div className="my-3 p-3.5 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Recommended Sum Assured</span>
                      <span className="font-extrabold text-white text-sm">
                        ₹{(rec.recommendedSumAssured / 100000).toFixed(1)} Lakhs
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Policy Term / PPT</span>
                      <span className="font-bold text-slate-200">
                        {rec.recommendedPolicyTerm} yrs / {rec.recommendedPPT} yrs
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Annual Base Premium</span>
                      <span className="font-extrabold text-cyan-400 text-base">
                        {formatInr(rec.calculatedBasePremiumAnnual)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Monthly (incl. 3% load)</span>
                      <span className="font-bold text-slate-300">
                        {formatInr(rec.calculatedBasePremiumMonthly)}
                      </span>
                    </div>
                  </div>

                  {rec.matchingRateRecordId && (
                    <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
                      <span>Rate Record: {rec.matchingRateRecordId}</span>
                      <span className="text-emerald-400">Exact Rate Match</span>
                    </div>
                  )}

                  {/* Affordability Badge */}
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Budget Assessment:</span>
                    <span className={`font-semibold ${
                      rec.affordabilityAssessment === 'Exceeds Current Budget' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {rec.affordabilityAssessment}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="my-3 p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl text-xs text-rose-300 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Underwriting Rejection Reasons:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-rose-300/90">
                    {rec.ineligibilityReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rationale & Key Features */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Recommendation Rationale:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                    {rec.recommendationRationale.map((rat, idx) => (
                      <li key={idx}>{rat}</li>
                    ))}
                  </ul>
                </div>

                {/* Eligible Riders */}
                {rec.eligibleRiders.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-semibold text-cyan-400 block mb-1">
                      Eligible Add-on Riders:
                    </span>
                    <div className="space-y-1">
                      {rec.eligibleRiders.map((er, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] bg-slate-800/80 px-2 py-1 rounded">
                          <span className="text-slate-300 truncate max-w-[200px]">{er.rider.rider_name}</span>
                          <span className="text-cyan-300 font-semibold">+{formatInr(er.annualCost)}/yr</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dataset Source Reference */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
                <span className="truncate">Source: {rec.dataSourceReference}</span>
                <span className="shrink-0 text-slate-400">Strict Actuarial Rules</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                  <span>Side-by-Side Policy Comparison</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Compare benefits, premiums, riders, and limitations across selected policies
                </p>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-x-auto flex-1">
              <table className="w-full text-xs text-left text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="p-3 bg-slate-850 font-bold text-slate-400 w-1/4">Comparison Metric</th>
                    {comparedPolicies.map((rec) => (
                      <th key={rec.product.product_id} className="p-3 bg-slate-800 font-bold text-white text-sm">
                        {rec.product.product_name}
                        <span className="block text-[10px] font-normal text-cyan-400 mt-0.5">{rec.product.category}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Product ID &amp; Insurer</td>
                    {comparedPolicies.map((rec) => (
                      <td key={rec.product.product_id} className="p-3 font-mono text-[11px]">
                        {rec.product.product_id} ({rec.product.insurer_name})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Eligibility Status</td>
                    {comparedPolicies.map((rec) => (
                      <td key={rec.product.product_id} className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          rec.isEligible ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                        }`}>
                          {rec.isEligible ? 'Eligible' : 'Ineligible'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Recommended Sum Assured</td>
                    {comparedPolicies.map((rec) => (
                      <td key={rec.product.product_id} className="p-3 font-extrabold text-white text-sm">
                        ₹{(rec.recommendedSumAssured / 100000).toFixed(1)} Lakhs
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Policy Term &amp; PPT</td>
                    {comparedPolicies.map((rec) => (
                      <td key={rec.product.product_id} className="p-3">
                        {rec.recommendedPolicyTerm} years term (PPT: {rec.recommendedPPT} years)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Calculated Annual Base Premium</td>
                    {comparedPolicies.map((rec) => (
                      <td key={rec.product.product_id} className="p-3 font-extrabold text-cyan-400 text-sm">
                        {formatInr(rec.calculatedBasePremiumAnnual)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Source Rate Record ID</td>
                    {comparedPolicies.map((rec) => (
                      <td key={rec.product.product_id} className="p-3 font-mono text-xs text-slate-300">
                        {rec.matchingRateRecordId || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Eligible Riders</td>
                    {comparedPolicies.map((rec) => (
                      <td key={rec.product.product_id} className="p-3 text-[11px]">
                        {rec.eligibleRiders.length > 0 ? (
                          rec.eligibleRiders.map((r, i) => (
                            <div key={i}>• {r.rider.rider_name} (+{formatInr(r.annualCost)}/yr)</div>
                          ))
                        ) : (
                          <span className="text-slate-500">None applicable</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Affordability Rating</td>
                    {comparedPolicies.map((rec) => (
                      <td key={rec.product.product_id} className="p-3 font-semibold text-emerald-400">
                        {rec.affordabilityAssessment}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Key Exclusions</td>
                    {comparedPolicies.map((rec) => (
                      <td key={rec.product.product_id} className="p-3 text-[11px] text-slate-400">
                        {rec.limitations.join('; ')}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
