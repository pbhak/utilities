import type {
  AllMiddlewareArgs,
  BlockAction,
  SlackActionMiddlewareArgs,
  SlackViewMiddlewareArgs,
  ViewSubmitAction,
} from '@slack/bolt';
import { transcript } from '..';

interface MessageMetadata {
  ts: string;
  cid: string;
  uid: string;
  doNotWelcome: boolean;
}

export async function openMessageView({
  ack,
  body,
  client,
  context,
}: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs): Promise<void> {
  await ack();
  const doNotWelcome = body.actions[0]?.action_id == 'replyAgain';

  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      callback_id: 'messageViewSubmitted',
      type: 'modal',
      private_metadata: JSON.stringify({
        ts: body.message?.ts,
        cid: body.container.channel_id,
        uid: body.user.id,
        doNotWelcome: doNotWelcome,
      }),
      title: {
        type: 'plain_text',
        text: 'top text',
      },
      submit: {
        type: 'plain_text',
        text: 'send',
      },
      close: {
        type: 'plain_text',
        text: 'cancel',
      },
      blocks: [
        {
          type: 'input',
          block_id: 'message',
          label: {
            type: 'plain_text',
            text: 'message to send:',
          },
          element: {
            type: 'plain_text_input',
            action_id: 'input',
          },
        },
      ],
    },
  });
}

export async function handleMessageSubmission({
  ack,
  body,
  client,
  payload,
  respond,
}: SlackViewMiddlewareArgs<ViewSubmitAction> & AllMiddlewareArgs): Promise<void> {
  await ack({ response_action: 'clear' });

  const metadata: MessageMetadata = JSON.parse(payload.private_metadata);

  if (!metadata.doNotWelcome) {
    // Since doNotWelcome was false, we know the user got here from a welcome message
    // Update the welcome message to remove the "send message" button
    await client.chat.update({
      channel: metadata.cid,
      ts: metadata.ts,
      text: transcript.welcome.public.replace('{user}', `<@${body.user.id}>`),
    });
  }

  await client.chat.postEphemeral({
    channel: metadata.cid,
    user: metadata.uid,
    text: 'message sent!',
  });

  await client.chat.postMessage({
    channel: process.env.USER_ID,
    text: `<@${metadata.uid}> said: ${payload.state.values.message?.input?.value}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<@${metadata.uid}> said: ${payload.state.values.message?.input?.value}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'reply',
            },
            action_id: 'replyClicked',
          },
        ],
      },
    ],
  });
}
