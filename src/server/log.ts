import type { Request, Response } from 'express';
import { sendLog } from '..';

export default async function log(req: Request, res: Response) {
  const apiKey = req.get('X-Api-Key');
  if (!apiKey) {
    sendLog('invalid request made to /log - no api key provided', 'log');
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
    sendLog('invalid request made to /log - invalid api key', 'log');
    res.sendStatus(403);
    return;
  }

  if (req.body === undefined || req.body.log === undefined) {
    sendLog('invalid request made to /log - no log text provided', 'log');
    res.sendStatus(400);
    return;
  }

  sendLog(req.body.log, req.body.source ? req.body.source : 'log');
}
