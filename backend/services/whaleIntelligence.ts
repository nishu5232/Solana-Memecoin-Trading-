import { WhaleMetrics } from '../types';

export class WhaleIntelligenceEngine {
  private whaleThresholdUsd = 15000; // Configurable threshold for whale definition

  public setWhaleThreshold(thresholdUsd: number) {
    this.whaleThresholdUsd = thresholdUsd;
  }

  public getWhaleThreshold(): number {
    return this.whaleThresholdUsd;
  }

  public evaluateWallets(
    tokenAddress: string,
    existingMetrics?: WhaleMetrics
  ): WhaleMetrics {
    if (existingMetrics) {
      return existingMetrics;
    }

    // Default baseline for fresh tokens
    return {
      tokenAddress,
      whaleCount: 0,
      netWhaleFlowUsd1h: 0,
      topBuyerCount1h: 0,
      topSellerCount1h: 0,
      insiderAccumulationDetected: false,
      coordinatedDumpingRisk: false,
      notableWallets: [],
    };
  }
}

export const whaleEngine = new WhaleIntelligenceEngine();
