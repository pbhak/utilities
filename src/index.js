import Bolt from "@slack/bolt";
import { readFileSync } from "node:fs";
import { member_join, app_mention, home_opened } from "./events.js";
import start_server from "./server.js";
import yaml from "js-yaml";
import {
  doNothing,
  dontSendWelcomeMessage,
  joinPrivateChannel,
  sendWelcomeMessage,
} from "./actions.js";
import {
  openMessageView,
  handleMessageSubmission,
  handleReplySubmission,
  openReplyView,
  openPrivateChannelView,
  addToPrivateChannel,
  welcomeInjection,
} from "./views.js";
import { sha256, shenanigans } from "./commands.js";

export { messages, sendMessage, getUserInfo };

const bot = new Bolt.App({
  token: process.env.ACCESS_TOKEN,
  appToken: process.env.SOCKET_TOKEN,
  socketMode: true,
});

const CHANNEL = process.env.CHANNEL;

// Read transcript YAML file
const messages = yaml.load(readFileSync(process.env.YAML_FILE));

async function sendMessage(text) {
  try {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text,
    });
  } catch (error) {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text: messages.error,
    });
    console.error(error);
  }
}

async function getUserInfo() {
  const status = await bot.client.users.getPresence({
    user: "U07V1ND4H0Q",
  });
  return status.presence == "active";
}

// Events
bot.event("member_joined_channel", member_join);
bot.event("app_mention", app_mention);
bot.event("app_home_opened", home_opened);

// Actions
bot.action("send_message", openMessageView);
bot.action("replyAgain", welcomeInjection, openMessageView);
bot.action("reply_clicked", openReplyView);
bot.action("showWelcomeMessage", sendWelcomeMessage);
bot.action("dontShowWelcomeMessage", dontSendWelcomeMessage);
bot.action("private_channel_add", openPrivateChannelView);
bot.action("users", doNothing);
bot.action("join_private_channel", joinPrivateChannel);

// View callbacks
bot.view("messageViewSubmitted", handleMessageSubmission);
bot.view("replyViewSubmitted", handleReplySubmission);
bot.view("privateChannelViewSubmitted", addToPrivateChannel);

// Slash commands
bot.command("/shenanigans", shenanigans);
bot.command("/sha256", sha256);

// Start bot and server
(async () => {
  await bot.start();
  console.log(messages.startup.bot);
})();

start_server();
