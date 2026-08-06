import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    unitsLimit: 400000,
    unitsConsumed: 12540,
    unitsRemaining: 387460,
    resetDate: '2026-09-01',
    apiKeyStatus: 'ACTIVE'
  });
}
