import React, { useState } from 'react';
import { AIDecisionLog } from '@/backend/types';
import { Search, Filter, ShieldCheck, XCircle, CheckCircle2 } from 'lucide-react';

interface DecisionLogsTabProps {
  logs: AIDecisionLog[];
}

export const DecisionLogsTab: React.FC<DecisionLogsTabProps> = ({ logs }) => {
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filterAction === 'ALL' || log.aiDecision.action === filterAction;
    const matchesSearch =
      log.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tokenAddress.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="bg-slate-900/90 border border-slate-800 rounded p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Autonomous AI Decision Audit Log ({logs.length})
          </h3>
          <p className="text-xs text-slate-400">
            Full audit trail of every token telemetry snapshot, model action, and risk engine validation
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search symbol/address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs w-full sm:w-44 focus:outline-none focus:border-emerald-500"
          />

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs"
          >
            <option value="ALL">All Actions</option>
            <option value="BUY">BUY</option>
            <option value="WAIT">WAIT</option>
            <option value="SELL">SELL</option>
            <option value="DO_NOT_TRADE">DO_NOT_TRADE</option>
          </select>
        </div>
      </div>

      {/* Logs Accordion / Cards */}
      <div className="space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded p-8 text-center text-xs text-slate-500">
            No decision logs recorded matching this filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isBuy = log.aiDecision.action === 'BUY';
            const isApproved = log.riskResult.approved;
            return (
              <div
                key={log.id}
                className="bg-slate-900/90 border border-slate-800 rounded p-4 space-y-3 font-mono text-xs"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800/80 pb-2.5 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-100 text-sm">{log.symbol}</span>
                    <span className="text-slate-400 text-xs">
                      ${log.marketSnapshot.priceUsd.toFixed(6)}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isBuy
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : log.aiDecision.action === 'WAIT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      AI: {log.aiDecision.action} ({(log.aiDecision.confidence * 100).toFixed(0)}%)
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isApproved
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      Risk: {isApproved ? 'APPROVED' : 'REJECTED'}
                    </span>

                    {log.executed && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        FILLED
                      </span>
                    )}
                  </div>
                </div>

                {/* Telemetry Snapshot Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Liquidity:</span>
                    <span>${(log.marketSnapshot.liquidityUsd / 1000).toFixed(1)}k</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">1h Volume:</span>
                    <span>${(log.marketSnapshot.volume1h / 1000).toFixed(1)}k</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Buy/Sell Ratio:</span>
                    <span>{log.marketSnapshot.buySellRatio.toFixed(2)}x</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Security Score:</span>
                    <span
                      className={
                        log.securityResult.score >= 80 ? 'text-emerald-400' : 'text-amber-400'
                      }
                    >
                      {log.securityResult.score}/100 ({log.securityResult.status})
                    </span>
                  </div>
                </div>

                {/* Reasoning & Rejection */}
                <div className="space-y-1 text-[11px] bg-slate-950/70 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-400 font-semibold">AI Brain Logic:</div>
                  <div className="text-slate-300 leading-relaxed">
                    {log.aiDecision.reasoning.join(' ')}
                  </div>

                  {log.rejectionReason && (
                    <div className="text-rose-400 pt-1 border-t border-slate-800/80 mt-1">
                      <span className="font-semibold">Risk Engine Rejection: </span>
                      <span>{log.rejectionReason}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
