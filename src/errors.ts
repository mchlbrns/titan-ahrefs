export class AhrefsEngineError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code = 'ENGINE_ERROR', details?: Record<string, unknown>) {
    super(message);
    this.name = 'AhrefsEngineError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AhrefsApiError extends AhrefsEngineError {
  public readonly statusCode?: number;
  public readonly endpoint?: string;

  constructor(message: string, statusCode?: number, endpoint?: string, details?: Record<string, unknown>) {
    super(message, 'API_ERROR', details);
    this.name = 'AhrefsApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

export class ConfigurationError extends AhrefsEngineError {
  public readonly configPath?: string;

  constructor(message: string, configPath?: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
    this.configPath = configPath;
  }
}

export class SnapshotError extends AhrefsEngineError {
  public readonly domain?: string;

  constructor(message: string, domain?: string, details?: Record<string, unknown>) {
    super(message, 'SNAPSHOT_ERROR', details);
    this.name = 'SnapshotError';
    this.domain = domain;
  }
}

export class ReportGenerationError extends AhrefsEngineError {
  public readonly reportType?: string;

  constructor(message: string, reportType?: string, details?: Record<string, unknown>) {
    super(message, 'REPORT_GENERATION_ERROR', details);
    this.name = 'ReportGenerationError';
    this.reportType = reportType;
  }
}
