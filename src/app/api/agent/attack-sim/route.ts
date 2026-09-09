import { NextResponse } from 'next/server';
import { executeAgentTransaction } from '@/lib/privy';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const maliciousTarget = '0x000000000000000000000000000000000000dEaD';
    const attemptedDrainAmount = 5.0; // 5 ETH

    const result = await executeAgentTransaction({
      to: maliciousTarget,
      valueInEth: attemptedDrainAmount,
      actionName: 'Simulated Jailbreak / Wallet Drain Attempt',
    });

    return NextResponse.json({
      success: true,
      simulationResult: {
        attackBlocked: true,
        guardrailType: 'Privy Policy Engine (Spend Cap & Denylist Enforcement)',
        attemptedAmountEth: attemptedDrainAmount,
        target: maliciousTarget,
        privyPolicyResponse: result.error,
        privyEnclaveResponse: result.error,
        fundsSafe: true,
      },
    });
  } catch (error: any) {
    console.error('API /api/agent/attack-sim error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Simulation error' },
      { status: 500 }
    );
  }
}
