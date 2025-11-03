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
import { memberLeave } from './events/member-leave';

export const app = new App({
  token: process.env.ACCESS_TOKEN,
  appToken: process.env.SOCKET_TOKEN,
  socketMode: true,
});

let botCount = 0;

export function getBotCount(): number {
  return botCount;
}

export function incrementBotCount(): void {
  botCount++;
}

export function decrementBotCount(): void {
  botCount--;
}

export async function initializeBotCount(): Promise<void> {
  try {
    let botCounter = 0;
    let totalMembers = 0;
    let cursor: string | undefined;
    const limit = 200; // https://docs.slack.dev/reference/methods/conversations.members/#pagination 

    do {
      const channelInfo = await app.client.conversations.members({
        channel: process.env.MAIN_CHANNEL,
        limit,
        cursor,
      });

      if (!channelInfo.members || channelInfo.members.length === 0) {
        break;
      }

      const userInfoPromises = channelInfo.members.map(userId =>
        app.client.users.info({ user: userId }).catch(error => {
          console.error(`Failed to get info for user ${userId}:`, error);
          return null;
        })
      );

      const userInfos = await Promise.all(userInfoPromises);

      for (const userInfo of userInfos) {
        if (userInfo?.user?.is_bot) botCounter++;
      }

      totalMembers += channelInfo.members.length;
      cursor = channelInfo.response_metadata?.next_cursor;

      await new Promise(resolve => setTimeout(resolve, 100));

    } while (cursor);

    botCount = botCounter;
    console.log(`Initialized bot count: ${botCount} bots out of ${totalMembers} total members`);
    sendLog(`Bot count initialized: ${botCount} bots out of ${totalMembers} total members`, 'bot-counter');
  } catch (error) {
    console.error('Failed to initialize bot count:', error);
    sendLog(`Failed to initialize bot count: ${error}`, 'bot-counter');
  }
}

process.on('uncaughtException', (error) => {
  sendLog(
    `An uncaught exception has occurred (\`${error.name}\`):\n\`\`\`${error.stack}\`\`\``
  );
});

app.error(async (error) => {
  const stack = (error as any).original?.stack || error.stack;

  await sendLog(`An API error has occurred (\`${error.name}\`):\n\`\`\`${stack}\`\`\``);
});

export const transcript: Transcript = parseYAML(await Bun.file('transcript.yml').text());

function getCommandName(baseCommand: string): string {
  const prefix = process.env.COMMAND_PREFIX;
  return prefix ? `/${prefix}${baseCommand}` : `/${baseCommand}`;
}

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
app.event('member_left_channel', memberLeave);
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
app.command(getCommandName('sha256'), sha256);
app.command(getCommandName('yappery'), joinPingGroup);
app.command(getCommandName('get-id'), getId);

(async () => {
  await app.start();
  console.log(transcript.startup.bot);
  sendLog(transcript.startup.bot, 'bot');

  const prefix = process.env.COMMAND_PREFIX;
  if (prefix) {
    const commandInfo = `Commands available with prefix "${prefix}": ${getCommandName('sha256')}, ${getCommandName('yappery')}, ${getCommandName('get-id')}`;
    console.log(commandInfo);
    sendLog(commandInfo, 'commands');
  }

  // Initialize bot count after startup
  await initializeBotCount();
})();

startServer();
