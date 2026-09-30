import React, { useState } from 'react';
import {
  AIDecisionResult,
  MarketMetrics,
  RiskEvaluationResult,
  TakeProfitTier,
  TokenSecurityReport,
  WhaleMetrics,
} from '@/backend/types';
import { QuantitativeAnalysis } from '@/backend/services/marketAnalysis';
import { Zap, ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

interface AISignalsTabProps {
  tokens: MarketMetrics[];
  selectedAddress: string;
  onSelectAddress: (address: string) => void;
  auditResult?: {
    token: MarketMetrics;
    security: TokenSecurityReport;
    quant: QuantitativeAnalysis;
    whale: WhaleMetrics;
    aiDecision: AIDecisionResult;
    riskEvaluation: RiskEvaluationResult;
  };
  onRunAudit: (address: string) => void;
  loading: boolean;
}

export const AISignalsTab: React.FC<AISignalsTabProps> = ({
  tokens,
  selectedAddress,
  onSelectAddress,
  auditResult,
  onRunAudit,
  loading,
}) => {
  return (
    <div className="space-y-4">
      {/* Selector & Audit Trigger */}
      <div className="bg-slate-900/90 border border-slate-800 rounded p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-mono text-slate-400">Target Token:</label>
          <select
            value={selectedAddress}
            onChange={(e) => onSelectAddress(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
          >
            {tokens.map((t) => (
              <option key={t.tokenAddress} value={t.tokenAddress}>
                {t.symbol} - {t.name} (${t.priceUsd.toFixed(6)})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onRunAudit(selectedAddress)}
          disabled={loading || !selectedAddress}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold font-mono transition-colors disabled:opacity-50 shadow-sm"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>{loading ? 'Evaluating Model Invariants...' : 'Run Real-time AI Evaluation'}</span>
        </button>
      </div>

      {auditResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main AI Decision Card */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-100">{auditResult.token.symbol}</span>
                  <span className="text-xs text-slate-400">{auditResult.token.name}</span>
                  <span className="text-xs font-mono text-slate-500">
                    ${auditResult.token.priceUsd.toFixed(6)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Evaluated: {new Date(auditResult.aiDecision.evaluatedAt).toLocaleTimeString()} · Setup: {auditResult.aiDecision.setup}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <div className="text-[10px] text-slate-500 uppercase">Decision Action</div>
                  <div
                    className={`text-base font-bold px-3 py-0.5 rounded border ${
                      auditResult.aiDecision.action === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : auditResult.aiDecision.action === 'WAIT'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {auditResult.aiDecision.action}
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-[10px] text-slate-500 uppercase">Confidence</div>
                  <div className="text-base font-bold text-slate-200">
                    {(auditResult.aiDecision.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Sizing & Boundary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800/80">
                <div className="text-[10px] text-slate-500">Entry Range</div>
                <div className="text-slate-200 font-bold mt-0.5">
                  {auditResult.aiDecision.entryRange.min > 0
                    ? `$${auditResult.aiDecision.entryRange.min.toFixed(6)} - $${auditResult.aiDecision.entryRange.max.toFixed(6)}`
                    : 'Current Market'}
                </div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800/80">
                <div className="text-[10px] text-slate-500">Stop Loss</div>
                <div className="text-rose-400 font-bold mt-0.5">
                  {auditResult.aiDecision.stopLoss > 0
                    ? `$${auditResult.aiDecision.stopLoss.toFixed(6)}`
                    : 'N/A'}
                </div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800/80">
                <div className="text-[10px] text-slate-500">Risk/Reward</div>
                <div className="text-emerald-400 font-bold mt-0.5">
                  {auditResult.aiDecision.riskReward > 0
                    ? `${auditResult.aiDecision.riskReward.toFixed(2)}x`
                    : 'N/A'}
                </div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800/80">
                <div className="text-[10px] text-slate-500">Position Allocation</div>
                <div className="text-slate-200 font-bold mt-0.5">
                  ${auditResult.aiDecision.positionSizeUsd.toFixed(2)} USD
                </div>
              </div>
            </div>

            {/* Take Profit Multi-Tier Array */}
            {auditResult.aiDecision.takeProfit.length > 0 && (
              <div className="space-y-1.5 font-mono">
                <div className="text-[11px] font-semibold text-slate-300">
                  Target Profit Taking Architecture:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {auditResult.aiDecision.takeProfit.map((tp: TakeProfitTier, idx: number) => {
                    const upsidePct =
                      ((tp.price - auditResult.token.priceUsd) / auditResult.token.priceUsd) * 100;
                    return (
                      <div
                        key={idx}
                        className="bg-slate-950/70 border border-slate-800 p-2 rounded"
                      >
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>TP Tier 0{idx + 1}</span>
                          <span className="text-emerald-400 font-semibold">{tp.percentage}% size</span>
                        </div>
                        <div className="text-slate-100 font-bold text-sm mt-0.5">
                          ${tp.price.toFixed(6)}
                        </div>
                        <div className="text-[10px] text-emerald-400/90">
                          +{upsidePct.toFixed(1)}% from current
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reasoning & Invalidation */}
            <div className="space-y-3 pt-2">
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-1.5">
                  AI Quantitative Reasoning:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded border border-slate-800/80">
                  {auditResult.aiDecision.reasoning.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {auditResult.aiDecision.invalidationConditions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-1.5">
                    Invalidation Conditions:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-rose-300/90 bg-rose-950/20 p-3 rounded border border-rose-900/40">
                    {auditResult.aiDecision.invalidationConditions.map((ic: string, i: number) => (
                      <li key={i}>{ic}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Deterministic Risk Engine Evaluation Gate */}
          <div className="bg-slate-900/90 border border-slate-800 rounded p-5 space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>DETERMINISTIC RISK GATE</span>
              </div>
              <h3 className="text-sm font-bold text-slate-100">
                Pre-Execution Risk Verdict
              </h3>
            </div>

            <div
              className={`p-3 rounded border text-xs font-mono space-y-1 ${
                auditResult.riskEvaluation.approved
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-sm">
                <span>VERDICT:</span>
                <span>{auditResult.riskEvaluation.approved ? 'APPROVED' : 'REJECTED'}</span>
              </div>
              <div className="text-[11px] opacity-90">
                Risk Score: {auditResult.riskEvaluation.riskScore}/100
              </div>
              <div className="text-[11px] opacity-90">
                Adjusted Size: ${auditResult.riskEvaluation.adjustedPositionSizeUsd.toFixed(2)} USD
              </div>
            </div>

            {/* Rejection / Validation Notes */}
            {auditResult.riskEvaluation.rejections.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-rose-400 mb-1">
                  Active Risk Blockers:
                </h4>
                <div className="space-y-1">
                  {auditResult.riskEvaluation.rejections.map((rej: string, i: number) => (
                    <div
                      key={i}
                      className="text-xs text-rose-300 bg-rose-950/30 p-2 rounded border border-rose-900/50 flex items-start gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{rej}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {auditResult.riskEvaluation.reasons.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-emerald-400 mb-1">
                  Passed Safety Checks:
                </h4>
                <div className="space-y-1">
                  {auditResult.riskEvaluation.reasons.map((rea: string, i: number) => (
                    <div
                      key={i}
                      className="text-xs text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-900/40 flex items-start gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rea}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Token Security Quick Summary */}
            <div className="pt-3 border-t border-slate-800 text-xs font-mono space-y-1.5">
              <div className="text-slate-400 text-[11px]">Security Verification:</div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span
                  className={
                    auditResult.security.securityStatus === 'SAFE_TO_ANALYZE'
                      ? 'text-emerald-400'
                      : auditResult.security.securityStatus === 'BLOCKED'
                      ? 'text-rose-400 font-bold'
                      : 'text-amber-400'
                  }
                >
                  {auditResult.security.securityStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mint Authority:</span>
                <span className="text-slate-300">
                  {auditResult.security.mintAuthorityRevoked ? 'Revoked (Safe)' : 'Active (Blocked)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Freeze Authority:</span>
                <span className="text-slate-300">
                  {auditResult.security.freezeAuthorityRevoked ? 'Revoked (Safe)' : 'Active (Blocked)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
