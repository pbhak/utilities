import type { SlackCommandMiddlewareArgs } from '@slack/bolt';

const debugCommands: Record<string, (client: SlackCommandMiddlewareArgs) => Promise<void>> = {
  welcome: debugWelcome,
  memberJoin: debugMemberJoin,
  kill: killBot,
  restart: restartBot,
  sysinfo: sysInfo,
};

async function debugWelcome(client: SlackCommandMiddlewareArgs): Promise<void> {}

async function debugMemberJoin(client: SlackCommandMiddlewareArgs): Promise<void> {}

async function killBot(client: SlackCommandMiddlewareArgs): Promise<void> {}

async function restartBot(client: SlackCommandMiddlewareArgs): Promise<void> {}

async function sysInfo(client: SlackCommandMiddlewareArgs): Promise<void> {}

// TODO implement this
// TODO add statistics for ping group, channel, etc
// TODO fix celeb member counts
