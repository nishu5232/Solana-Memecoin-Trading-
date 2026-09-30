import { GoogleGenAI, Type } from '@google/genai';
import {
  AIDecisionResult,
  MarketMetrics,
  PortfolioMetrics,
  Position,
  RiskControlsConfig,
  TokenSecurityReport,
  WhaleMetrics,
} from '../types';
import { QuantitativeAnalysis } from './marketAnalysis';

export class GeminiTradingBrain {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  public async evaluateOpportunity(payload: {
    token: MarketMetrics;
    security: TokenSecurityReport;
    quant: QuantitativeAnalysis;
    whale?: WhaleMetrics;
    portfolio: PortfolioMetrics;
    openPositions: Position[];
    riskLimits: RiskControlsConfig;
  }): Promise<AIDecisionResult> {
    const now = Date.now();

    // Invariant: If security is BLOCKED, brain returns DO_NOT_TRADE immediately without burning API call
    if (payload.security.securityStatus === 'BLOCKED') {
      return {
        action: 'DO_NOT_TRADE',
        confidence: 0.99,
        setup: 'none',
        entryRange: { min: 0, max: 0 },
        stopLoss: 0,
        takeProfit: [],
        riskReward: 0,
        positionSizeUsd: 0,
        maxSlippagePercent: 0,
        timeHorizon: 'none',
        reasoning: [
          'Immediate security failure: Token has hard on-chain security violations.',
          ...payload.security.knownScamFlags,
        ],
        riskFlags: ['TOKEN_SECURITY_HARD_BLOCK'],
        invalidationConditions: ['Security status must be SAFE_TO_ANALYZE or CAUTION'],
        evaluatedAt: now,
      };
    }

    // Invariant: If Kill Switch active, immediately DO_NOT_TRADE
    if (payload.riskLimits.killSwitchTriggered) {
      return {
        action: 'DO_NOT_TRADE',
        confidence: 1.0,
        setup: 'none',
        entryRange: { min: 0, max: 0 },
        stopLoss: 0,
        takeProfit: [],
        riskReward: 0,
        positionSizeUsd: 0,
        maxSlippagePercent: 0,
        timeHorizon: 'none',
        reasoning: ['Kill switch is currently ACTIVE. System will not evaluate or open new positions.'],
        riskFlags: ['KILL_SWITCH_ACTIVE'],
        invalidationConditions: [],
        evaluatedAt: now,
      };
    }

    const currentPrice = payload.token.priceUsd;

    // If Gemini client is not initialized or API key is absent, use strict deterministic fallback analysis
    if (!this.ai || !process.env.GEMINI_API_KEY) {
      return this.deterministicFallbackBrain(payload, 'GEMINI_API_KEY_NOT_CONFIGURED');
    }

    try {
      const prompt = `
You are the AI Quantitative Trading Brain for an autonomous Solana memecoin trading system.
Analyze the structured token telemetry below and determine the optimal action.

TOKEN TELEMETRY:
- Symbol: ${payload.token.symbol} (${payload.token.name})
- Address: ${payload.token.tokenAddress}
- Price USD: $${currentPrice.toFixed(8)}
- 5m Price Change: ${payload.token.priceChange5m.toFixed(2)}%
- 1h Price Change: ${payload.token.priceChange1h.toFixed(2)}%
- 24h Price Change: ${payload.token.priceChange24h.toFixed(2)}%
- 1h Volume: $${payload.token.volume1h.toLocaleString()}
- Buy Volume 1h: $${payload.token.buyVolume1h.toLocaleString()} | Sell Volume 1h: $${payload.token.sellVolume1h.toLocaleString()}
- Buy/Sell Ratio: ${payload.token.buySellRatio1h.toFixed(2)}
- Relative Volume (RVOL): ${payload.token.relativeVolume.toFixed(2)}x
- Liquidity Pool: $${payload.token.liquidityUsd.toLocaleString()}
- Market Cap: $${payload.token.marketCap.toLocaleString()}
- Token Age: ${payload.token.tokenAgeHours.toFixed(1)} hours

SECURITY STATUS:
- Status: ${payload.security.securityStatus} (Score: ${payload.security.score}/100)
- Mint Authority Revoked: ${payload.security.mintAuthorityRevoked}
- Freeze Authority Revoked: ${payload.security.freezeAuthorityRevoked}
- LP Burned/Locked: ${payload.security.lpBurnedOrLockedPercent.toFixed(1)}%
- Top 10 Concentration: ${payload.security.top10HoldersPercent.toFixed(1)}%
- Dev Wallet: ${payload.security.devWalletHoldingPercent.toFixed(1)}%
- Flags: ${JSON.stringify(payload.security.knownScamFlags)}

QUANTITATIVE SIGNALS:
- Trend: ${payload.quant.trend}
- Momentum Score: ${payload.quant.momentumScore} (-100 to +100)
- Breakout Detected: ${payload.quant.breakoutDetected}
- Pullback Detected: ${payload.quant.pullbackDetected}
- Exhaustion Detected: ${payload.quant.momentumExhaustionDetected}
- Estimated Slippage: ${payload.quant.estimatedSlippageAt100Usd}%

PORTFOLIO & RISK LIMITS:
- Portfolio Cash: $${payload.portfolio.cashBalanceUsd.toFixed(2)}
- Current Exposure: ${payload.portfolio.exposurePercent.toFixed(1)}%
- Max Position Size: $${payload.riskLimits.maxPositionSizeUsd}
- Max Allowed Slippage: ${payload.riskLimits.maxAllowedSlippagePercent}%
- Min Risk/Reward: ${payload.riskLimits.minRiskRewardRatio}
- Max Stop Loss: ${payload.riskLimits.maxLossPerTradePercent}%

CRITICAL RULES:
1. You may choose: BUY, WAIT, SELL, EXIT, or DO_NOT_TRADE.
2. Choose WAIT or DO_NOT_TRADE whenever risk is elevated or conditions are mediocre.
3. NEVER promise guaranteed profit. Focus purely on risk-adjusted positive expected value (+EV).
4. If action is BUY:
   - stop_loss must be between 4% and ${payload.riskLimits.maxLossPerTradePercent}% below entry.
   - take_profit array must have 2 to 3 tiers with realistic upside targets and target allocation percentages summing to 100%.
   - risk_reward must be >= ${payload.riskLimits.minRiskRewardRatio}.
   - position_size must be <= $${payload.riskLimits.maxPositionSizeUsd}.
5. Return strictly the schema provided.
`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: {
                type: Type.STRING,
                enum: ['BUY', 'WAIT', 'SELL', 'EXIT', 'DO_NOT_TRADE'],
              },
              confidence: {
                type: Type.NUMBER,
                description: 'Confidence level from 0.0 to 1.0',
              },
              setup: {
                type: Type.STRING,
                enum: [
                  'momentum_breakout',
                  'pullback_retest',
                  'volume_expansion',
                  'whale_accumulation',
                  'liquidity_surge',
                  'reversal_exhaustion',
                  'none',
                ],
              },
              entryRange: {
                type: Type.OBJECT,
                properties: {
                  min: { type: Type.NUMBER },
                  max: { type: Type.NUMBER },
                },
                required: ['min', 'max'],
              },
              stopLoss: { type: Type.NUMBER },
              takeProfit: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    price: { type: Type.NUMBER },
                    percentage: { type: Type.NUMBER },
                  },
                  required: ['price', 'percentage'],
                },
              },
              riskReward: { type: Type.NUMBER },
              positionSizeUsd: { type: Type.NUMBER },
              maxSlippagePercent: { type: Type.NUMBER },
              timeHorizon: {
                type: Type.STRING,
                enum: ['scalp_5m', 'short_term_1h', 'swing_4h', 'none'],
              },
              reasoning: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              riskFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              invalidationConditions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'action',
              'confidence',
              'setup',
              'entryRange',
              'stopLoss',
              'takeProfit',
              'riskReward',
              'positionSizeUsd',
              'maxSlippagePercent',
              'timeHorizon',
              'reasoning',
              'riskFlags',
              'invalidationConditions',
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        return this.deterministicFallbackBrain(payload, 'EMPTY_MODEL_RESPONSE');
      }

      const parsed = JSON.parse(text) as AIDecisionResult;
      parsed.evaluatedAt = now;
      parsed.rawGeminiResponse = text;
      // Mark take profit tiers with hit=false
      parsed.takeProfit = (parsed.takeProfit || []).map((tp) => ({
        price: tp.price,
        percentage: tp.percentage,
        hit: false,
      }));

      return parsed;
    } catch (err: any) {
      console.error('Gemini API evaluation error:', err?.message || err);
      return this.deterministicFallbackBrain(payload, `API_ERROR_${err?.message || 'UNKNOWN'}`);
    }
  }

  /**
   * Deterministic mathematical fallback brain when offline or handling cold boot.
   */
  public deterministicFallbackBrain(
    payload: {
      token: MarketMetrics;
      security: TokenSecurityReport;
      quant: QuantitativeAnalysis;
      portfolio: PortfolioMetrics;
      riskLimits: RiskControlsConfig;
    },
    note?: string
  ): AIDecisionResult {
    const currentPrice = payload.token.priceUsd;
    const isSecuritySafe = payload.security.securityStatus === 'SAFE_TO_ANALYZE';
    const isMomentumPositive = payload.quant.momentumScore > 15;
    const hasBuyFlow = payload.token.buySellRatio1h > 1.15;
    const hasRvol = payload.token.relativeVolume > 1.1;
    const hasLiquidity = payload.token.liquidityUsd >= payload.riskLimits.minLiquidityUsd;

    const qualifiesForBuy = 
      isSecuritySafe && 
      isMomentumPositive && 
      hasBuyFlow && 
      hasRvol && 
      hasLiquidity && 
      !payload.quant.momentumExhaustionDetected;

    if (qualifiesForBuy) {
      const stopLoss = Number((currentPrice * 0.92).toFixed(8)); // 8% SL
      const tp1 = Number((currentPrice * 1.12).toFixed(8)); // +12% TP1
      const tp2 = Number((currentPrice * 1.25).toFixed(8)); // +25% TP2
      const tp3 = Number((currentPrice * 1.45).toFixed(8)); // +45% TP3
      const riskReward = 2.4;
      const positionSizeUsd = Math.min(payload.riskLimits.maxPositionSizeUsd, 100);

      return {
        action: 'BUY',
        confidence: 0.81,
        setup: payload.quant.breakoutDetected ? 'momentum_breakout' : 'volume_expansion',
        entryRange: {
          min: Number((currentPrice * 0.995).toFixed(8)),
          max: Number((currentPrice * 1.008).toFixed(8)),
        },
        stopLoss,
        takeProfit: [
          { price: tp1, percentage: 33, hit: false },
          { price: tp2, percentage: 33, hit: false },
          { price: tp3, percentage: 34, hit: false },
        ],
        riskReward,
        positionSizeUsd,
        maxSlippagePercent: 1.5,
        timeHorizon: 'short_term_1h',
        reasoning: [
          'High relative volume (>1.1x) combined with positive short-term momentum and healthy buy flow.',
          'Token passed verified security audit: mint and freeze revoked, LP locked.',
          note ? `Evaluated under fallback mode (${note})` : 'System rules confirmed positive expected value.',
        ],
        riskFlags: payload.security.knownScamFlags.length > 0 ? payload.security.knownScamFlags : ['NONE'],
        invalidationConditions: [
          '5m price breaks below short-term support stop loss',
          'Buy/Sell ratio drops below 0.90',
        ],
        evaluatedAt: Date.now(),
      };
    }

    return {
      action: 'WAIT',
      confidence: 0.75,
      setup: 'none',
      entryRange: { min: 0, max: 0 },
      stopLoss: 0,
      takeProfit: [],
      riskReward: 0,
      positionSizeUsd: 0,
      maxSlippagePercent: 0,
      timeHorizon: 'none',
      reasoning: [
        'Conditions do not meet strict risk-adjusted expected value criteria.',
        !isSecuritySafe ? `Security status is ${payload.security.securityStatus}` : '',
        !hasBuyFlow ? `Buy/Sell volume ratio (${payload.token.buySellRatio1h.toFixed(2)}) is insufficient` : '',
        !isMomentumPositive ? `Momentum score (${payload.quant.momentumScore}) below entry threshold` : '',
      ].filter(Boolean),
      riskFlags: payload.security.knownScamFlags,
      invalidationConditions: ['Wait for volume breakout or retest of base support'],
      evaluatedAt: Date.now(),
    };
  }
}

export const geminiBrain = new GeminiTradingBrain();
