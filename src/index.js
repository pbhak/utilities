import Bolt from '@slack/bolt';
import { readFileSync } from 'node:fs';
import { member_join, app_mention } from './events.js';
import start_server  from './server.js';
import yaml from 'js-yaml';
import { handleReply, message_action } from './actions.js';
import { handle_message_action, handle_message_submission } from './views.js';

export { messages, sendMessage };

const bot = new Bolt.App({
  token: process.env.ACCESS_TOKEN,
  appToken: process.env.SOCKET_TOKEN,
  socketMode: true
});

// todo:
// - make modal for sending/replying messages and have it go off of a button (?)
// - get dms working
// - solder headers?
 
const CHANNEL = process.env.CHANNEL

// Read transcript YAML file
const messages = yaml.load(readFileSync(process.env.YAML_FILE));

async function sendMessage(text) {
  try {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text
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
bot.event('member_joined_channel', async event => member_join(bot, event));
bot.event('app_mention', async event => app_mention(bot, event));

// Actions
bot.action('send_message', handle_message_action);
bot.action('reply_clicked', handleReply);

// Views
bot.view('e', handle_message_submission);

// Start bot and server
(async () => {
  await bot.start();
  console.log(messages.startup.bot);
  message_action(bot.client, CHANNEL)
})();

start_server()

