import { messages } from './index.js';

export { member_join, app_mention };

async function member_join({ event, body, client }) {
  if (event.channel != 'C08H2P5RHA7') {
    // return; // because we don't want it welcoming people in other channels
  }

  try {
    await client.chat.postEphemeral({
      channel: event.channel,
      text: messages.welcome.initial,
      user: event.user ?? event.message.user // to account for edited messages
    });

    await client.chat.postEphemeral({
      channel: body.event.channel,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: messages.welcome.question
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'sure!'
              },
              style: 'primary',
              action_id: 'showWelcomeMessage'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'nah'
              },
              style: 'danger',
              action_id: 'dontShowWelcomeMessage'
            }
          ]
        }
      ],
      user: event.user ?? event.message.user
    });
  } catch (error) {
    await client.chat.postMessage({
      channel: event.channel,
      text: messages.error
    });
    console.error(error);
  }
}

async function app_mention({ client, event }) {
  try {
    await client.reactions.add({
      channel: event.channel,
      name: 'hyper-dino-wave',
      timestamp: event.ts
    });
  } catch (error) {
    await client.chat.postMessage({
      channel: event.channel,
      text: messages.error
    });
    console.error(error);
  }
}
