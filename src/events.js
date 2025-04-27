import { messages } from "./index.js";

export { member_join, app_mention, home_opened };

async function member_join({ event, body, client }) {
  if (event.channel == "C08MNCVRJN8")
    member_join_private({ event, body, client });

  if (event.channel != "C08H2P5RHA7" || event.user.is_bot) {
    return; // because we don't want it welcoming people in other channels or bots
  }

  try {
    await client.chat.postEphemeral({
      channel: event.channel,
      text: messages.welcome.initial,
      user: event.user ?? event.message.user, // to account for edited messages
    });

    const all_members = await client.conversations.members({
      channel: event.channel,
    });
    let numberOfUsers = 0;
    await Promise.all(
      all_members.members.map(async (userId) => {
        const user = await client.users.info({ user: userId });
        if (!user.user.is_bot) {
          numberOfUsers++;
        }
      })
    );

    if (numberOfUsers % 10 == 0) {
      await client.chat.postMessage({
        channel: event.channel,
        text: `we just hit ${numberOfUsers} members!`,
      });
    }

    await client.chat.postEphemeral({
      channel: body.event.channel,
      text: "want to be publicly welcomed?",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: messages.welcome.question,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "sure!",
              },
              style: "primary",
              action_id: "showWelcomeMessage",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "nah",
              },
              style: "danger",
              action_id: "dontShowWelcomeMessage",
            },
          ],
        },
      ],
      user: event.user ?? event.message.user,
    });
  } catch (error) {
    await client.chat.postMessage({
      channel: event.channel,
      text: messages.error,
    });
    console.error(error);
  }
}

async function member_join_private({ event, body, client }) {
  await client.chat.postEphemeral({
    channel: "C08MNCVRJN8",
    user: event.user,
    text: messages.private.welcome,
  });

  await client.chat.postEphemeral({
    channel: "C08MNCVRJN8",
    user: "U07V1ND4H0Q",
    text: `<@${event.user}> just joined!`,
  });
}

async function app_mention({ client, event }) {
  if (event.text.includes(":hyper-dino-wave:")) {
    await client.reactions.add({
      channel: event.channel,
      name: "hyper-dino-wave-flip",
      timestamp: event.ts,
    });
  } else {
    await client.reactions.add({
      channel: event.channel,
      name: "hyper-dino-wave",
      timestamp: event.ts,
    });
  }
  await client.chat.postMessage({
    channel: event.channel,
    text: messages.error,
  });
  console.error(error);
}

async function home_opened({ client, event }) {
  if (event.user == "U07V1ND4H0Q") {
    // me!
    await client.views.publish({
      user_id: event.user,
      view: {
        type: "home",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "Dashboard",
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "add person to private channel",
                },
                action_id: "private_channel_add",
              },
            ],
          },
        ],
      },
    });
  }
}
