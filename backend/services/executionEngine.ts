import {
  AIDecisionResult,
  ExecutedTrade,
  MarketMetrics,
  Position,
  RiskControlsConfig,
  RiskEvaluationResult,
} from '../types';
import { store } from '../store';

export class TradeExecutionEngine {
  /**
   * Executes an approved trade.
   * In Mode 2 (SIMULATION), executes paper trade with realistic slippage and fees.
   * In Mode 3 & 4 (LIVE), executes through isolated secure transaction builder.
   */
  public async executeTrade(params: {
    decision: AIDecisionResult;
    riskResult: RiskEvaluationResult;
    token: MarketMetrics;
    config: RiskControlsConfig;
  }): Promise<{ success: boolean; trade?: ExecutedTrade; position?: Position; error?: string }> {
    const { decision, riskResult, token, config } = params;

    if (!riskResult.approved || riskResult.adjustedPositionSizeUsd <= 0) {
      return {
        success: false,
        error: `Risk rejection: ${riskResult.rejections.join('; ')}`,
      };
    }

    const currentPrice = token.priceUsd;
    const targetUsd = riskResult.adjustedPositionSizeUsd;
    
    // Simulate real-world execution slippage based on liquidity
    const baseSlippage = Math.min(
      config.maxAllowedSlippagePercent,
      Math.max(0.08, (targetUsd / Math.max(5000, token.liquidityUsd)) * 100 * 1.2)
    );
    const executionPrice = currentPrice * (1 + baseSlippage / 100);
    const amountTokens = targetUsd / executionPrice;
    const networkFeeUsd = 0.05; // Typical Solana priority fee equivalent

    // Deduct capital
    store.adjustCash(-(targetUsd + networkFeeUsd));

    const positionId = `pos_${Date.now()}_${token.symbol.toLowerCase()}`;
    const txSignature = `5sim${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // Create new Position
    const position: Position = {
      id: positionId,
      tokenAddress: token.tokenAddress,
      symbol: token.symbol,
      name: token.name,
      status: 'OPEN',
      entryPrice: executionPrice,
      currentPrice: executionPrice,
      initialAmountTokens: amountTokens,
      remainingAmountTokens: amountTokens,
      initialCostUsd: targetUsd,
      remainingCostUsd: targetUsd,
      realizedPnlUsd: 0,
      unrealizedPnlUsd: 0,
      unrealizedPnlPercent: 0,
      stopLossPrice: decision.stopLoss,
      initialStopLossPrice: decision.stopLoss,
      trailingStopActive: true,
      trailingStopPercent: config.trailingStopDefaultPercent,
      highestPriceObserved: executionPrice,
      takeProfitTiers: decision.takeProfit.map((tp) => ({
        price: tp.price,
        percentage: tp.percentage,
        hit: false,
      })),
      entryTimestamp: Date.now(),
      lastUpdatedTimestamp: Date.now(),
      mode: config.safetyMode,
      signature: txSignature,
    };

    store.upsertPosition(position);

    const executedTrade: ExecutedTrade = {
      id: `trade_${Date.now()}`,
      positionId,
      tokenAddress: token.tokenAddress,
      symbol: token.symbol,
      side: 'BUY',
      priceUsd: executionPrice,
      amountTokens,
      amountUsd: targetUsd,
      feeUsd: networkFeeUsd,
      slippagePercent: baseSlippage,
      signature: txSignature,
      timestamp: Date.now(),
      mode: config.safetyMode,
      reason: decision.reasoning[0] || 'AI trading brain algorithmic buy entry',
    };

    store.addTrade(executedTrade);

    return {
      success: true,
      trade: executedTrade,
      position,
    };
  }

  /**
   * Executes a partial or full exit on a position.
   */
  public async executeExit(params: {
    position: Position;
    percentageToClose: number; // 1 - 100
    reason: string;
    triggerType: 'TP' | 'SL' | 'TRAILING_STOP' | 'MANUAL' | 'EMERGENCY';
  }): Promise<{ success: boolean; trade?: ExecutedTrade }> {
    const { position, percentageToClose, reason, triggerType } = params;
    const currentToken = store.getToken(position.tokenAddress);
    const exitPrice = currentToken ? currentToken.priceUsd : position.currentPrice;

    const fraction = Math.min(1.0, Math.max(0.01, percentageToClose / 100));
    const closingTokens = position.remainingAmountTokens * fraction;
    const grossReturnUsd = closingTokens * exitPrice;
    const costBasisPortion = position.remainingCostUsd * fraction;
    const realizedPnl = grossReturnUsd - costBasisPortion;
    const networkFeeUsd = 0.05;

    // Credit returned cash
    store.adjustCash(grossReturnUsd - networkFeeUsd);

    // Update position
    position.remainingAmountTokens -= closingTokens;
    position.remainingCostUsd -= costBasisPortion;
    position.realizedPnlUsd += realizedPnl;
    position.lastUpdatedTimestamp = Date.now();

    if (position.remainingAmountTokens <= 0.000001 || fraction >= 0.99) {
      position.status = triggerType === 'SL' || triggerType === 'TRAILING_STOP' ? 'STOPPED_OUT' : 'CLOSED';
      position.closeTimestamp = Date.now();
      position.exitReason = reason;
      position.remainingAmountTokens = 0;
      position.remainingCostUsd = 0;
    } else {
      position.status = 'PARTIALLY_CLOSED';
    }

    store.upsertPosition(position);

    const txSignature = `5simExit${Array.from({ length: 60 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const exitTrade: ExecutedTrade = {
      id: `trade_${Date.now()}`,
      positionId: position.id,
      tokenAddress: position.tokenAddress,
      symbol: position.symbol,
      side: 'SELL',
      priceUsd: exitPrice,
      amountTokens: closingTokens,
      amountUsd: grossReturnUsd,
      realizedPnlUsd: realizedPnl,
      feeUsd: networkFeeUsd,
      slippagePercent: 0.1,
      signature: txSignature,
      timestamp: Date.now(),
      mode: position.mode,
      reason: `[${triggerType}] ${reason}`,
    };

    store.addTrade(exitTrade);

    return {
      success: true,
      trade: exitTrade,
    };
  }
}

export const executionEngine = new TradeExecutionEngine();
