import { BeforeAll, AfterAll, Before, After, ITestCaseHookParameter, setDefaultTimeout } from '@cucumber/cucumber';
import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const headlessEnv = (process.env.HEADLESS ?? 'false').toLowerCase();
const isHeadless = headlessEnv === 'true';

setDefaultTimeout(60_000);

declare global {
  var __BROWSER__: Browser | undefined;
  var __PAGE__: Page | undefined;
  var __CTX__: { screenshotPath?: string, t0?: number, t1?: number } | undefined;
}

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

BeforeAll(async function () {
  await ensureDir('reports');
  await ensureDir('screenshots');

  globalThis.__BROWSER__ = await puppeteer.launch({
    headless: isHeadless,                        // 👈 controlled by env
    slowMo: isHeadless ? 0 : 100,                // 👈 slowMo only when visible (local)
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // 👈 required in CI
  });
});

AfterAll(async function () {
  await globalThis.__BROWSER__?.close();
});

Before(async function () {
  const browser = globalThis.__BROWSER__!;
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  globalThis.__PAGE__ = page;
  globalThis.__CTX__ = {};
});

After(async function (this: any, { pickle, result }: ITestCaseHookParameter) {
  const name = pickle?.name?.replace(/\W+/g, '_') ?? 'scenario';

  if (result?.status === 'FAILED' && globalThis.__PAGE__) {
    await ensureDir('screenshots');
    const failureShot = path.join('screenshots', `${name}-FAILED.png`);
    await globalThis.__PAGE__!.screenshot({ path: failureShot as `${string}.png` });
    this.attach(`Saved failure screenshot to ${failureShot}`);
  }

  await globalThis.__PAGE__?.close();
});
