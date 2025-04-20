import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import nominatim from "nominatim-client";
import { sendMessage, messages, getUserInfo } from "./index.js";

// Geocoding API
const geocoding = nominatim.createClient({
  useragent: "pbhak's utilities",
  referer: "https://info.pbhak.hackclub.app",
});

const battery_emoji = (battery, charging) =>
  charging
    ? ":zap:"
    : battery <= 20
    ? messages.emojis.battery.low
    : messages.emojis.battery.normal;
const location_emoji = (country) =>
  country == "United States"
    ? messages.emojis.country.us
    : messages.emojis.country.other;

async function location_info(lat, lon) {
  const result = await geocoding.reverse({ lat, lon });
  return result.address;
}

async function info(battery, charging, lat, lon) {
  const location = await location_info(lat, lon);
  const info_message = messages.stats
    .replace("{battery}", `${battery}% ${battery_emoji(battery, charging)}`)
    .replace(
      "{location}",
      `${location.city}, ${location.state}  ${location_emoji(location.country)}`
    );

  sendMessage(info_message);
}

const server = express();
server.use(bodyParser.json());

server.get("/", (req, res) => {
  res.send(messages.root);
});

server.post("/info", (req, res) => {
  if (
    req.body.battery == undefined ||
    req.body.battery < 0 ||
    req.body.battery > 100 ||
    req.body.lat == undefined ||
    req.body.lon == undefined ||
    req.body.charging == undefined
  ) {
    res.sendStatus(400); // Either battery percentage was not given or percentage range is illegal
    return;
  }
  req.body.charging = req.body.charging == "Yes" ? true : false;
  info(req.body.battery, req.body.charging, req.body.lat, req.body.lon);
  res.sendStatus(200);
});

server.get("/online", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "https://pbhak.dev");
  res.send(await getUserInfo());
});

export default function start_server() {
  server.listen(process.env.PORT, () => {
    console.log(messages.startup.server.replace("{port}", process.env.PORT));
  });
}
