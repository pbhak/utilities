import { messages } from './index.js'

export { openMessageView, openReplyView };
export { handleMessageSubmission, handleReplySubmission };

async function openMessageView({ ack, body, client }) {
    await ack()

    try {
      await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          callback_id: 'messageViewSubmitted',
          type: 'modal',
          private_metadata: JSON.stringify({ts: body.message.ts, cid: body.container.channel_id, uid: body.user.id}),
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

async function openReplyView({ ack, body, client }) {
  await ack();

  console.log(body)

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        callback_id: 'replyViewSubmitted',
        type: 'modal',
        private_metadata: JSON.stringify({
          ts: body.message.ts, 
          cid: body.container.channel_id, 
          uid: body.message.text.match(/<@(\w+)>/)[1],
          message: body.message.text.match(/(?<=said: ).*/)[0]
        }),
        title: {
          type: 'plain_text',
          text: 'top text'
        },
        submit: {
          type: 'plain_text',
          text: 'Send'
        },
        close: {
          type: 'plain_text',
          text: 'Cancel',
        },
        blocks: [
          {
            type: 'input',
            block_id: 'reply',
            label: {
              type: 'plain_text',
              text: 'reply:'
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

// Callbacks

async function handleMessageSubmission({ ack, client, payload }) {
  await ack({
    response_action: 'clear'
  });

  const metadata = JSON.parse(payload.private_metadata)
  
  await client.chat.update({
    channel: metadata.cid,
    ts: metadata.ts,
    text: 'message sent!'
  });

  await client.chat.postMessage({
    channel: 'U07V1ND4H0Q',
    text: `<@${metadata.uid}> said: ${payload.state.values.message.input.value}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<@${metadata.uid}> said: ${payload.state.values.message.input.value}`
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

async function handleReplySubmission({ ack, client, payload }) {
  await ack();
  const metadata = JSON.parse(payload.private_metadata)

  console.log(metadata)
  
  await client.chat.update({
    ts: metadata.ts,
    channel: metadata.cid,
    text: 'reply sent!'
  });

  await client.chat.postMessage({
    channel: metadata.uid,
    blocks: [{
			type: 'rich_text',
      text: `@pbhak replied: ${payload.state.values.reply.input.value}`,		
      elements: [
				{
					type: 'rich_text_quote',
					elements: [{
							type: 'text',
							text: metadata.message
						
          }]
				},
				{
					type: 'rich_text_section',
					elements: [
						{
							type: 'user',
							user_id: 'U07V1ND4H0Q' // me
						},
						{
							type: 'text',
							text: ` replied: ${payload.state.values.reply.input.value}`
						}
					]
				}
			]
		}]
  });
}