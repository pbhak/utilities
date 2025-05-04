import { messages } from "./index.js";

export {
  sendWelcomeMessage,
  dontSendWelcomeMessage,
  doNothing,
  joinPrivateChannel,
};

async function sendWelcomeMessage({ ack, body, client, respond }) {
  await ack();

  await respond({
    delete_original: true,
  });

  const welcome_message = messages.welcome.public.replace(
    "{user}",
    `<@${body.user.id}>`
  );

  try {
    await client.chat.postMessage({
      channel: body.channel.id,
      text: welcome_message,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: welcome_message,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "send message",
              },
              action_id: "send_message",
            },
          ],
        },
      ],
    });
  } catch (error) {
    await client.chat.postMessage({
      channel: body.channel.id,
      text: messages.error,
    });
    console.error(error);
  }
}

async function dontSendWelcomeMessage({ ack, body, client, respond }) {
  await ack();

  await client.chat.postEphemeral({
    channel: body.channel.id,
    text: messages.welcome.private,
    user: body.user.id,
  });

  await respond({
    delete_original: true,
  });

  await client.chat.postMessage({
    channel: "U07V1ND4H0Q", // my dms
    text: messages.welcome.private_dm.replace("{user}", `<@${body.user.id}>`),
  });
}

export async function doNothing({ ack }) {
  await ack();
}

async function joinPrivateChannel({ ack, body, client }) {
  await ack();
  await client.conversations.invite({
    channel: "C08MNCVRJN8",
    users: body.user.id,
  });
  await client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: messages.private.invite + `\n ${messages.private.invite_edit}`,
        },
      },
    ],
  });
}
