import * as fs from 'fs';
import * as path from 'path';
import { DomainRegistry, CompetitorRegistry, ManagedDomainConfig } from './types';
import { ConfigurationError } from './errors';
import { Logger } from './logger';

export interface AppSettings {
  max_retries: number;
  retry_delay_ms: number;
  max_retry_delay_ms: number;
  backoff_factor: number;
  log_level: 'debug' | 'info' | 'warn' | 'error';
  log_format: 'json' | 'pretty';
  reports_dir: string;
  snapshots_dir: string;
  enable_html_reports: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  max_retries: 3,
  retry_delay_ms: 500,
  max_retry_delay_ms: 5000,
  backoff_factor: 2.0,
  log_level: 'info',
  log_format: 'pretty',
  reports_dir: 'reports/generated',
  snapshots_dir: 'snapshots/local',
  enable_html_reports: true
};

export class ConfigLoader {
  private configDir: string;
  private logger?: Logger;

  constructor(configDir?: string, logger?: Logger) {
    this.configDir = configDir || path.join(__dirname, '../config');
    this.logger = logger;
  }

  public loadAppSettings(): AppSettings {
    const appConfigPath = path.join(this.configDir, 'app.json');
    if (!fs.existsSync(appConfigPath)) {
      if (this.logger) {
        this.logger.debug(`app.json not found at ${appConfigPath}. Using default app settings.`);
      }
      return DEFAULT_APP_SETTINGS;
    }

    try {
      const content = fs.readFileSync(appConfigPath, 'utf-8');
      const parsed = JSON.parse(content) as Partial<AppSettings>;
      return { ...DEFAULT_APP_SETTINGS, ...parsed };
    } catch (err) {
      throw new ConfigurationError(`Failed to parse app settings from ${appConfigPath}`, appConfigPath, {
        cause: (err as Error).message
      });
    }
  }

  public loadDomainRegistry(): DomainRegistry {
    const domainConfigPath = path.join(this.configDir, 'domains.json');
    if (!fs.existsSync(domainConfigPath)) {
      if (this.logger) {
        this.logger.warn(`domains.json not found at ${domainConfigPath}. Using default fallback domains.`);
      }
      return {
        managed_domains: [
          { domain: 'titantreasure.com', target_country: 'us', priority: 'high', description: 'Main Destination Platform' },
          { domain: 'red-engage.com', target_country: 'us', priority: 'high', description: 'Engagement & Content Platform' },
          { domain: 'heavengirlfriend.com', target_country: 'us', priority: 'high', description: 'AI Companion & Entertainment' },
          { domain: 'hornycompanion.com', target_country: 'us', priority: 'high', description: 'Companion & Discovery Platform' }
        ]
      };
    }

    try {
      const content = fs.readFileSync(domainConfigPath, 'utf-8');
      const registry = JSON.parse(content) as DomainRegistry;
      this.validateDomainRegistry(registry, domainConfigPath);
      return registry;
    } catch (err) {
      if (err instanceof ConfigurationError) throw err;
      throw new ConfigurationError(`Failed to load domain registry from ${domainConfigPath}`, domainConfigPath, {
        cause: (err as Error).message
      });
    }
  }

  public loadCompetitorRegistry(): CompetitorRegistry {
    const compConfigPath = path.join(this.configDir, 'competitors.json');
    if (!fs.existsSync(compConfigPath)) {
      if (this.logger) {
        this.logger.debug(`competitors.json not found at ${compConfigPath}. Returning empty competitor registry.`);
      }
      return { competitors_by_domain: {} };
    }

    try {
      const content = fs.readFileSync(compConfigPath, 'utf-8');
      const registry = JSON.parse(content) as CompetitorRegistry;
      this.validateCompetitorRegistry(registry, compConfigPath);
      return registry;
    } catch (err) {
      if (err instanceof ConfigurationError) throw err;
      throw new ConfigurationError(`Failed to load competitor registry from ${compConfigPath}`, compConfigPath, {
        cause: (err as Error).message
      });
    }
  }

  private validateDomainRegistry(registry: DomainRegistry, filePath: string): void {
    if (!registry || !Array.isArray(registry.managed_domains)) {
      throw new ConfigurationError(`Invalid domains.json: 'managed_domains' must be an array.`, filePath);
    }

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    for (const item of registry.managed_domains) {
      this.validateDomainConfig(item, filePath, domainRegex);
    }
  }

  private validateDomainConfig(item: ManagedDomainConfig, filePath: string, domainRegex: RegExp): void {
    if (!item.domain || typeof item.domain !== 'string') {
      throw new ConfigurationError(`Invalid managed domain entry: missing 'domain' string.`, filePath);
    }
    if (!domainRegex.test(item.domain)) {
      throw new ConfigurationError(`Invalid domain format '${item.domain}' in ${filePath}`, filePath);
    }
    if (!item.target_country || typeof item.target_country !== 'string') {
      throw new ConfigurationError(`Invalid domain entry '${item.domain}': missing 'target_country'.`, filePath);
    }
    if (!item.priority || !['high', 'medium', 'low'].includes(item.priority)) {
      throw new ConfigurationError(`Invalid priority '${item.priority}' for domain '${item.domain}'. Must be 'high', 'medium', or 'low'.`, filePath);
    }
  }

  private validateCompetitorRegistry(registry: CompetitorRegistry, filePath: string): void {
    if (!registry || typeof registry.competitors_by_domain !== 'object') {
      throw new ConfigurationError(`Invalid competitors.json: 'competitors_by_domain' must be an object.`, filePath);
    }
  }
}
