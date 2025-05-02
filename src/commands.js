export { shenanigans, sha256, join_ping_group, get_id };

async function shenanigans({ ack, command, client }) {
  await ack();
  const allowed_ids = ["U07V1ND4H0Q"];

  if (!allowed_ids.includes(command.user_id)) {
    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "you really thought i would let other people channel ping with MY bot? nice try bud.",
    });

    return;
  }

  await client.chat.postMessage({
    channel: command.channel_id,
    username: "pbhak",
    icon_url:
      "https://ca.slack-edge.com/T0266FRGM-U07V1ND4H0Q-577848889833-512",
    text: "you just got channel pinged",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `@channel ${command.text}`,
        },
      },
    ],
  });
}

async function sha256({ ack, command, client }) {
  await ack();

  await client.conversations.setTopic({
    channel: "C08MF2BHPK7",
    topic: "test hehe",
  });

  const hash = new Bun.CryptoHasher("sha256")
    .update(command.text)
    .digest("hex");
  await client.chat.postEphemeral({
    channel: command.channel_id,
    user: command.user_id,
    text: `here's your requested hash! \`${hash}\``,
  });
}

async function join_ping_group({ ack, command, client }) {
  await ack();

  const existing_users = await client.usergroups.users.list({
    usergroup: process.env.USER_GROUP,
  });

  if (existing_users.users.includes(command.user_id)) {
    const new_users = existing_users.users.filter(
      (user) => user !== command.user_id
    );

    await client.usergroups.users.update({
      usergroup: process.env.USER_GROUP,
      users: new_users,
    });
    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "alright, i've removed you from my user group. have a good one!",
    });
  } else {
    const new_users = [...existing_users.users, command.user_id];

    await client.usergroups.users.update({
      usergroup: process.env.USER_GROUP,
      users: new_users,
    });

    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "added you to the ping group - thanks for joining!",
    });
  }
}

async function get_id({ ack, command, client }) {
  await ack();

  let ids = {};
  let finalMessage = "here's your requested IDs! \n";
  // Get all given mentions and use RegEx to map each mention into an array for looping
  const mentions = [...command.text.matchAll(/<[^>]+>/g)].map((exp) => exp[0]);

  mentions.forEach((mention) => {
    if (mention.startsWith("<@") || mention.startsWith("<#")) {
      // User mention or channel mention - get substring between position 2 (@) and |
      const name =
        mention[1] +
        mention.substring(mention.indexOf("|") + 1, mention.indexOf(">"));
      ids[name] = mention.substring(2, mention.indexOf("|", 2));
    } else if (mention.startsWith("<!")) {
      // User group mention - get substring between ^ (pos 10) and |
      const name = mention.substring(
        mention.indexOf("|") + 1,
        mention.indexOf(">")
      );
      ids[name] = mention.substring(10, mention.indexOf("|", 10));
    }
  });

  for (const name in ids) {
    const id = ids[name];
    finalMessage += `\`${name}\`: \`${id}\` \n`;
  }

  await client.chat.postEphemeral({
    user: command.user_id,
    channel: command.channel_id,
    text: finalMessage,
  });
}
