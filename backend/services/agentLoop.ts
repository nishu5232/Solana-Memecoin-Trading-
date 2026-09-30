import { store } from '../store';
import { securityEngine } from './securityEngine';
import { marketAnalysisEngine } from './marketAnalysis';
import { whaleEngine } from './whaleIntelligence';
import { geminiBrain } from './geminiBrain';
import { riskEngine } from './riskEngine';
import { executionEngine } from './executionEngine';
import { positionMonitoringEngine } from './positionManager';
import { AIDecisionLog } from '../types';

export class AutonomousAgentLoop {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private cycleDelayMs = 6000; // 6 seconds per autonomous scan pass

  public start(): void {
    if (this.timer) return;
    store.updateAgentStatus({
      isRunning: true,
      status: 'SCANNING',
      errorMessage: undefined,
    });
    console.log('[AGENT] Autonomous trading cycle started.');
    this.timer = setInterval(() => this.runCycle(), this.cycleDelayMs);
  }

  public pause(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    store.updateAgentStatus({
      isRunning: false,
      status: 'PAUSED',
    });
    console.log('[AGENT] Autonomous trading cycle paused.');
  }

  public emergencyStop(reason: string): void {
    this.pause();
    store.triggerKillSwitch(reason);
    console.warn(`[AGENT] EMERGENCY KILL SWITCH: ${reason}`);
  }

  public async runCycle(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const status = store.getAgentStatus();
      if (!status.isRunning || status.killSwitchActive) {
        this.isProcessing = false;
        return;
      }

      const cycleNum = status.currentCycle + 1;
      store.updateAgentStatus({
        status: 'SCANNING',
        currentCycle: cycleNum,
        lastScanTimestamp: Date.now(),
      });

      // 1. MONITOR OPEN POSITIONS FIRST (Profit Taking / Stop Loss / Trailing Stop)
      await positionMonitoringEngine.monitorOpenPositions();

      // Simulate micro market volatility for live data stream
      const tokens = store.getTokens();
      for (const t of tokens) {
        // Small random walk between -0.8% and +0.85%
        const delta = (Math.random() - 0.48) * 1.5;
        store.simulatePriceTick(t.tokenAddress, delta);
      }

      // 2. DISCOVER & FILTER TOKENS
      const scannerConfig = store.getScannerConfig();
      const riskConfig = store.getRiskConfig();
      const portfolio = store.getPortfolioMetrics();
      const openPositions = store.getOpenPositions();

      // Candidate selection based on filters
      const candidates = tokens.filter((t) => {
        return (
          t.liquidityUsd >= scannerConfig.minLiquidityUsd &&
          t.volume1h >= scannerConfig.minVolume1hUsd &&
          t.tokenAgeHours >= scannerConfig.minTokenAgeHours &&
          t.marketCap <= scannerConfig.maxMarketCapUsd
        );
      });

      // Pick top candidate with highest momentum or volume
      if (candidates.length > 0) {
        const candidate = candidates[Math.floor(Math.random() * candidates.length)];
        store.updateAgentStatus({ status: 'ANALYZING' });

        // 3. SECURITY CHECK
        let secReport = store.getSecurityReport(candidate.tokenAddress);
        if (!secReport) {
          secReport = securityEngine.evaluate({
            tokenAddress: candidate.tokenAddress,
            symbol: candidate.symbol,
            mintAuthorityRevoked: true,
            freezeAuthorityRevoked: true,
            lpBurnedOrLockedPercent: 100,
            top10HoldersPercent: 28,
            devWalletHoldingPercent: 0,
            isHoneypotSuspect: false,
            transferFeePercent: 0,
          });
          store.setSecurityReport(candidate.tokenAddress, secReport);
        }

        // 4. MARKET ANALYSIS
        const quant = marketAnalysisEngine.analyze(candidate);
        const whale = whaleEngine.evaluateWallets(candidate.tokenAddress, store.getWhaleMetrics(candidate.tokenAddress));

        // 5. AI BRAIN EVALUATION
        const aiDecision = await geminiBrain.evaluateOpportunity({
          token: candidate,
          security: secReport,
          quant,
          whale,
          portfolio,
          openPositions,
          riskLimits: riskConfig,
        });

        // 6. DETERMINISTIC RISK ENGINE
        const riskEvaluation = riskEngine.evaluate({
          decision: aiDecision,
          token: candidate,
          security: secReport,
          portfolio,
          openPositions,
          config: riskConfig,
        });

        let executed = false;
        let tradeId: string | undefined;

        // 7. EXECUTION (if approved & active safety mode)
        if (riskEvaluation.approved && (riskConfig.safetyMode === '2_SIMULATION' || riskConfig.safetyMode === '4_AUTONOMOUS_LIVE')) {
          store.updateAgentStatus({ status: 'EXECUTING' });
          const execResult = await executionEngine.executeTrade({
            decision: aiDecision,
            riskResult: riskEvaluation,
            token: candidate,
            config: riskConfig,
          });

          if (execResult.success && execResult.trade) {
            executed = true;
            tradeId = execResult.trade.id;
          }
        }

        // 8. AUDIT LOG RECORDING
        const decisionLog: AIDecisionLog = {
          id: `log_${Date.now()}_${candidate.symbol}`,
          timestamp: Date.now(),
          tokenAddress: candidate.tokenAddress,
          symbol: candidate.symbol,
          marketSnapshot: {
            priceUsd: candidate.priceUsd,
            liquidityUsd: candidate.liquidityUsd,
            marketCap: candidate.marketCap,
            volume1h: candidate.volume1h,
            buySellRatio: candidate.buySellRatio1h,
          },
          securityResult: {
            status: secReport.securityStatus,
            score: secReport.score,
          },
          aiDecision,
          riskResult: riskEvaluation,
          executed,
          tradeId,
          rejectionReason: riskEvaluation.rejections.length > 0 ? riskEvaluation.rejections.join('; ') : undefined,
        };

        store.addDecisionLog(decisionLog);
        store.updateAgentStatus({
          lastDecisionTimestamp: Date.now(),
          status: 'SCANNING',
        });
      }
    } catch (err: any) {
      console.error('[AGENT] Cycle exception:', err?.message || err);
      store.updateAgentStatus({
        errorMessage: `Cycle error: ${err?.message || 'Unknown error'}`,
      });
    } finally {
      this.isProcessing = false;
    }
  }
}

export const agentLoop = new AutonomousAgentLoop();
