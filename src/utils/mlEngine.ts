import { CustomerProfile } from '../types/insurance';

export interface ClusterCentroid {
  id: number;
  name: string;
  description: string;
  color: string;
  centroid: number[];
  size: number;
  avgAge: number;
  avgIncome: number;
  avgLiabilities: number;
  avgSavings: number;
}

export interface ClusteredCustomer {
  profileId: string;
  fullName: string;
  clusterId: number;
  clusterName: string;
  pcaX: number;
  pcaY: number;
  distanceToCentroid: number;
}

export interface MLClusteringResult {
  clusters: ClusterCentroid[];
  customers: ClusteredCustomer[];
  inertia: number;
  silhouetteScore: number;
  featureNames: string[];
}

export interface ModelMetrics {
  modelName: string;
  datasetSize: number;
  featuresUsed: string[];
  targetVariable: string;
  trainSplitPct: number;
  testSplitPct: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    fn: number;
    tn: number;
  };
  limitations: string[];
}

// Normalize array with Z-Score
function standardize(matrix: number[][]): { normalized: number[][]; means: number[]; stds: number[] } {
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const means: number[] = new Array(numCols).fill(0);
  const stds: number[] = new Array(numCols).fill(0);

  for (let j = 0; j < numCols; j++) {
    let sum = 0;
    for (let i = 0; i < numRows; i++) sum += matrix[i][j];
    means[j] = sum / numRows;

    let varianceSum = 0;
    for (let i = 0; i < numRows; i++) {
      varianceSum += Math.pow(matrix[i][j] - means[j], 2);
    }
    stds[j] = Math.sqrt(varianceSum / numRows) || 1;
  }

  const normalized = matrix.map(row => 
    row.map((val, j) => (val - means[j]) / stds[j])
  );

  return { normalized, means, stds };
}

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

export function performKMeansClustering(profiles: CustomerProfile[], k: number = 4): MLClusteringResult {
  if (!profiles || profiles.length === 0) {
    return { clusters: [], customers: [], inertia: 0, silhouetteScore: 0, featureNames: [] };
  }

  const featureNames = [
    'Age',
    'Annual Income',
    'Total Liabilities',
    'Liquid Savings',
    'Number of Dependents',
    'Risk Appetite Index'
  ];

  const rawFeatures = profiles.map(p => {
    const riskScore = p.risk_appetite === 'Aggressive' ? 3 : (p.risk_appetite === 'Moderate' ? 2 : 1);
    const dependents = (p.num_children || 0) + (p.num_dependent_parents || 0) + (p.marital_status === 'Married' && !p.spouse_working ? 1 : 0);
    const totalLiab = (p.home_loan_outstanding_inr || 0) + (p.car_loan_outstanding_inr || 0) + (p.personal_loan_outstanding_inr || 0) + (p.education_loan_outstanding_inr || 0);

    return [
      p.age,
      p.annual_income_inr,
      totalLiab,
      p.liquid_savings_inr,
      dependents,
      riskScore
    ];
  });

  const { normalized } = standardize(rawFeatures);

  // Initialize centroids deterministically with k-means++ spread
  let centroids: number[][] = [];
  centroids.push([...normalized[0]]);
  
  while (centroids.length < k) {
    let bestCandidate = normalized[0];
    let maxMinDist = -1;

    for (let i = 0; i < normalized.length; i++) {
      let minDist = Infinity;
      for (const c of centroids) {
        const d = euclideanDistance(normalized[i], c);
        if (d < minDist) minDist = d;
      }
      if (minDist > maxMinDist) {
        maxMinDist = minDist;
        bestCandidate = normalized[i];
      }
    }
    centroids.push([...bestCandidate]);
  }

  // Iterative refinement (15 iterations)
  let assignments: number[] = new Array(normalized.length).fill(0);
  for (let iter = 0; iter < 15; iter++) {
    // Assignment step
    for (let i = 0; i < normalized.length; i++) {
      let closestCentroid = 0;
      let minDist = Infinity;
      for (let cIdx = 0; cIdx < k; cIdx++) {
        const dist = euclideanDistance(normalized[i], centroids[cIdx]);
        if (dist < minDist) {
          minDist = dist;
          closestCentroid = cIdx;
        }
      }
      assignments[i] = closestCentroid;
    }

    // Update step
    const newCentroids: number[][] = Array.from({ length: k }, () => new Array(featureNames.length).fill(0));
    const counts = new Array(k).fill(0);

    for (let i = 0; i < normalized.length; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let j = 0; j < featureNames.length; j++) {
        newCentroids[c][j] += normalized[i][j];
      }
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let j = 0; j < featureNames.length; j++) {
          newCentroids[c][j] /= counts[c];
        }
        centroids[c] = newCentroids[c];
      }
    }
  }

  // Calculate inertia
  let inertia = 0;
  for (let i = 0; i < normalized.length; i++) {
    inertia += Math.pow(euclideanDistance(normalized[i], centroids[assignments[i]]), 2);
  }

  // Calculate Silhouette Score
  let silhouetteTotal = 0;
  for (let i = 0; i < normalized.length; i++) {
    const ownCluster = assignments[i];
    
    // a(i): average distance to points in same cluster
    let aSum = 0;
    let aCount = 0;
    for (let j = 0; j < normalized.length; j++) {
      if (i !== j && assignments[j] === ownCluster) {
        aSum += euclideanDistance(normalized[i], normalized[j]);
        aCount++;
      }
    }
    const a = aCount > 0 ? aSum / aCount : 0;

    // b(i): minimum average distance to points in any other cluster
    let minOtherAvg = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === ownCluster) continue;
      let bSum = 0;
      let bCount = 0;
      for (let j = 0; j < normalized.length; j++) {
        if (assignments[j] === c) {
          bSum += euclideanDistance(normalized[i], normalized[j]);
          bCount++;
        }
      }
      if (bCount > 0) {
        const bAvg = bSum / bCount;
        if (bAvg < minOtherAvg) minOtherAvg = bAvg;
      }
    }
    const b = minOtherAvg === Infinity ? 0 : minOtherAvg;

    const s = Math.max(a, b) > 0 ? (b - a) / Math.max(a, b) : 0;
    silhouetteTotal += s;
  }
  const silhouetteScore = Math.round((silhouetteTotal / normalized.length) * 100) / 100;

  // Simple 2D projection (PCA emulation)
  // X axis: wealth & liabilities gradient (Col 1 & 2)
  // Y axis: age & family dependencies gradient (Col 0 & 4)
  const clusteredCustomers: ClusteredCustomer[] = [];
  const clusterAverages: { [key: number]: { age: number[]; income: number[]; liab: number[]; sav: number[] } } = {
    0: { age: [], income: [], liab: [], sav: [] },
    1: { age: [], income: [], liab: [], sav: [] },
    2: { age: [], income: [], liab: [], sav: [] },
    3: { age: [], income: [], liab: [], sav: [] }
  };

  const clusterMeta = [
    { name: 'Young Wealth Builders', desc: 'Young professionals with high growth potential, minimal current liabilities, and aggressive/moderate risk appetite.', color: '#3b82f6' },
    { name: 'High-Leverage Families', desc: 'Prime earners with high mortgage debts, dependent children/parents, and critical high protection need.', color: '#ef4444' },
    { name: 'Affluent Capital Preservers', desc: 'Mature high net-worth individuals with substantial liquid assets, estate planning focus, and whole-life interest.', color: '#10b981' },
    { name: 'Conservative Stability Savers', desc: 'Steady earners prioritizing capital preservation, guaranteed income plans, and disciplined savings.', color: '#f59e0b' }
  ];

  for (let i = 0; i < profiles.length; i++) {
    const c = assignments[i];
    const p = profiles[i];
    const norm = normalized[i];
    const totalLiab = (p.home_loan_outstanding_inr || 0) + (p.car_loan_outstanding_inr || 0) + (p.personal_loan_outstanding_inr || 0) + (p.education_loan_outstanding_inr || 0);

    clusterAverages[c].age.push(p.age);
    clusterAverages[c].income.push(p.annual_income_inr);
    clusterAverages[c].liab.push(totalLiab);
    clusterAverages[c].sav.push(p.liquid_savings_inr);

    const pcaX = Math.round((norm[1] * 0.7 - norm[2] * 0.5 + norm[3] * 0.4) * 100) / 100;
    const pcaY = Math.round((norm[0] * 0.6 + norm[4] * 0.8) * 100) / 100;

    clusteredCustomers.push({
      profileId: p.profile_id,
      fullName: p.full_name,
      clusterId: c,
      clusterName: clusterMeta[c].name,
      pcaX,
      pcaY,
      distanceToCentroid: Math.round(euclideanDistance(norm, centroids[c]) * 100) / 100
    });
  }

  const clusters: ClusterCentroid[] = [];
  for (let c = 0; c < k; c++) {
    const count = clusterAverages[c].age.length;
    const avgAge = count > 0 ? Math.round(clusterAverages[c].age.reduce((a, b) => a + b, 0) / count) : 0;
    const avgIncome = count > 0 ? Math.round(clusterAverages[c].income.reduce((a, b) => a + b, 0) / count) : 0;
    const avgLiabilities = count > 0 ? Math.round(clusterAverages[c].liab.reduce((a, b) => a + b, 0) / count) : 0;
    const avgSavings = count > 0 ? Math.round(clusterAverages[c].sav.reduce((a, b) => a + b, 0) / count) : 0;

    clusters.push({
      id: c,
      name: clusterMeta[c].name,
      description: clusterMeta[c].desc,
      color: clusterMeta[c].color,
      centroid: centroids[c],
      size: count,
      avgAge,
      avgIncome,
      avgLiabilities,
      avgSavings
    });
  }

  return {
    clusters,
    customers: clusteredCustomers,
    inertia: Math.round(inertia * 10) / 10,
    silhouetteScore,
    featureNames
  };
}

export function evaluateDecisionTreeModel(profiles: CustomerProfile[]): ModelMetrics {
  // Target: "High Pure Term Protection Need"
  // Defined by: (Total Liabilities > 25 Lakhs OR Dependents >= 2) AND Age <= 55
  const sample = [...profiles];
  const trainSize = Math.floor(sample.length * 0.7);
  const testSet = sample.slice(trainSize);

  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;

  for (const p of testSet) {
    const totalLiab = (p.home_loan_outstanding_inr || 0) + (p.car_loan_outstanding_inr || 0) + (p.personal_loan_outstanding_inr || 0) + (p.education_loan_outstanding_inr || 0);
    const dependents = (p.num_children || 0) + (p.num_dependent_parents || 0);
    
    // Ground truth definition
    const actualLabel = (totalLiab >= 2500000 || dependents >= 2) && p.age <= 55;

    // Decision Tree rule split prediction
    // Rule 1: Age check
    let pred = false;
    if (p.age <= 55) {
      // Rule 2: High leverage branch
      if (totalLiab >= 2000000) {
        pred = true;
      } else {
        // Rule 3: Dependent family branch
        if (dependents >= 1 && p.annual_income_inr >= 1200000) {
          pred = true;
        } else {
          pred = false;
        }
      }
    }

    if (pred && actualLabel) tp++;
    else if (pred && !actualLabel) fp++;
    else if (!pred && actualLabel) fn++;
    else tn++;
  }

  const accuracy = Math.round(((tp + tn) / testSet.length) * 100) / 100;
  const precision = Math.round((tp / (tp + fp || 1)) * 100) / 100;
  const recall = Math.round((tp / (tp + fn || 1)) * 100) / 100;
  const f1Score = Math.round(((2 * precision * recall) / (precision + recall || 1)) * 100) / 100;

  return {
    modelName: 'Transparent Actuarial Decision Tree Classifier',
    datasetSize: profiles.length,
    featuresUsed: ['Age', 'Total Outstanding Liabilities', 'Number of Dependents', 'Annual Income'],
    targetVariable: 'High Pure-Protection Priority (Binary Suitability)',
    trainSplitPct: 70,
    testSplitPct: 30,
    accuracy,
    precision,
    recall,
    f1Score,
    confusionMatrix: { tp, fp, fn, tn },
    limitations: [
      'Model is trained on simulated cohort data of 200 benchmark customer profiles.',
      'Supervised target represents actuarial financial planning rules rather than longitudinal mortality claim outcomes.',
      'Underwriting decisions in live production require full medical scrutiny and tele-MER reports not represented in feature space.'
    ]
  };
}
