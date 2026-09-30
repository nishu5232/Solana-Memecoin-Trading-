/**
 * Core domain types for the Solana AI Memecoin Trading Agent
 */

export type SafetyMode = 
  | '1_ANALYSIS_ONLY' 
  | '2_SIMULATION' 
  | '3_LIMITED_LIVE' 
  | '4_AUTONOMOUS_LIVE';

export type SecurityStatus = 
  | 'SAFE_TO_ANALYZE' 
  | 'CAUTION' 
  | 'HIGH_RISK' 
  | 'BLOCKED';

export type AIAction = 
  | 'BUY' 
  | 'WAIT' 
  | 'SELL' 
  | 'EXIT' 
  | 'DO_NOT_TRADE';

export type TradeSetup = 
  | 'momentum_breakout' 
  | 'pullback_retest' 
  | 'volume_expansion' 
  | 'whale_accumulation' 
  | 'liquidity_surge' 
  | 'reversal_exhaustion' 
  | 'none';

export interface TokenSecurityReport {
  tokenAddress: string;
  symbol: string;
  mintAuthorityRevoked: boolean;
  freezeAuthorityRevoked: boolean;
  lpBurnedOrLockedPercent: number;
  top10HoldersPercent: number;
  devWalletHoldingPercent: number;
  isHoneypotSuspect: boolean;
  transferFeePercent: number;
  knownScamFlags: string[];
  securityStatus: SecurityStatus;
  score: number; // 0 - 100
  evaluatedAt: number;
}

export interface MarketMetrics {
  tokenAddress: string;
  symbol: string;
  name: string;
  priceUsd: number;
  marketCap: number;
  liquidityUsd: number;
  volume5m: number;
  volume15m: number;
  volume1h: number;
  volume24h: number;
  buyVolume1h: number;
  sellVolume1h: number;
  buySellRatio1h: number;
  priceChange5m: number;
  priceChange1h: number;
  priceChange24h: number;
  txCount1h: number;
  holderCount: number;
  relativeVolume: number; // RVOL vs 24h baseline
  volumeAcceleration: number; // Rate of change in 5m vs 1h
  volatility1h: number;
  priceImpactPercentEstimate: number;
  dex: string;
  pairAddress: string;
  tokenAgeHours: number;
  updatedAt: number;
}

export interface WhaleMetrics {
  tokenAddress: string;
  whaleCount: number;
  netWhaleFlowUsd1h: number;
  topBuyerCount1h: number;
  topSellerCount1h: number;
  insiderAccumulationDetected: boolean;
  coordinatedDumpingRisk: boolean;
  notableWallets: {
    address: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    amountUsd: number;
    timestamp: number;
  }[];
}

export interface TakeProfitTier {
  price: number;
  percentage: number; // % of position to close (e.g. 25)
  hit: boolean;
  executedAt?: number;
}

export interface AIDecisionResult {
  action: AIAction;
  confidence: number; // 0.0 - 1.0
  setup: TradeSetup;
  entryRange: {
    min: number;
    max: number;
  };
  stopLoss: number;
  takeProfit: TakeProfitTier[];
  riskReward: number;
  positionSizeUsd: number;
  maxSlippagePercent: number;
  timeHorizon: 'scalp_5m' | 'short_term_1h' | 'swing_4h' | 'none';
  reasoning: string[];
  riskFlags: string[];
  invalidationConditions: string[];
  rawGeminiResponse?: string;
  evaluatedAt: number;
}

export interface RiskEvaluationResult {
  approved: boolean;
  reasons: string[];
  rejections: string[];
  adjustedPositionSizeUsd: number;
  riskScore: number; // 0 (safest) - 100 (highest risk)
  evaluatedAt: number;
}

export interface Position {
  id: string;
  tokenAddress: string;
  symbol: string;
  name: string;
  status: 'OPEN' | 'PARTIALLY_CLOSED' | 'CLOSED' | 'STOPPED_OUT';
  entryPrice: number;
  currentPrice: number;
  initialAmountTokens: number;
  remainingAmountTokens: number;
  initialCostUsd: number;
  remainingCostUsd: number;
  realizedPnlUsd: number;
  unrealizedPnlUsd: number;
  unrealizedPnlPercent: number;
  stopLossPrice: number;
  initialStopLossPrice: number;
  trailingStopActive: boolean;
  trailingStopPercent: number;
  highestPriceObserved: number;
  takeProfitTiers: TakeProfitTier[];
  entryTimestamp: number;
  lastUpdatedTimestamp: number;
  closeTimestamp?: number;
  mode: SafetyMode;
  signature?: string;
  exitReason?: string;
}

export interface ExecutedTrade {
  id: string;
  positionId: string;
  tokenAddress: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  priceUsd: number;
  amountTokens: number;
  amountUsd: number;
  realizedPnlUsd?: number;
  feeUsd: number;
  slippagePercent: number;
  signature: string;
  timestamp: number;
  mode: SafetyMode;
  reason: string;
}

export interface AIDecisionLog {
  id: string;
  timestamp: number;
  tokenAddress: string;
  symbol: string;
  marketSnapshot: {
    priceUsd: number;
    liquidityUsd: number;
    marketCap: number;
    volume1h: number;
    buySellRatio: number;
  };
  securityResult: {
    status: SecurityStatus;
    score: number;
  };
  aiDecision: AIDecisionResult;
  riskResult: RiskEvaluationResult;
  executed: boolean;
  tradeId?: string;
  rejectionReason?: string;
}

export interface RiskControlsConfig {
  maxPositionSizeUsd: number;
  maxPortfolioExposurePercent: number;
  maxDailyLossUsd: number;
  maxLossPerTradePercent: number;
  maxConcurrentPositions: number;
  maxAllowedSlippagePercent: number;
  minLiquidityUsd: number;
  minRiskRewardRatio: number;
  minHolderCount: number;
  maxTop10ConcentrationPercent: number;
  minTokenAgeHours: number;
  trailingStopDefaultPercent: number;
  killSwitchTriggered: boolean;
  safetyMode: SafetyMode;
  requireSimulatedSimulationPass: boolean;
}

export interface ScannerFilterConfig {
  minLiquidityUsd: number;
  maxMarketCapUsd: number;
  minVolume1hUsd: number;
  minBuySellRatio: number;
  maxTop10ConcentrationPercent: number;
  minTokenAgeHours: number;
  minTransactionCount1h: number;
  requireRevokedMint: boolean;
  requireRevokedFreeze: boolean;
}

export interface PortfolioMetrics {
  totalBalanceUsd: number;
  cashBalanceUsd: number;
  allocatedExposureUsd: number;
  exposurePercent: number;
  unrealizedPnlUsd: number;
  realizedPnlUsd: number;
  dailyRealizedPnlUsd: number;
  totalPnlUsd: number;
  totalTradesCount: number;
  winningTradesCount: number;
  losingTradesCount: number;
  winRatePercent: number;
  averageWinUsd: number;
  averageLossUsd: number;
  profitFactor: number;
  maxDrawdownPercent: number;
  totalFeesPaidUsd: number;
  averageHoldDurationMinutes: number;
  activePositionsCount: number;
  lastUpdated: number;
}

export interface AgentStatus {
  isRunning: boolean;
  status: 'IDLE' | 'SCANNING' | 'ANALYZING' | 'EXECUTING' | 'PAUSED' | 'EMERGENCY_STOP';
  currentCycle: number;
  lastScanTimestamp: number;
  lastDecisionTimestamp: number;
  safetyMode: SafetyMode;
  activePositionsCount: number;
  processedTokensCount: number;
  killSwitchActive: boolean;
  solanaRpcHealthy: boolean;
  geminiApiHealthy: boolean;
  errorMessage?: string;
}
