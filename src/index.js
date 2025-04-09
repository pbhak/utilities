import Bolt from '@slack/bolt';
import yaml from 'js-yaml';
import { readFileSync } from 'node:fs';
import { member_join, app_mention } from './events.js';
import { start_server } from './server.js';

// TODO: refactor file, 
// TODO: split folder structure
// TODO: clean up imports

const bot = new Bolt.App({
  token: process.env.ACCESS_TOKEN,
  appToken: process.env.SOCKET_TOKEN,
  socketMode: true
});
 
// TODO: make CHANNEl an environment variable?
// const CHANNEL = 'C08H2P5RHA7'; // #parneel-yaps
export const CHANNEL = 'C01KPAX6AG2'  // #bot-testing-ground

// Read transcript YAML file
export const messages = yaml.load(readFileSync(process.env.YAML_FILE));


export async function sendMessage(text) {
  try {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text,
    });
  } catch (error) {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text: messages.error
    });
    console.error(error);
  }
}

// Events

bot.event('message', async event => member_join(bot, event));
bot.event('app_mention', async event => app_mention(bot, event));

// Start bot and server
(async () => {
  await bot.start();
  console.log(messages.startup.bot);
})();

start_server()

