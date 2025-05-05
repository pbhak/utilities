export interface Walk {
  contexts: null;
  name: string;
  is_default_name: boolean;
  notes: string;
  reference_key: string;
  is_verified: boolean;
  aggregates: Aggregates;
  source: string;
  source_manufacturer: null;
  has_time_series: boolean;
  start_datetime: Date;
  start_locale_timezone: string;
  created_datetime: Date;
  updated_datetime: Date;
  _links: Links;
}

export interface WalkWebhook {
  type: string;
  ts: Date;
  object_id: string;
  _links: WebhookLinks;
}

interface WebhookLinks {
  workout: User[];
  user: User[];
}

interface User {
  href: string;
  id: string;
}

interface Links {
  self: ActivityType[];
  user: ActivityType[];
  activity_type: ActivityType[];
  route: ActivityType[];
  workout_attribution: ActivityType[];
  privacy: ActivityType[];
  documentation: Documentation[];
}

interface ActivityType {
  href: string;
  id: string;
}

interface Documentation {
  href: string;
}

interface Aggregates {
  distance_total: number;
  active_time_total: number;
  elapsed_time_total: number;
  speed_max: number;
  speed_avg: number;
  cadence_max: number;
  cadence_min: number;
  cadence_avg: number;
  metabolic_energy_total: number;
  steps_total: number;
}
