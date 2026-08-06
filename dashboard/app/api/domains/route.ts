import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface ManagedDomain {
  domain: string;
  target_country?: string;
  priority?: string;
  description?: string;
}

let inMemoryDomains: ManagedDomain[] = [
  { domain: 'titantreasure.com', target_country: 'us', priority: 'high', description: 'Primary Platform' },
  { domain: 'red-engage.com', target_country: 'us', priority: 'high', description: 'Engagement Platform' },
  { domain: 'heavengirlfriend.com', target_country: 'us', priority: 'high', description: 'AI Companion' },
  { domain: 'hornycompanion.com', target_country: 'us', priority: 'high', description: 'Companion Platform' }
];

function getConfigPath(): string | undefined {
  const possiblePaths = [
    path.join(process.cwd(), 'config/domains.json'),
    path.join(process.cwd(), '../config/domains.json')
  ];
  return possiblePaths.find(p => fs.existsSync(p));
}

function loadDomainsFromFile(): ManagedDomain[] | null {
  try {
    const configPath = getConfigPath();
    if (configPath) {
      const content = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (Array.isArray(content.managed_domains)) {
        return content.managed_domains;
      }
    }
  } catch (err) {
    console.warn('Could not read config/domains.json:', err);
  }
  return null;
}

function saveDomainsToFile(domains: ManagedDomain[]) {
  try {
    const configPath = getConfigPath() || path.join(process.cwd(), '../config/domains.json');
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify({ managed_domains: domains }, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write config/domains.json (read-only environment):', err);
  }
}

export async function GET() {
  try {
    const fileDomains = loadDomainsFromFile();
    if (fileDomains && fileDomains.length > 0) {
      // Sync inMemory with file if file exists
      inMemoryDomains = fileDomains;
    }
    return NextResponse.json({ managed_domains: inMemoryDomains });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const domainName = (body.domain || '').trim().toLowerCase();

    if (!domainName) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 });
    }

    const existing = inMemoryDomains.find(d => d.domain.toLowerCase() === domainName);
    if (!existing) {
      const newDomainObj: ManagedDomain = {
        domain: domainName,
        target_country: body.target_country || 'us',
        priority: body.priority || 'medium',
        description: body.description || 'Added via Dashboard UI'
      };
      inMemoryDomains.push(newDomainObj);
      saveDomainsToFile(inMemoryDomains);
    }

    return NextResponse.json({ success: true, managed_domains: inMemoryDomains });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const domainName = (body.domain || '').trim().toLowerCase();

    if (!domainName) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 });
    }

    inMemoryDomains = inMemoryDomains.filter(d => d.domain.toLowerCase() !== domainName);
    saveDomainsToFile(inMemoryDomains);

    return NextResponse.json({ success: true, managed_domains: inMemoryDomains });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

