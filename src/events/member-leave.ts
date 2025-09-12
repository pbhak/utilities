import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

export async function memberLeave({
  client,
  event,
}: SlackEventMiddlewareArgs<'member_left_channel'> & AllMiddlewareArgs): Promise<void> {
  const userInfo = await client.users.info({ user: event.user });
  const isBot = userInfo.user?.is_bot;

  if (event.channel !== process.env.MAIN_CHANNEL || isBot) return;

  await client.chat.postEphemeral({
    channel: event.channel,
    text: `<@${event.user}> has left :(`,
    user: process.env.USER_ID,
  });
}
