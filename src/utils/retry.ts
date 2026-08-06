import { Logger } from '../logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  retryableStatuses?: number[];
  logger?: Logger;
}

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 5000;
  const backoffFactor = options.backoffFactor ?? 2.0;
  const retryableStatuses = options.retryableStatuses ?? [429, 500, 502, 503, 504];
  const log = options.logger;

  let delay = initialDelayMs;

  for (let attempt = 1; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err: unknown) {
      const isRetryableError = checkRetryable(err, retryableStatuses);

      if (attempt > maxRetries || !isRetryableError) {
        if (log) {
          log.error(`Operation failed permanently after attempt ${attempt}/${maxRetries + 1}`, {
            error: (err as Error).message
          });
        }
        throw err;
      }

      // Calculate exponential backoff with jitter (+/- 20%)
      const jitter = 0.8 + Math.random() * 0.4;
      const currentDelay = Math.min(Math.round(delay * jitter), maxDelayMs);

      if (log) {
        log.warn(`Operation attempt ${attempt} failed. Retrying in ${currentDelay}ms...`, {
          attempt,
          maxRetries,
          delayMs: currentDelay,
          reason: (err as Error).message
        });
      }

      await sleep(currentDelay);
      delay *= backoffFactor;
    }
  }
}

function checkRetryable(err: unknown, retryableStatuses: number[]): boolean {
  if (err && typeof err === 'object' && 'statusCode' in err && typeof (err as { statusCode: unknown }).statusCode === 'number') {
    return retryableStatuses.includes((err as { statusCode: number }).statusCode);
  }
  if (err instanceof Error) {
    const statusMatch = err.message.match(/HTTP error (\d+)/i);
    if (statusMatch) {
      const code = parseInt(statusMatch[1], 10);
      return retryableStatuses.includes(code);
    }
    // Network errors (e.g. ECONNRESET, ETIMEDOUT, fetch failed)
    const netErrors = ['fetch failed', 'econnreset', 'etimedout', 'econnrefused', 'network error'];
    return netErrors.some(e => err.message.toLowerCase().includes(e));
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
