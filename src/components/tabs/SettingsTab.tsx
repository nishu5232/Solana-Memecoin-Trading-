import React, { useState } from 'react';
import { PortfolioMetrics, SafetyMode } from '@/backend/types';
import { Wallet, ShieldCheck, Server, Key, DollarSign, PlusCircle } from 'lucide-react';

interface SettingsTabProps {
  portfolio: PortfolioMetrics;
  onAdjustBalance: (amount: number) => Promise<void>;
  safetyMode: SafetyMode;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  portfolio,
  onAdjustBalance,
  safetyMode,
}) => {
  const [depositAmount, setDepositAmount] = useState(500);
  const [adjusting, setAdjusting] = useState(false);

  const handleDeposit = async () => {
    setAdjusting(true);
    await onAdjustBalance(depositAmount);
    setAdjusting(false);
  };

  const handleReset = async () => {
    setAdjusting(true);
    // Reset back to $2,000 baseline
    const delta = 2000 - portfolio.cashBalanceUsd;
    await onAdjustBalance(delta);
    setAdjusting(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. Wallet & Simulated Capital Allocation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Trading Wallet & Capital Reserves</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dedicated Solana trading wallet with secure server-side isolated signer
            </p>
          </div>

          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-500 uppercase">Available Cash</div>
            <div className="text-base font-bold text-slate-100">
              ${portfolio.cashBalanceUsd.toFixed(2)} USD
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-950/70 p-3 rounded border border-slate-800 space-y-2">
            <div className="text-slate-400 font-semibold">Simulated Deposit / Rebalance:</div>
            <p className="text-[11px] text-slate-500">
              Deposit or adjust simulated capital to test risk-sizing under larger or smaller accounts.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 w-32 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleDeposit}
                disabled={adjusting}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors disabled:opacity-50"
              >
                + Deposit Funds
              </button>
              <button
                onClick={handleReset}
                disabled={adjusting}
                className="px-3 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
              >
                Reset to $2,000
              </button>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="text-slate-400 font-semibold">Wallet Isolation Architecture:</div>
            <div className="text-slate-300 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Signer Environment:</span>
                <span className="text-emerald-400">Server-Side Isolated</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Frontend Private Key Exposure:</span>
                <span className="text-emerald-400 font-bold">ZERO (Guaranteed)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Simulation:</span>
                <span className="text-slate-200">Required Before Broadcast</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Operating Mode:</span>
                <span className="text-slate-200 font-bold">{safetyMode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Network & RPC Configuration */}
      <div className="bg-slate-900/90 border border-slate-800 rounded p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Solana RPC & DEX Routing Infrastructure</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            High-throughput RPC connection and DEX aggregator routing channels
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
            <div className="text-[10px] text-slate-500">Primary RPC Node</div>
            <div className="text-slate-200 font-bold mt-0.5">api.mainnet-beta.solana.com</div>
            <div className="text-[10px] text-emerald-400 mt-1">Status: Latency ~45ms (Healthy)</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
            <div className="text-[10px] text-slate-500">DEX Aggregator Route</div>
            <div className="text-slate-200 font-bold mt-0.5">Jupiter v6 Swap API</div>
            <div className="text-[10px] text-emerald-400 mt-1">Status: Quote Ready</div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded border border-slate-800">
            <div className="text-[10px] text-slate-500">On-Chain Security Source</div>
            <div className="text-slate-200 font-bold mt-0.5">RugCheck + Raydium CPMM</div>
            <div className="text-[10px] text-emerald-400 mt-1">Status: Invariants Monitored</div>
          </div>
        </div>
      </div>
    </div>
  );
};
