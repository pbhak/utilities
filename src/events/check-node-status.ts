import { app, sendLog } from '..';

interface TailscaleNodes {
  addresses: string[];
  authorized: boolean;
  blocksIncomingConnections: boolean;
  clientVersion: string;
  created: string;
  expires: string;
  hostname: string;
  id: string;
  isExternal: boolean;
  keyExpiryDisabled: boolean;
  lastSeen: string;
  machineKey: string;
  name: string;
  nodeId: string;
  nodeKey: string;
  os: string;
  tailnetLockError: string;
  tailnetLockKey: string;
  updateAvailable: boolean;
  user: string;
  tags?: string[];
}

function withinOneHour(date: Date): boolean {
  return date.getTime() > Date.now() - 60 * 60 * 1000;
}

export async function checkNodeStatus() {
  let offlineNodes: TailscaleNodes[] = [];
  const nodesToExclude = ['zenbook', 'hermando'];

  const tailscaleResponse = await fetch(
    'https://api.tailscale.com/api/v2/tailnet/pbhak.github/devices',
    { headers: { Authorization: `Bearer ${process.env.TAILSCALE_API_KEY}` } }
  );
  const tailscaleNodes = ((await tailscaleResponse.json()) as { devices: TailscaleNodes[] })
    .devices;

  tailscaleNodes.forEach(async (node) => {
    const nodeName = node.name.split('.')[0];
    if (!nodeName) return;

    if (
      !nodesToExclude.includes(nodeName) &&
      !nodeName?.startsWith('tailscale-ssh-console') &&
      !node.isExternal &&
      !withinOneHour(new Date(node.lastSeen))
    ) {
      // Node offline
      offlineNodes.push(node);
    }
  });

  if (offlineNodes.length === 0) {
    sendLog('all nodes online', 'tailscale');
    return;
  } else {
    const nodeOfflineMessageTimestamp = (
      await sendLog('offline node(s) detected', 'tailscale')
    ).ts;

    offlineNodes.forEach((offlineNode) => {
      const offlineNodeName = offlineNode.name.split('.')[0];

      sendLog(
        `node \`${offlineNodeName}\` is offline!`,
        'tailscale',
        nodeOfflineMessageTimestamp
      );

      app.client.chat.postMessage({
        channel: process.env.MAIN_CHANNEL,
        text: `<@U07V1ND4H0Q> node \`${offlineNodeName}\` is offline! (last seen ${new Date(
          offlineNode.lastSeen
        ).toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })})`,
      });
    });
  }
}
