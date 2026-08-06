import { AhrefsClient } from './client';
import { CompetitorMetrics } from './types';
import { Logger } from './logger';

export class CompetitorAnalyzer {
  private client: AhrefsClient;
  private logger: Logger;

  constructor(client?: AhrefsClient, logger?: Logger) {
    this.client = client || new AhrefsClient();
    this.logger = logger || new Logger({ context: 'CompetitorAnalyzer' });
  }

  public async analyzeCompetitorGap(targetDomain: string, competitorDomain: string): Promise<CompetitorMetrics> {
    this.logger.info(`Analyzing competitor gap: ${targetDomain} vs ${competitorDomain}`);
    return this.client.fetchCompetitorOverview(targetDomain, competitorDomain);
  }
}
