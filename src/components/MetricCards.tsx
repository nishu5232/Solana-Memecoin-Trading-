import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  Shield,
  Layers,
} from 'lucide-react';
import { PortfolioMetrics, RiskControlsConfig } from '@/backend/types';

interface MetricCardsProps {
  portfolio: PortfolioMetrics;
  riskConfig: RiskControlsConfig;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ portfolio, riskConfig }) => {
  const isPnlPositive = portfolio.totalPnlUsd >= 0;
  const isDailyPositive = portfolio.dailyRealizedPnlUsd >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
      {/* 1. Total Balance */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded p-3">
        <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between mb-1">
          <span>Total Balance</span>
          <Wallet className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="text-lg font-mono font-bold text-slate-100">
          ${portfolio.totalBalanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          Cash: ${portfolio.cashBalanceUsd.toFixed(2)}
        </div>
      </div>

      {/* 2. Total P&L */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded p-3">
        <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between mb-1">
          <span>Net Total P&L</span>
          {isPnlPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          )}
        </div>
        <div
          className={`text-lg font-mono font-bold ${
            isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isPnlPositive ? '+' : ''}${portfolio.totalPnlUsd.toFixed(2)}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          Realized: ${portfolio.realizedPnlUsd.toFixed(2)}
        </div>
      </div>

      {/* 3. Daily P&L */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded p-3">
        <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between mb-1">
          <span>Daily P&L</span>
          <Activity className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div
          className={`text-lg font-mono font-bold ${
            isDailyPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isDailyPositive ? '+' : ''}${portfolio.dailyRealizedPnlUsd.toFixed(2)}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          Limit: -${riskConfig.maxDailyLossUsd}
        </div>
      </div>

      {/* 4. Unrealized P&L */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded p-3">
        <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between mb-1">
          <span>Unrealized P&L</span>
          <span className="text-[10px] text-slate-500 font-mono">Open</span>
        </div>
        <div
          className={`text-lg font-mono font-bold ${
            portfolio.unrealizedPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {portfolio.unrealizedPnlUsd >= 0 ? '+' : ''}${portfolio.unrealizedPnlUsd.toFixed(2)}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          Active float
        </div>
      </div>

      {/* 5. Win Rate */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded p-3">
        <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between mb-1">
          <span>Win Rate</span>
          <span className="text-[10px] text-slate-500 font-mono">{portfolio.winningTradesCount}W/{portfolio.losingTradesCount}L</span>
        </div>
        <div className="text-lg font-mono font-bold text-slate-100">
          {portfolio.winRatePercent.toFixed(1)}%
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          Avg W: +${portfolio.averageWinUsd.toFixed(2)}
        </div>
      </div>

      {/* 6. Profit Factor */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded p-3">
        <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between mb-1">
          <span>Profit Factor</span>
          <span className="text-[10px] text-slate-500 font-mono">R:R</span>
        </div>
        <div className="text-lg font-mono font-bold text-slate-100">
          {portfolio.profitFactor > 50 ? 'N/A' : portfolio.profitFactor.toFixed(2)}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          Min goal: &ge; 1.80
        </div>
      </div>

      {/* 7. Max Drawdown */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded p-3">
        <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between mb-1">
          <span>Max Drawdown</span>
          <Shield className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="text-lg font-mono font-bold text-amber-400">
          {portfolio.maxDrawdownPercent.toFixed(1)}%
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          Peak equity drop
        </div>
      </div>

      {/* 8. Active Exposure */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded p-3">
        <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between mb-1">
          <span>Portfolio Exposure</span>
          <Layers className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="text-lg font-mono font-bold text-slate-100">
          {portfolio.exposurePercent.toFixed(1)}%
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          {portfolio.activePositionsCount}/{riskConfig.maxConcurrentPositions} pos
        </div>
      </div>
    </div>
  );
};
