export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogFormat = 'json' | 'pretty';

export interface LoggerOptions {
  level?: LogLevel;
  format?: LogFormat;
  context?: string;
}

const LOG_LEVEL_WEIGHTS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

export class Logger {
  private level: LogLevel;
  private format: LogFormat;
  private context: string;

  constructor(options: LoggerOptions = {}) {
    const envLevel = (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || 'info';
    const envFormat = (process.env.LOG_FORMAT?.toLowerCase() as LogFormat) || 'pretty';
    this.level = options.level || (['debug', 'info', 'warn', 'error'].includes(envLevel) ? envLevel : 'info');
    this.format = options.format || (['json', 'pretty'].includes(envFormat) ? envFormat : 'pretty');
    this.context = options.context || 'TitanAhrefs';
  }

  public child(context: string): Logger {
    return new Logger({
      level: this.level,
      format: this.format,
      context: `${this.context}:${context}`
    });
  }

  private shouldLog(targetLevel: LogLevel): boolean {
    return LOG_LEVEL_WEIGHTS[targetLevel] >= LOG_LEVEL_WEIGHTS[this.level];
  }

  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    if (this.format === 'json') {
      return JSON.stringify({
        timestamp,
        level,
        context: this.context,
        message,
        ...meta
      });
    }

    const levelIcon: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️ ',
      warn: '⚠️ ',
      error: '❌'
    };

    const metaStr = meta && Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${levelIcon[level]} [${this.context}] ${message}${metaStr}`;
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }
}

export const logger = new Logger();
