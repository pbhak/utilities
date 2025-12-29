import type { Request, Response } from 'express';
import { app, sendLog, transcript } from '..';

interface IPData {
  ip: string;
  success: boolean;
  type: string;
  continent: string;
  continent_code: string;
  country: string;
  country_code: string;
  region: string;
  region_code: string;
  city: string;
  latitude: number;
  longitude: number;
  is_eu: boolean;
  postal: string;
  calling_code: string;
  capital: string;
  borders: string;
  flag: {
    img: string;
    emoji: string;
    emoji_unicode: string;
  };
  connection: {
    asn: number;
    org: string;
    isp: string;
    domain: string;
  };
  timezone: {
    id: string;
    abbr: string;
    is_dst: boolean;
    offset: number;
    utc: string;
    current_time: Date;
  };
}

interface HackatimeData {
  data: {
    grand_total: {
      text: string;
      total_seconds: number;
    };
  };
}

async function getHackatimeData(): Promise<string> {
  const hackatimeEndpoint = `https://hackatime.hackclub.com/api/hackatime/v1/users/${process.env.USER_ID}/statusbar/today`;
  const hackatimeData = (await fetch(hackatimeEndpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.HACKATIME_API_KEY}`,
    },
  }).then(async (result) => await result.json())) as HackatimeData;

  const hackatimeSeconds = hackatimeData.data.grand_total.total_seconds;
  if (hackatimeSeconds === 0) return '0m';
  if (hackatimeSeconds < 60) return `${Math.round(hackatimeSeconds)}s`;

  const hackatimeMinutes = hackatimeSeconds / 60;
  if (hackatimeMinutes < 60) return `${Math.round(hackatimeMinutes)}m`;

  const hackatimeHours = hackatimeMinutes / 60;
  return `${Math.round(hackatimeHours)}:${Math.round(hackatimeHours % 60)
    .toString()
    .padStart(2, '0')}h`;
}

function batteryEmoji(battery: number, charging: boolean): string {
  return charging
    ? ':zap:'
    : battery <= 20
    ? transcript.emojis.battery.low
    : transcript.emojis.battery.normal;
}

async function getCountry(ip: string): Promise<string> {
  const ipData = (await fetch(`http://ipwho.is/${ip}`).then(
    async (res) => await res.json()
  )) as IPData;
  return ipData.country;
}

async function locationEmoji(ip: string): Promise<string> {
  try {
    const ipData = (await fetch(`http://ipwho.is/${ip}`).then(
      async (res) => await res.json()
    )) as IPData;
    return `:${ipData.flag.emoji}:`;
  } catch {
    return transcript.emojis.country.other;
  }
}

async function formatStats(
  battery: number,
  charging: boolean,
  city: string,
  state: string,
  ip: string
) {
  const country = await getCountry(ip);
  const hackatimeInfo = await getHackatimeData();

  return transcript.stats
    .replace('{battery}', `${battery}% ${batteryEmoji(battery, charging)}`)
    .replace('{location}', `${city}, ${state ? state : country}  ${locationEmoji(ip)}`)
    .replace('{codingTime}', hackatimeInfo);
}

export default async function info(req: Request, res: Response) {
  const apiKey = req.get('X-Api-Key');
  if (!apiKey) {
    sendLog('invalid request made to /info - no api key provided', 'stats');
    res.sendStatus(403);
    return;
  }

  const givenKeyHash = Buffer.from(
    new Bun.CryptoHasher('sha256').update(apiKey).digest('hex')
  );
  const actualHash = Buffer.from(process.env.API_KEY_HASH);

  if (
    givenKeyHash.length !== actualHash.length ||
    !crypto.timingSafeEqual(givenKeyHash, actualHash)
  ) {
    sendLog('invalid request made to /info - invalid api key', 'stats');
    res.sendStatus(403);
    return;
  }

  if (
    req.body.battery == undefined ||
    req.body.battery < 0 ||
    req.body.battery > 100 ||
    req.body.charging == undefined ||
    req.body.city == undefined ||
    req.body.state == undefined ||
    req.body.ip == undefined
  ) {
    sendLog('invalid request made to /info - invalid request body', 'stats');
    res.sendStatus(400); // Either battery percentage was not given or percentage range is illegal
    return;
  }

  sendLog('battery and location data received on /info', 'stats');
  app.client.chat.postMessage({
    channel: process.env.MAIN_CHANNEL,
    text: await formatStats(
      req.body.battery,
      req.body.charging === 'Yes',
      req.body.city,
      req.body.state,
      req.body.ip
    ),
  });
  res.sendStatus(200);
}
