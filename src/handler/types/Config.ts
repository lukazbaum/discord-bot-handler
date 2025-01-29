import type {
  ContextMenuCommandInteraction,
  GatewayIntentBits,
  Interaction,
  Message,
  MessageReplyOptions,
} from 'discord.js';

export interface Config {
  getPrefix?: (guildId: string) => string;
  prefix?: string;
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
