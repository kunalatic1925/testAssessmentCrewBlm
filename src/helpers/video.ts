import type { Page } from 'puppeteer';
import { VideoPage } from '../pages/VideoPage.js';
import { delay } from './delay.js';

export async function ensurePlaying(page: Page): Promise<void> {
  const video = new VideoPage(page);
  await video.ensurePlayerReady();
  await delay(2000); // buffer

  for (let attempt = 0; attempt < 6; attempt++) {
    if (await video.isPlaying()) {
      return;
    }
    await video.play();
    await delay(1500);
  }
}

export async function ensurePaused(page: Page): Promise<void> {
  const video = new VideoPage(page);
  await video.ensurePlayerReady();

  // Try up to 5 times to get to a paused state
  for (let attempt = 0; attempt < 5; attempt++) {
    if (await video.isPaused()) {
      return;
    }

    await video.pause();
    await delay(800);
  }
}

