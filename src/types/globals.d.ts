import type { Browser, Page } from 'puppeteer';

declare global {
  var __BROWSER__: Browser | undefined;
  var __PAGE__: Page | undefined;
  var __CTX__: { screenshotPath?: string, t0?: number, t1?: number } | undefined;
}

export {};
