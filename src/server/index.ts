import bodyParser from 'body-parser';
import express from 'express';
import { app, sendLog, transcript } from '..';
import type { WalkWebhook } from '../types/walk';
import info from './stats';
import processWalk from './walk';
import lastfm from './lastfm';
import log from './log'

const server = express();
server.use(bodyParser.json());

server.get('/', (req, res) => res.redirect('https://github.com/pbhak/utilities'));

server.get('/online', async (req, res) => {
  res.set('Access-Control-Allow-Origin', 'https://pbhak.dev');

  const isOnline =
    (await app.client.users.getPresence({ user: process.env.USER_ID })).presence === 'active';

  res.send(isOnline);
});

server.get('/lastfm', lastfm);

server.post('/walk', (req, res) => {
  processWalk((req.body[0] as WalkWebhook)._links.workout[0]!.href);
  res.sendStatus(202);
});

server.post('/info', info);

server.post('/log', log)

export default function startServer() {
  server.listen(process.env.PORT, () => {
    const startup = transcript.startup.server.replace('{port}', process.env.PORT.toString());
    console.log(startup);
    sendLog(startup, 'server');
  });
}
