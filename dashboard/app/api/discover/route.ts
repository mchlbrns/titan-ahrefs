import { NextRequest, NextResponse } from 'next/server';
import { AhrefsClient } from '../../../src/client';
import { CompetitorAnalyzer } from '../../../src/competitors';
import { ConfigLoader } from '../../../src/config';
import { Logger } from '../../../src/logger';
import { getCompetitorsFromSupabase } from '../../../src/supabase';

export async function GET(req: NextRequest) {
  const logger = new Logger({ context: 'VercelDiscoverRoute' });
  const searchParams = req.nextUrl.searchParams;
  
  const configLoader = new ConfigLoader(undefined, logger);
  const domainRegistry = configLoader.loadDomainRegistry();

  const primaryDomain = searchParams.get('domain') || domainRegistry.managed_domains[0]?.domain || 'titantreasure.com';
  const requestedCompetitor = searchParams.get('competitor');

  const client = new AhrefsClient({ logger });
  const analyzer = new CompetitorAnalyzer(client, logger);

  const competitorRegistry = configLoader.loadCompetitorRegistry();

  const supabaseCompetitors = await getCompetitorsFromSupabase(primaryDomain);
  const competitorList = requestedCompetitor 
    ? [requestedCompetitor]
    : (supabaseCompetitors || competitorRegistry.competitors_by_domain[primaryDomain] || ['chumbacasino.com', 'pulsz.com', 'luckylandslots.com']);

  try {
    const results = await Promise.all(
      competitorList.map(async (comp) => {
        try {
          return await analyzer.analyzeCompetitorGap(primaryDomain, comp);
        } catch (err) {
          logger.warn(`Failed competitor discovery for ${comp} vs ${primaryDomain}: ${(err as Error).message}`);
          return {
            targetDomain: primaryDomain,
            competitorDomain: comp,
            domainRating: 0,
            organicTraffic: 0,
            trafficValue: 0,
            sharedKeywords: 0,
            competitorExclusiveKeywords: 0,
            gapOpportunities: [],
            error: (err as Error).message
          };
        }
      })
    );

    return NextResponse.json({
      status: 'SUCCESS',
      primaryDomain,
      timestamp: new Date().toISOString(),
      competitors: results
    }, { status: 200 });

  } catch (error) {
    logger.error('Competitor discovery endpoint failed', { error: (error as Error).message });
    return NextResponse.json({
      error: 'Failed to run competitor discovery',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
