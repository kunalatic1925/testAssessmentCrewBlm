import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import dotenv from 'dotenv';
import { HomePage } from '../pages/HomePage.js';
import { VideoPage } from '../pages/VideoPage.js';
import { ensurePaused, ensurePlaying } from '../helpers/video.js';
import { delay } from '../helpers/delay.js';

dotenv.config();

const BASE_URL = process.env.BASE_URL ?? 'https://www.youtube.com';
const KEYWORD = process.env.SEARCH_KEYWORD ?? 'QA automation';

let home: HomePage;
let video: VideoPage;

Given('I open the video site', async function (this: any) {
  const page = globalThis.__PAGE__!;
  home = new HomePage(page, BASE_URL);
  await home.open();
  this.attach(`Opened: ${BASE_URL}`);
});

When('I search for a keyword', async function (this: any) {
  await home.search(KEYWORD);
  this.attach(`Searched for: ${KEYWORD}`);
});

Then('I should see at least one search result', async function (this: any) {
  const count = await home.getResultCount();
  this.attach(`Result count: ${count}`);
  assert.ok(count >= 1, 'Expected at least one search result');
});

When('I open the first video result', async function (this: any) {
  await home.openFirstResult();
  video = new VideoPage(globalThis.__PAGE__!);
  await video.ensurePlayerReady();

  // If you have ad handling (waitThenSkipAd / ensureNoAd), keep that here
  if ((video as any).waitThenSkipAd) {
    await (video as any).waitThenSkipAd(12_000, 250, 12_000, 5_000);
  }

  // 🔹 Go fullscreen and ensure playback once we are on the watch page
  await video.ensureFullscreenAndPlaying();
  
});

Then('the video should start playing', async function (this: any) {
  // Extra safety: try to ensure playing again
  await ensurePlaying(globalThis.__PAGE__!);

  const playing = await video.isPlaying();
  this.attach(`Playing status in CI: ${playing}`);
  assert.ok(playing, 'Expected video to be playing');
});

When('I pause the video', async function (this: any) {
  await ensurePaused(globalThis.__PAGE__!);
});

Then('the video should be paused', async function (this: any) {
  assert.equal(await video.isPlaying(), false, 'Expected video to be paused');
});

When('I seek forward in the video', async function (this: any) {
  await ensurePlaying(globalThis.__PAGE__!);  // 👈 make sure it's playing
  const t0 = await video.currentTime();
  await video.waitThenSkipAd(12_000, 250, 12_000, 5_000);
  await video.seekForward(15);
  await delay(800);  
  const t1 = await video.currentTime();
  (globalThis as any).__CTX__!.t0 = t0;
  (globalThis as any).__CTX__!.t1 = t1;
  this.attach(`Time before: ${t0.toFixed(2)}s; after seek: ${t1.toFixed(2)}s`);
});

Then('the video time should have advanced', async function (this: any) {
  const { t0, t1 } = (globalThis as any).__CTX__ || {};
  if (typeof t0 !== 'number' || typeof t1 !== 'number') {
    throw new Error('Seek times not recorded. Ensure the When step ran.');
  }
  assert.ok(t1 > t0 + 5, `Expected currentTime to advance by >5s after seek (t0=${t0}, t1=${t1})`);
});

When('I take a screenshot while playing', async function (this: any) {
  await ensurePlaying(globalThis.__PAGE__!);
  const name = `playing-${Date.now()}.png`;
  const filepath = path.join('screenshots', name);
  await globalThis.__PAGE__!.screenshot({ path: filepath as `${string}.png` });
  globalThis.__CTX__!.screenshotPath = filepath;
  this.attach(`Saved screenshot: ${filepath}`);
});

Then('the screenshot file should exist', async function (this: any) {
  const fp = globalThis.__CTX__!.screenshotPath;
  assert.ok(fp, 'No screenshot path recorded');
  await fs.access(fp!);
});

Then('the video title should not be empty', async function (this: any) {
  const title = await video.title();
  this.attach(`Title: ${title}`);
  assert.ok(title && title.trim().length > 0, 'Expected non-empty video title');
});
