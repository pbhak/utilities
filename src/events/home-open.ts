import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

export async function homeOpened({
  client,
  event,
}: SlackEventMiddlewareArgs<'app_home_opened'> & AllMiddlewareArgs): Promise<void> {
  if (!(event.user === process.env.USER_ID)) return;

  await client.views.publish({
    user_id: event.user,
    view: {
      type: 'home',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Dashboard',
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'add person to private channel',
              },
              action_id: 'privateChannelAdd',
            },
          ],
        },
      ],
    },
  });
}