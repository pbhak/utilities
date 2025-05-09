import type { AllMiddlewareArgs, SlackActionMiddlewareArgs } from '@slack/bolt';
import { transcript } from '..';

export async function sendWelcomeMessage({
  ack,
  body,
  client,
  respond,
}: SlackActionMiddlewareArgs & AllMiddlewareArgs): Promise<void> {
  await ack();
  if (!body.channel || !body.channel.id) return; // in case the action is triggered from a modal

  await respond({ delete_original: true });

  const welcomeMessage = transcript.welcome.public.replace('{user}', `<@${body.user.id}>`);
  await client.chat.postMessage({
    channel: body.channel.id,
    text: welcomeMessage,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: welcomeMessage,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'send message',
            },
            action_id: 'sendMessage',
          },
        ],
      },
    ],
  });
}

export async function dontSendWelcomeMessage({
  ack,
  body,
  client,
  respond,
}: SlackActionMiddlewareArgs & AllMiddlewareArgs): Promise<void> {
  await ack();

  if (!body.channel || !body.channel.id) return; // in case the action is triggered from a modal

  await client.chat.postEphemeral({
    channel: body.channel.id,
    text: transcript.welcome.private,
    user: body.user.id,
  });

  await client.chat.postEphemeral({
    channel: body.channel.id,
    text: `user <@${body.user.id}> has joined! :yay:`,
    user: process.env.USER_ID
  })

  await respond({ delete_original: true });
}