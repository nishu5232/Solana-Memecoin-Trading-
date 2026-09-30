import React, { useState } from 'react';
import {
  Play,
  Pause,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  RefreshCw,
  PowerOff,
} from 'lucide-react';
import { AgentStatus, SafetyMode } from '@/backend/types';

interface HeaderProps {
  status: AgentStatus;
  onStartAgent: () => void;
  onPauseAgent: () => void;
  onEmergencyStop: (reason: string) => void;
  onResetKillSwitch: () => void;
  onModeChange: (mode: SafetyMode) => void;
  onRefreshAll: () => void;
  refreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onStartAgent,
  onPauseAgent,
  onEmergencyStop,
  onResetKillSwitch,
  onModeChange,
  onRefreshAll,
  refreshing,
}) => {
  const [showKillModal, setShowKillModal] = useState(false);
  const [killReason, setKillReason] = useState('Manual risk operator intervention');

  const getStatusColor = (s: AgentStatus['status']) => {
    switch (s) {
      case 'SCANNING':
      case 'ANALYZING':
      case 'EXECUTING':
        return 'text-emerald-400';
      case 'PAUSED':
      case 'IDLE':
        return 'text-amber-400';
      case 'EMERGENCY_STOP':
        return 'text-rose-400';
      default:
        return 'text-slate-400';
    }
  };

  const getModeLabel = (mode: SafetyMode) => {
    switch (mode) {
      case '1_ANALYSIS_ONLY':
        return 'Mode 1 · Analysis Only';
      case '2_SIMULATION':
        return 'Mode 2 · Paper Simulation';
      case '3_LIMITED_LIVE':
        return 'Mode 3 · Limited Live';
      case '4_AUTONOMOUS_LIVE':
        return 'Mode 4 · Autonomous Live';
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Brand and Sub-metadata */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-slate-100 tracking-tight">
                  SOLANA AI TRADING OPERATOR
                </h1>
                <span className="text-xs font-mono text-slate-500">v1.0-PRO</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <span className={getStatusColor(status.status)}>{status.status}</span>
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Cycle #{status.currentCycle}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">Solana Mainnet</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-emerald-400/90">Gemini 3.8 Flash Brain</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Controls */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          {/* Safety Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded p-1">
            {(
              [
                '1_ANALYSIS_ONLY',
                '2_SIMULATION',
                '3_LIMITED_LIVE',
                '4_AUTONOMOUS_LIVE',
              ] as SafetyMode[]
            ).map((mode) => {
              const isActive = status.safetyMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => onModeChange(mode)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? mode === '4_AUTONOMOUS_LIVE'
                        ? 'bg-rose-500 text-white font-semibold shadow'
                        : mode === '2_SIMULATION'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-slate-800 text-slate-100 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={getModeLabel(mode)}
                >
                  {mode === '1_ANALYSIS_ONLY' && 'Mode 1: Analysis'}
                  {mode === '2_SIMULATION' && 'Mode 2: Paper'}
                  {mode === '3_LIMITED_LIVE' && 'Mode 3: Live Ltd'}
                  {mode === '4_AUTONOMOUS_LIVE' && 'Mode 4: Auto Live'}
                </button>
              );
            })}
          </div>

          {/* Refresh Data */}
          <button
            onClick={onRefreshAll}
            disabled={refreshing}
            className="p-1.5 rounded border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title="Refresh system state and market feeds"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Agent Start / Pause */}
          {status.isRunning ? (
            <button
              onClick={onPauseAgent}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-medium rounded transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Cycle</span>
            </button>
          ) : (
            <button
              onClick={onStartAgent}
              disabled={status.killSwitchActive}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-medium rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Autonomous Agent</span>
            </button>
          )}

          {/* Emergency Kill Switch */}
          {status.killSwitchActive ? (
            <button
              onClick={onResetKillSwitch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold rounded transition-colors"
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span>Reset Kill Switch</span>
            </button>
          ) : (
            <button
              onClick={() => setShowKillModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900 text-xs font-semibold rounded transition-colors"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>KILL SWITCH</span>
            </button>
          )}
        </div>
      </div>

      {/* Kill Switch Reason Modal */}
      {showKillModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800 rounded-lg max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertOctagon className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Trigger Emergency Kill Switch?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will immediately pause the autonomous trading loop, reject any pending or upcoming trades, and set the risk engine into hard circuit-breaker lock.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Reason for Emergency Shutdown:
              </label>
              <input
                type="text"
                value={killReason}
                onChange={(e) => setKillReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKillModal(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded border border-slate-700 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onEmergencyStop(killReason);
                  setShowKillModal(false);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
              >
                Confirm EMERGENCY HALT
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
