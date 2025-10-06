import type { Request, Response } from 'express';

export default async function lastfm(req: Request, res: Response) {
  const lastfmDataEndpoint = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=pbhak&api_key=${process.env.LASTFM_API_KEY}&format=json&limit=1`;
  res.send(await (await fetch(lastfmDataEndpoint)).json());
}
