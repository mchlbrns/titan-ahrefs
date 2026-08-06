import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const possiblePaths = [
      path.join(process.cwd(), 'config/domains.json'),
      path.join(process.cwd(), '../config/domains.json')
    ];
    const configPath = possiblePaths.find(p => fs.existsSync(p));
    if (configPath) {
      const domains = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return NextResponse.json(domains);
    }
    return NextResponse.json({
      managed_domains: [
        { domain: 'titantreasure.com', target_country: 'us', priority: 'high', description: 'Primary Platform' },
        { domain: 'red-engage.com', target_country: 'us', priority: 'high', description: 'Engagement Platform' },
        { domain: 'heavengirlfriend.com', target_country: 'us', priority: 'high', description: 'AI Companion' },
        { domain: 'hornycompanion.com', target_country: 'us', priority: 'high', description: 'Companion Platform' }
      ]
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
