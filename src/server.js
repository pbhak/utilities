import { battery_msg } from './bot.js';
import bodyParser from 'body-parser';
import express from 'express';

const server = express();
server.use(bodyParser.json());

server.listen(process.env.PORT, () => {
  console.log(`server: started on port ${process.env.PORT}`);
});

server.post('/info', (req, res) => {
  if (req.body.battery == undefined || req.body.battery < 0 || req.body.battery > 100) {
    res.sendStatus(400); // Either battery percentage was not given or percentage range is illegal
    return;
  }
  battery_msg(req.body.battery);
  res.sendStatus(200);
});