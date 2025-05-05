import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

export async function appMention({
  client,
  event,
}: SlackEventMiddlewareArgs<'app_mention'> & AllMiddlewareArgs): Promise<void> {
  const includesWave = event.text.includes(':hyper-dino-wave:');
  const messageReactions = await client.reactions.get({
    channel: event.channel,
    timestamp: event.ts,
  });

  const messageReactionNames = messageReactions.message?.reactions?.map((reaction) => reaction.name)

  if (
    !(
      messageReactionNames?.includes('hyper-dino-wave') ||
      messageReactionNames?.includes('hyper-dino-wave-flip')
    )
  ) {
    await client.reactions.add({
      channel: event.channel,
      name: includesWave ? 'hyper-dino-wave-flip' : 'hyper-dino-wave',
      timestamp: event.ts,
    });
  }
}
