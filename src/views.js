import { messages } from "./index.js";

export { openMessageView, openReplyView, openPrivateChannelView };
export { handleMessageSubmission, handleReplySubmission, addToPrivateChannel };

async function openMessageView({ ack, body, client }) {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        callback_id: "messageViewSubmitted",
        type: "modal",
        private_metadata: JSON.stringify({
          ts: body.message.ts,
          cid: body.container.channel_id,
          uid: body.user.id,
        }),
        title: {
          type: "plain_text",
          text: "top text",
        },
        submit: {
          type: "plain_text",
          text: "Send",
        },
        close: {
          type: "plain_text",
          text: "Cancel",
        },
        blocks: [
          {
            type: "input",
            block_id: "message",
            label: {
              type: "plain_text",
              text: "message to send:",
            },
            element: {
              type: "plain_text_input",
              action_id: "input",
              multiline: false,
            },
          },
        ],
      },
    });
  } catch (error) {
    await client.chat.postMessage({
      channel: body.container.channel_id,
      text: messages.error,
    });
    console.error(error);
  }
}

async function openReplyView({ ack, body, client }) {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        callback_id: "replyViewSubmitted",
        type: "modal",
        private_metadata: JSON.stringify({
          ts: body.message.ts,
          cid: body.container.channel_id,
          uid: body.message.text.match(/<@(\w+)>/)[1],
          message: body.message.text.match(/(?<=said: ).*/)[0],
        }),
        title: {
          type: "plain_text",
          text: "top text",
        },
        submit: {
          type: "plain_text",
          text: "Send",
        },
        close: {
          type: "plain_text",
          text: "Cancel",
        },
        blocks: [
          {
            type: "input",
            block_id: "reply",
            label: {
              type: "plain_text",
              text: "reply:",
            },
            element: {
              type: "plain_text_input",
              action_id: "input",
              multiline: false,
            },
          },
        ],
      },
    });
  } catch (error) {
    await client.chat.postMessage({
      channel: body.container.channel_id,
      text: messages.error,
    });
    console.error(error);
  }
}

async function openPrivateChannelView({ ack, body, client }) {
  await ack();
  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      callback_id: "privateChannelViewSubmitted",
      type: "modal",
      title: {
        type: "plain_text",
        text: "add to #parneel-reflects",
        emoji: true,
      },
      submit: {
        type: "plain_text",
        text: "Submit",
      },
      blocks: [
        {
          type: "section",
          block_id: "usersToAdd",
          text: {
            type: "mrkdwn",
            text: "*user(s) to add:*",
          },
          accessory: {
            type: "multi_users_select",
            action_id: "users",
          },
        },
      ],
    },
  });
}

// Callbacks

async function handleMessageSubmission({ ack, body, client, payload }) {
  await ack({
    response_action: "clear",
  });

  const metadata = JSON.parse(payload.private_metadata);

  await client.chat.update({
    channel: metadata.cid,
    ts: metadata.ts,
    text: messages.welcome.public.replace("{user}", `<@${body.user.id}>`),
  });

  await client.chat.postMessage({
    channel: metadata.cid,
    text: "message sent!",
  });

  await client.chat.postMessage({
    channel: "U07V1ND4H0Q", // my dms :p
    text: `<@${metadata.uid}> said: ${payload.state.values.message.input.value}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${metadata.uid}> said: ${payload.state.values.message.input.value}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "reply",
            },
            action_id: "reply_clicked",
          },
        ],
      },
    ],
  });
}

async function handleReplySubmission({ ack, client, payload }) {
  await ack();
  const metadata = JSON.parse(payload.private_metadata);

  await client.chat.update({
    ts: metadata.ts,
    channel: metadata.cid,
    text: "reply sent!",
  });

  await client.chat.postMessage({
    channel: metadata.uid,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `> ${metadata.message} \n <@U07V1ND4H0Q> replied: ${payload.state.values.reply.input.value}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "reply",
            },
            action_id: "replyAgain",
          },
        ],
      },
    ],
  });
}

async function addToPrivateChannel({ ack, client, payload }) {
  await ack();
  payload.state.values.usersToAdd.users.selected_users.forEach(async id => {
    await client.chat.postMessage({
      channel: id,
      text: messages.private.invite,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: messages.private.invite
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'join'
              },
              style: 'primary',
              action_id: 'join_private_channel'
            }
          ]
        }
      ]
    });
  });
}
