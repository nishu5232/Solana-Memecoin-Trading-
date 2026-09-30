import React, { useState, useEffect } from 'react';
import { RiskControlsConfig } from '@/backend/types';
import { Shield, Save, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface RiskControlsTabProps {
  config: RiskControlsConfig;
  onSaveConfig: (updated: Partial<RiskControlsConfig>) => Promise<void>;
  onTriggerKillSwitch: () => void;
  onResetKillSwitch: () => void;
}

export const RiskControlsTab: React.FC<RiskControlsTabProps> = ({
  config,
  onSaveConfig,
  onTriggerKillSwitch,
  onResetKillSwitch,
}) => {
  const [form, setForm] = useState<RiskControlsConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ ...config });
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSaveConfig(form);
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Risk Governance & Circuit Breakers</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Hard boundaries enforced between AI model decisions and wallet transaction execution
          </p>
        </div>

        {form.killSwitchTriggered ? (
          <button
            onClick={onResetKillSwitch}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold font-mono transition-colors"
          >
            Reset Kill Switch
          </button>
        ) : (
          <button
            onClick={onTriggerKillSwitch}
            className="px-3 py-1.5 bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900 text-xs font-bold font-mono transition-colors"
          >
            Trigger Kill Switch
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
          {/* Max Position Size */}
          <div className="space-y-1.5">
            <label className="text-slate-300 block">Max Position Size ($ USD)</label>
            <input
              type="number"
              value={form.maxPositionSizeUsd}
              onChange={(e) => setForm({ ...form, maxPositionSizeUsd: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500">Max USD per individual token entry</span>
          </div>

          {/* Max Portfolio Exposure */}
          <div className="space-y-1.5">
            <label className="text-slate-300 block">Max Portfolio Exposure (%)</label>
            <input
              type="number"
              value={form.maxPortfolioExposurePercent}
              onChange={(e) => setForm({ ...form, maxPortfolioExposurePercent: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500">Hard ceiling on allocated capital</span>
          </div>

          {/* Max Daily Loss Circuit Breaker */}
          <div className="space-y-1.5">
            <label className="text-slate-300 block">Max Daily Loss ($ USD)</label>
            <input
              type="number"
              value={form.maxDailyLossUsd}
              onChange={(e) => setForm({ ...form, maxDailyLossUsd: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500">Halts all trading if hit in 24 hours</span>
          </div>

          {/* Max Loss Per Trade % */}
          <div className="space-y-1.5">
            <label className="text-slate-300 block">Max Stop Loss Per Trade (%)</label>
            <input
              type="number"
              value={form.maxLossPerTradePercent}
              onChange={(e) => setForm({ ...form, maxLossPerTradePercent: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500">Rejects AI setups with wider SL</span>
          </div>

          {/* Max Concurrent Positions */}
          <div className="space-y-1.5">
            <label className="text-slate-300 block">Max Concurrent Positions</label>
            <input
              type="number"
              value={form.maxConcurrentPositions}
              onChange={(e) => setForm({ ...form, maxConcurrentPositions: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500">Prevents portfolio over-diversification</span>
          </div>

          {/* Max Slippage Tolerance */}
          <div className="space-y-1.5">
            <label className="text-slate-300 block">Max Allowed Slippage (%)</label>
            <input
              type="number"
              step="0.1"
              value={form.maxAllowedSlippagePercent}
              onChange={(e) => setForm({ ...form, maxAllowedSlippagePercent: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500">Protects against MEV sandwich attacks</span>
          </div>

          {/* Min Liquidity */}
          <div className="space-y-1.5">
            <label className="text-slate-300 block">Min Pool Liquidity ($ USD)</label>
            <input
              type="number"
              value={form.minLiquidityUsd}
              onChange={(e) => setForm({ ...form, minLiquidityUsd: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500">Hard floor for pair liquidity</span>
          </div>

          {/* Min Risk Reward Ratio */}
          <div className="space-y-1.5">
            <label className="text-slate-300 block">Min Risk / Reward Ratio</label>
            <input
              type="number"
              step="0.1"
              value={form.minRiskRewardRatio}
              onChange={(e) => setForm({ ...form, minRiskRewardRatio: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500">e.g. 1.8 means target &ge; 1.8x risk</span>
          </div>

          {/* Trailing Stop Default % */}
          <div className="space-y-1.5">
            <label className="text-slate-300 block">Default Trailing Stop (%)</label>
            <input
              type="number"
              step="0.5"
              value={form.trailingStopDefaultPercent}
              onChange={(e) => setForm({ ...form, trailingStopDefaultPercent: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500">Trailing distance from peak high</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {savedSuccess && (
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Risk parameters updated and actively enforced.</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold font-mono transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Enforcing...' : 'Save & Enforce Limits'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
