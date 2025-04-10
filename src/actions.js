import { messages } from "./index.js";

export { message_action, handleReply };

async function message_action(client, channel) {
  try {
    await client.chat.postMessage({
      channel: channel,
      text: 'test button',
      blocks: [
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
    await client.chat.postMessage({
      channel: channel,
      text: messages.error
    });
    console.error(error);
  }
}

async function handleReply() {

}