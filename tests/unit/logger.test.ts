import { Logger } from '../../src/logger';

describe('Logger Unit Tests', () => {
  let spyInfo: jest.SpyInstance;
  let spyWarn: jest.SpyInstance;
  let spyError: jest.SpyInstance;

  beforeEach(() => {
    spyInfo = jest.spyOn(console, 'info').mockImplementation(() => {});
    spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    spyError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('logs formatted message at specified level', () => {
    const logger = new Logger({ level: 'info', format: 'pretty', context: 'TestCtx' });
    logger.info('Test info message', { key: 'val' });

    expect(spyInfo).toHaveBeenCalledTimes(1);
    expect(spyInfo.mock.calls[0][0]).toContain('[TestCtx]');
    expect(spyInfo.mock.calls[0][0]).toContain('Test info message');
  });

  test('filters out messages below configured log level', () => {
    const logger = new Logger({ level: 'error' });
    logger.info('Should be ignored');
    logger.warn('Should be ignored');
    logger.error('Critical failure');

    expect(spyInfo).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
    expect(spyError).toHaveBeenCalledTimes(1);
  });

  test('formats structured JSON output', () => {
    const logger = new Logger({ level: 'info', format: 'json', context: 'JsonCtx' });
    logger.info('JSON test', { meta: 123 });

    expect(spyInfo).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(spyInfo.mock.calls[0][0]);
    expect(parsed.context).toBe('JsonCtx');
    expect(parsed.message).toBe('JSON test');
    expect(parsed.meta).toBe(123);
  });
});
