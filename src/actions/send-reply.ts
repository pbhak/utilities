import type {
  AllMiddlewareArgs,
  BlockAction,
  SlackActionMiddlewareArgs,
  SlackViewMiddlewareArgs,
  ViewSubmitAction,
} from '@slack/bolt';

interface ReplyMetadata {
  ts: string;
  cid: string;
  uid: string;
  senderUid: string;
  message: string;
}

export async function openReplyView({
  ack,
  body,
  client,
}: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs): Promise<void> {
  await ack();

  if (!body.message || !body.message.text) return;

  let replyBlockquote: string = '';

  if (body.actions[0]?.action_id == 'replyClicked') {
    replyBlockquote = body.message.text.match(/said:\s*(.*)/)![1] ?? '';
  } else if (body.actions[0]?.action_id == 'replyAgain') {
    const initialReplyBlockquote = body.message.text.match(
      /(?<=replied:\s)(.*?)(?=\sreply button$)/
    );
    if (initialReplyBlockquote) {
      replyBlockquote = initialReplyBlockquote[0];
    } else {
      replyBlockquote = body.message.text.match(/(?<=replied: ).*/)![0];
    }
  }

  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      callback_id: 'replyViewSubmitted',
      type: 'modal',
      private_metadata: JSON.stringify({
        ts: body.message?.ts,
        cid: body.container.channel_id,
        uid: body.message.text.match(/<@(\w+)>/)![1],
        senderUid: body.user.id,
        message: replyBlockquote,
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
          block_id: 'reply',
          label: {
            type: 'plain_text',
            text: 'reply:',
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

export async function handleReplySubmission({
  ack,
  client,
  payload,
}: SlackViewMiddlewareArgs & AllMiddlewareArgs): Promise<void> {
  await ack();

  const metadata: ReplyMetadata = JSON.parse(payload.private_metadata);

  await client.chat.update({
    ts: metadata.ts,
    channel: metadata.cid,
    text: `> ${payload.state.values.reply?.input?.value} \nreply sent!`,
  });

  await client.chat.postMessage({
    channel: metadata.uid,
    text: `<@${metadata.senderUid}> replied: ${payload.state.values.reply?.input?.value}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `> ${metadata.message} \n<@${metadata.senderUid}> replied: ${payload.state.values.reply?.input?.value}`,
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
            action_id: 'replyAgain',
          },
        ],
      },
    ],
  });
}
