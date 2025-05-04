import { App } from '@slack/bolt';
import { parse as parseYAML } from 'yaml';
import type { Transcript } from '../types/transcript';
// TODO replace postMessage with say when needed
// TODO error handling
export const app = new App({
  token: process.env.ACCESS_TOKEN,
  appToken: process.env.SOCKET_TOKEN,
  socketMode: true,
});

export const transcript: Transcript = parseYAML(await Bun.file('transcript.yml').text());

export async function sendLog(text: string): Promise<void> {
  await app.client.chat.postMessage({
    channel: process.env.LOG_CHANNEL,
    text,
  });
}

(async () => {
  await app.start();
  console.log(transcript.startup.bot);
})();
