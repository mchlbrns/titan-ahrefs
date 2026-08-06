import { execSync } from 'child_process';
import * as path from 'path';

describe('CLI Smoke Integration Tests', () => {
  const rootDir = path.join(__dirname, '../..');

  const runCli = (args: string): string => {
    return execSync(`npx tsx src/index.ts ${args}`, {
      cwd: rootDir,
      encoding: 'utf-8',
      env: { ...process.env, MOCK_API_FALLBACK: 'true' }
    });
  };

  test('CLI command audit:domains executes cleanly', () => {
    const output = runCli('audit:domains');
    expect(output).toContain('Titan Ahrefs Engine');
    expect(output).toContain('audit:domains');
    expect(output).toContain('red-engage.com');
  });

  test('CLI command fetch:keywords executes cleanly', () => {
    const output = runCli('fetch:keywords');
    expect(output).toContain('fetch:keywords');
    expect(output).toContain('Total Organic Keywords');
  });

  test('CLI command snapshot:create executes cleanly', () => {
    const output = runCli('snapshot:create');
    expect(output).toContain('snapshot:create');
    expect(output).toContain('Snapshot Created for');
  });

  test('CLI command analyze:competitors executes cleanly', () => {
    const output = runCli('analyze:competitors');
    expect(output).toContain('analyze:competitors');
    expect(output).toContain('Competitor Analysis');
  });

  test('CLI command report:weekly executes cleanly', () => {
    const output = runCli('report:weekly');
    expect(output).toContain('report:weekly');
    expect(output).toContain('Weekly Executive Report Generated');
  });
});
