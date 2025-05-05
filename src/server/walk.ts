import { app, sendLog, transcript } from '..';
import type { Walk } from '../types/walk';

function convertSecondsToMinutes(secs: number) {
  const finalMinutes = Math.floor(secs / 60);
  const finalSeconds = (secs % 60).toString().padStart(2, '0');

  return `${finalMinutes}:${finalSeconds}`;
}

function minutesPerMile(meters: number, seconds: number) {
  const miles = Math.round((meters / 1609) * 100) / 100;
  return convertSecondsToMinutes(Math.round(seconds / miles));
}

function minutesPerKm(meters: number, seconds: number) {
  const km = meters / 1000;
  return convertSecondsToMinutes(Math.round(seconds / km));
}

export default async function processWalk(walkUrl: string) {
  sendLog('walk data received on /walk', 'walk');

  const workoutUrl = 'https://api.mapmyfitness.com' + walkUrl;
  const workoutResponse = await fetch(workoutUrl, {
    headers: {
      Authorization: `Bearer ${process.env.MPF_BEARER_TOKEN}`,
      'Api-Key': process.env.MPF_API_KEY,
    },
  })
  const workoutInfo = (await workoutResponse.json() as Walk).aggregates

  // Convert the distance (meters) to miles, then round it to 2 places
  const distanceMiles = Math.round((workoutInfo.distance_total / 1609) * 100) / 100;
  const distanceKm = Math.round(workoutInfo.distance_total / 10) / 100;
  const timeMinutes = convertSecondsToMinutes(workoutInfo.active_time_total);

  const minsPerMile = minutesPerMile(
    workoutInfo.distance_total,
    workoutInfo.active_time_total
  );
  const minsPerKm = minutesPerKm(workoutInfo.distance_total, workoutInfo.active_time_total);

  const parentMessage = await app.client.chat.postMessage({
    channel: process.env.MAIN_CHANNEL,
    text: transcript.walk.completed
      .replace('{distance}', distanceMiles.toString())
      .replace('{time}', timeMinutes),
  });

  await app.client.chat.postMessage({
    channel: process.env.MAIN_CHANNEL,
    text: transcript.walk.stats
      .replace('{km}', distanceKm.toString())
      .replace('{steps}', workoutInfo.steps_total.toLocaleString('en-US'))
      .replace('{min/mile}', minsPerMile)
      .replace('{min/km}', minsPerKm),
    thread_ts: parentMessage.ts,
  });
}
