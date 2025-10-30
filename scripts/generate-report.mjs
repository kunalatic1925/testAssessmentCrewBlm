import reporter from 'multiple-cucumber-html-reporter';
import fs from 'fs-extra';

const jsonReport = 'reports/report.json';
const outputDir = 'reports/history';

await fs.ensureDir(outputDir);

if (!fs.existsSync(jsonReport)) {
  console.error(`JSON report not found at ${jsonReport}. Run tests first.`);
  process.exit(0);
}

reporter.generate({
  jsonDir: 'reports',
  reportPath: outputDir,
  openReportInBrowser: false,
  disableLog: true,
  pageTitle: 'UI Automation Report',
  reportName: 'Puppeteer + Cucumber Report',
  metadata:{
    browser: { name: 'chrome', version: 'auto' },
    device: 'Local Mac/PC',
    platform: { name: process.platform, version: process.version }
  },
  customData: {
    title: 'Run info',
    data: [
      { label: 'Project', value: 'UI Automation Framework (YouTube Demo)' },
      { label: 'Release', value: 'v1.0.0' },
      { label: 'Execution Start Time', value: new Date().toLocaleString() }
    ]
  }
});
console.log(`Enhanced report created at ${outputDir}/index.html`);
