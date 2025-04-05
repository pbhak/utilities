import Bolt from '@slack/bolt';
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import bodyParser from 'body-parser';
import express from 'express';
import nominatim from 'nominatim-client';

const geocoding = nominatim.createClient({
  useragent: "pbhak's utilities",            
  referer: 'https://info.pbhak.hackclub.app',  
});

const bot = new Bolt.App({
  token: process.env.ACCESS_TOKEN,
  appToken: process.env.SOCKET_TOKEN,
  socketMode: true
});

const CHANNEL = 'C08H2P5RHA7'; // C01KPAX6AG2 for #bot-testing-ground, C08H2P5RHA7 for #parneel-yaps

const messages = yaml.load(readFileSync('/home/pbhak/utilities/src/messages.yml'));

bot.event('member_joined_channel', async event => {
  try {
    await bot.client.chat.postEphemeral({
      channel: CHANNEL,
      text: messages.welcome,
      user: event.body.event.user
    });
  } catch (error) {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text: messages.error
    });
    console.error(error);
  }
});

async function location_info(lat, lon) {
  const result = await geocoding.reverse({ lat, lon });
  return result.address;
}

const battery_emoji = (battery, charging) => charging ? ':zap:' : (battery <= 20 ? ':low_battery:' : ':battery:')
const location_emoji = country => (country == 'United States') ? ':us:' : ':globe_with_meridians:'

async function info(battery, charging, lat, lon) {
  const location = await location_info(lat, lon);

  try {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text: messages.stats
              .replace('{battery}', `${battery}% ${battery_emoji(battery, charging)}`)
              .replace('{location}', `${location.city}, ${location.state}  ${location_emoji(location.country)}`)
    });
  } catch (error) {
    await bot.client.chat.postMessage({
      channel: CHANNEL,
      text: messages.error
    });
    console.error(error);
  }
}

// Express server
const server = express();
server.use(bodyParser.json());

server.get('/', (req, res) => {
  res.send("hi! you've reached the root endpoint on my info api. maybe check your request uri? - pbhak :)");
  console.log('GET request received to /')
});

server.post('/info', (req, res) => {
  if (
    req.body.battery == undefined || 
    req.body.battery < 0 || 
    req.body.battery > 100 || 
    req.body.lat == undefined || 
    req.body.lon == undefined  ||
    req.body.charging == undefined
  ) {
    res.sendStatus(400); // Either battery percentage was not given or percentage range is illegal
    return;
  }
  req.body.charging = req.body.charging == 'Yes' ? true : false
  info(req.body.battery, req.body.charging, req.body.lat, req.body.lon);
  res.sendStatus(200);
});

// Start bot and server
(async () => {
  await bot.start();
  console.log('application started!');
})();

server.listen(process.env.PORT, () => {
  console.log(`server: started on port ${process.env.PORT}`);
});
