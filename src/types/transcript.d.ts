/** The bot's transcript. Contains most text templates sent by the bot. */
export interface Transcript {
  /** Messages related to welcoming users */
  welcome: Welcome;
  /** Standard error message sent when an error occurs */
  error: string;
  /** Message sent every day for daily statistics, contains info about the current location and phone battery level */
  stats: string;
  /** Messages sent upon bot startup */
  startup: Startup;
  /** Emojis sent in the daily stats message */
  emojis: Emojis;
  /** Messages related to my private channel */
  private: Private;
  /** Messages related to walk webhooks, sent in by the MapMyFitness API */
  walk: Walk;
  /** Messages related to my usergroup */
  usergroup: Usergroup;
}

interface Welcome {
  /** Initial ephemeral message sent when a user joins the channel */
  initial: string;
  /** Ephemeral message asking users whether or not they want to be publically welcomed  */
  question: string;
  /** Message sent publically if the users chooses to be publically welcomed */
  public: string;
  /** Ephemerla message sent if the user chooses not to be publically welcomed */
  private: string;
}

interface Startup {
  /** Message sent when the bot is started */
  bot: string;
  /** Message sent when the server is started */
  server: string;
}

interface Emojis {
  /** Emojis pertaining to battery level */
  battery: Battery;
  /** Emojis pertaining to current location */
  country: Country;
}

interface Battery {
  /** Emoji used when the battery is low */
  low: string;
  /** Emoji used when the battery is not low */
  normal: string;
}

interface Country {
  /** Emoji used when flag data cannot be obtained */
  other: string;
}

interface Private {
  /** Message sent to people if they're invited to join my private channel */
  invite: string;
  /** Message sent to people when they join my private channel */
  welcome: string;
}

interface Walk {
  /** Message sent publically when a walk is completed */
  completed: string;
  /** Message sent containing additional walk statistics after a walk is completedd */
  stats: string;
}

interface Usergroup {
  /** Message sent when a user joins my user group */
  join: string;
  /** Message sent when a user leaves my user group */
  leave: string;
}
