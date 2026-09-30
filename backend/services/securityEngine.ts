import { SecurityStatus, TokenSecurityReport } from '../types';

export class TokenSecurityEngine {
  /**
   * Deterministically evaluate token security parameters.
   * If critical security violations exist, returns BLOCKED.
   * The AI brain CANNOT override a BLOCKED status.
   */
  public evaluate(data: {
    tokenAddress: string;
    symbol: string;
    mintAuthorityRevoked: boolean;
    freezeAuthorityRevoked: boolean;
    lpBurnedOrLockedPercent: number;
    top10HoldersPercent: number;
    devWalletHoldingPercent: number;
    isHoneypotSuspect: boolean;
    transferFeePercent: number;
    knownScamFlags?: string[];
  }): TokenSecurityReport {
    const flags: string[] = [...(data.knownScamFlags || [])];
    let score = 100;

    // Hard Critical Invariants:
    if (!data.mintAuthorityRevoked) {
      flags.push('CRITICAL: Mint authority is still active (unlimited supply dilution risk)');
      score -= 50;
    }

    if (!data.freezeAuthorityRevoked) {
      flags.push('CRITICAL: Freeze authority is active (blacklisting and transfer freeze risk)');
      score -= 50;
    }

    if (data.isHoneypotSuspect) {
      flags.push('CRITICAL: Honeypot-like sell suppression detected');
      score -= 60;
    }

    if (data.lpBurnedOrLockedPercent < 50) {
      flags.push(`CRITICAL: Unprotected Liquidity Pool (only ${data.lpBurnedOrLockedPercent.toFixed(1)}% burned/locked)`);
      score -= 40;
    } else if (data.lpBurnedOrLockedPercent < 85) {
      flags.push(`WARNING: Partial LP Lock (${data.lpBurnedOrLockedPercent.toFixed(1)}% burned/locked)`);
      score -= 15;
    }

    if (data.transferFeePercent > 3.0) {
      flags.push(`WARNING: High transfer fee / tax detected (${data.transferFeePercent.toFixed(1)}%)`);
      score -= 25;
    }

    if (data.top10HoldersPercent > 50) {
      flags.push(`WARNING: Severe holder concentration (Top 10 hold ${data.top10HoldersPercent.toFixed(1)}%)`);
      score -= 30;
    } else if (data.top10HoldersPercent > 35) {
      flags.push(`MODERATE: Elevated top-10 concentration (${data.top10HoldersPercent.toFixed(1)}%)`);
      score -= 10;
    }

    if (data.devWalletHoldingPercent > 10) {
      flags.push(`WARNING: Large developer wallet balance (${data.devWalletHoldingPercent.toFixed(1)}% of supply)`);
      score -= 25;
    }

    score = Math.max(0, Math.min(100, score));

    let securityStatus: SecurityStatus;
    if (
      !data.mintAuthorityRevoked || 
      !data.freezeAuthorityRevoked || 
      data.isHoneypotSuspect || 
      data.lpBurnedOrLockedPercent < 50 || 
      score < 40
    ) {
      securityStatus = 'BLOCKED';
    } else if (score < 65 || data.top10HoldersPercent > 45 || data.transferFeePercent > 1.5) {
      securityStatus = 'HIGH_RISK';
    } else if (score < 85 || data.top10HoldersPercent > 30) {
      securityStatus = 'CAUTION';
    } else {
      securityStatus = 'SAFE_TO_ANALYZE';
    }

    return {
      tokenAddress: data.tokenAddress,
      symbol: data.symbol,
      mintAuthorityRevoked: data.mintAuthorityRevoked,
      freezeAuthorityRevoked: data.freezeAuthorityRevoked,
      lpBurnedOrLockedPercent: data.lpBurnedOrLockedPercent,
      top10HoldersPercent: data.top10HoldersPercent,
      devWalletHoldingPercent: data.devWalletHoldingPercent,
      isHoneypotSuspect: data.isHoneypotSuspect,
      transferFeePercent: data.transferFeePercent,
      knownScamFlags: flags,
      securityStatus,
      score,
      evaluatedAt: Date.now(),
    };
  }
}

export const securityEngine = new TokenSecurityEngine();
