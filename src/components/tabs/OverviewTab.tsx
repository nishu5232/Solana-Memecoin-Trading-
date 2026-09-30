import React from 'react';
import {
  AgentStatus,
  AIDecisionLog,
  MarketMetrics,
  Position,
  RiskControlsConfig,
} from '@/backend/types';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface OverviewTabProps {
  status: AgentStatus;
  positions: Position[];
  latestDecision?: AIDecisionLog;
  topTokens: MarketMetrics[];
  riskConfig: RiskControlsConfig;
  onSelectToken: (address: string) => void;
  onNavigateTab: (tabId: string) => void;
  onClosePosition: (id: string, pct: number) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  status,
  positions,
  latestDecision,
  topTokens,
  riskConfig,
  onSelectToken,
  onNavigateTab,
  onClosePosition,
}) => {
  const pipelineSteps = [
    { name: 'DISCOVER', state: status.status === 'SCANNING' ? 'active' : 'idle' },
    { name: 'FILTER', state: status.status === 'SCANNING' ? 'active' : 'idle' },
    { name: 'SECURITY', state: status.status === 'ANALYZING' ? 'active' : 'idle' },
    { name: 'MARKET STATS', state: status.status === 'ANALYZING' ? 'active' : 'idle' },
    { name: 'AI BRAIN', state: status.status === 'ANALYZING' ? 'active' : 'idle' },
    { name: 'RISK ENGINE', state: status.status === 'ANALYZING' ? 'active' : 'idle' },
    { name: 'EXECUTION', state: status.status === 'EXECUTING' ? 'active' : 'idle' },
    { name: 'PROFIT-TAKING', state: 'idle' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Autonomous Pipeline Status Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Autonomous Execution Pipeline
            </div>
            <div className="text-sm font-medium text-slate-200">
              Deterministic 8-Stage Cycle · Real-time Solana Memecoin Scanner
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span>Scan interval: 6.0s</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Mode: {riskConfig.safetyMode.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Pipeline Visual Track */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 font-mono text-[10px]">
          {pipelineSteps.map((step, idx) => (
            <div
              key={step.name}
              className={`p-2 rounded border text-center transition-all ${
                step.state === 'active'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="text-[9px] text-slate-500">0{idx + 1}</div>
              <div className="truncate">{step.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Active Positions & Market Highlights */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Positions */}
          <div className="bg-slate-900/90 border border-slate-800 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Active Open Positions</h3>
                <p className="text-xs text-slate-400">
                  Real-time profit-taking engine monitoring TP1/TP2/TP3 & trailing stops
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('positions')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
              >
                <span>View all ({positions.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {positions.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-800 rounded">
                <p className="text-xs text-slate-400">No open positions currently.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  The agent only opens positions when strict security and risk-adjusted EV filters align.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {positions.map((pos) => {
                  const pnl = pos.unrealizedPnlUsd;
                  const isPos = pnl >= 0;
                  return (
                    <div
                      key={pos.id}
                      className="bg-slate-950/70 border border-slate-800/90 rounded p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 text-sm">{pos.symbol}</span>
                          <span className="text-xs text-slate-400">{pos.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {pos.remainingAmountTokens.toFixed(2)} tokens
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                          <span>Entry: ${pos.entryPrice.toFixed(6)}</span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span>Now: ${pos.currentPrice.toFixed(6)}</span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-rose-400/90">SL: ${pos.stopLossPrice.toFixed(6)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        <div className="text-right font-mono">
                          <div
                            className={`text-sm font-bold ${
                              isPos ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPos ? '+' : ''}${pnl.toFixed(2)} ({pos.unrealizedPnlPercent.toFixed(2)}%)
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Cost: ${pos.remainingCostUsd.toFixed(2)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onClosePosition(pos.id, 50)}
                            className="px-2 py-1 text-[11px] font-mono rounded border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800"
                            title="Take partial 50% profit/exit"
                          >
                            50% Exit
                          </button>
                          <button
                            onClick={() => onClosePosition(pos.id, 100)}
                            className="px-2 py-1 text-[11px] font-mono rounded border border-rose-900/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60"
                            title="Close full 100% position immediately"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* High-Velocity Market Opportunities */}
          <div className="bg-slate-900/90 border border-slate-800 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Live Scanned Solana Memecoins</h3>
                <p className="text-xs text-slate-400">
                  Sorted by 1-hour trading volume & relative momentum velocity
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('market')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
              >
                <span>Full Scanner</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/80">
              {topTokens.slice(0, 4).map((t) => (
                <div
                  key={t.tokenAddress}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{t.symbol}</span>
                      <span className="text-slate-400 truncate max-w-[140px]">{t.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{t.dex}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                      <span>${t.priceUsd.toFixed(6)}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span
                        className={
                          t.priceChange1h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        1h: {t.priceChange1h >= 0 ? '+' : ''}{t.priceChange1h.toFixed(1)}%
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>Liq: ${(t.liquidityUsd / 1000).toFixed(0)}k</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>RVOL: {t.relativeVolume.toFixed(2)}x</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectToken(t.tokenAddress)}
                    className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800/60 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-mono"
                  >
                    AI Audit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Brain Decision Stream & Invariants */}
        <div className="space-y-4">
          {/* Latest AI Brain Decision */}
          <div className="bg-slate-900/90 border border-slate-800 rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                <span>AI BRAIN TELEMETRY</span>
              </div>
              {latestDecision && (
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(latestDecision.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>

            {latestDecision ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-sm font-bold text-slate-100">
                      {latestDecision.symbol}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5 font-mono">
                      ${latestDecision.marketSnapshot.priceUsd.toFixed(6)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        latestDecision.aiDecision.action === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : latestDecision.aiDecision.action === 'WAIT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {latestDecision.aiDecision.action}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {(latestDecision.aiDecision.confidence * 100).toFixed(0)}% conf
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1 font-mono">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Setup:</span>
                    <span className="text-slate-200 capitalize">
                      {latestDecision.aiDecision.setup.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Risk/Reward:</span>
                    <span className="text-slate-200 font-bold">
                      {latestDecision.aiDecision.riskReward > 0
                        ? `${latestDecision.aiDecision.riskReward.toFixed(2)}x`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Stop Loss:</span>
                    <span className="text-rose-400">
                      {latestDecision.aiDecision.stopLoss > 0
                        ? `$${latestDecision.aiDecision.stopLoss.toFixed(6)}`
                        : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Risk Engine:</span>
                    <span
                      className={
                        latestDecision.riskResult.approved
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }
                    >
                      {latestDecision.riskResult.approved ? 'APPROVED' : 'REJECTED'}
                    </span>
                  </div>
                </div>

                {latestDecision.aiDecision.reasoning.length > 0 && (
                  <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    <p className="font-semibold text-slate-400 mb-1">Quantitative Logic:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {latestDecision.aiDecision.reasoning.slice(0, 2).map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                Awaiting first autonomous decision cycle...
              </div>
            )}
          </div>

          {/* Hard Invariant Check List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Deterministic Safety Invariants
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hard Security Verification</span>
                </span>
                <span className="font-mono text-emerald-400 text-[11px]">ENFORCED</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Deterministic Risk Engine Gate</span>
                </span>
                <span className="font-mono text-emerald-400 text-[11px]">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Isolated Signer Architecture</span>
                </span>
                <span className="font-mono text-emerald-400 text-[11px]">SECURE</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Max Daily Loss Circuit Breaker</span>
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  ${riskConfig.maxDailyLossUsd}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Multi-tier Profit Taking (TP1/2/3)</span>
                </span>
                <span className="font-mono text-slate-400 text-[11px]">DYNAMIC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
