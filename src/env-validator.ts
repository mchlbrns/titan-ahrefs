import { Logger } from './logger';

export interface EnvValidationResult {
  valid: boolean;
  missingVars: string[];
}

export function validateEnvironment(logger?: Logger): EnvValidationResult {
  const missingVars: string[] = [];

  if (!process.env.AHREFS_API_KEY || process.env.AHREFS_API_KEY.trim() === '' || process.env.AHREFS_API_KEY === 'mock_key_for_testing') {
    missingVars.push('AHREFS_API_KEY');
  }

  if (missingVars.length > 0) {
    const errorMsg = `[FATAL] Missing or invalid required environment variables: ${missingVars.join(', ')}`;
    if (logger) {
      logger.error(errorMsg);
    }
    return { valid: false, missingVars };
  }

  return { valid: true, missingVars: [] };
}
