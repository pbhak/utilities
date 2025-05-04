import type {
  AllMiddlewareArgs,
  BlockAction,
  SlackActionMiddlewareArgs,
  SlackViewMiddlewareArgs,
  ViewSubmitAction,
} from '@slack/bolt';
import { transcript } from '..';
import { pathToFileURL } from 'url';

export async function joinPrivateChannel({
  ack,
  body,
  client,
}: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs): Promise<void> {
  await ack();

  await client.conversations.invite({
    channel: process.env.PRIVATE_CHANNEL,
    users: body.user.id,
  });

  await client.chat.update({
    channel: body.channel?.id as string,
    ts: body.message?.ts as string,
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
      callback_id: 'privateChannelViewSubmitted', // FIXME
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
          block_id: 'usersToAdd', // FIXME
          text: {
            type: 'mrkdwn',
            text: '*user(s) to add:*',
          },
          accessory: {
            type: 'multi_users_select',
            action_id: 'users', // FIXME
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
              action_id: 'join_private_channel', // FIXME
            },
          ],
        },
      ],
    });
  });
}