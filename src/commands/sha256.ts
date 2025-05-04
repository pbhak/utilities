import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';

export async function sha256({
  ack,
  command,
  client,
}: SlackCommandMiddlewareArgs & AllMiddlewareArgs): Promise<void> {
  await ack();

  const hash = new Bun.CryptoHasher('sha256').update(command.text).digest('hex');
  await client.chat.postEphemeral({
    channel: command.channel_id,
    user: command.user_id,
    text: `here's your requested hash! \`${hash}\``,
  });
}
