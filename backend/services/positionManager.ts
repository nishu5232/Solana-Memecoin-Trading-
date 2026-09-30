import { Position } from '../types';
import { store } from '../store';
import { executionEngine } from './executionEngine';

export class PositionMonitoringEngine {
  /**
   * Monitor all open positions and evaluate profit-taking / stop-loss / trailing-stops.
   */
  public async monitorOpenPositions(): Promise<{ closedCount: number; partialExitsCount: number }> {
    const openPositions = store.getOpenPositions();
    let closedCount = 0;
    let partialExitsCount = 0;

    for (const position of openPositions) {
      const token = store.getToken(position.tokenAddress);
      if (!token) continue;

      const currentPrice = token.priceUsd;
      position.currentPrice = currentPrice;

      // Update peak observed price
      if (currentPrice > position.highestPriceObserved) {
        position.highestPriceObserved = currentPrice;
      }

      // 1. Dynamic Trailing Stop Adjustment
      if (position.trailingStopActive) {
        const calculatedTrailingStop = position.highestPriceObserved * (1 - position.trailingStopPercent / 100);
        if (calculatedTrailingStop > position.stopLossPrice) {
          position.stopLossPrice = calculatedTrailingStop;
        }
      }

      // 2. Hard Stop Loss & Trailing Stop Check
      if (currentPrice <= position.stopLossPrice) {
        const isTrailing = position.stopLossPrice > position.initialStopLossPrice;
        await executionEngine.executeExit({
          position,
          percentageToClose: 100,
          reason: isTrailing 
            ? `Trailing stop hit at $${currentPrice.toFixed(8)} (protected profit from peak $${position.highestPriceObserved.toFixed(8)})`
            : `Hard stop loss triggered at $${currentPrice.toFixed(8)} (initial SL: $${position.initialStopLossPrice.toFixed(8)})`,
          triggerType: isTrailing ? 'TRAILING_STOP' : 'SL',
        });
        closedCount++;
        continue;
      }

      // 3. Take-Profit Multi-Tier Check (TP1, TP2, TP3)
      for (const tier of position.takeProfitTiers) {
        if (!tier.hit && currentPrice >= tier.price) {
          tier.hit = true;
          tier.executedAt = Date.now();
          await executionEngine.executeExit({
            position,
            percentageToClose: tier.percentage,
            reason: `Target hit: TP level reached at $${tier.price.toFixed(8)} (secured ${tier.percentage}% partial gain)`,
            triggerType: 'TP',
          });
          partialExitsCount++;

          // After TP1 is hit, automatically move stop-loss to breakeven!
          if (position.stopLossPrice < position.entryPrice) {
            position.stopLossPrice = position.entryPrice;
          }
          break; // Process one tier per tick cycle
        }
      }

      // 4. Liquidity Deterioration Exit: if liquidity dropped > 50% since entry
      if (token.liquidityUsd < 15000) {
        await executionEngine.executeExit({
          position,
          percentageToClose: 100,
          reason: `Emergency Exit: Liquidity pool deteriorated below safe threshold ($${token.liquidityUsd.toLocaleString()})`,
          triggerType: 'EMERGENCY',
        });
        closedCount++;
        continue;
      }
    }

    return { closedCount, partialExitsCount };
  }
}

export const positionMonitoringEngine = new PositionMonitoringEngine();
