<<<<<<< HEAD
import { EmbedBuilder, Interaction } from "discord.js";
import { Intent, ConsoleColor } from "./handler";

// Message command prefix.
export const prefix: string = "ep ";

// Intents which will be enabled by default.
export const defaultIntents: Intent[] = [Intent.Guilds, Intent.MessageContent, Intent.GuildMessages, Intent.GuildMembers, Intent.GuildPresences];
=======
import { Config, getLogChannelPresetEmbed } from './handler';
import {
  type ContextMenuCommandInteraction,
  GatewayIntentBits,
  type Interaction,
  Message,
  type MessageReplyOptions,
} from 'discord.js';

const defaultConfig: Config = {
  prefix: '!',
  ownerId: 'YOUR_USER_ID',
  eventsFolder: 'events',
  commandsFolder: 'commands',
  componentsFolder: 'components',
  defaultIntents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],

  /* More customizability coming soon */
  deniedCommandReplies: {
    general: 'You are not allowed to use this command.',
    specific: {
      allowedUsers: 'This command is restricted to specific users.',
      blockedUsers: 'You have been blocked from using this command.',
      allowedChannels: 'This command can only be used in specific channels.',
      blockedChannels: 'This channel is not allowed to use this command.',
      allowedCategories: 'This command is restricted to specific categories.',
      blockedCategories: 'This category is blocked from using this command.',
      allowedGuilds: 'This command is only available in specific servers.',
      blockedGuilds: 'This server is not allowed to use this command.',
      allowedRoles: 'You need a specific role to use this command.',
      blockedRoles: 'You have a role that is blocked from using this command.',
      restrictedToOwner: 'Only the bot owner can use this command.',
      restrictedToNSFW: 'This command can only be used in NSFW channels.',
      isDisabled: 'This command is currently disabled.',
      custom: 'You are not allowed to use this command.',
    },
    cooldowns: {
      user: 'You can use this command again in {time} seconds.',
      guild: 'This command is on cooldown for this server. Try again in {time} seconds.',
      global: 'This command is on global cooldown. Try again in {time} seconds.',
    },
  },
>>>>>>> 1ba7b721051224c5ba87ccd88f479c8eccdc8e84

  logChannelConfig: {
    channelId: 'YOUR_LOG_CHANNEL_ID',
    message: async (
      context: Interaction | ContextMenuCommandInteraction | Message,
      commandName: string,
      commandType: string,
    ): Promise<MessageReplyOptions> => {
      return {
        embeds: [getLogChannelPresetEmbed(context, commandName, commandType)],
      };
    },
  },
};

<<<<<<< HEAD
// Your Discord ID (for owner only commands)
export const ownerId: string = "936693149114449921";

// Layout for the info logging message.
export function getLoggerLogMessage(message: string): string {
    return `${ConsoleColor.Green}[INFO] ${message}${ConsoleColor.Reset}`;
}

// Layout for the warning logging message.
export function getLoggerWarnMessage(message: string): string {
    return `${ConsoleColor.Yellow}[WARNING] ${message}${ConsoleColor.Reset}`;
}

// Layout for the error logging message.
export function getLoggerErrorMessage(message: string): string {
    return `${ConsoleColor.Red}[ERROR] ${message}${ConsoleColor.Reset}`;
}

// Generates an embed when a user lacks the necessary conditions to execute a command.
export function getCommandNotAllowedEmbed(interaction: Interaction): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("You are not authorized to use this command!")
        .setColor("#DA373C")
}

// Generates an embed when a command is on cooldown.
export function getCommandOnCooldownEmbed(timeLeft: number, commandName: string): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle("Command on cooldown")
        .setColor("#DA373C")
        .setDescription(`Please wait ${timeLeft} more second(s) before reusing the \`${commandName}\` command.`);
}
=======
export default defaultConfig;
>>>>>>> 1ba7b721051224c5ba87ccd88f479c8eccdc8e84
