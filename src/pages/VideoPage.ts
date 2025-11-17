import type { Page } from 'puppeteer';
import { delay } from '../helpers/delay.js';

export class VideoPage {
  constructor(private page: Page) {}

  async ensurePlayerReady(): Promise<void> {
    await this.page.waitForFunction(() => !!document.querySelector('video'), { timeout: 30_000 });
  }

  private async isAdShowing(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const p = document.querySelector('.html5-video-player');
      const overlays =
        document.querySelector('.ytp-ad-player-overlay') ||
        document.querySelector('.ytp-ad-image-overlay');
      return !!p && (p.classList.contains('ad-showing') || p.classList.contains('ad-interrupting')) || !!overlays;
    });
  }

  async waitThenSkipAd(initialWaitMs = 12_000, pollMs = 250, maxPollMs = 12_000, fallbackMs = 5_000): Promise<void> {
    const { page } = this;

    // 1) Let the ad run first so Skip can appear (no mute/pause here)
    await delay(initialWaitMs);

    // 2) Poll for Skip for up to maxPollMs
    const deadline = Date.now() + maxPollMs;

    // Prefer the button, but also support your provided <span> selector by clicking its closest button.
    const selectors = [
      'button.ytp-ad-skip-button',
      '.ytp-ad-skip-button-modern',
      '.ytp-skip-ad-button',
      '.ytp-ad-skip-button-container button',
      'span.ytp-skip-ad-button__icon' // we'll click its closest('button') via DOM
    ];

    while (Date.now() < deadline) {
      // If ad ended by itself, stop early
      if (!(await this.isAdShowing())) return;

      // Try each selector strategy
      for (const sel of selectors) {
        const el = await page.$(sel);
        if (!el) continue;

        try {
          // If we matched the <span> you gave, click its nearest button via DOM
          if (sel === 'span.ytp-skip-ad-button__icon') {
            const clicked = await page.evaluate((spanSel) => {
              const span = document.querySelector(spanSel);
              const btn = span ? span.closest('button') : null;
              if (btn instanceof HTMLButtonElement) { btn.click(); return true; }
              return false;
            }, sel);
            if (clicked) {
              await delay(300);
              return;
            }
          } else {
            // Normal Puppeteer click on button
            await el.click({ delay: 20 });
            await delay(300);
            return;
          }
        } catch {
          // Try DOM-based click as a fallback
          try {
            const success = await page.evaluate((css) => {
              const node = document.querySelector(css);
              if (!node) return false;
              (node as HTMLElement).click?.();
              return true;
            }, sel);
            if (success) {
              await delay(300);
              return;
            }
          } catch {}
        }
      }

      await delay(pollMs);
    }

    // 3) Skip never appeared (unskippable?) → wait a bit more and continue
    await delay(fallbackMs);
  }

  async isPlaying(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const v = document.querySelector('video') as HTMLVideoElement | null;
      return !!v && !v.paused && v.currentTime > 0;
    });
  }

  async pause(): Promise<void> {
    await this.page.keyboard.press('k');
    await delay(800);
  }

  async play(): Promise<void> {
    // Ensure the player has focus and we interact with it
    try {
      await this.page.click('video', { delay: 50 }).catch(() => {});
    } catch {}
  
    // Keyboard toggle (YouTube shortcut)
    await this.page.keyboard.press('k').catch(() => {});
    await delay(1000);
  
    // Fallback: direct JS play() on the <video> element
    try {
      await this.page.evaluate(() => {
        const v = document.querySelector('video') as HTMLVideoElement | null;
        if (v && v.paused) {
          const p = v.play();
          if (p && typeof p.then === 'function') {
            p.catch(() => { /* ignore autoplay errors */ });
          }
        }
      });
    } catch {}
  
    await delay(500);
  }

  async seekForward(seconds = 10): Promise<void> {
    const presses = Math.max(1, Math.round(seconds / 10));
    for (let i = 0; i < presses; i++) {
      await this.page.keyboard.press('l');
      await delay(400);
    }
  }

  async currentTime(): Promise<number> {
    return await this.page.evaluate(() => {
      const v = document.querySelector('video') as HTMLVideoElement | null;
      return v?.currentTime ?? 0;
    });
  }

  async title(): Promise<string> {
    const h1Text = await this.page.$eval('h1', el => el.textContent?.trim() ?? '').catch(() => '');
    if (h1Text) return h1Text;
    return this.page.title();
  }
}
