import { messages } from './index.js';

export { sendWelcomeMessage, dontSendWelcomeMessage };

async function sendWelcomeMessage({ ack, body, client, respond }) {
  await ack();

  await respond({
    delete_original: true
  })

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

async function dontSendWelcomeMessage({ ack, body, client, respond }) {
  await ack();

  await client.chat.postEphemeral({
    channel: body.channel.id,
    text: 'alright, no problem boss!',
    user: body.user.id
  });

  await respond({
    delete_original: true
  })

  await client.chat.postMessage({
    channel: 'U07V1ND4H0Q', // my dms
    text: `user <@${body.user.id}> has joined the channel!`
  });
}

