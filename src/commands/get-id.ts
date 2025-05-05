import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';

export async function getId({
  ack,
  command,
  client,
}: SlackCommandMiddlewareArgs & AllMiddlewareArgs): Promise<void> {
  await ack();

  let allIds: { name: string; id: string }[] = [];
  let message: string = "here's your requested IDs!\n";

  // Get all given mentions and use RegEx to map each mention into an array for looping
  const mentions: string[] = [...command.text.matchAll(/<[^>]+>/g)].map((exp) => exp[0]);

  if (mentions.length === 0) {
    // If no input was provided, give the command user and command channel as a default value
    allIds.push({ name: `@${command.user_name}`, id: command.user_id });
    allIds.push({ name: `#${command.channel_name}`, id: command.channel_id });
  }

  mentions.forEach((mention) => {
    // the name of the user/channel/usergroup - <@id|handle> or <!subteam^id|handle> -> @handle
    const name =
      mention[1] + mention.substring(mention.indexOf('|') + 1, mention.indexOf('>'));
    const id = mention.substring(
      // The location of the ID is different depending on what is being mentioned
      // User groups: <subteam^id|handle> -> id
      // Users/channels: <[@ | #]id|handle> -> id
      mention[1] === '!' ? 10 : 2,
      mention.indexOf('|')
    );
    allIds.push({ name, id });
  });

  allIds.forEach((mention) => {
    message += `\`${mention.name}\`: \`${mention.id}\` \n`;
  });

  await client.chat.postEphemeral({
    channel: command.channel_id,
    user: command.user_id,
    text: message,
  });
}