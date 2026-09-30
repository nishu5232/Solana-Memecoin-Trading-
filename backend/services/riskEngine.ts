import {
  AIDecisionResult,
  MarketMetrics,
  PortfolioMetrics,
  Position,
  RiskControlsConfig,
  RiskEvaluationResult,
  TokenSecurityReport,
} from '../types';

export class DeterministicRiskEngine {
  /**
   * Deterministically validates whether a proposed AI decision can be executed.
   * If any risk rule fails, the trade is rejected unconditionally.
   */
  public evaluate(params: {
    decision: AIDecisionResult;
    token: MarketMetrics;
    security: TokenSecurityReport;
    portfolio: PortfolioMetrics;
    openPositions: Position[];
    config: RiskControlsConfig;
  }): RiskEvaluationResult {
    const { decision, token, security, portfolio, openPositions, config } = params;
    const rejections: string[] = [];
    const reasons: string[] = [];
    let riskScore = 10; // Base baseline risk

    // 1. Kill Switch Check
    if (config.killSwitchTriggered) {
      rejections.push('REJECT: Emergency Kill Switch is ACTIVE. All trading halted.');
      return {
        approved: false,
        reasons,
        rejections,
        adjustedPositionSizeUsd: 0,
        riskScore: 100,
        evaluatedAt: Date.now(),
      };
    }

    // 2. Safety Mode Check
    if (config.safetyMode === '1_ANALYSIS_ONLY') {
      rejections.push('REJECT: Operating in Mode 1 (ANALYSIS ONLY). No execution permitted.');
    }

    // 3. Action Check
    if (decision.action !== 'BUY') {
      rejections.push(`REJECT: Decision action is ${decision.action}, not BUY.`);
    }

    // 4. Hard Security Status Check
    if (security.securityStatus === 'BLOCKED') {
      rejections.push('REJECT: Token Security Status is BLOCKED. Cannot override.');
      riskScore += 90;
    } else if (security.securityStatus === 'HIGH_RISK') {
      rejections.push('REJECT: Token Security Status is HIGH_RISK. Capital preservation rule triggered.');
      riskScore += 50;
    }

    // 5. Minimum Liquidity Check
    if (token.liquidityUsd < config.minLiquidityUsd) {
      rejections.push(
        `REJECT: Liquidity ($${token.liquidityUsd.toLocaleString()}) is below minimum requirement ($${config.minLiquidityUsd.toLocaleString()}).`
      );
      riskScore += 30;
    }

    // 6. Max Concurrent Positions Check
    const activePositionsForToken = openPositions.filter(
      (p) => p.tokenAddress === token.tokenAddress && (p.status === 'OPEN' || p.status === 'PARTIALLY_CLOSED')
    );
    if (activePositionsForToken.length > 0) {
      rejections.push(`REJECT: Duplicate position already open for token ${token.symbol}.`);
    }

    if (openPositions.length >= config.maxConcurrentPositions) {
      rejections.push(
        `REJECT: Concurrent open positions (${openPositions.length}) has reached max limit (${config.maxConcurrentPositions}).`
      );
    }

    // 7. Daily Loss Limit Check
    if (portfolio.dailyRealizedPnlUsd <= -config.maxDailyLossUsd) {
      rejections.push(
        `REJECT: Daily loss circuit breaker hit ($${Math.abs(portfolio.dailyRealizedPnlUsd).toFixed(2)} / limit $${config.maxDailyLossUsd}).`
      );
      riskScore += 40;
    }

    // 8. Max Portfolio Exposure Check
    if (portfolio.exposurePercent >= config.maxPortfolioExposurePercent) {
      rejections.push(
        `REJECT: Portfolio exposure (${portfolio.exposurePercent.toFixed(1)}%) is at or exceeds max ceiling (${config.maxPortfolioExposurePercent}%).`
      );
    }

    // 9. Stale Market Data Check (data older than 180 seconds)
    const dataAgeSeconds = (Date.now() - token.updatedAt) / 1000;
    if (dataAgeSeconds > 180) {
      rejections.push(`REJECT: Market data is stale (${dataAgeSeconds.toFixed(0)}s old > 180s threshold).`);
    }

    // 10. Risk/Reward Ratio Check
    if (decision.riskReward < config.minRiskRewardRatio) {
      rejections.push(
        `REJECT: Proposed Risk/Reward ratio (${decision.riskReward.toFixed(2)}) is below minimum threshold (${config.minRiskRewardRatio}).`
      );
    }

    // 11. Slippage Tolerance Check
    if (decision.maxSlippagePercent > config.maxAllowedSlippagePercent) {
      rejections.push(
        `REJECT: Requested slippage (${decision.maxSlippagePercent}%) exceeds system maximum (${config.maxAllowedSlippagePercent}%).`
      );
    }

    // 12. Sizing and Balance Validation
    let adjustedSize = Math.min(decision.positionSizeUsd, config.maxPositionSizeUsd);
    // Position sizing cannot exceed available cash (leave $5 for transaction fees)
    const maxAffordable = Math.max(0, portfolio.cashBalanceUsd - 5.0);
    if (adjustedSize > maxAffordable) {
      adjustedSize = maxAffordable;
    }

    if (adjustedSize < 10.0) {
      rejections.push(`REJECT: Insufficient wallet balance for minimum viable position size (available: $${portfolio.cashBalanceUsd.toFixed(2)}).`);
    }

    // 13. Stop Loss sanity check
    if (decision.stopLoss >= token.priceUsd) {
      rejections.push(`REJECT: Invalid stop loss ($${decision.stopLoss}) at or above entry price ($${token.priceUsd}).`);
    } else {
      const stopDistancePercent = ((token.priceUsd - decision.stopLoss) / token.priceUsd) * 100;
      if (stopDistancePercent > config.maxLossPerTradePercent) {
        rejections.push(
          `REJECT: Stop loss distance (${stopDistancePercent.toFixed(1)}%) exceeds max allowed risk per trade (${config.maxLossPerTradePercent}%).`
        );
      }
    }

    const approved = rejections.length === 0;

    if (approved) {
      reasons.push('Risk checks passed: Liquidity, slippage, exposure, security and portfolio limits confirmed.');
      reasons.push(`Allocating controlled position size: $${adjustedSize.toFixed(2)} USD.`);
      riskScore = Math.min(45, riskScore);
    }

    return {
      approved,
      reasons,
      rejections,
      adjustedPositionSizeUsd: approved ? adjustedSize : 0,
      riskScore: Math.min(100, riskScore),
      evaluatedAt: Date.now(),
    };
  }
}

export const riskEngine = new DeterministicRiskEngine();
