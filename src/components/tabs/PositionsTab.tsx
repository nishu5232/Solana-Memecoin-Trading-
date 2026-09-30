import React from 'react';
import { Position, TakeProfitTier } from '@/backend/types';
import { ArrowUpRight, ArrowDownRight, Shield, Target, Clock, ExternalLink } from 'lucide-react';

interface PositionsTabProps {
  positions: Position[];
  onClosePosition: (id: string, percentage: number) => void;
}

export const PositionsTab: React.FC<PositionsTabProps> = ({ positions, onClosePosition }) => {
  const openPositions = positions.filter((p) => p.status === 'OPEN' || p.status === 'PARTIALLY_CLOSED');
  const closedPositions = positions.filter((p) => p.status === 'CLOSED' || p.status === 'STOPPED_OUT');

  return (
    <div className="space-y-6">
      {/* 1. Open Positions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Open Positions ({openPositions.length})
            </h3>
            <p className="text-xs text-slate-400">
              Real-time monitoring with dynamic trailing stops and profit-taking ladder
            </p>
          </div>
        </div>

        {openPositions.length === 0 ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded p-8 text-center">
            <p className="text-xs text-slate-400">No active positions open.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Positions are opened automatically when the autonomous agent finds an opportunity meeting all risk thresholds.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openPositions.map((pos) => {
              const pnl = pos.unrealizedPnlUsd;
              const isPositive = pnl >= 0;
              return (
                <div
                  key={pos.id}
                  className="bg-slate-900/90 border border-slate-800 rounded p-4 space-y-3 font-mono text-xs"
                >
                  <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-100">{pos.symbol}</span>
                        <span className="text-slate-400 text-xs font-normal">{pos.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {pos.mode.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Opened: {new Date(pos.entryTimestamp).toLocaleTimeString()} · Tokens: {pos.remainingAmountTokens.toFixed(2)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-base font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}${pnl.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isPositive ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Core Levels */}
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-slate-950/80 p-2 rounded border border-slate-800/70">
                      <div className="text-slate-500 text-[10px]">Entry Price</div>
                      <div className="text-slate-200 font-bold mt-0.5">${pos.entryPrice.toFixed(6)}</div>
                    </div>
                    <div className="bg-slate-950/80 p-2 rounded border border-slate-800/70">
                      <div className="text-slate-500 text-[10px]">Current Price</div>
                      <div className="text-slate-100 font-bold mt-0.5">${pos.currentPrice.toFixed(6)}</div>
                    </div>
                    <div className="bg-slate-950/80 p-2 rounded border border-slate-800/70">
                      <div className="text-rose-400/90 text-[10px]">Active Stop Loss</div>
                      <div className="text-rose-400 font-bold mt-0.5">${pos.stopLossPrice.toFixed(6)}</div>
                    </div>
                  </div>

                  {/* Profit Taking Ladder */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Profit-Taking Tiers (TP Ladder)</span>
                      <span>Peak: ${pos.highestPriceObserved.toFixed(6)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {pos.takeProfitTiers.map((tp: TakeProfitTier, idx: number) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded border text-[10px] text-center ${
                            tp.hit
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                              : 'bg-slate-950/50 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div>TP{idx + 1} ({tp.percentage}%)</div>
                          <div className="text-[9px] mt-0.5">${tp.price.toFixed(6)}</div>
                          <div className="text-[8px] opacity-75">{tp.hit ? 'HIT' : 'PENDING'}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] text-slate-500">
                      Cost: ${pos.remainingCostUsd.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onClosePosition(pos.id, 25)}
                        className="px-2 py-1 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-[11px]"
                      >
                        25%
                      </button>
                      <button
                        onClick={() => onClosePosition(pos.id, 50)}
                        className="px-2 py-1 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-[11px]"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => onClosePosition(pos.id, 100)}
                        className="px-2.5 py-1 rounded border border-rose-900 bg-rose-950 text-rose-300 hover:bg-rose-900 text-[11px] font-bold"
                      >
                        Close Full
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Closed / Stopped Out Positions */}
      {closedPositions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">
            Closed Position History ({closedPositions.length})
          </h3>
          <div className="bg-slate-900/90 border border-slate-800 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Token</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Entry</th>
                    <th className="py-2.5 px-3">Exit Reason</th>
                    <th className="py-2.5 px-3 text-right">Realized P&L</th>
                    <th className="py-2.5 px-3 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {closedPositions.map((p) => {
                    const isWin = p.realizedPnlUsd >= 0;
                    const durationMins = p.closeTimestamp
                      ? Math.round((p.closeTimestamp - p.entryTimestamp) / (1000 * 60))
                      : 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-slate-100">
                          {p.symbol}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              p.status === 'STOPPED_OUT'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          ${p.entryPrice.toFixed(6)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-[200px]">
                          {p.exitReason || 'Target reached'}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold ${
                            isWin ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isWin ? '+' : ''}${p.realizedPnlUsd.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {durationMins}m
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
