/**
 * Anomaly Detection Model
 * Simulates a trained Isolation Forest model for detecting unusual transactions
 */

import type { TrainingTransaction } from "../training-data";
import { trainedCategoryStats } from "./artifacts/anomaly-detector";

export interface AnomalyResult {
  isAnomaly: boolean;
  anomalyScore: number; // 0-1, higher = more anomalous
  reason: string;
  severity: "low" | "medium" | "high";
  suggestedAction?: string;
  dataQuality?: "low" | "medium" | "high";
}

const ANOMALY_THRESHOLD_SCALE = 1.0;
const HARD_ANOMALY_AMOUNT = 1_000_000;
const EXTREME_ANOMALY_MULTIPLIER = 10;

/**
 * Simulated trained Isolation Forest model for anomaly detection
 */
export function detectAnomaly(
  transaction: TrainingTransaction,
  historicalTransactions: TrainingTransaction[]
): AnomalyResult {
  const category = transaction.category;
  const amount = Math.abs(transaction.amount);
  const expenseHistory = historicalTransactions.filter((tx) => tx.type === transaction.type);
  if (expenseHistory.length > 0) {
    const allAmounts = expenseHistory.map((tx) => Math.abs(tx.amount)).sort((a, b) => a - b);
    const medianAll = median(allAmounts);
    if (medianAll > 0 && amount >= medianAll * EXTREME_ANOMALY_MULTIPLIER) {
      return {
        isAnomaly: true,
        anomalyScore: 0.9,
        reason: `Amount (${amount} UGX) is ${EXTREME_ANOMALY_MULTIPLIER}x your typical spend`,
        severity: "high",
        suggestedAction: "Please verify this transaction is correct",
        dataQuality: expenseHistory.length >= 10 ? "medium" : "low",
      };
    }
  }

  if (historicalTransactions.length < 10) {
    if (amount >= HARD_ANOMALY_AMOUNT) {
      return {
        isAnomaly: true,
        anomalyScore: 0.8,
        reason: `Amount (${amount} UGX) is unusually large`,
        severity: "high",
        suggestedAction: "Please verify this transaction is correct",
        dataQuality: "low",
      };
    }
    return {
      isAnomaly: false,
      anomalyScore: 0,
      reason: "Insufficient historical data",
      severity: "low",
      dataQuality: "low",
    };
  }
  const categoryTx = historicalTransactions.filter(
    (tx) => tx.category === category && tx.type === transaction.type
  );
  
  if (categoryTx.length === 0) {
    // New category - could be anomaly
    return {
      isAnomaly: true,
      anomalyScore: 0.6,
      reason: "Transaction in new category",
      severity: "medium",
      suggestedAction: "Verify category is correct",
      dataQuality: "low",
    };
  }
  
  if (categoryTx.length < 5) {
    const trained = trainedCategoryStats[category];
    if (!trained) {
      return {
        isAnomaly: false,
        anomalyScore: 0,
        reason: "Insufficient category history",
        severity: "low",
        dataQuality: "low",
      };
    }

    const zScore = trained.mad > 0
      ? Math.abs(0.6745 * (amount - trained.median) / trained.mad)
      : trained.median === 0
        ? 0
        : Math.abs((amount - trained.median) / trained.median);

    const threshold = trained.p98 ?? trained.p97 ?? trained.p95 ?? trained.p90;
    if (threshold && amount >= threshold * ANOMALY_THRESHOLD_SCALE) {
      return {
        isAnomaly: true,
        anomalyScore: 0.7,
        reason: `Amount (${amount} UGX) is above typical ${category} spending`,
        severity: "medium",
        suggestedAction: "Double-check this transaction",
        dataQuality: "low",
      };
    }

    if (zScore > 3) {
      return {
        isAnomaly: true,
        anomalyScore: Math.min(zScore / 5, 1),
        reason: `Amount (${amount} UGX) is unusual for ${category} based on trained norms`,
        severity: "high",
        suggestedAction: "Please verify this transaction is correct",
        dataQuality: "low",
      };
    }

    if (zScore > 2) {
      return {
        isAnomaly: true,
        anomalyScore: Math.min(zScore / 4, 1),
        reason: `Amount is higher than expected for ${category} based on trained norms`,
        severity: "medium",
        suggestedAction: "Double-check this transaction",
        dataQuality: "low",
      };
    }

    return {
      isAnomaly: false,
      anomalyScore: Math.min(zScore / 3, 1),
      reason: "Limited category history; using trained norms",
      severity: "low",
      dataQuality: "low",
    };
  }
  
  // Calculate statistics for this category
  const amounts = categoryTx.map((tx) => Math.abs(tx.amount));
  const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
  const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  const medianAmount = median(amounts);
  const mad = median(amounts.map((value) => Math.abs(value - medianAmount))) || 0;
  const trained = trainedCategoryStats[category];
  
  // Robust Z-score calculation (MAD) with fallback to standard deviation
  const zScore = mad > 0
    ? Math.abs(0.6745 * (amount - medianAmount) / mad)
    : stdDev === 0
      ? (amount === mean ? 0 : 10)
      : Math.abs((amount - mean) / stdDev);
  
  // Anomaly thresholds
  let isAnomaly = false;
  let severity: "low" | "medium" | "high" = "low";
  let reason = "";
  let anomalyScore = 0;
  
  const threshold = trained?.p98 ?? trained?.p97 ?? trained?.p95 ?? trained?.p90;
  if (threshold && amount >= threshold * ANOMALY_THRESHOLD_SCALE) {
    isAnomaly = true;
    severity = "low";
    reason = `Amount (${amount} UGX) is above typical ${category} spending`;
    anomalyScore = 0.45;
  }

  if (zScore > 3) {
    // Very unusual (3+ standard deviations)
    isAnomaly = true;
    severity = "high";
    reason = `Amount (${amount} UGX) is ${zScore.toFixed(1)}x the average for ${category}`;
    anomalyScore = Math.min(zScore / 5, 1); // Normalize to 0-1
    if (amount > mean * 2) {
      reason += " - Unusually large transaction";
    } else {
      reason += " - Unusually small transaction";
    }
  } else if (zScore > 2) {
    // Moderately unusual
    isAnomaly = true;
    severity = "medium";
    reason = `Amount is ${zScore.toFixed(1)}x the average for ${category}`;
    anomalyScore = zScore / 4;
  } else if (zScore > 1.5) {
    // Slightly unusual
    isAnomaly = true;
    severity = "low";
    reason = `Slightly unusual amount for ${category}`;
    anomalyScore = zScore / 3;
  }
  
  // Check for duplicate transactions (same amount, same day)
  const sameDay = historicalTransactions.filter(
    (tx) =>
      tx.date === transaction.date &&
      Math.abs(Math.abs(tx.amount) - amount) < 10 && // Within 10 UGX
      tx.category === category &&
      tx.type === transaction.type
  );
  
  if (sameDay.length > 1 && !isAnomaly) {
    isAnomaly = true;
    severity = "medium";
    reason = "Possible duplicate transaction";
    anomalyScore = 0.6;
  }
  
  // Check for unusual merchant patterns
  if (transaction.merchant) {
    const merchantTx = historicalTransactions.filter(
      (tx) => tx.merchant?.toLowerCase() === transaction.merchant?.toLowerCase()
    );
    
    if (merchantTx.length === 0 && amount > mean * 1.5) {
      isAnomaly = true;
      severity = "medium";
      reason = `First transaction with ${transaction.merchant} - verify merchant`;
      anomalyScore = Math.max(anomalyScore, 0.5);
    }
  }
  
  let suggestedAction: string | undefined;
  if (isAnomaly && severity === "high") {
    suggestedAction = "Please verify this transaction is correct";
  } else if (isAnomaly && severity === "medium") {
    suggestedAction = "Double-check this transaction";
  }
  
  return {
    isAnomaly,
    anomalyScore: Math.min(anomalyScore, 1),
    reason,
    severity,
    suggestedAction,
    dataQuality: categoryTx.length >= 20 ? "high" : "medium",
  };
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Batch anomaly detection
 */
export function detectAnomalies(
  transactions: TrainingTransaction[],
  historicalTransactions: TrainingTransaction[]
): Array<{ transaction: TrainingTransaction; anomaly: AnomalyResult }> {
  return transactions.map((tx) => ({
    transaction: tx,
    anomaly: detectAnomaly(tx, historicalTransactions),
  }));
}

