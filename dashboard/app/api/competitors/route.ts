import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const possiblePaths = [
      path.join(process.cwd(), 'config/competitors.json'),
      path.join(process.cwd(), '../config/competitors.json')
    ];
    const configPath = possiblePaths.find(p => fs.existsSync(p));
    if (configPath) {
      const competitors = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return NextResponse.json(competitors);
    }
    return NextResponse.json({
      competitors_by_domain: {
        'titantreasure.com': ['chumbacasino.com', 'pulsz.com', 'luckylandslots.com'],
        'red-engage.com': [],
        'heavengirlfriend.com': [],
        'hornycompanion.com': []
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
