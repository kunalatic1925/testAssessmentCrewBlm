import type { Page } from 'puppeteer';

export class HomePage {
  constructor(private page: Page, private baseUrl: string) {}

  async open(): Promise<void> {
    await this.page.goto(this.baseUrl, { waitUntil: 'domcontentloaded' });
  }

  async search(keyword: string): Promise<void> {
    const q = encodeURIComponent(keyword);
    await this.page.goto(`${this.baseUrl}/results?search_query=${q}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForSelector('ytd-video-renderer a#video-title, a#video-title-link', { timeout: 30000 });
  }

  async getResultCount(): Promise<number> {
    return await this.page.$$eval('ytd-video-renderer a#video-title, a#video-title-link', els => els.length);
  }

  async openFirstResult(): Promise<void> {
    const selector = 'ytd-video-renderer a#video-title, a#video-title-link';
    await this.page.waitForSelector(selector, { timeout: 30000 });

    const prevPages = await this.page.browser().pages();
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null),
      this.page.click(selector, { button: 'left' })
    ]);

    const pages = await this.page.browser().pages();
    if (pages.length > prevPages.length) {
      const newTab = pages[pages.length - 1];
      await newTab.bringToFront();
      (globalThis as any).__PAGE__ = newTab;
    } else {
      const url = this.page.url();
      if (!/watch\?v=/.test(url)) {
        await this.page.waitForFunction(() => !!document.querySelector('video'), { timeout: 30000 }).catch(() => null);
      }
    }
  }
}
