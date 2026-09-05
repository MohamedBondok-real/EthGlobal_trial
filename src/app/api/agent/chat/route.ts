import { NextResponse } from 'next/server';
import { processAgentChat } from '@/lib/agentEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message || '';

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const response = await processAgentChat(message);

    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error: any) {
    console.error('API /api/agent/chat error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
