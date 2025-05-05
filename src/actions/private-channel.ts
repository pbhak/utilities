import type {
  AllMiddlewareArgs,
  BlockAction,
  SlackActionMiddlewareArgs,
  SlackViewMiddlewareArgs,
  ViewSubmitAction,
} from '@slack/bolt';
import { transcript } from '..';

export async function joinPrivateChannel({
  ack,
  body,
  client,
}: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs): Promise<void> {
  await ack();

  if (!body.channel || !body.message) return;

  await client.conversations.invite({
    channel: process.env.PRIVATE_CHANNEL,
    users: body.user.id,
  });

  await client.chat.update({
    channel: body.channel?.id,
    ts: body.message?.ts,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: transcript.private.invite + `\n channel joined :)`,
        },
      },
    ],
  });
}

export async function openPrivateChannelView({
  ack,
  body,
  client,
}: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs): Promise<void> {
  await ack();

  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      callback_id: 'privateChannelViewSubmitted',
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'add to #parneel-reflects',
      },
      submit: {
        type: 'plain_text',
        text: 'submit',
      },
      blocks: [
        {
          type: 'section',
          block_id: 'usersToAdd',
          text: {
            type: 'mrkdwn',
            text: '*user(s) to add:*',
          },
          accessory: {
            type: 'multi_users_select',
          },
        },
      ],
    },
  });
}

export async function addToPrivateChannel({
  ack,
  client,
  payload,
}: SlackViewMiddlewareArgs<ViewSubmitAction> & AllMiddlewareArgs): Promise<void> {
  await ack();

  payload.state.values.usersToAdd?.users?.selected_users?.forEach(async (id) => {
    await client.chat.postMessage({
      channel: id,
      text: transcript.private.invite,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: transcript.private.invite,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'join',
              },
              style: 'primary',
              action_id: 'joinPrivateChannel',
            },
          ],
        },
      ],
    });
  });
}
