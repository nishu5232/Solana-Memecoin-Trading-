import { MarketMetrics } from '../types';

export interface QuantitativeAnalysis {
  tokenAddress: string;
  momentumScore: number; // -100 to +100
  trend: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  relativeVolumeState: 'EXTREME' | 'HIGH' | 'NORMAL' | 'LOW';
  volumePressure: 'BUY_HEAVY' | 'BALANCED' | 'SELL_HEAVY';
  volatilityRegime: 'LOW' | 'EXPANDING' | 'EXTREME';
  breakoutDetected: boolean;
  pullbackDetected: boolean;
  momentumExhaustionDetected: boolean;
  liquidityQualityScore: number; // 0 to 100
  estimatedSlippageAt100Usd: number;
  signals: string[];
}

export class MarketAnalysisEngine {
  public analyze(metrics: MarketMetrics): QuantitativeAnalysis {
    const signals: string[] = [];

    // 1. Momentum Score Calculation
    // Weighted combination of 5m (40%), 1h (40%), 24h (20%)
    const rawScore = 
      metrics.priceChange5m * 4.0 + 
      metrics.priceChange1h * 1.5 + 
      metrics.priceChange24h * 0.2;
    const momentumScore = Math.max(-100, Math.min(100, Math.round(rawScore)));

    let trend: QuantitativeAnalysis['trend'] = 'NEUTRAL';
    if (momentumScore > 35) {
      trend = 'STRONG_BULLISH';
      signals.push('Strong positive momentum across short-term timeframes');
    } else if (momentumScore > 10) {
      trend = 'BULLISH';
      signals.push('Moderate upward price drift');
    } else if (momentumScore < -35) {
      trend = 'STRONG_BEARISH';
      signals.push('Severe downward selling cascade');
    } else if (momentumScore < -10) {
      trend = 'BEARISH';
      signals.push('Mild negative downward pressure');
    }

    // 2. Relative Volume (RVOL)
    let relativeVolumeState: QuantitativeAnalysis['relativeVolumeState'] = 'NORMAL';
    if (metrics.relativeVolume >= 2.0) {
      relativeVolumeState = 'EXTREME';
      signals.push(`Extreme volume surge (RVOL: ${metrics.relativeVolume.toFixed(2)}x)`);
    } else if (metrics.relativeVolume >= 1.3) {
      relativeVolumeState = 'HIGH';
      signals.push(`Elevated participation volume (RVOL: ${metrics.relativeVolume.toFixed(2)}x)`);
    } else if (metrics.relativeVolume < 0.7) {
      relativeVolumeState = 'LOW';
      signals.push('Anemic trading volume below baseline');
    }

    // 3. Buy/Sell Pressure
    let volumePressure: QuantitativeAnalysis['volumePressure'] = 'BALANCED';
    if (metrics.buySellRatio1h >= 1.4) {
      volumePressure = 'BUY_HEAVY';
      signals.push(`Dominant buy flow (Buy/Sell: ${metrics.buySellRatio1h.toFixed(2)})`);
    } else if (metrics.buySellRatio1h <= 0.7) {
      volumePressure = 'SELL_HEAVY';
      signals.push(`Sellers dominating order flow (Buy/Sell: ${metrics.buySellRatio1h.toFixed(2)})`);
    }

    // 4. Volatility Regime
    let volatilityRegime: QuantitativeAnalysis['volatilityRegime'] = 'LOW';
    if (metrics.volatility1h > 15) {
      volatilityRegime = 'EXTREME';
      signals.push('Extreme 1-hour realized volatility');
    } else if (metrics.volatility1h > 6) {
      volatilityRegime = 'EXPANDING';
    }

    // 5. Breakout & Pullback Patterns
    const breakoutDetected = 
      metrics.priceChange5m > 1.5 && 
      metrics.volumeAcceleration > 1.2 && 
      metrics.buySellRatio1h > 1.25;

    const pullbackDetected = 
      metrics.priceChange1h > 3.0 && 
      metrics.priceChange5m < -0.2 && 
      metrics.priceChange5m > -1.8 && 
      metrics.buySellRatio1h > 1.1;

    const momentumExhaustionDetected = 
      metrics.priceChange1h > 20.0 && 
      metrics.buySellRatio1h < 1.0 && 
      metrics.volumeAcceleration < 0.9;

    if (breakoutDetected) signals.push('Setup Detected: Fresh momentum breakout with volume expansion');
    if (pullbackDetected) signals.push('Setup Detected: Controlled pullback to 1h moving support');
    if (momentumExhaustionDetected) signals.push('Risk Warning: Potential momentum exhaustion / blow-off top');

    // 6. Liquidity Quality
    // Healthy memecoins usually have 5% - 20% liquidity-to-market-cap ratio
    const liqRatio = metrics.marketCap > 0 ? (metrics.liquidityUsd / metrics.marketCap) * 100 : 0;
    let liquidityQualityScore = Math.min(100, Math.round(liqRatio * 5));
    if (metrics.liquidityUsd < 20000) liquidityQualityScore = 15;
    else if (metrics.liquidityUsd > 1000000) liquidityQualityScore = Math.max(85, liquidityQualityScore);

    // 7. Slippage Estimation for standard $100 trade
    const estimatedSlippageAt100Usd = Math.max(
      0.05, 
      Number(((100 / Math.max(1000, metrics.liquidityUsd)) * 100 * 1.5).toFixed(3))
    );

    return {
      tokenAddress: metrics.tokenAddress,
      momentumScore,
      trend,
      relativeVolumeState,
      volumePressure,
      volatilityRegime,
      breakoutDetected,
      pullbackDetected,
      momentumExhaustionDetected,
      liquidityQualityScore,
      estimatedSlippageAt100Usd,
      signals,
    };
  }
}

export const marketAnalysisEngine = new MarketAnalysisEngine();
