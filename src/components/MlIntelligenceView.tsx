import React, { useMemo, useState } from 'react';
import { CustomerProfile } from '../types/insurance';
import { performKMeansClustering, evaluateDecisionTreeModel } from '../utils/mlEngine';
import { Brain, Layers, Target, Info, CheckCircle, BarChart2 } from 'lucide-react';

interface MlIntelligenceViewProps {
  customerProfiles: CustomerProfile[];
  currentProfileId: string;
}

export const MlIntelligenceView: React.FC<MlIntelligenceViewProps> = ({
  customerProfiles,
  currentProfileId,
}) => {
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<number | 'ALL'>('ALL');

  const clusteringResult = useMemo(() => {
    return performKMeansClustering(customerProfiles, 4);
  }, [customerProfiles]);

  const dtMetrics = useMemo(() => {
    return evaluateDecisionTreeModel(customerProfiles);
  }, [customerProfiles]);

  const formatInr = (num: number) => {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const filteredCustomers = useMemo(() => {
    if (selectedClusterFilter === 'ALL') return clusteringResult.customers;
    return clusteringResult.customers.filter(c => c.clusterId === selectedClusterFilter);
  }, [clusteringResult, selectedClusterFilter]);

  const currentCustomerClustered = clusteringResult.customers.find(c => c.profileId === currentProfileId);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <span>Machine Learning &amp; Customer Segmentation Intelligence</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Exploratory K-Means cohort clustering and transparent Decision Tree policy suitability modeling across 200 customer profiles.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-700">
            <span className="text-slate-400 mr-1.5">Silhouette Score:</span>
            <span className="font-bold text-emerald-400">{clusteringResult.silhouetteScore}</span>
            <span className="text-[10px] text-slate-500 ml-1">(Good Separation)</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-700">
            <span className="text-slate-400 mr-1.5">Inertia:</span>
            <span className="font-bold text-cyan-400">{clusteringResult.inertia}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: K-MEANS CUSTOMER SEGMENTS */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
          <Layers className="w-4 h-4" />
          <span>8.1 Customer Cohort Segmentation (K-Means Clustering)</span>
        </h4>

        {/* 4 Cluster Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {clusteringResult.clusters.map((cluster) => {
            const isUserCluster = currentCustomerClustered?.clusterId === cluster.id;
            return (
              <div
                key={cluster.id}
                onClick={() => setSelectedClusterFilter(selectedClusterFilter === cluster.id ? 'ALL' : cluster.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isUserCluster
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                } ${selectedClusterFilter === cluster.id ? 'ring-2 ring-cyan-400' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cluster.color }}
                    ></span>
                    <span className="text-xs font-bold text-white truncate">{cluster.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {cluster.size} Profiles
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{cluster.description}</p>

                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-500 block">Avg Age</span>
                    <span className="font-semibold text-slate-200">{cluster.avgAge} yrs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Avg Income</span>
                    <span className="font-semibold text-slate-200">{formatInr(cluster.avgIncome)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Avg Debt</span>
                    <span className="font-semibold text-amber-400">{formatInr(cluster.avgLiabilities)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Avg Savings</span>
                    <span className="font-semibold text-emerald-400">{formatInr(cluster.avgSavings)}</span>
                  </div>
                </div>

                {isUserCluster && (
                  <div className="mt-2.5 pt-1.5 border-t border-cyan-800 text-[10px] text-cyan-300 font-bold flex items-center justify-center space-x-1">
                    <span>★ Current Client's Assigned Cluster</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 2D Projection Scatter Map */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="text-xs font-bold text-slate-200">
                2D PCA Feature Space Projection (Wealth Gradient vs Family Dependency)
              </h5>
              <p className="text-[11px] text-slate-400">
                Showing {filteredCustomers.length} mapped profiles. Current customer is highlighted with a radiant marker.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 text-[11px]">Filter:</span>
              <button
                onClick={() => setSelectedClusterFilter('ALL')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  selectedClusterFilter === 'ALL' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                All Clusters
              </button>
            </div>
          </div>

          {/* Interactive Plot Box */}
          <div className="relative h-64 bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-hidden flex items-center justify-center">
            {/* Grid lines */}
            <div className="absolute inset-x-0 top-1/2 border-t border-slate-800/80 border-dashed"></div>
            <div className="absolute inset-y-0 left-1/2 border-l border-slate-800/80 border-dashed"></div>

            {/* Render data points */}
            <div className="relative w-full h-full">
              {filteredCustomers.map((cust) => {
                const isCurrent = cust.profileId === currentProfileId;
                const cluster = clusteringResult.clusters.find(c => c.id === cust.clusterId);
                // Map PCA (-3 to +3) to % (5% to 95%)
                const left = Math.max(5, Math.min(95, ((cust.pcaX + 3) / 6) * 100));
                const top = Math.max(5, Math.min(95, ((3 - cust.pcaY) / 6) * 100));

                return (
                  <div
                    key={cust.profileId}
                    style={{ left: `${left}%`, top: `${top}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    title={`${cust.fullName} (${cust.profileId}) - ${cust.clusterName}`}
                  >
                    {isCurrent ? (
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-cyan-400 opacity-75"></span>
                        <div className="w-3.5 h-3.5 rounded-full bg-cyan-300 border-2 border-white shadow-lg z-10"></div>
                      </div>
                    ) : (
                      <div
                        className="w-2 h-2 rounded-full opacity-70 group-hover:opacity-100 group-hover:scale-150 transition-all"
                        style={{ backgroundColor: cluster?.color || '#3b82f6' }}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quadrant Axis Labels */}
            <span className="absolute bottom-2 right-3 text-[10px] text-slate-500 font-mono">
              + Wealth / Assets Gradient →
            </span>
            <span className="absolute top-2 left-3 text-[10px] text-slate-500 font-mono">
              ↑ Age / Dependency Gradient
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: DECISION TREE SUITABILITY CLASSIFIER & METRICS */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
          <Target className="w-4 h-4" />
          <span>8.2 Supervised Decision Tree Suitability Evaluation</span>
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Metrics Overview (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div>
              <h5 className="text-xs font-bold text-slate-200">Model Performance &amp; Evaluation Metrics</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target: {dtMetrics.targetVariable} • Train/Test Split: {dtMetrics.trainSplitPct}% / {dtMetrics.testSplitPct}%
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Accuracy</span>
                <span className="text-lg font-black text-emerald-400">{Math.round(dtMetrics.accuracy * 100)}%</span>
              </div>
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Precision</span>
                <span className="text-lg font-black text-cyan-400">{Math.round(dtMetrics.precision * 100)}%</span>
              </div>
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Recall</span>
                <span className="text-lg font-black text-indigo-400">{Math.round(dtMetrics.recall * 100)}%</span>
              </div>
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">F1-Score</span>
                <span className="text-lg font-black text-purple-400">{dtMetrics.f1Score}</span>
              </div>
            </div>

            {/* Confusion Matrix Table */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                Confusion Matrix (Test Cohort N={dtMetrics.confusionMatrix.tp + dtMetrics.confusionMatrix.fp + dtMetrics.confusionMatrix.fn + dtMetrics.confusionMatrix.tn})
              </span>
              <table className="w-full text-xs text-center border-collapse border border-slate-800">
                <thead>
                  <tr className="bg-slate-800 text-slate-300 text-[10px]">
                    <th className="p-2 border border-slate-700"></th>
                    <th className="p-2 border border-slate-700">Predicted Positive</th>
                    <th className="p-2 border border-slate-700">Predicted Negative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  <tr>
                    <td className="p-2 bg-slate-850 font-semibold border border-slate-800 text-left">
                      Actual Positive
                    </td>
                    <td className="p-2 bg-emerald-950/30 text-emerald-400 font-bold border border-slate-800">
                      TP: {dtMetrics.confusionMatrix.tp}
                    </td>
                    <td className="p-2 bg-rose-950/20 text-rose-400 font-bold border border-slate-800">
                      FN: {dtMetrics.confusionMatrix.fn}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 bg-slate-850 font-semibold border border-slate-800 text-left">
                      Actual Negative
                    </td>
                    <td className="p-2 bg-rose-950/20 text-rose-400 font-bold border border-slate-800">
                      FP: {dtMetrics.confusionMatrix.fp}
                    </td>
                    <td className="p-2 bg-emerald-950/30 text-emerald-400 font-bold border border-slate-800">
                      TN: {dtMetrics.confusionMatrix.tn}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Features & Limitations (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div>
              <h5 className="text-xs font-bold text-slate-200">Features Used in Tree Splitting</h5>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {dtMetrics.featuresUsed.map((feat, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-1 bg-slate-800 text-cyan-300 rounded border border-slate-700 font-mono">
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                <Info className="w-3.5 h-3.5" />
                <span>Transparent Model Limitations:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                {dtMetrics.limitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
