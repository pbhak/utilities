// TODO jsdoc

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_TOKEN: string;
      SOCKET_TOKEN: string;
      USER_ID: string;
      MAIN_CHANNEL: string;
      LOG_CHANNEL: string;
      PRIVATE_CHANNEL: string;
      USER_GROUP: string;
      YAML_FILE: string;
      PORT: number;
      API_KEY_HASH: string;
      MPF_API_KEY: string;
      MPF_BEARER_TOKEN: string;
      TAILSCALE_API_KEY: string;
    }
  }
}

export {};
