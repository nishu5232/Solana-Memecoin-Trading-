import React, { useState } from 'react';
import { runBacktest } from '../../api';
import { Play, TrendingUp, ShieldAlert, BarChart3 } from 'lucide-react';

export const BacktestingTab: React.FC = () => {
  const [strategy, setStrategy] = useState('AI_MOMENTUM_FILTER');
  const [days, setDays] = useState(30);
  const [initialCapital, setInitialCapital] = useState(2000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleRun = async () => {
    setLoading(true);
    try {
      const data = await runBacktest(strategy, days, initialCapital);
      setResult(data);
    } catch (err) {
      console.error('Backtest error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Quantitative Backtesting & Strategy Validation Lab</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate quantitative rules against simulated historical Solana price action and slippage
          </p>
        </div>

        <button
          onClick={handleRun}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold font-mono transition-colors shadow-sm disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Simulating Strategy Runs...' : 'Run Quantitative Backtest'}</span>
        </button>
      </div>

      {/* Configuration Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">Strategy Rule Set:</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 text-xs"
            >
              <option value="AI_MOMENTUM_FILTER">
                AI Brain + Invariant Security + Multi-Tier TP
              </option>
              <option value="SIMPLE_BREAKOUT">Simple 5m Breakout (No Security Check)</option>
              <option value="BUY_AND_HOLD">Naive DCA / Buy & Hold Baseline</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Historical Window:</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 text-xs"
            >
              <option value={7}>7 Days Micro Horizon</option>
              <option value={30}>30 Days Standard Horizon</option>
              <option value={90}>90 Days Extended Cycle</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Starting Capital ($ USD):</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded p-3 font-mono">
              <div className="text-[10px] text-slate-500 uppercase">Net Return</div>
              <div
                className={`text-lg font-bold mt-0.5 ${
                  result.netReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {result.netReturnPercent >= 0 ? '+' : ''}{result.netReturnPercent}%
              </div>
              <div className="text-[10px] text-slate-500">
                Final: ${result.finalBalance.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded p-3 font-mono">
              <div className="text-[10px] text-slate-500 uppercase">Win Rate</div>
              <div className="text-lg font-bold text-slate-100 mt-0.5">
                {result.winRatePercent}%
              </div>
              <div className="text-[10px] text-slate-500">
                {result.wins}W / {result.losses}L
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded p-3 font-mono">
              <div className="text-[10px] text-slate-500 uppercase">Profit Factor</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {result.profitFactor}x
              </div>
              <div className="text-[10px] text-slate-500">Gross Win/Loss</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded p-3 font-mono">
              <div className="text-[10px] text-slate-500 uppercase">Max Drawdown</div>
              <div className="text-lg font-bold text-rose-400 mt-0.5">
                -{result.maxDrawdownPercent}%
              </div>
              <div className="text-[10px] text-slate-500">Peak to trough</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded p-3 font-mono">
              <div className="text-[10px] text-slate-500 uppercase">Sharpe Ratio</div>
              <div className="text-lg font-bold text-slate-200 mt-0.5">
                {result.sharpeRatio}
              </div>
              <div className="text-[10px] text-slate-500">Risk-adjusted return</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded p-3 font-mono">
              <div className="text-[10px] text-slate-500 uppercase">Total Trades</div>
              <div className="text-lg font-bold text-slate-100 mt-0.5">
                {result.totalTrades}
              </div>
              <div className="text-[10px] text-slate-500">Closed samples</div>
            </div>
          </div>

          {/* Equity Progression Bar Visualizer */}
          <div className="bg-slate-900/90 border border-slate-800 rounded p-4 font-mono text-xs">
            <h4 className="text-xs font-semibold text-slate-300 mb-3">
              Simulated Cumulative Equity Progression:
            </h4>
            <div className="h-28 flex items-end gap-1 border-b border-slate-800 pb-2">
              {result.equityCurve.map((point: any, idx: number) => {
                const heightPct = Math.min(
                  100,
                  Math.max(10, ((point.equityAfter - result.initialBalance * 0.7) / (result.initialBalance * 0.8)) * 100)
                );
                const isGain = point.pnlUsd >= 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer"
                  >
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-all ${
                        isGain ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'
                      }`}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-950 border border-slate-700 p-1.5 rounded text-[10px] whitespace-nowrap z-10 shadow-lg text-slate-200">
                      <div>Trade #{point.tradeNumber}: {point.result}</div>
                      <div>P&L: ${point.pnlUsd}</div>
                      <div>Balance: ${point.equityAfter}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-2">
              <span>Day 0 (${result.initialBalance})</span>
              <span>Day {result.daysTested} (${result.finalBalance})</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded p-8 text-center text-xs text-slate-500">
          Click "Run Quantitative Backtest" to test this strategy under historical parameters.
        </div>
      )}
    </div>
  );
};
