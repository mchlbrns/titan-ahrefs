import { AhrefsClient } from './client';
import { BacklinkAuditReport } from './types';
import { Logger } from './logger';

export class BacklinkAuditor {
  private client: AhrefsClient;
  private logger: Logger;

  constructor(client?: AhrefsClient, logger?: Logger) {
    this.client = client || new AhrefsClient();
    this.logger = logger || new Logger({ context: 'BacklinkAuditor' });
  }

  public async auditBacklinkProfile(domain: string): Promise<BacklinkAuditReport> {
    this.logger.info(`Starting backlink profile audit for ${domain}`);
    return this.client.fetchAllBacklinks(domain);
  }
}
