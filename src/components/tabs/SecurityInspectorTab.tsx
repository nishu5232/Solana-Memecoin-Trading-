import React from 'react';
import { MarketMetrics, TokenSecurityReport } from '@/backend/types';
import { ShieldCheck, ShieldAlert, AlertOctagon, CheckCircle2, XCircle } from 'lucide-react';

interface SecurityInspectorTabProps {
  tokens: MarketMetrics[];
  selectedAddress: string;
  onSelectAddress: (address: string) => void;
  securityReport?: TokenSecurityReport;
}

export const SecurityInspectorTab: React.FC<SecurityInspectorTabProps> = ({
  tokens,
  selectedAddress,
  onSelectAddress,
  securityReport,
}) => {
  const selectedToken = tokens.find((t) => t.tokenAddress === selectedAddress);

  return (
    <div className="space-y-4">
      {/* Token Select Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-mono text-slate-400">Inspect Token Security:</label>
          <select
            value={selectedAddress}
            onChange={(e) => onSelectAddress(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
          >
            {tokens.map((t) => (
              <option key={t.tokenAddress} value={t.tokenAddress}>
                {t.symbol} ({t.name})
              </option>
            ))}
          </select>
        </div>

        {selectedToken && (
          <div className="text-xs font-mono text-slate-400">
            Address: <span className="text-slate-300">{selectedToken.tokenAddress}</span>
          </div>
        )}
      </div>

      {securityReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Security Card */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>{securityReport.symbol} Security Invariant Audit</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evaluated at: {new Date(securityReport.evaluatedAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase">Score</div>
                  <div
                    className={`text-lg font-bold ${
                      securityReport.score >= 80
                        ? 'text-emerald-400'
                        : securityReport.score >= 50
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {securityReport.score}/100
                  </div>
                </div>

                <div
                  className={`px-3 py-1 rounded border text-xs font-bold ${
                    securityReport.securityStatus === 'SAFE_TO_ANALYZE'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : securityReport.securityStatus === 'BLOCKED'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {securityReport.securityStatus}
                </div>
              </div>
            </div>

            {/* Invariant Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              {/* Mint Authority */}
              <div className="bg-slate-950/70 p-3 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[11px]">Mint Authority</div>
                  <div className="text-slate-200 font-semibold mt-0.5">
                    {securityReport.mintAuthorityRevoked ? 'Revoked (Immutable)' : 'Active (Unlimited Dilution)'}
                  </div>
                </div>
                {securityReport.mintAuthorityRevoked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>

              {/* Freeze Authority */}
              <div className="bg-slate-950/70 p-3 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[11px]">Freeze Authority</div>
                  <div className="text-slate-200 font-semibold mt-0.5">
                    {securityReport.freezeAuthorityRevoked ? 'Revoked (Non-freezable)' : 'Active (Blacklist Risk)'}
                  </div>
                </div>
                {securityReport.freezeAuthorityRevoked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>

              {/* LP Lock/Burn */}
              <div className="bg-slate-950/70 p-3 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[11px]">Liquidity Pool Lock/Burn</div>
                  <div className="text-slate-200 font-semibold mt-0.5">
                    {securityReport.lpBurnedOrLockedPercent.toFixed(1)}% Locked/Burned
                  </div>
                </div>
                {securityReport.lpBurnedOrLockedPercent >= 90 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>

              {/* Top 10 Concentration */}
              <div className="bg-slate-950/70 p-3 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[11px]">Top 10 Holders Holding</div>
                  <div className="text-slate-200 font-semibold mt-0.5">
                    {securityReport.top10HoldersPercent.toFixed(1)}% of Supply
                  </div>
                </div>
                {securityReport.top10HoldersPercent <= 35 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                )}
              </div>

              {/* Dev Wallet Holding */}
              <div className="bg-slate-950/70 p-3 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[11px]">Developer Wallet Holding</div>
                  <div className="text-slate-200 font-semibold mt-0.5">
                    {securityReport.devWalletHoldingPercent.toFixed(1)}% of Supply
                  </div>
                </div>
                {securityReport.devWalletHoldingPercent < 5 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>

              {/* Transfer Tax Fee */}
              <div className="bg-slate-950/70 p-3 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[11px]">Transfer Fee / Tax</div>
                  <div className="text-slate-200 font-semibold mt-0.5">
                    {securityReport.transferFeePercent.toFixed(1)}%
                  </div>
                </div>
                {securityReport.transferFeePercent === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>
            </div>

            {/* Flags Checklist */}
            {securityReport.knownScamFlags.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <h4 className="text-xs font-semibold text-rose-400">
                  Detected Risk Flags:
                </h4>
                <div className="space-y-1">
                  {securityReport.knownScamFlags.map((flag: string, i: number) => (
                    <div
                      key={i}
                      className="text-xs text-rose-300 bg-rose-950/30 p-2.5 rounded border border-rose-900/60 flex items-center gap-2"
                    >
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Security Constitution */}
          <div className="bg-slate-900/90 border border-slate-800 rounded p-5 space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>SECURITY CONSTITUTION</span>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                In memecoin trading, on-chain contract and liquidity traps cause over 85% of total capital loss.
              </p>
              <div className="bg-slate-950/80 p-3 rounded border border-slate-800 text-[11px] space-y-2">
                <div className="font-bold text-slate-200">Non-Negotiable Hard Block Rules:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Active Mint Authority → BLOCKED</li>
                  <li>Active Freeze Authority → BLOCKED</li>
                  <li>LP Lock/Burn &lt; 50% → BLOCKED</li>
                  <li>Honeypot-like sell suppression → BLOCKED</li>
                  <li>Top 10 concentration &gt; 50% → HIGH RISK</li>
                </ul>
              </div>
              <p className="text-[11px] text-slate-400">
                Rule #1: The AI trading brain has zero authority to bypass or override a hard BLOCKED classification.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/90 border border-slate-800 rounded">
          Select a token to load security telemetry.
        </div>
      )}
    </div>
  );
};
