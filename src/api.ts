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

export async function fetchHealth() {
  const res = await fetch('/api/health');
  return res.json();
}

export async function fetchSystemStatus(): Promise<AgentStatus> {
  const res = await fetch('/api/system/status');
  return res.json();
}

export async function startAgent(): Promise<{ success: boolean; status: AgentStatus }> {
  const res = await fetch('/api/agent/start', { method: 'POST' });
  return res.json();
}

export async function pauseAgent(): Promise<{ success: boolean; status: AgentStatus }> {
  const res = await fetch('/api/agent/pause', { method: 'POST' });
  return res.json();
}

export async function triggerEmergencyStop(reason: string): Promise<{ success: boolean; status: AgentStatus }> {
  const res = await fetch('/api/agent/emergency-stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  return res.json();
}

export async function resetKillSwitch(): Promise<{ success: boolean; status: AgentStatus }> {
  const res = await fetch('/api/agent/reset-kill-switch', { method: 'POST' });
  return res.json();
}

export async function updateSafetyMode(mode: SafetyMode): Promise<{ success: boolean; mode: SafetyMode; status: AgentStatus }> {
  const res = await fetch('/api/agent/safety-mode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  return res.json();
}

export async function fetchTokens(): Promise<MarketMetrics[]> {
  const res = await fetch('/api/tokens');
  return res.json();
}

export async function fetchTokenDetails(address: string): Promise<{
  token: MarketMetrics;
  security?: TokenSecurityReport;
  whale?: WhaleMetrics;
  quant: QuantitativeAnalysis;
}> {
  const res = await fetch(`/api/tokens/${address}`);
  return res.json();
}

export async function runTokenAnalysis(address: string): Promise<{
  token: MarketMetrics;
  security: TokenSecurityReport;
  quant: QuantitativeAnalysis;
  whale: WhaleMetrics;
  aiDecision: AIDecisionResult;
  riskEvaluation: RiskEvaluationResult;
}> {
  const res = await fetch(`/api/analyze/${address}`, { method: 'POST' });
  return res.json();
}

export async function fetchPositions(): Promise<Position[]> {
  const res = await fetch('/api/positions');
  return res.json();
}

export async function closePosition(id: string, percentage = 100, reason = 'Manual exit'): Promise<any> {
  const res = await fetch(`/api/positions/${id}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ percentage, reason }),
  });
  return res.json();
}

export async function fetchPortfolio(): Promise<PortfolioMetrics> {
  const res = await fetch('/api/portfolio');
  return res.json();
}

export async function fetchTrades(): Promise<ExecutedTrade[]> {
  const res = await fetch('/api/trades');
  return res.json();
}

export async function fetchDecisionLogs(): Promise<AIDecisionLog[]> {
  const res = await fetch('/api/decisions');
  return res.json();
}

export async function fetchRiskConfig(): Promise<RiskControlsConfig> {
  const res = await fetch('/api/risk/config');
  return res.json();
}

export async function saveRiskConfig(config: Partial<RiskControlsConfig>): Promise<RiskControlsConfig> {
  const res = await fetch('/api/risk/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function fetchScannerConfig(): Promise<ScannerFilterConfig> {
  const res = await fetch('/api/scanner/config');
  return res.json();
}

export async function saveScannerConfig(config: Partial<ScannerFilterConfig>): Promise<ScannerFilterConfig> {
  const res = await fetch('/api/scanner/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function adjustWalletBalance(amountDelta: number): Promise<PortfolioMetrics> {
  const res = await fetch('/api/wallet/adjust-balance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountDelta }),
  });
  return res.json();
}

export async function runBacktest(strategy: string, days: number, initialBalance: number): Promise<any> {
  const res = await fetch('/api/backtest/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ strategy, days, initialBalance }),
  });
  return res.json();
}
