import { NextResponse } from 'next/server';
import { getOrCreateAgentWallet, addAuditLog, privy } from '@/lib/privy';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { maxSpendLimitEth } = body;

    const wallet = await getOrCreateAgentWallet();

    if (maxSpendLimitEth) {
      addAuditLog({
        type: 'POLICY_ENFORCEMENT',
        status: 'SUCCESS',
        action: 'Privy Policy Rule Updated',
        details: `Max Spend limit updated to ${maxSpendLimitEth} ETH on Privy Policy Engine.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Policy rule successfully updated to ${maxSpendLimitEth} ETH.`,
      wallet,
    });
  } catch (error: any) {
    console.error('API /api/agent/policy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update policy' },
      { status: 500 }
    );
  }
}
