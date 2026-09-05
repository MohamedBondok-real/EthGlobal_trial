import { NextResponse } from 'next/server';
import { getOrCreateAgentWallet, getVaultState, getAuditLogs } from '@/lib/privy';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const wallet = await getOrCreateAgentWallet();
    const vault = getVaultState();
    const logs = getAuditLogs();

    return NextResponse.json({
      success: true,
      wallet,
      vault,
      logs,
    });
  } catch (error: any) {
    console.error('API /api/agent/state error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch agent state' },
      { status: 500 }
    );
  }
}
