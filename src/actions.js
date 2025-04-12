import { messages } from './index.js';

export { sendWelcomeMessage, dontSendWelcomeMessage };

async function sendWelcomeMessage({ ack, body, client }) {
  await ack();

  try {
    await client.chat.postMessage({
      channel: body.channel.id,
      text: `welcome to my channel <@${body.user.id}>!`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `welcome to my channel <@${body.user.id}>!`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'send message'
              },
              action_id: 'send_message'
            }
          ]
        }
      ]
    })
  } catch(error) {
    await client.chat.postMessage({
      channel: body.channel.id,
      text: messages.error
    });
    console.error(error);
  }
}

async function dontSendWelcomeMessage() {}