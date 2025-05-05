import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { transcript } from '..';

export async function joinPingGroup({
  ack,
  command,
  client,
}: SlackCommandMiddlewareArgs & AllMiddlewareArgs): Promise<void> {
  await ack();

  const currentPingGroupMembers = await client.usergroups.users.list({
    usergroup: process.env.USER_GROUP,
  });

  if (currentPingGroupMembers.users?.includes(command.user_id)) {
    // Get all users in the user group and remove the command caller
    const newPingGroupMembers = currentPingGroupMembers.users.filter(
      (user) => user !== command.user_id
    );

    // Update the usergroup to remove the command caller
    await client.usergroups.users.update({
      usergroup: process.env.USER_GROUP,
      users: newPingGroupMembers.join(','),
    });

    await client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: transcript.usergroup.leave,
    });
  } else if (currentPingGroupMembers.users) {
    const newPingGroupMembers = [...currentPingGroupMembers.users, command.user_id];

    await client.usergroups.users.update({
      usergroup: process.env.USER_GROUP,
      users: newPingGroupMembers.join(','),
    });

    await client.chat.postEphemeral({
      channel: command.user_id,
      user: command.user_id,
      text: transcript.usergroup.join,
    });
  }
}
