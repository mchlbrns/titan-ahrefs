import { NextRequest, NextResponse } from 'next/server';
import { AhrefsClient } from '../../../src/client';
import { ReportGenerator } from '../../../src/reports';
import { ConfigLoader } from '../../../src/config';
import { Logger } from '../../../src/logger';

export async function GET(req: NextRequest) {
  const logger = new Logger({ context: 'VercelReportRoute' });
  const configLoader = new ConfigLoader(undefined, logger);
  const domainRegistry = configLoader.loadDomainRegistry();
  const domains = domainRegistry.managed_domains.map(d => d.domain);

  const searchParams = req.nextUrl.searchParams;
  const format = (searchParams.get('format') || 'html').toLowerCase();

  const client = new AhrefsClient({ logger });
  const reporter = new ReportGenerator(undefined, client, logger);

  try {
    const report = await reporter.generateWeeklyReport(domains, { enableHtml: true });

    switch (format) {
      case 'csv': {
        return new NextResponse(report.csvContent || '', {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="ahrefs-seo-report-${new Date().toISOString().slice(0, 10)}.csv"`
          }
        });
      }

      case 'json': {
        return NextResponse.json(report, { status: 200 });
      }

      case 'markdown':
      case 'md': {
        return new NextResponse(report.markdownContent, {
          status: 200,
          headers: { 'Content-Type': 'text/markdown' }
        });
      }

      case 'html':
      default: {
        const toolbarHtml = `
        <div style="background: #1e293b; padding: 12px 24px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif;">
          <div style="font-weight: bold; color: #06b6d4; font-size: 1rem;">
            📊 Titan Ahrefs Web Dashboard
          </div>
          <div style="display: flex; gap: 8px;">
            <a href="/api/report?format=html" style="background: #06b6d4; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">🌐 Web Dashboard</a>
            <a href="/api/report?format=csv" style="background: #10b981; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">📊 Export CSV (Excel)</a>
            <a href="/api/report?format=markdown" style="background: #6366f1; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">📄 Export Markdown</a>
            <a href="/api/report?format=json" style="background: #8b5cf6; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">💾 Raw JSON</a>
            <button onclick="window.print()" style="background: #f59e0b; color: #fff; border: none; cursor: pointer; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">🖨️ Print / Save PDF</button>
          </div>
        </div>
        `;

        let fullHtml = report.htmlContent || `<html><body><h1>Report Generated</h1></body></html>`;
        if (fullHtml.includes('<body>')) {
          fullHtml = fullHtml.replace('<body>', `<body>${toolbarHtml}`);
        } else {
          fullHtml = toolbarHtml + fullHtml;
        }

        return new NextResponse(fullHtml, {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });
      }
    }
  } catch (error) {
    logger.error('Vercel serverless report generation failed', { error: (error as Error).message });
    return NextResponse.json({
      error: 'Failed to generate weekly report',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
