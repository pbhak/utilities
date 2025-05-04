import { sendLog } from "./index.js";

export { shenanigans, sha256, join_ping_group, get_id };


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

  if (mentions.length === 0) {
    // If no input was provided, give the command user and command channel as default
    ids[`@${command.user_name}`] = command.user_id;
    ids[`#${command.channel_name}`] = command.channel_id;
  }

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
