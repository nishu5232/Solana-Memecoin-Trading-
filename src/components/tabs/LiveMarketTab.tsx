import React, { useState } from 'react';
import { MarketMetrics, ScannerFilterConfig } from '@/backend/types';
import { Search, Filter, ShieldCheck, ShieldAlert, Zap, ArrowUpDown } from 'lucide-react';

interface LiveMarketTabProps {
  tokens: MarketMetrics[];
  scannerConfig: ScannerFilterConfig;
  onUpdateFilter: (config: Partial<ScannerFilterConfig>) => void;
  onSelectToken: (address: string) => void;
  onRunAudit: (address: string) => void;
  auditLoadingAddress?: string;
}

export const LiveMarketTab: React.FC<LiveMarketTabProps> = ({
  tokens,
  scannerConfig,
  onUpdateFilter,
  onSelectToken,
  onRunAudit,
  auditLoadingAddress,
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof MarketMetrics>('volume1h');
  const [sortDesc, setSortDesc] = useState(true);

  // Filters
  const filteredTokens = tokens
    .filter((t) => {
      const matchSearch =
        t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.tokenAddress.toLowerCase().includes(search.toLowerCase());
      const matchLiq = t.liquidityUsd >= scannerConfig.minLiquidityUsd;
      const matchVol = t.volume1h >= scannerConfig.minVolume1hUsd;
      return matchSearch && matchLiq && matchVol;
    })
    .sort((a, b) => {
      const valA = (a[sortField] ?? 0) as number;
      const valB = (b[sortField] ?? 0) as number;
      return sortDesc ? valB - valA : valA - valB;
    });

  const toggleSort = (field: keyof MarketMetrics) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol, name, or Solana address..."
            className="w-full bg-slate-950 border border-slate-700 rounded pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span>Min Liq:</span>
            <select
              value={scannerConfig.minLiquidityUsd}
              onChange={(e) => onUpdateFilter({ minLiquidityUsd: Number(e.target.value) })}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
            >
              <option value="10000">$10k</option>
              <option value="30000">$30k</option>
              <option value="50000">$50k</option>
              <option value="100000">$100k</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Min 1h Vol:</span>
            <select
              value={scannerConfig.minVolume1hUsd}
              onChange={(e) => onUpdateFilter({ minVolume1hUsd: Number(e.target.value) })}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
            >
              <option value="5000">$5k</option>
              <option value="15000">$15k</option>
              <option value="50000">$50k</option>
              <option value="100000">$100k</option>
            </select>
          </div>

          <div className="text-slate-500">
            Showing {filteredTokens.length} / {tokens.length} tokens
          </div>
        </div>
      </div>

      {/* Main High-Density Token Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Token</th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200"
                  onClick={() => toggleSort('priceUsd')}
                >
                  <div className="flex items-center gap-1">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200"
                  onClick={() => toggleSort('priceChange5m')}
                >
                  5m
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200"
                  onClick={() => toggleSort('priceChange1h')}
                >
                  1h
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200"
                  onClick={() => toggleSort('liquidityUsd')}
                >
                  Liquidity
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200"
                  onClick={() => toggleSort('volume1h')}
                >
                  1h Volume
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200"
                  onClick={() => toggleSort('buySellRatio1h')}
                >
                  Buy/Sell
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200"
                  onClick={() => toggleSort('relativeVolume')}
                >
                  RVOL
                </th>
                <th className="py-2.5 px-3">DEX</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTokens.map((t) => {
                const isAuditLoading = auditLoadingAddress === t.tokenAddress;
                return (
                  <tr
                    key={t.tokenAddress}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-bold text-slate-100">
                          <span>{t.symbol}</span>
                          <span className="text-[10px] text-slate-400 font-normal truncate max-w-[120px]">
                            {t.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          {t.tokenAddress.slice(0, 4)}...{t.tokenAddress.slice(-4)}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-200 font-bold">
                      ${t.priceUsd.toFixed(6)}
                    </td>

                    <td
                      className={`py-2.5 px-3 font-semibold ${
                        t.priceChange5m >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {t.priceChange5m >= 0 ? '+' : ''}
                      {t.priceChange5m.toFixed(2)}%
                    </td>

                    <td
                      className={`py-2.5 px-3 font-semibold ${
                        t.priceChange1h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {t.priceChange1h >= 0 ? '+' : ''}
                      {t.priceChange1h.toFixed(2)}%
                    </td>

                    <td className="py-2.5 px-3 text-slate-300">
                      ${(t.liquidityUsd / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
                    </td>

                    <td className="py-2.5 px-3 text-slate-300">
                      ${(t.volume1h / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
                    </td>

                    <td
                      className={`py-2.5 px-3 font-semibold ${
                        t.buySellRatio1h >= 1.2
                          ? 'text-emerald-400'
                          : t.buySellRatio1h <= 0.8
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {t.buySellRatio1h.toFixed(2)}x
                    </td>

                    <td className="py-2.5 px-3 text-slate-300">
                      {t.relativeVolume.toFixed(2)}x
                    </td>

                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {t.dex}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectToken(t.tokenAddress)}
                          className="px-2 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => onRunAudit(t.tokenAddress)}
                          disabled={isAuditLoading}
                          className="px-2.5 py-1 rounded border border-emerald-600/60 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-[11px] font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                          <Zap className="w-3 h-3" />
                          <span>{isAuditLoading ? 'Analyzing...' : 'AI Audit'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
