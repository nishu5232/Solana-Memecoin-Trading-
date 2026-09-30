import React from 'react';
import { ExecutedTrade } from '@/backend/types';
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from 'lucide-react';

interface TradeHistoryTabProps {
  trades: ExecutedTrade[];
}

export const TradeHistoryTab: React.FC<TradeHistoryTabProps> = ({ trades }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Trade Execution Ledger</h3>
          <p className="text-xs text-slate-400">
            Immutable chronological audit log of all completed order fills and router events
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500">
          Total Fills: {trades.length}
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Token</th>
                <th className="py-2.5 px-3">Side</th>
                <th className="py-2.5 px-3">Fill Price</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">USD Value</th>
                <th className="py-2.5 px-3">Slippage / Fee</th>
                <th className="py-2.5 px-3 text-right">Realized P&L</th>
                <th className="py-2.5 px-3 text-right">Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No executed trades recorded yet.
                  </td>
                </tr>
              ) : (
                trades.map((t) => {
                  const isBuy = t.side === 'BUY';
                  const hasPnl = t.realizedPnlUsd !== undefined;
                  const isPosPnl = hasPnl && (t.realizedPnlUsd ?? 0) >= 0;
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {new Date(t.timestamp).toLocaleTimeString()}
                      </td>

                      <td className="py-2.5 px-3 font-bold text-slate-100">
                        {t.symbol}
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isBuy ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isBuy ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          <span>{t.side}</span>
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-200">
                        ${t.priceUsd.toFixed(6)}
                      </td>

                      <td className="py-2.5 px-3 text-slate-300">
                        {t.amountTokens.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-2.5 px-3 text-slate-300">
                        ${t.amountUsd.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {t.slippagePercent.toFixed(2)}% · ${t.feeUsd.toFixed(2)}
                      </td>

                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          hasPnl
                            ? isPosPnl
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {hasPnl
                          ? `${isPosPnl ? '+' : ''}$${t.realizedPnlUsd!.toFixed(2)}`
                          : '—'}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <span
                          className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer font-mono inline-flex items-center gap-1"
                          title={t.signature}
                        >
                          <span>{t.signature.slice(0, 4)}...{t.signature.slice(-4)}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
