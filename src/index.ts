import { App } from '@slack/bolt';
import { parse as parseYAML } from 'yaml';
import type { Transcript } from '../types/transcript';

export const app = new App({
  token: process.env.ACCESS_TOKEN,
  appToken: process.env.SOCKET_TOKEN,
  socketMode: true,
});

export const transcript: Transcript = parseYAML(
  await Bun.file('transcript.yml').text()
);

(async () => {
  await app.start();
  console.log(transcript.startup.bot);
})();