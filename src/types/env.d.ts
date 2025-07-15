declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** Slack access token */
      ACCESS_TOKEN: string;
      /** Slack socket token */
      SOCKET_TOKEN: string;
      /** My Slack user ID */
      USER_ID: string;
      /** Main channel for messages */
      MAIN_CHANNEL: string;
      /** Channel for logs */
      LOG_CHANNEL: string;
      /** My private channel */
      PRIVATE_CHANNEL: string;
      /** My user group */
      USER_GROUP: string;
      /** Path to transcript.yml file */
      YAML_FILE: string;
      /** Port to run the server on */
      PORT: number;
      /** Hash of API key used for server operations */
      API_KEY_HASH: string;
      /** MapMyFitness API key */
      MPF_API_KEY: string;
      /** MapMyFitness auth token */
      MPF_BEARER_TOKEN: string;
      /** Tailscale API key */
      TAILSCALE_API_KEY: string;
      /** Hackatime API key */
      HACKATIME_API_KEY: string;
    }
  }
}

export {};
