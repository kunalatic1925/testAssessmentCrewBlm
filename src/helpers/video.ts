import type { Page } from 'puppeteer';
import { VideoPage } from '../pages/VideoPage.js';
import { delay } from './delay.js';

export async function ensurePlaying(page: Page): Promise<void> {
  const video = new VideoPage(page);
  await video.ensurePlayerReady();

  // Try up to 5 times over ~6–7 seconds
  for (let attempt = 0; attempt < 5; attempt++) {
    if (await video.isPlaying()) {
      return;
    }
    await video.play();
    await delay(1200);
  }
}


export async function ensurePaused(page: Page): Promise<void> {
  const video = new VideoPage(page);
  await video.ensurePlayerReady();
  if (await video.isPlaying()) {
    await video.pause();
    await delay(300);
  } else {
    await video.play();
    await delay(500);
    await video.pause();
    await delay(300);
  }
}
