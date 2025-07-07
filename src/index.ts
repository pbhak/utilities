import { App } from '@slack/bolt';
import type { ChatPostMessageResponse } from '@slack/web-api';
import { CronJob } from 'cron';
import { parse as parseYAML } from 'yaml';
import {
  addToPrivateChannel,
  joinPrivateChannel,
  openPrivateChannelView,
} from './actions/private-channel';
import { handleMessageSubmission, openMessageView } from './actions/send-message';
import { handleReplySubmission, replyAgain, replyClicked } from './actions/send-reply';
import { dontSendWelcomeMessage, sendWelcomeMessage } from './actions/welcome-messages';
import { getId } from './commands/get-id';
import { sha256 } from './commands/sha256';
import { joinPingGroup } from './commands/yappery';
import { appMention } from './events/app-mention';
import { checkNodeStatus } from './events/check-node-status';
import { homeOpened } from './events/home-open';
import { memberJoin } from './events/member-join';
import startServer from './server';
import type { Transcript } from './types/transcript';

export const app = new App({
  token: process.env.ACCESS_TOKEN,
  appToken: process.env.SOCKET_TOKEN,
  socketMode: true,
});

process.on('uncaughtException', (error) => {
  sendLog(
    `An uncaught exception has occurred (\`${error.name}\`):\n\`\`\`${error.stack}\`\`\``
  );
});

app.error(async (error) => {
  sendLog(`An API error has occured (\`${error.name}\`):\n\`\`\`${error.stack}\`\`\``);
});

export const transcript: Transcript = parseYAML(await Bun.file('transcript.yml').text());

/** Send a debug log to the log channel as Markdown. */
export async function sendLog(
  text: string,
  origin?: string,
  thread_ts?: string
): Promise<ChatPostMessageResponse> {
  const messageText = (origin ? `${origin}: ` : `log: `) + text;
  return await app.client.chat.postMessage({
    channel: process.env.LOG_CHANNEL,
    text: messageText,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: messageText,
        },
      },
    ],
    thread_ts,
  });
}

// new CronJob('0 * * * *', checkNodeStatus, null, true, 'America/Los_Angeles');

////// Event handlers
app.event('member_joined_channel', memberJoin);
app.event('app_mention', appMention);
app.event('app_home_opened', homeOpened);

////// Action handlers
app.action('sendMessage', openMessageView);
app.action('replyAgain', replyAgain);
app.action('replyClicked', replyClicked);
app.action('showWelcomeMessage', sendWelcomeMessage);
app.action('dontShowWelcomeMessage', dontSendWelcomeMessage);
app.action('privateChannelAdd', openPrivateChannelView);
app.action('joinPrivateChannel', joinPrivateChannel);

////// View submission callbacks
app.view('messageViewSubmitted', handleMessageSubmission);
app.view('replyViewSubmitted', handleReplySubmission);
app.view('privateChannelViewSubmitted', addToPrivateChannel);

////// Slash commands
app.command('/sha256', sha256);
app.command('/yappery', joinPingGroup);
app.command('/get-id', getId);

(async () => {
  await app.start();
  console.log(transcript.startup.bot);
  sendLog(transcript.startup.bot, 'bot');
})();

startServer();
