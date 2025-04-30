export { shenanigans, sha256, join_ping_group };

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
