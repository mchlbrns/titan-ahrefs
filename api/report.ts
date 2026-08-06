import { VercelRequest, VercelResponse } from '@vercel/node';
import { AhrefsClient } from '../src/client';
import { ReportGenerator } from '../src/reports';
import { ConfigLoader } from '../src/config';
import { Logger } from '../src/logger';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const logger = new Logger({ context: 'VercelServer' });
  const configLoader = new ConfigLoader(undefined, logger);
  const domainRegistry = configLoader.loadDomainRegistry();
  const domains = domainRegistry.managed_domains.map(d => d.domain);

  const client = new AhrefsClient({ logger });
  const reporter = new ReportGenerator(undefined, client, logger);

  try {
    const report = await reporter.generateWeeklyReport(domains, { enableHtml: true });
    const format = (req.query.format as string || 'html').toLowerCase();

    switch (format) {
      case 'csv': {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="ahrefs-seo-report-${new Date().toISOString().slice(0, 10)}.csv"`);
        return res.status(200).send(report.csvContent || '');
      }

      case 'json': {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(report);
      }

      case 'markdown':
      case 'md': {
        res.setHeader('Content-Type', 'text/markdown');
        return res.status(200).send(report.markdownContent);
      }

      case 'html':
      default: {
        // Inject top Format Selector Toolbar for Pedro into the HTML output
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

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(fullHtml);
      }
    }
  } catch (error) {
    logger.error('Vercel serverless report generation failed', { error: (error as Error).message });
    return res.status(500).json({
      error: 'Failed to generate weekly report',
      details: (error as Error).message
    });
  }
}
