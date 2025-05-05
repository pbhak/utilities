import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import type { MemberJoinedChannelEvent, WebClient } from '@slack/web-api';
import { transcript } from '..';

export async function memberJoin({
  client,
  event,
}: SlackEventMiddlewareArgs<'member_joined_channel'> & AllMiddlewareArgs): Promise<void> {
  if (event.channel === process.env.PRIVATE_CHANNEL) memberJoinPrivate({ client, event });

  const userInfo = await client.users.info({ user: event.user });
  const isBot = userInfo.user?.is_bot;

  if (event.channel !== process.env.MAIN_CHANNEL || isBot) return;

  // Send the user the initial (ephemeral) welcome message
  await client.chat.postEphemeral({
    channel: event.channel,
    text: transcript.welcome.initial,
    user: event.user,
  });

  // Check the amount of people in the channel, and send a celebratory message if it's a multiple of 10
  const numMembers = (await client.conversations.info({
    channel: event.channel,
    include_num_members: true,
  })).channel?.num_members;

  if (numMembers && numMembers % 10 == 0) {
    await client.chat.postMessage({
      channel: event.channel,
      text: `we just hit ${numMembers} members!`,
    });
  }

  await client.chat.postEphemeral({
    channel: event.channel,
    text: 'want to be publicly welcomed?',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: transcript.welcome.question,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'sure!',
            },
            style: 'primary',
            action_id: 'showWelcomeMessage',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'nah',
            },
            style: 'danger',
            action_id: 'dontShowWelcomeMessage',
          },
        ],
      },
    ],
    user: event.user,
  });
}

async function memberJoinPrivate({
  client,
  event,
}: {
  client: WebClient;
  event: MemberJoinedChannelEvent;
}): Promise<void> {
  await client.chat.postEphemeral({
    channel: event.channel,
    user: event.user,
    text: transcript.private.welcome,
  });

  await client.chat.postEphemeral({
    channel: event.channel,
    user: process.env.USER_ID,
    text: `<@${event.user}> has joined!`,
  });
}
