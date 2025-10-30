# UI Automation Framework (Puppeteer + Cucumber + TypeScript, POM)

Visible Chrome, slowMo for demos, robust YouTube test (search → play/pause → seek → screenshot → title check), and dual reporting:
- **Basic report:** `reports/report.html` + `reports/report.json`
- **Enhanced report:** `reports/history/index.html` (with embedded screenshots & history)

## Requirements
- Node.js 20+
- Internet access for `npm install` (to fetch reporters)

## Setup
```bash
npm install
cp .env.example .env
# (optional) edit .env to change BASE_URL or SEARCH_KEYWORD
```

## Run
```bash
npm run pretest   # compile TS → dist
npm test          # runs cucumber (visible Chrome)
npm run report:open  # open enhanced report
```

## Structure
```
features/
  search_and_play.feature
src/
  hooks.ts
  steps/search_and_play.steps.ts
  pages/HomePage.ts
  pages/VideoPage.ts
  helpers/delay.ts
  helpers/video.ts
reports/            # basic report + enhanced history
screenshots/        # runtime screenshots
scripts/generate-report.mjs  # builds enhanced report
```
