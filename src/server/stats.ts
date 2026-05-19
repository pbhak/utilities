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

  const hackatimeHours = Math.floor(hackatimeMinutes / 60);
  const hackatimeRemainingMinutes = Math.floor(hackatimeMinutes % 60);
  return `${hackatimeHours}:${hackatimeRemainingMinutes.toString().padStart(2, '0')}h`;
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
    async (res) => await res.json(),
  )) as IPData;
  return ipData.country;
}

async function locationEmoji(ip: string): Promise<string> {
  try {
    const ipData = (await fetch(`http://ipwho.is/${ip}`).then(
      async (res) => await res.json(),
    )) as IPData;
    return `${ipData.flag.emoji}`;
  } catch {
    return transcript.emojis.country.other;
  }
}

async function formatStats(
  battery: number,
  charging: boolean,
  city: string,
  state: string,
  ip: string,
) {
  const country = await getCountry(ip);
  const flag = await locationEmoji(ip);
  const hackatimeInfo = await getHackatimeData();

  return transcript.stats
    .replace('{battery}', `${battery}% ${batteryEmoji(battery, charging)}`)
    .replace('{location}', `${city}, ${state ? state : country}  ${flag}`)
    .replace('{codingTime}', hackatimeInfo)
    .replace('{neocat}', getRandomNeocat());
}

function getRandomNeocat(): string {
  const neocats: string[] = [
    'neocat',
    'neocat_boop_blush',
    'neocat_boop',
    'neocat_boop_blep',
    'neocat_boop_cute',
    'neocat_boop_googly',
    'neocat_boop_happy',
    'neocat_boop_nervous',
    'neocat_boop_owo',
    'neocat_boop_woozy',
    'neocat_3c',
    'neocat__w_',
    'neocat_angel',
    'neocat_aww',
    'neocat_baa',
    'neocat_blank',
    'neocat_blep',
    'neocat_catmode',
    'neocat_cute',
    'neocat_cute_reach',
    'neocat_drowsy',
    'neocat_evil',
    'neocat_evil_3c',
    'neocat_floof',
    'neocat_floof__w_',
    'neocat_floof_angel',
    'neocat_floof_cute',
    'neocat_floof_happy',
    'neocat_floof_mug',
    'neocat_floof_owo',
    'neocat_floof_reach',
    'neocat_flop',
    'neocat_flop__w_',
    'neocat_flop_blep',
    'neocat_flop_happy',
    'neocat_flop_sleep',
    'neocat_flush',
    'neocat_glare',
    'neocat_glasses',
    'neocat_happy',
    'neocat_happy_blep',
    'neocat_hyper',
    'neocat_kirby',
    'neocat_kirby_succ',
    'neocat_laugh',
    'neocat_laugh_nervous',
    'neocat_laugh_sweat',
    'neocat_laugh_tears',
    'neocat_lul',
    'neocat_melt',
    'neocat_melt_2',
    'neocat_melt_3',
    'neocat_melt_blep',
    'neocat_melt_happy',
    'neocat_melt_reach',
    'neocat_approve',
    'neocat_bongo_down',
    'neocat_bongo_up',
    'neocat_facepalm',
    'neocat_fingerguns',
    'neocat_heart',
    'neocat_book',
    'neocat_book_owo',
    'neocat_cool',
    'neocat_cool_fingerguns',
    'neocat_gun',
    'neocat_knife',
    'neocat_knives',
    'neocat_laptop',
    'neocat_laptop_notice',
    'neocat_laptop_owo',
    'neocat_box',
    'neocat_cofe',
    'neocat_comfy',
    'neocat_comfy__w_',
    'neocat_comfy_happy',
    'neocat_comfy_mug',
    'neocat_comfy_sip',
    'neocat_amogus',
    'neocat_astronaut',
    'neocat_astronaut_gun',
    'neocat_foxmask',
    'neocat_magnify',
    'neocat_mug',
    'neocat_mug__w_',
    'neocat_mug_drink',
    'neocat_mug_owo',
    'neocat_nervous',
    'neocat_nom_waffle',
    'neocat_notice',
    'neocat_o_o',
    'neocat_owo',
    'neocat_owo_blep',
    'neocat_pat',
    'neocat_pat_floof',
    'neocat_pat_flop',
    'neocat_pat_googly',
    'neocat_pat_happy',
    'neocat_pat_sad',
    'neocat_pat_up',
    'neocat_pat_woozy',
    'neocat_peek',
    'neocat_peek_bread',
    'neocat_peek_comfy',
    'neocat_peek_knife',
    'neocat_peek_owo',
    'neocat_pensive',
    'neocat_phone',
    'neocat_pleading',
    'neocat_pleading_reach',
    'neocat_police',
    'neocat_pout',
    'neocat_rainbow',
    'neocat_reach',
    'neocat_reach_drool',
    'neocat_reject',
    'neocat_sad',
    'neocat_sad_reach',
    'neocat_santa',
    'neocat_science',
    'neocat_scream',
    'neocat_scream_angry',
    'neocat_scream_scared',
    'neocat_scream_stare',
    'neocat_shocked',
    'neocat_shy',
    'neocat_sign_aaa',
    'neocat_sign_no',
    'neocat_sign_nya',
    'neocat_sign_thx',
    'neocat_sign_yes',
    'neocat_sign_yip',
    'neocat_sip',
    'neocat_sip_glare',
    'neocat_sip_nervous',
    'neocat_sip_owo',
    'neocat_smol',
    'neocat_smug',
    'neocat_snuggle',
    'neocat_snuggle_fox',
    'neocat_sob',
    'neocat_solder',
    'neocat_solder_googly',
    'neocat_surprised',
    'neocat_surprised_pika',
    'neocat_sweat',
    'neocat_thief',
    'neocat_think',
    'neocat_think_anime',
    'neocat_think_cool',
    'neocat_think_googly',
    'neocat_think_owo',
    'neocat_think_woozy',
    'neocat_thinking',
    'neocat_thonk',
    'neocat_thumbsdown',
    'neocat_thumbsup',
    'neocat_up',
    'neocat_up__w_',
    'neocat_up_paws',
    'neocat_up_sleep',
    'neocat_uwu',
    'neocat_verified',
    'neocat_vr',
    'neocat_what',
    'neocat_wink',
    'neocat_wink_blep',
    'neocat_woozy',
    'neocat_x_x',
    'neocat_yeet',
    'neocat_yell',
  ];

  return neocats[Math.floor(Math.random() * neocats.length)] as string;
}

export default async function info(req: Request, res: Response) {
  const apiKey = req.get('X-Api-Key');
  if (!apiKey) {
    sendLog('invalid request made to /info - no api key provided', 'stats');
    res.sendStatus(403);
    return;
  }

  const givenKeyHash = Buffer.from(
    new Bun.CryptoHasher('sha256').update(apiKey).digest('hex'),
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
      req.body.ip,
    ),
  });
  res.sendStatus(200);
}
