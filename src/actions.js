import { messages } from "./index.js";

export async function message_action() {
  try {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text: 'test button',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'click me!'
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
    });
  } catch (error) {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text: messages.error
    });
    console.error(error);
  }
}

export async function handle_message_action({ ack, body, client }) {
  await ack()

  try {
    const modal = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        callback_id: 'e',
        "type": "modal",
        "title": {
          "type": "plain_text",
          "text": "top text",
          "emoji": true
        },
        "submit": {
          "type": "plain_text",
          "text": "Submit",
          "emoji": true
        },
        "close": {
          "type": "plain_text",
          "text": "Cancel",
          "emoji": true
        },
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "text"
            }
          }
        ]
      }
    });
  } catch (error) {
    await bot.client.chat.postMessage({
      channel: body.channel.id,
      text: messages.error
    });
    console.error(error);
  }
}