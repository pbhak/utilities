import express from 'express';
import bodyParser from 'body-parser';

const server = express();
server.use(bodyParser.json());

server.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});

server.post('/battery', (req, res) => {
  if (req.body.battery == undefined || req.body.battery < 0 || req.body.battery > 100) {
    res.sendStatus(400); // Either battery percentage was not given or percentage range is illegal
    return;
  }
  console.log(req.body.battery); // TODO: Replace this with a function call in bot.js to send to channel
  res.sendStatus(200);
});