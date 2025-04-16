export async function shenanigans({ ack, command, client }) {
  await ack();
  const allowed_ids = ['U07V1NDd4H0Q']

  if (!allowed_ids.includes(command.user_id)) {
    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: 'you really thought i would let other people channel ping with MY bot? nice try bud.'
    });

    return;
  }

  await client.chat.postMessage({
    channel: command.channel_id,
    username: 'pbhak',
    icon_url: 'https://ca.slack-edge.com/T0266FRGM-U07V1ND4H0Q-577848889833-512',
    text: 'you just got channel pinged',
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