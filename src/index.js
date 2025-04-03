import Bolt from "@slack/bolt";

const bot = new Bolt.App({
  token: process.env.ACCESS_TOKEN,
  appToken: process.env.SOCKET_TOKEN,
  socketMode: true
});

const CHANNEL = "C08H2P5RHA7"

bot.event('member_joined_channel', async event => {
  try {
    await bot.client.chat.postEphemeral({
      channel: CHANNEL,
      text: `
hey! thanks for joining my channel :)
feel free to ping me if you need something, or if you just want to talk - if i'm not currently active i'll get back to you as soon i get online

oh and also, join the channels in the neighbors tab! they're all cool people (feel free to add yourself asw)
have a good one!
      `,
      user: event.body.event.user
    });
  } catch (error) {
    console.error(error);
  }
});

await bot.start();
console.log('Application started');