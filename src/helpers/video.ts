import type { Page } from 'puppeteer';
import { VideoPage } from '../pages/VideoPage.js';
import { delay } from './delay.js';

export async function ensurePlaying(page: Page): Promise<void> {
  const video = new VideoPage(page);
  await video.ensurePlayerReady();
  if (!(await video.isPlaying())) {
    await video.play();
    await delay(300);
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
