import { withRetry } from '../../src/utils/retry';

describe('withRetry Utility Unit Tests', () => {
  test('resolves immediately when function succeeds on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await withRetry(fn, { maxRetries: 3, initialDelayMs: 10 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('retries on retryable HTTP 429 status code and succeeds', async () => {
    let calls = 0;
    const fn = jest.fn().mockImplementation(async () => {
      calls++;
      if (calls < 3) {
        const err = new Error('HTTP error 429');
        Object.assign(err, { statusCode: 429 });
        throw err;
      }
      return 'recovered';
    });

    const result = await withRetry(fn, { maxRetries: 3, initialDelayMs: 10, backoffFactor: 1 });
    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('throws error when max retries exceeded', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('HTTP error 500'));

    await expect(withRetry(fn, { maxRetries: 2, initialDelayMs: 10 })).rejects.toThrow('HTTP error 500');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('does not retry on non-retryable error status codes (e.g. 401)', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('HTTP error 401'));

    await expect(withRetry(fn, { maxRetries: 3, initialDelayMs: 10 })).rejects.toThrow('HTTP error 401');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
