import type {
  ContextMenuCommandInteraction,
  GatewayIntentBits,
  Interaction,
  Message,
  MessageReplyOptions,
} from 'discord.js';

export interface Config {
  prefix?: string; // now optional (if you want static fallback)
  getPrefix: (guildId: string) => string; // new dynamic function
  customPrefixes?: CustomPrefix[];
  ownerId?: string;
  eventsFolder: string;
  commandsFolder: string;
  componentsFolder: string;
  defaultIntents: GatewayIntentBits[];
  deniedCommandReplies: any;
  logChannelConfig?: LogChannelConfig;
}

export interface LogChannelConfig {
  channelId: string;
  message: (
      context: Interaction | ContextMenuCommandInteraction | Message,
      commandName: string,
      commandType: string,
  ) => Promise<MessageReplyOptions>;
}

export interface CustomPrefix {
  guildId: string;
  prefix: string;
}