import nominatim, { type NominatimClient } from 'nominatim-client';
import { app, sendLog, transcript } from '..';
import type { Request, Response } from 'express';

// Initialize eocoding API
const geocoding: NominatimClient = nominatim.createClient({
  useragent: "pbhak's utilities",
  referer: 'https://utilities.pbhak.dev',
});

function batteryEmoji(battery: number, charging: boolean) {
  return charging
    ? ':zap:'
    : battery <= 20
    ? transcript.emojis.battery.low
    : transcript.emojis.battery.normal;
}

function locationEmoji(country: string) {
  return country == 'United States'
    ? transcript.emojis.country.us
    : transcript.emojis.country.other;
}

async function formatStats(battery: number, charging: boolean, lat: number, lon: number) {
  const location = await geocoding.reverse({ lat, lon }).then((location) => location.address);
  return transcript.stats
    .replace('{battery}', `${battery}% ${batteryEmoji(battery, charging)}`)
    .replace(
      '{location}',
      `${location.city}, ${location.state}  ${locationEmoji(location.country)}`
    );
}

export default async function info(req: Request, res: Response) {
  const apiKey = req.get('X-Api-Key');
  if (!apiKey) {
    sendLog('invalid request made to /info - no api key provided');
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
    sendLog('invalid request made to /info - invalid api key');
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
    sendLog('invalid request made to /info - invalid request body');
    res.sendStatus(400); // Either battery percentage was not given or percentage range is illegal
    return;
  }

  sendLog('battery and location data received on /info');
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
