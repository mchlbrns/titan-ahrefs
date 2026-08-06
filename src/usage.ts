import { ApiUsageLimits, ApiRequestCostLog } from './types';
import { Logger } from './logger';

export class ApiUsageMonitor {
  private logger: Logger;
  private logs: ApiRequestCostLog[] = [];
  private totalUnitsConsumed: number = 0;

  // Estimated Ahrefs API v3 unit cost calculation constants
  private static UNIT_COST_USD = 0.00002; // ~$20 per 1,000,000 units
  private currentLimits: ApiUsageLimits = {
    unitsLimit: 100000,
    unitsConsumed: 0,
    unitsRemaining: 100000,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    apiKeyStatus: 'ACTIVE'
  };

  constructor(logger?: Logger) {
    this.logger = logger || new Logger({ context: 'ApiUsageMonitor' });
  }

  public recordApiCall(endpoint: string, unitsConsumed: number = 1, success: boolean = true): ApiRequestCostLog {
    const cost = unitsConsumed * ApiUsageMonitor.UNIT_COST_USD;
    const log: ApiRequestCostLog = {
      endpoint,
      timestamp: new Date().toISOString(),
      unitsConsumed,
      estimatedCostUsd: Number(cost.toFixed(6)),
      success
    };

    this.logs.push(log);
    this.totalUnitsConsumed += unitsConsumed;
    this.currentLimits.unitsConsumed += unitsConsumed;
    this.currentLimits.unitsRemaining = Math.max(0, this.currentLimits.unitsLimit - this.currentLimits.unitsConsumed);

    this.logger.debug(`API Request logged [${endpoint}]`, {
      unitsConsumed,
      estimatedCostUsd: log.estimatedCostUsd,
      unitsRemaining: this.currentLimits.unitsRemaining
    });

    return log;
  }

  public updateLimitsFromApi(apiData: Partial<ApiUsageLimits>): void {
    if (apiData.unitsLimit !== undefined) this.currentLimits.unitsLimit = apiData.unitsLimit;
    if (apiData.unitsConsumed !== undefined) this.currentLimits.unitsConsumed = apiData.unitsConsumed;
    if (apiData.unitsRemaining !== undefined) this.currentLimits.unitsRemaining = apiData.unitsRemaining;
    if (apiData.resetDate) this.currentLimits.resetDate = apiData.resetDate;
    if (apiData.apiKeyStatus) this.currentLimits.apiKeyStatus = apiData.apiKeyStatus;

    this.logger.info(`Updated API Usage Limits`, {
      unitsLimit: this.currentLimits.unitsLimit,
      unitsConsumed: this.currentLimits.unitsConsumed,
      unitsRemaining: this.currentLimits.unitsRemaining,
      resetDate: this.currentLimits.resetDate,
      apiKeyStatus: this.currentLimits.apiKeyStatus
    });
  }

  public getUsageSummary(): ApiUsageLimits {
    return { ...this.currentLimits };
  }

  public getRequestLogs(): ApiRequestCostLog[] {
    return [...this.logs];
  }

  public getTotalCostUsd(): number {
    return Number((this.totalUnitsConsumed * ApiUsageMonitor.UNIT_COST_USD).toFixed(4));
  }
}
