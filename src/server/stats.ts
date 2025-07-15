import nominatim, { type NominatimClient } from 'nominatim-client';
import { app, sendLog, transcript } from '..';
import type { Request, Response } from 'express';

interface NominatimAddress {
  amenity: string;
  road: string;
  suburb: string;
  city_district: string;
  city: string;
  county: string;
  state: string;
  postcode: string;
  country: string;
  country_code: string;
}

interface HackatimeData {
  data: {
    grand_total: {
      text: string;
      total_seconds: number;
    };
  };
}

// Initialize eocoding API
const geocoding: NominatimClient = nominatim.createClient({
  useragent: "pbhak's utilities",
  referer: 'https://utilities.pbhak.dev',
});

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
  return `${Math.round(hackatimeHours)}h ${Math.round(hackatimeHours % 60)}m`;
}

function batteryEmoji(battery: number, charging: boolean) {
  return charging
    ? ':zap:'
    : battery <= 20
    ? transcript.emojis.battery.low
    : transcript.emojis.battery.normal;
}

function locationEmoji(data: NominatimAddress) {
  if (data.country_code) {
    return `:flag-${data.country_code}:`;
  } else {
    return data.country == 'United States'
      ? transcript.emojis.country.us
      : transcript.emojis.country.other;
  }
}

async function formatStats(battery: number, charging: boolean, lat: number, lon: number) {
  const locationInfo = (await geocoding.reverse({ lat, lon })).address;
  const hackatimeInfo = await getHackatimeData();

  return transcript.stats
    .replace('{battery}', `${battery}% ${batteryEmoji(battery, charging)}`)
    .replace(
      '{location}',
      `${locationInfo.city}, ${
        locationInfo.state ? locationInfo.state : locationInfo.country
      }  ${locationEmoji(locationInfo)}`
    )
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
    req.body.lat == undefined ||
    req.body.lon == undefined ||
    req.body.charging == undefined
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
      req.body.lat,
      req.body.lon
    ),
  });
  res.sendStatus(200);
}
