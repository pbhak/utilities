import { messages } from "./index.js";

export { member_join, app_mention };

const member_join = async (bot, event) => {
  if (event.body.event.channel != 'C08H2P5RHA7') {
    return;
  }

  try {
    await bot.client.chat.postEphemeral({
      channel: event.body.event.channel,
      text: messages.welcome,
      user: event.body.event.user
    });
  } catch (error) {
    await bot.client.chat.postMessage({
      channel: event.body.event.channel,
      text: messages.error
    });
    console.error(error);
  }
}

const app_mention = async (bot, event) => {
  try {
    await event.client.reactions.add({
      channel: event.body.event.channel,
      name: 'hyper-dino-wave',
      timestamp: event.body.event.ts
    });
  } catch (error) {
    await bot.client.chat.postMessage({
      channel: event.body.event.channel,
      text: messages.error
    });
    console.error(error);
  }
}
