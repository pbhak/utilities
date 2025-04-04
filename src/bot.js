import Bolt from '@slack/bolt';
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const bot = new Bolt.App({
  token: process.env.ACCESS_TOKEN,
  appToken: process.env.SOCKET_TOKEN,
  socketMode: true
});

const CHANNEL = 'C01KPAX6AG2'; // C01KPAX6AG2 for #bot-testing-ground, C08H2P5RHA7 for #parneel-yaps

const messages = yaml.load(readFileSync('src/messages.yml'));

bot.event('message', async event => {
  try {
    await bot.client.chat.postEphemeral({
      channel: CHANNEL,
      text: messages.welcome,
      user: event.body.event.user
    });
  } catch (error) {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text: messages.error,
    });
    console.error(error);
  }
});

export async function battery_msg(battery) {
  try {
    await bot.client.chat.postEphemeral({
      channel: CHANNEL,
      text: `Battery percentage is ${battery}%`,
      user: 'U07V1ND4H0Q'
    });
  } catch (error) {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text: messages.error,
    });
    console.error(error);
  }
}

(async () => {
  await bot.start();
  console.log('Application started');
})();
