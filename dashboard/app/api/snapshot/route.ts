import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain') || 'titantreasure.com';
  return NextResponse.json({
    snapshotId: `snap_${domain.replace(/\./g, '_')}_${Date.now()}`,
    domain,
    timestamp: new Date().toISOString(),
    dataSource: 'ahrefs-api-v3',
    status: 'active'
  });
}
