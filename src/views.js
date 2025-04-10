export { handle_message_action, handle_message_submission };

async function handle_message_action({ ack, body, client }) {
    await ack()

    try {
      await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          callback_id: 'e',
          type: 'modal',
          private_metadata: `[${body.message.ts}, "${body.container.channel_id}", "${body.user.id}"]`,
          title: {
            type: 'plain_text',
            text: 'top text',
            emoji: true
          },
          submit: {
            type: 'plain_text',
            text: 'Send',
            emoji: true
          },
          close: {
            type: 'plain_text',
            text: 'Cancel',
            emoji: true
          },
          blocks: [
            {
              type: 'input',
              block_id: 'message',
              label: {
                type: 'plain_text',
                text: 'message to send:'
              },
              element: {
                type: 'plain_text_input',
                action_id: 'input',
                multiline: false
              }
            }
          ]
        }
      });
    } catch (error) {
      await client.chat.postMessage({
        channel: body.container.channel_id,
        text: messages.error
      });
      console.error(error);
    }
}

async function handle_message_submission ({ ack, client, payload }) {
  await ack({
    response_action: 'clear'
  });

  const metadata = JSON.parse(payload.private_metadata)
  
  await client.chat.update({
    channel: metadata[1],
    ts: metadata[0],
    text: 'test button',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'message sent!'
        }
      },
    ]
  });

  await client.chat.postMessage({
    channel: 'U07V1ND4H0Q',
    text: `<@${metadata[2]}> said: ${payload.state.values.message.input.value}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<@${metadata[2]}> said: ${payload.state.values.message.input.value}`
        }
      },
      {
        type: 'actions',
        elements: [{
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'reply'
          },
          action_id: 'reply_clicked'
        }]
      }
  ]
  });
}