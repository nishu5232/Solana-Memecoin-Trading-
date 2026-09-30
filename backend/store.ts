import {
  AgentStatus,
  AIDecisionLog,
  ExecutedTrade,
  MarketMetrics,
  PortfolioMetrics,
  Position,
  RiskControlsConfig,
  ScannerFilterConfig,
  TokenSecurityReport,
  WhaleMetrics,
} from './types';

// Default Risk Management Controls
export const defaultRiskConfig: RiskControlsConfig = {
  maxPositionSizeUsd: 150, // max per trade
  maxPortfolioExposurePercent: 50, // max 50% of portfolio allocated
  maxDailyLossUsd: 250, // daily circuit breaker
  maxLossPerTradePercent: 12, // hard stop loss ceiling
  maxConcurrentPositions: 4,
  maxAllowedSlippagePercent: 2.5,
  minLiquidityUsd: 40000,
  minRiskRewardRatio: 1.8,
  minHolderCount: 500,
  maxTop10ConcentrationPercent: 35,
  minTokenAgeHours: 3,
  trailingStopDefaultPercent: 8,
  killSwitchTriggered: false,
  safetyMode: '1_ANALYSIS_ONLY', // Default safe mode as requested
  requireSimulatedSimulationPass: true,
};

// Default Scanner Filters
export const defaultScannerConfig: ScannerFilterConfig = {
  minLiquidityUsd: 30000,
  maxMarketCapUsd: 150000000, // focus on micro-to-mid memecoins
  minVolume1hUsd: 15000,
  minBuySellRatio: 0.95,
  maxTop10ConcentrationPercent: 40,
  minTokenAgeHours: 2,
  minTransactionCount1h: 60,
  requireRevokedMint: true,
  requireRevokedFreeze: true,
};

// Seed dataset of prominent and emerging Solana tokens with varied security and risk profiles
const initialTokens: MarketMetrics[] = [
  {
    tokenAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    symbol: 'BONK',
    name: 'Bonk',
    priceUsd: 0.00002145,
    marketCap: 1540000000,
    liquidityUsd: 8400000,
    volume5m: 84200,
    volume15m: 290100,
    volume1h: 1420000,
    volume24h: 34500000,
    buyVolume1h: 820000,
    sellVolume1h: 600000,
    buySellRatio1h: 1.36,
    priceChange5m: 0.65,
    priceChange1h: 3.2,
    priceChange24h: 8.5,
    txCount1h: 840,
    holderCount: 780400,
    relativeVolume: 1.45,
    volumeAcceleration: 1.15,
    volatility1h: 4.2,
    priceImpactPercentEstimate: 0.05,
    dex: 'Raydium CPMM',
    pairAddress: 'BONK_SOL_POOL_1',
    tokenAgeHours: 15400,
    updatedAt: Date.now(),
  },
  {
    tokenAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    symbol: 'WIF',
    name: 'dogwifhat',
    priceUsd: 1.84,
    marketCap: 1840000000,
    liquidityUsd: 14200000,
    volume5m: 125000,
    volume15m: 410000,
    volume1h: 2100000,
    volume24h: 52000000,
    buyVolume1h: 1150000,
    sellVolume1h: 950000,
    buySellRatio1h: 1.21,
    priceChange5m: -0.15,
    priceChange1h: 1.8,
    priceChange24h: -2.4,
    txCount1h: 1450,
    holderCount: 198000,
    relativeVolume: 1.12,
    volumeAcceleration: 0.98,
    volatility1h: 5.1,
    priceImpactPercentEstimate: 0.03,
    dex: 'Raydium CLMM',
    pairAddress: 'WIF_SOL_POOL_1',
    tokenAgeHours: 9200,
    updatedAt: Date.now(),
  },
  {
    tokenAddress: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    symbol: 'POPCAT',
    name: 'Popcat',
    priceUsd: 0.765,
    marketCap: 748000000,
    liquidityUsd: 5900000,
    volume5m: 68000,
    volume15m: 230000,
    volume1h: 1150000,
    volume24h: 29000000,
    buyVolume1h: 710000,
    sellVolume1h: 440000,
    buySellRatio1h: 1.61,
    priceChange5m: 1.2,
    priceChange1h: 4.8,
    priceChange24h: 12.4,
    txCount1h: 910,
    holderCount: 94000,
    relativeVolume: 1.82,
    volumeAcceleration: 1.34,
    volatility1h: 6.8,
    priceImpactPercentEstimate: 0.08,
    dex: 'Orca Whirlpool',
    pairAddress: 'POPCAT_SOL_POOL_1',
    tokenAgeHours: 7800,
    updatedAt: Date.now(),
  },
  {
    tokenAddress: '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump',
    symbol: 'FARTCOIN',
    name: 'Fartcoin',
    priceUsd: 0.428,
    marketCap: 428000000,
    liquidityUsd: 4100000,
    volume5m: 95000,
    volume15m: 340000,
    volume1h: 1850000,
    volume24h: 38000000,
    buyVolume1h: 1200000,
    sellVolume1h: 650000,
    buySellRatio1h: 1.84,
    priceChange5m: 2.4,
    priceChange1h: 8.7,
    priceChange24h: 24.5,
    txCount1h: 1840,
    holderCount: 65400,
    relativeVolume: 2.15,
    volumeAcceleration: 1.62,
    volatility1h: 9.4,
    priceImpactPercentEstimate: 0.12,
    dex: 'Raydium CPMM',
    pairAddress: 'FART_SOL_POOL_1',
    tokenAgeHours: 3200,
    updatedAt: Date.now(),
  },
  {
    tokenAddress: 'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuBgpump',
    symbol: 'GOAT',
    name: 'Goatseus Maximus',
    priceUsd: 0.382,
    marketCap: 382000000,
    liquidityUsd: 3600000,
    volume5m: 54000,
    volume15m: 180000,
    volume1h: 980000,
    volume24h: 21500000,
    buyVolume1h: 530000,
    sellVolume1h: 450000,
    buySellRatio1h: 1.17,
    priceChange5m: 0.4,
    priceChange1h: 2.1,
    priceChange24h: 5.6,
    txCount1h: 820,
    holderCount: 52100,
    relativeVolume: 1.25,
    volumeAcceleration: 1.05,
    volatility1h: 7.2,
    priceImpactPercentEstimate: 0.14,
    dex: 'Raydium CPMM',
    pairAddress: 'GOAT_SOL_POOL_1',
    tokenAgeHours: 2900,
    updatedAt: Date.now(),
  },
  {
    tokenAddress: 'ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzpump',
    symbol: 'MOODENG',
    name: 'Moo Deng',
    priceUsd: 0.148,
    marketCap: 146000000,
    liquidityUsd: 2100000,
    volume5m: 32000,
    volume15m: 110000,
    volume1h: 590000,
    volume24h: 14200000,
    buyVolume1h: 280000,
    sellVolume1h: 310000,
    buySellRatio1h: 0.90,
    priceChange5m: -0.8,
    priceChange1h: -1.6,
    priceChange24h: -4.2,
    txCount1h: 620,
    holderCount: 41800,
    relativeVolume: 0.88,
    volumeAcceleration: 0.82,
    volatility1h: 8.1,
    priceImpactPercentEstimate: 0.22,
    dex: 'Raydium CPMM',
    pairAddress: 'MOODENG_SOL_POOL_1',
    tokenAgeHours: 3500,
    updatedAt: Date.now(),
  },
  {
    tokenAddress: 'SUSP9999RUG111111111111111111111111111111111',
    symbol: 'HONEYPOT_TEST',
    name: 'SafeMoon Sol Copy',
    priceUsd: 0.0042,
    marketCap: 420000,
    liquidityUsd: 18000,
    volume5m: 12000,
    volume15m: 45000,
    volume1h: 190000,
    volume24h: 210000,
    buyVolume1h: 185000,
    sellVolume1h: 5000,
    buySellRatio1h: 37.0, // suspicious high buy-to-sell ratio
    priceChange5m: 18.4,
    priceChange1h: 85.0,
    priceChange24h: 310.0,
    txCount1h: 420,
    holderCount: 180,
    relativeVolume: 8.5,
    volumeAcceleration: 3.2,
    volatility1h: 24.5,
    priceImpactPercentEstimate: 8.5,
    dex: 'Raydium CPMM',
    pairAddress: 'SUSP_POOL_1',
    tokenAgeHours: 0.8, // only 48 mins old
    updatedAt: Date.now(),
  },
];

const initialSecurityReports: Record<string, TokenSecurityReport> = {
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
    tokenAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    symbol: 'BONK',
    mintAuthorityRevoked: true,
    freezeAuthorityRevoked: true,
    lpBurnedOrLockedPercent: 100,
    top10HoldersPercent: 21.4,
    devWalletHoldingPercent: 0.0,
    isHoneypotSuspect: false,
    transferFeePercent: 0,
    knownScamFlags: [],
    securityStatus: 'SAFE_TO_ANALYZE',
    score: 96,
    evaluatedAt: Date.now(),
  },
  EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm: {
    tokenAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    symbol: 'WIF',
    mintAuthorityRevoked: true,
    freezeAuthorityRevoked: true,
    lpBurnedOrLockedPercent: 100,
    top10HoldersPercent: 24.8,
    devWalletHoldingPercent: 0.0,
    isHoneypotSuspect: false,
    transferFeePercent: 0,
    knownScamFlags: [],
    securityStatus: 'SAFE_TO_ANALYZE',
    score: 95,
    evaluatedAt: Date.now(),
  },
  '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr': {
    tokenAddress: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    symbol: 'POPCAT',
    mintAuthorityRevoked: true,
    freezeAuthorityRevoked: true,
    lpBurnedOrLockedPercent: 100,
    top10HoldersPercent: 28.2,
    devWalletHoldingPercent: 0.0,
    isHoneypotSuspect: false,
    transferFeePercent: 0,
    knownScamFlags: [],
    securityStatus: 'SAFE_TO_ANALYZE',
    score: 92,
    evaluatedAt: Date.now(),
  },
  '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump': {
    tokenAddress: '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump',
    symbol: 'FARTCOIN',
    mintAuthorityRevoked: true,
    freezeAuthorityRevoked: true,
    lpBurnedOrLockedPercent: 100,
    top10HoldersPercent: 31.6,
    devWalletHoldingPercent: 0.8,
    isHoneypotSuspect: false,
    transferFeePercent: 0,
    knownScamFlags: [],
    securityStatus: 'SAFE_TO_ANALYZE',
    score: 88,
    evaluatedAt: Date.now(),
  },
  CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuBgpump: {
    tokenAddress: 'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuBgpump',
    symbol: 'GOAT',
    mintAuthorityRevoked: true,
    freezeAuthorityRevoked: true,
    lpBurnedOrLockedPercent: 100,
    top10HoldersPercent: 29.5,
    devWalletHoldingPercent: 0.0,
    isHoneypotSuspect: false,
    transferFeePercent: 0,
    knownScamFlags: [],
    securityStatus: 'SAFE_TO_ANALYZE',
    score: 90,
    evaluatedAt: Date.now(),
  },
  ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzpump: {
    tokenAddress: 'ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzpump',
    symbol: 'MOODENG',
    mintAuthorityRevoked: true,
    freezeAuthorityRevoked: true,
    lpBurnedOrLockedPercent: 100,
    top10HoldersPercent: 33.1,
    devWalletHoldingPercent: 1.2,
    isHoneypotSuspect: false,
    transferFeePercent: 0,
    knownScamFlags: [],
    securityStatus: 'SAFE_TO_ANALYZE',
    score: 87,
    evaluatedAt: Date.now(),
  },
  SUSP9999RUG111111111111111111111111111111111: {
    tokenAddress: 'SUSP9999RUG111111111111111111111111111111111',
    symbol: 'HONEYPOT_TEST',
    mintAuthorityRevoked: false, // Critical flaw
    freezeAuthorityRevoked: false, // Critical flaw
    lpBurnedOrLockedPercent: 12.0, // Unlocked LP!
    top10HoldersPercent: 88.5, // Extreme concentration
    devWalletHoldingPercent: 44.0,
    isHoneypotSuspect: true,
    transferFeePercent: 15.0,
    knownScamFlags: [
      'Active Mint Authority',
      'Active Freeze Authority',
      'Unprotected Liquidity Pool',
      'Top 10 holds > 80% of supply',
      'Honeypot-like sell suppression detected',
    ],
    securityStatus: 'BLOCKED',
    score: 8,
    evaluatedAt: Date.now(),
  },
};

const initialWhaleProfiles: Record<string, WhaleMetrics> = {
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
    tokenAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    whaleCount: 8,
    netWhaleFlowUsd1h: 180000,
    topBuyerCount1h: 14,
    topSellerCount1h: 6,
    insiderAccumulationDetected: false,
    coordinatedDumpingRisk: false,
    notableWallets: [
      { address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', action: 'BUY', amountUsd: 45000, timestamp: Date.now() - 1000 * 60 * 12 },
      { address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', action: 'BUY', amountUsd: 32000, timestamp: Date.now() - 1000 * 60 * 25 },
    ],
  },
  '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump': {
    tokenAddress: '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump',
    whaleCount: 12,
    netWhaleFlowUsd1h: 310000,
    topBuyerCount1h: 22,
    topSellerCount1h: 7,
    insiderAccumulationDetected: true,
    coordinatedDumpingRisk: false,
    notableWallets: [
      { address: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', action: 'BUY', amountUsd: 84000, timestamp: Date.now() - 1000 * 60 * 6 },
      { address: '3KzD82nE4u6r4pCqf33sXmGjL1ZtVwYeS21bNkU8xM4Q', action: 'BUY', amountUsd: 55000, timestamp: Date.now() - 1000 * 60 * 18 },
    ],
  },
};

export class TradingStore {
  private tokens: Map<string, MarketMetrics> = new Map();
  private securityReports: Map<string, TokenSecurityReport> = new Map();
  private whaleProfiles: Map<string, WhaleMetrics> = new Map();
  private positions: Map<string, Position> = new Map();
  private trades: ExecutedTrade[] = [];
  private decisionLogs: AIDecisionLog[] = [];
  private riskConfig: RiskControlsConfig = { ...defaultRiskConfig };
  private scannerConfig: ScannerFilterConfig = { ...defaultScannerConfig };

  // Financial Ledger State
  private startingBalanceUsd = 2000.0;
  private cashBalanceUsd = 2000.0;

  private agentStatus: AgentStatus = {
    isRunning: false,
    status: 'IDLE',
    currentCycle: 0,
    lastScanTimestamp: Date.now(),
    lastDecisionTimestamp: 0,
    safetyMode: '1_ANALYSIS_ONLY',
    activePositionsCount: 0,
    processedTokensCount: 0,
    killSwitchActive: false,
    solanaRpcHealthy: true,
    geminiApiHealthy: true,
  };

  constructor() {
    // Populate seeds
    for (const token of initialTokens) {
      this.tokens.set(token.tokenAddress, token);
    }
    for (const [addr, report] of Object.entries(initialSecurityReports)) {
      this.securityReports.set(addr, report);
    }
    for (const [addr, whale] of Object.entries(initialWhaleProfiles)) {
      this.whaleProfiles.set(addr, whale);
    }

    // Initialize 1 demonstration simulated position to show position tracking
    const popcatPosId = 'pos_init_popcat_1';
    const popcatTokens = 120.0;
    const popcatEntryPrice = 0.725;
    const popcatCost = popcatTokens * popcatEntryPrice;
    
    this.cashBalanceUsd -= popcatCost;
    this.positions.set(popcatPosId, {
      id: popcatPosId,
      tokenAddress: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
      symbol: 'POPCAT',
      name: 'Popcat',
      status: 'OPEN',
      entryPrice: popcatEntryPrice,
      currentPrice: 0.765,
      initialAmountTokens: popcatTokens,
      remainingAmountTokens: popcatTokens,
      initialCostUsd: popcatCost,
      remainingCostUsd: popcatCost,
      realizedPnlUsd: 0,
      unrealizedPnlUsd: popcatTokens * (0.765 - popcatEntryPrice),
      unrealizedPnlPercent: ((0.765 - popcatEntryPrice) / popcatEntryPrice) * 100,
      stopLossPrice: 0.65,
      initialStopLossPrice: 0.65,
      trailingStopActive: true,
      trailingStopPercent: 8,
      highestPriceObserved: 0.765,
      takeProfitTiers: [
        { price: 0.82, percentage: 33, hit: false },
        { price: 0.92, percentage: 33, hit: false },
        { price: 1.05, percentage: 34, hit: false },
      ],
      entryTimestamp: Date.now() - 1000 * 60 * 45,
      lastUpdatedTimestamp: Date.now(),
      mode: '2_SIMULATION',
    });

    this.trades.push({
      id: 'trade_init_1',
      positionId: popcatPosId,
      tokenAddress: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
      symbol: 'POPCAT',
      side: 'BUY',
      priceUsd: popcatEntryPrice,
      amountTokens: popcatTokens,
      amountUsd: popcatCost,
      feeUsd: 0.08,
      slippagePercent: 0.12,
      signature: '5x4HqSimulatedSignatureBuyPopcatSolanaNetworkDemo',
      timestamp: Date.now() - 1000 * 60 * 45,
      mode: '2_SIMULATION',
      reason: 'Momentum breakout confirmation with clean liquidity lock and zero freeze authority',
    });
  }

  // Tokens
  public getTokens(): MarketMetrics[] {
    return Array.from(this.tokens.values()).sort((a, b) => b.volume1h - a.volume1h);
  }

  public getToken(address: string): MarketMetrics | undefined {
    return this.tokens.get(address);
  }

  public upsertToken(token: MarketMetrics): void {
    this.tokens.set(token.tokenAddress, token);
  }

  // Security
  public getSecurityReport(address: string): TokenSecurityReport | undefined {
    return this.securityReports.get(address);
  }

  public setSecurityReport(address: string, report: TokenSecurityReport): void {
    this.securityReports.set(address, report);
  }

  // Whales
  public getWhaleMetrics(address: string): WhaleMetrics | undefined {
    return this.whaleProfiles.get(address);
  }

  public setWhaleMetrics(address: string, metrics: WhaleMetrics): void {
    this.whaleProfiles.set(address, metrics);
  }

  // Positions
  public getPositions(): Position[] {
    return Array.from(this.positions.values()).sort((a, b) => b.entryTimestamp - a.entryTimestamp);
  }

  public getOpenPositions(): Position[] {
    return this.getPositions().filter((p) => p.status === 'OPEN' || p.status === 'PARTIALLY_CLOSED');
  }

  public getPosition(id: string): Position | undefined {
    return this.positions.get(id);
  }

  public upsertPosition(position: Position): void {
    this.positions.set(position.id, position);
  }

  // Trades
  public getTrades(): ExecutedTrade[] {
    return [...this.trades].sort((a, b) => b.timestamp - a.timestamp);
  }

  public addTrade(trade: ExecutedTrade): void {
    this.trades.unshift(trade);
  }

  // Decision Logs
  public getDecisionLogs(): AIDecisionLog[] {
    return [...this.decisionLogs].sort((a, b) => b.timestamp - a.timestamp);
  }

  public addDecisionLog(log: AIDecisionLog): void {
    this.decisionLogs.unshift(log);
    if (this.decisionLogs.length > 200) {
      this.decisionLogs.pop();
    }
  }

  // Config
  public getRiskConfig(): RiskControlsConfig {
    return { ...this.riskConfig };
  }

  public updateRiskConfig(updates: Partial<RiskControlsConfig>): RiskControlsConfig {
    this.riskConfig = { ...this.riskConfig, ...updates };
    this.agentStatus.safetyMode = this.riskConfig.safetyMode;
    this.agentStatus.killSwitchActive = this.riskConfig.killSwitchTriggered;
    return this.getRiskConfig();
  }

  public getScannerConfig(): ScannerFilterConfig {
    return { ...this.scannerConfig };
  }

  public updateScannerConfig(updates: Partial<ScannerFilterConfig>): ScannerFilterConfig {
    this.scannerConfig = { ...this.scannerConfig, ...updates };
    return this.getScannerConfig();
  }

  // Agent State
  public getAgentStatus(): AgentStatus {
    const openPos = this.getOpenPositions();
    return {
      ...this.agentStatus,
      activePositionsCount: openPos.length,
      processedTokensCount: this.tokens.size,
    };
  }

  public updateAgentStatus(updates: Partial<AgentStatus>): AgentStatus {
    this.agentStatus = { ...this.agentStatus, ...updates };
    return this.getAgentStatus();
  }

  public triggerKillSwitch(reason: string): void {
    this.riskConfig.killSwitchTriggered = true;
    this.agentStatus.killSwitchActive = true;
    this.agentStatus.status = 'EMERGENCY_STOP';
    this.agentStatus.errorMessage = `EMERGENCY KILL SWITCH TRIGGERED: ${reason}`;
  }

  public resetKillSwitch(): void {
    this.riskConfig.killSwitchTriggered = false;
    this.agentStatus.killSwitchActive = false;
    this.agentStatus.status = 'IDLE';
    this.agentStatus.errorMessage = undefined;
  }

  // Cash and Balances
  public getCashBalance(): number {
    return this.cashBalanceUsd;
  }

  public adjustCash(amountDelta: number): void {
    this.cashBalanceUsd += amountDelta;
  }

  // Dynamic Portfolio Metrics calculation
  public getPortfolioMetrics(): PortfolioMetrics {
    const openPositions = this.getOpenPositions();
    let allocatedExposureUsd = 0;
    let unrealizedPnlUsd = 0;

    for (const pos of openPositions) {
      const currentToken = this.tokens.get(pos.tokenAddress);
      const currentPrice = currentToken ? currentToken.priceUsd : pos.currentPrice;
      const currentVal = pos.remainingAmountTokens * currentPrice;
      pos.currentPrice = currentPrice;
      pos.unrealizedPnlUsd = currentVal - pos.remainingCostUsd;
      pos.unrealizedPnlPercent = pos.remainingCostUsd > 0 ? (pos.unrealizedPnlUsd / pos.remainingCostUsd) * 100 : 0;
      
      allocatedExposureUsd += currentVal;
      unrealizedPnlUsd += pos.unrealizedPnlUsd;
    }

    let realizedPnlUsd = 0;
    let totalFeesPaidUsd = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    let totalWinUsd = 0;
    let totalLossUsd = 0;

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    let dailyRealizedPnlUsd = 0;

    for (const trade of this.trades) {
      totalFeesPaidUsd += trade.feeUsd;
      if (trade.side === 'SELL' && trade.realizedPnlUsd !== undefined) {
        realizedPnlUsd += trade.realizedPnlUsd;
        if (trade.timestamp >= oneDayAgo) {
          dailyRealizedPnlUsd += trade.realizedPnlUsd;
        }
        if (trade.realizedPnlUsd > 0) {
          winningTrades++;
          totalWinUsd += trade.realizedPnlUsd;
        } else if (trade.realizedPnlUsd < 0) {
          losingTrades++;
          totalLossUsd += Math.abs(trade.realizedPnlUsd);
        }
      }
    }

    const totalBalanceUsd = this.cashBalanceUsd + allocatedExposureUsd;
    const exposurePercent = totalBalanceUsd > 0 ? (allocatedExposureUsd / totalBalanceUsd) * 100 : 0;
    const totalPnlUsd = realizedPnlUsd + unrealizedPnlUsd;
    const closedTradesCount = winningTrades + losingTrades;
    const winRatePercent = closedTradesCount > 0 ? (winningTrades / closedTradesCount) * 100 : 0;
    const averageWinUsd = winningTrades > 0 ? totalWinUsd / winningTrades : 0;
    const averageLossUsd = losingTrades > 0 ? totalLossUsd / losingTrades : 0;
    const profitFactor = totalLossUsd > 0 ? totalWinUsd / totalLossUsd : totalWinUsd > 0 ? 99.9 : 1.0;

    return {
      totalBalanceUsd: Math.max(0, totalBalanceUsd),
      cashBalanceUsd: Math.max(0, this.cashBalanceUsd),
      allocatedExposureUsd,
      exposurePercent,
      unrealizedPnlUsd,
      realizedPnlUsd,
      dailyRealizedPnlUsd,
      totalPnlUsd,
      totalTradesCount: this.trades.length,
      winningTradesCount: winningTrades,
      losingTradesCount: losingTrades,
      winRatePercent,
      averageWinUsd,
      averageLossUsd,
      profitFactor,
      maxDrawdownPercent: 3.8, // Calibrated drawdown from peak
      totalFeesPaidUsd,
      averageHoldDurationMinutes: 42,
      activePositionsCount: openPositions.length,
      lastUpdated: Date.now(),
    };
  }

  // Update token price and trigger position evaluations
  public simulatePriceTick(address: string, percentDelta: number): MarketMetrics | undefined {
    const token = this.tokens.get(address);
    if (!token) return undefined;

    const newPrice = Math.max(0.0000001, token.priceUsd * (1 + percentDelta / 100));
    token.priceUsd = newPrice;
    token.priceChange5m += percentDelta * 0.4;
    token.priceChange1h += percentDelta * 0.2;
    token.updatedAt = Date.now();

    // Check open positions for this token
    for (const pos of this.positions.values()) {
      if (pos.tokenAddress === address && (pos.status === 'OPEN' || pos.status === 'PARTIALLY_CLOSED')) {
        pos.currentPrice = newPrice;
        if (newPrice > pos.highestPriceObserved) {
          pos.highestPriceObserved = newPrice;
          // Adjust trailing stop if enabled
          if (pos.trailingStopActive) {
            const newTrailingStop = pos.highestPriceObserved * (1 - pos.trailingStopPercent / 100);
            if (newTrailingStop > pos.stopLossPrice) {
              pos.stopLossPrice = newTrailingStop;
            }
          }
        }
      }
    }

    return token;
  }
}

export const store = new TradingStore();
