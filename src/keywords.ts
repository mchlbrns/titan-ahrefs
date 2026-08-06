import { AhrefsClient } from './client';
import { DomainKeywordReport } from './types';
import { Logger } from './logger';

export class KeywordTracker {
  private client: AhrefsClient;
  private logger: Logger;

  constructor(client?: AhrefsClient, logger?: Logger) {
    this.client = client || new AhrefsClient();
    this.logger = logger || new Logger({ context: 'KeywordTracker' });
  }

  public async fetchKeywordRankings(domain: string): Promise<DomainKeywordReport> {
    this.logger.info(`Fetching keyword rankings for ${domain}`);
    return this.client.fetchOrganicKeywords(domain);
  }
}
