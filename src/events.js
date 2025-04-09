import { CHANNEL, messages } from "./index.js";

export const member_join = async (bot, event) => {
  try {
    await bot.client.chat.postEphemeral({
      channel: CHANNEL,
      text: messages.welcome,
      user: event.body.event.user
    });
  } catch (error) {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text: messages.error
    });
    console.error(error);
  }
}

export const app_mention = async (bot, event) => {
  try {
    await event.client.reactions.add({
      channel: CHANNEL,
      name: 'hyper-dino-wave',
      timestamp: event.body.event.ts
    });
  } catch (error) {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text: messages.error
    });
    console.error(error);
  }
}
