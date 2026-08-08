import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import {
  getManagedDomainsFromSupabase,
  addManagedDomainToSupabase,
  deleteManagedDomainFromSupabase
} from '../../../src/supabase';

interface ManagedDomain {
  domain: string;
  target_country?: string;
  priority?: string;
  description?: string;
}

const DEFAULT_DOMAINS: ManagedDomain[] = [
  { domain: 'titantreasure.com', target_country: 'us', priority: 'high', description: 'Primary Social Casino Platform' },
  { domain: 'betsweepsy.com', target_country: 'us', priority: 'high', description: 'Sweepstakes Lander' },
  { domain: 'luckytwogrands.com', target_country: 'us', priority: 'high', description: 'Sweepstakes Lander' },
  { domain: 'sweepsybet.com', target_country: 'us', priority: 'high', description: 'Sweepstakes Lander' },
  { domain: 'goldishsweeps.com', target_country: 'us', priority: 'high', description: 'Sweepstakes Lander' },
  { domain: 'luckierbety.com', target_country: 'us', priority: 'high', description: 'Sweepstakes Lander' },
  { domain: 'titantreasure.bet', target_country: 'us', priority: 'high', description: 'Casino Domain' },
  { domain: 'titantreasure.casino', target_country: 'us', priority: 'high', description: 'Casino Domain' },
  { domain: 'red-engage.com', target_country: 'us', priority: 'high', description: 'Engagement Platform' },
  { domain: 'heavengirlfriend.com', target_country: 'us', priority: 'high', description: 'AI Companion & Gaming Platform' },
  { domain: 'hornycompanion.com', target_country: 'us', priority: 'medium', description: 'Adult Directory' }
];

let inMemoryDomains: ManagedDomain[] = [...DEFAULT_DOMAINS];

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

function getDomainsFromCookie(): ManagedDomain[] | null {
  try {
    const cookieStore = cookies();
    const cookieVal = cookieStore.get('titan_managed_domains')?.value;
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal);
      if (Array.isArray(parsed)) {
        return parsed.map(d => (typeof d === 'string' ? { domain: d } : d));
      }
    }
  } catch {
    // cookie parsing error
  }
  return null;
}

export async function GET() {
  try {
    const supabaseDomains = await getManagedDomainsFromSupabase();
    if (supabaseDomains && supabaseDomains.length > 0) {
      inMemoryDomains = supabaseDomains;
      return NextResponse.json({ managed_domains: inMemoryDomains });
    }

    const cookieDomains = getDomainsFromCookie();
    if (cookieDomains) {
      inMemoryDomains = cookieDomains;
      return NextResponse.json({ managed_domains: inMemoryDomains });
    }

    const fileDomains = loadDomainsFromFile();
    if (fileDomains && fileDomains.length > 0) {
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

    const newDomainObj: ManagedDomain = {
      domain: domainName,
      target_country: body.target_country || 'us',
      priority: body.priority || 'medium',
      description: body.description || 'Added via Dashboard UI'
    };

    const existing = inMemoryDomains.find(d => d.domain.toLowerCase() === domainName);
    if (!existing) {
      inMemoryDomains.push(newDomainObj);
      saveDomainsToFile(inMemoryDomains);
    }

    await addManagedDomainToSupabase(newDomainObj);

    const response = NextResponse.json({ success: true, managed_domains: inMemoryDomains });
    response.cookies.set('titan_managed_domains', JSON.stringify(inMemoryDomains), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax'
    });
    return response;
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
    await deleteManagedDomainFromSupabase(domainName);

    const response = NextResponse.json({ success: true, managed_domains: inMemoryDomains });
    response.cookies.set('titan_managed_domains', JSON.stringify(inMemoryDomains), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax'
    });
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
