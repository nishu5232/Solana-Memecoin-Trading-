import React, { useState, useEffect, useCallback } from 'react';
import {
  AgentStatus,
  AIDecisionLog,
  ExecutedTrade,
  MarketMetrics,
  PortfolioMetrics,
  Position,
  RiskControlsConfig,
  ScannerFilterConfig,
  SafetyMode,
  TokenSecurityReport,
  WhaleMetrics,
  AIDecisionResult,
  RiskEvaluationResult,
} from '@/backend/types';
import { QuantitativeAnalysis } from '@/backend/services/marketAnalysis';
import {
  fetchHealth,
  fetchSystemStatus,
  startAgent,
  pauseAgent,
  triggerEmergencyStop,
  resetKillSwitch,
  updateSafetyMode,
  fetchTokens,
  fetchPositions,
  closePosition,
  fetchPortfolio,
  fetchTrades,
  fetchDecisionLogs,
  fetchRiskConfig,
  saveRiskConfig,
  fetchScannerConfig,
  saveScannerConfig,
  runTokenAnalysis,
  adjustWalletBalance,
} from './api';

import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { OverviewTab } from './components/tabs/OverviewTab';
import { LiveMarketTab } from './components/tabs/LiveMarketTab';
import { AISignalsTab } from './components/tabs/AISignalsTab';
import { PositionsTab } from './components/tabs/PositionsTab';
import { TradeHistoryTab } from './components/tabs/TradeHistoryTab';
import { SecurityInspectorTab } from './components/tabs/SecurityInspectorTab';
import { RiskControlsTab } from './components/tabs/RiskControlsTab';
import { DecisionLogsTab } from './components/tabs/DecisionLogsTab';
import { BacktestingTab } from './components/tabs/BacktestingTab';
import { SettingsTab } from './components/tabs/SettingsTab';

import {
  Activity,
  BarChart2,
  Cpu,
  Layers,
  ListOrdered,
  ShieldAlert,
  Sliders,
  History,
  FlaskConical,
  Settings,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [status, setStatus] = useState<AgentStatus>({
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
  });

  const [portfolio, setPortfolio] = useState<PortfolioMetrics>({
    totalBalanceUsd: 2000,
    cashBalanceUsd: 1913,
    allocatedExposureUsd: 87,
    exposurePercent: 4.35,
    unrealizedPnlUsd: 4.8,
    realizedPnlUsd: 0,
    dailyRealizedPnlUsd: 0,
    totalPnlUsd: 4.8,
    totalTradesCount: 1,
    winningTradesCount: 0,
    losingTradesCount: 0,
    winRatePercent: 0,
    averageWinUsd: 0,
    averageLossUsd: 0,
    profitFactor: 1.0,
    maxDrawdownPercent: 0,
    totalFeesPaidUsd: 0.08,
    averageHoldDurationMinutes: 45,
    activePositionsCount: 1,
    lastUpdated: Date.now(),
  });

  const [riskConfig, setRiskConfig] = useState<RiskControlsConfig>({
    maxPositionSizeUsd: 150,
    maxPortfolioExposurePercent: 50,
    maxDailyLossUsd: 250,
    maxLossPerTradePercent: 12,
    maxConcurrentPositions: 4,
    maxAllowedSlippagePercent: 2.5,
    minLiquidityUsd: 40000,
    minRiskRewardRatio: 1.8,
    minHolderCount: 500,
    maxTop10ConcentrationPercent: 35,
    minTokenAgeHours: 3,
    trailingStopDefaultPercent: 8,
    killSwitchTriggered: false,
    safetyMode: '1_ANALYSIS_ONLY',
    requireSimulatedSimulationPass: true,
  });

  const [scannerConfig, setScannerConfig] = useState<ScannerFilterConfig>({
    minLiquidityUsd: 30000,
    maxMarketCapUsd: 150000000,
    minVolume1hUsd: 15000,
    minBuySellRatio: 0.95,
    maxTop10ConcentrationPercent: 40,
    minTokenAgeHours: 2,
    minTransactionCount1h: 60,
    requireRevokedMint: true,
    requireRevokedFreeze: true,
  });

  const [tokens, setTokens] = useState<MarketMetrics[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<ExecutedTrade[]>([]);
  const [decisionLogs, setDecisionLogs] = useState<AIDecisionLog[]>([]);

  // Selected Token for deeper audit / security inspect
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string>('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    token: MarketMetrics;
    security: TokenSecurityReport;
    quant: QuantitativeAnalysis;
    whale: WhaleMetrics;
    aiDecision: AIDecisionResult;
    riskEvaluation: RiskEvaluationResult;
  } | undefined>(undefined);

  const [refreshing, setRefreshing] = useState(false);

  // Load all telemetry
  const loadData = useCallback(async () => {
    try {
      const [
        statusData,
        portfolioData,
        tokensData,
        positionsData,
        tradesData,
        decisionsData,
        riskData,
        scanData,
      ] = await Promise.all([
        fetchSystemStatus(),
        fetchPortfolio(),
        fetchTokens(),
        fetchPositions(),
        fetchTrades(),
        fetchDecisionLogs(),
        fetchRiskConfig(),
        fetchScannerConfig(),
      ]);

      setStatus(statusData);
      setPortfolio(portfolioData);
      setTokens(tokensData);
      setPositions(positionsData);
      setTrades(tradesData);
      setDecisionLogs(decisionsData);
      setRiskConfig(riskData);
      setScannerConfig(scanData);

      if (!selectedTokenAddress && tokensData.length > 0) {
        setSelectedTokenAddress(tokensData[0].tokenAddress);
      }
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    }
  }, [selectedTokenAddress]);

  useEffect(() => {
    loadData();
    // Auto-refresh every 4 seconds to reflect live market ticks & positions
    const interval = setInterval(() => {
      loadData();
    }, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Actions
  const handleStartAgent = async () => {
    const res = await startAgent();
    if (res.status) setStatus(res.status);
  };

  const handlePauseAgent = async () => {
    const res = await pauseAgent();
    if (res.status) setStatus(res.status);
  };

  const handleEmergencyStop = async (reason: string) => {
    const res = await triggerEmergencyStop(reason);
    if (res.status) setStatus(res.status);
    await loadData();
  };

  const handleResetKillSwitch = async () => {
    const res = await resetKillSwitch();
    if (res.status) setStatus(res.status);
    await loadData();
  };

  const handleModeChange = async (mode: SafetyMode) => {
    const res = await updateSafetyMode(mode);
    if (res.status) setStatus(res.status);
    await loadData();
  };

  const handleRunAudit = async (address: string) => {
    setAuditLoading(true);
    setSelectedTokenAddress(address);
    try {
      const result = await runTokenAnalysis(address);
      setAuditResult(result);
      setActiveTab('signals');
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleClosePosition = async (id: string, pct: number) => {
    await closePosition(id, pct, `Manual ${pct}% close from terminal`);
    await loadData();
  };

  const handleSaveRiskConfig = async (updated: Partial<RiskControlsConfig>) => {
    const saved = await saveRiskConfig(updated);
    setRiskConfig(saved);
  };

  const handleUpdateScannerFilter = async (updated: Partial<ScannerFilterConfig>) => {
    const saved = await saveScannerConfig(updated);
    setScannerConfig(saved);
  };

  const handleAdjustBalance = async (amount: number) => {
    const updated = await adjustWalletBalance(amount);
    setPortfolio(updated);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'market', label: 'Live Market', icon: BarChart2 },
    { id: 'signals', label: 'AI Brain', icon: Cpu },
    { id: 'positions', label: 'Positions', icon: Layers, badge: positions.filter((p) => p.status === 'OPEN').length },
    { id: 'trades', label: 'Trade History', icon: History },
    { id: 'security', label: 'Security', icon: ShieldAlert },
    { id: 'risk', label: 'Risk Controls', icon: Sliders },
    { id: 'decisions', label: 'Decision Logs', icon: ListOrdered },
    { id: 'backtest', label: 'Backtesting', icon: FlaskConical },
    { id: 'settings', label: 'Wallet & Settings', icon: Settings },
  ];

  const selectedSecurityReport = tokens.find(
    (t) => t.tokenAddress === selectedTokenAddress
  ) ? (auditResult?.token.tokenAddress === selectedTokenAddress ? auditResult.security : undefined) : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Persistent Header */}
      <Header
        status={status}
        onStartAgent={handleStartAgent}
        onPauseAgent={handlePauseAgent}
        onEmergencyStop={handleEmergencyStop}
        onResetKillSwitch={handleResetKillSwitch}
        onModeChange={handleModeChange}
        onRefreshAll={async () => {
          setRefreshing(true);
          await loadData();
          setRefreshing(false);
        }}
        refreshing={refreshing}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 py-4 space-y-4 flex-1">
        {/* Persistent Financial Metric Ribbon */}
        <MetricCards portfolio={portfolio} riskConfig={riskConfig} />

        {/* Tab Navigation Segmented Bar */}
        <div className="border-b border-slate-800 bg-slate-900/60 rounded-t p-1 flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-slate-100 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="text-[10px] font-mono text-emerald-400">
                    ({tab.badge})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        <div className="pt-1">
          {activeTab === 'overview' && (
            <OverviewTab
              status={status}
              positions={positions.filter((p) => p.status === 'OPEN' || p.status === 'PARTIALLY_CLOSED')}
              latestDecision={decisionLogs[0]}
              topTokens={tokens}
              riskConfig={riskConfig}
              onSelectToken={(addr) => {
                setSelectedTokenAddress(addr);
                handleRunAudit(addr);
              }}
              onNavigateTab={(tabId) => setActiveTab(tabId)}
              onClosePosition={handleClosePosition}
            />
          )}

          {activeTab === 'market' && (
            <LiveMarketTab
              tokens={tokens}
              scannerConfig={scannerConfig}
              onUpdateFilter={handleUpdateScannerFilter}
              onSelectToken={(addr) => {
                setSelectedTokenAddress(addr);
                setActiveTab('security');
              }}
              onRunAudit={handleRunAudit}
              auditLoadingAddress={auditLoading ? selectedTokenAddress : undefined}
            />
          )}

          {activeTab === 'signals' && (
            <AISignalsTab
              tokens={tokens}
              selectedAddress={selectedTokenAddress}
              onSelectAddress={(addr) => {
                setSelectedTokenAddress(addr);
                handleRunAudit(addr);
              }}
              auditResult={auditResult}
              onRunAudit={handleRunAudit}
              loading={auditLoading}
            />
          )}

          {activeTab === 'positions' && (
            <PositionsTab
              positions={positions}
              onClosePosition={handleClosePosition}
            />
          )}

          {activeTab === 'trades' && (
            <TradeHistoryTab trades={trades} />
          )}

          {activeTab === 'security' && (
            <SecurityInspectorTab
              tokens={tokens}
              selectedAddress={selectedTokenAddress}
              onSelectAddress={(addr) => setSelectedTokenAddress(addr)}
              securityReport={selectedSecurityReport}
            />
          )}

          {activeTab === 'risk' && (
            <RiskControlsTab
              config={riskConfig}
              onSaveConfig={handleSaveRiskConfig}
              onTriggerKillSwitch={() => handleEmergencyStop('Operator trigger from Risk Controls panel')}
              onResetKillSwitch={handleResetKillSwitch}
            />
          )}

          {activeTab === 'decisions' && (
            <DecisionLogsTab logs={decisionLogs} />
          )}

          {activeTab === 'backtest' && (
            <BacktestingTab />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              portfolio={portfolio}
              onAdjustBalance={handleAdjustBalance}
              safetyMode={riskConfig.safetyMode}
            />
          )}
        </div>
      </main>

      {/* Terminal Footer */}
      <footer className="border-t border-slate-800/80 py-2.5 px-4 bg-slate-950 text-slate-500 font-mono text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Solana Mainnet RPC</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Cluster Slot ~324,891,120</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-emerald-400">Risk Engine Guard: Active</span>
          </div>
          <div>
            <span>Quantitative expected value architecture · Capital preservation first</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
