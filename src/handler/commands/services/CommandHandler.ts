import config from '../../../config';
import { client } from '../../../index';
import { LogManager } from '../../utils/LogManager';
import type { LogChannelConfig } from '../../types/Config';
import type { PrefixCommand } from '../prefix/PrefixCommand';
import type { ContextMenu } from '../interactions/ContextMenu';
import type { SlashCommand } from '../interactions/SlashCommand';
import { CommandValidator } from '../validators/CommandValidator';
import {
  AutocompleteInteraction,
  Channel,
  ChatInputCommandInteraction,
  Colors,
  ContextMenuCommandInteraction,
  EmbedBuilder,
  Interaction,
  Message,
  MessageFlags,
} from 'discord.js';

export class CommandHandler {
  static async handleSlashCommandInteraction(
    interaction: ChatInputCommandInteraction | AutocompleteInteraction,
  ): Promise<void> {
    const command = client.commands.slash.get(interaction.commandName) as SlashCommand | undefined;

    if (!command) {
      return LogManager.logError(`No command matching ${interaction.commandName} was found.`);
    }

    if (interaction.isAutocomplete()) {
      return this.handleAutocomplete(interaction, command);
    }

    if (!(await this.checkCommandPermission(command, interaction))) return;

    try {
      await command.execute(interaction);
      if (command.logUsage) await this.sendUsageLog(interaction, interaction.commandName, 'Slash Command');
    } catch (err) {
      LogManager.logError(`Error executing command ${interaction.commandName}`, err);
    }
  }

  static async handleContextMenuInteraction(interaction: ContextMenuCommandInteraction): Promise<void> {
    const contextMenu = client.commands.context.get(interaction.commandName) as ContextMenu | undefined;

    if (!contextMenu) {
      return LogManager.logError(`No context menu matching ${interaction.commandName} was found.`);
    }

    if (!(await this.checkCommandPermission(contextMenu, interaction))) return;

    try {
      await contextMenu.execute(interaction);
      if (contextMenu.logUsage) await this.sendUsageLog(interaction, interaction.commandName, 'Context Menu');
    } catch (err) {
      LogManager.logError(`Error executing context menu ${interaction.commandName}`, err);
    }
  }

  static async handlePrefixCommand(message: Message): Promise<void> {
    // Dynamically get the prefix based on the guild ID
    const prefix = config.getPrefix?.(message.guild?.id || '') ?? config.prefix; // dynamite from config

    // Ensure the message starts with the prefix
    if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

    // Extract the command name from the message content
    const commandName: string = message.content.slice(prefix.length).trim().split(/\s+/)[0]?.toLowerCase();
    const resolvedCommandName: string = client.commands.prefixAliases.get(commandName) ?? commandName;

    // Get the command object from the command collection
    const command: PrefixCommand | undefined = client.commands.prefix.get(resolvedCommandName);

    if (!command) {
      return; // Command not found, exit silently
    }

    // Check if the user has permission to execute the command
    if (!(await this.checkCommandPermission(command, message))) return;

    try {
      // Execute the command and log its usage if necessary
      await command.execute(message);
      if (command.logUsage) {
        await this.sendUsageLog(message, resolvedCommandName, 'Prefix Command');
      }
    } catch (err) {
      // Log errors during command execution
      LogManager.logError(`Error executing prefix command ${resolvedCommandName}`, err);
    }
  }

  private static async handleAutocomplete(interaction: AutocompleteInteraction, command: SlashCommand): Promise<void> {
    if (!command.autocomplete) {
      return LogManager.logError(`No autocomplete in ${interaction.commandName} was found.`);
    }

    try {
      await command.autocomplete(interaction);
    } catch (err) {
      LogManager.logError(`Error executing autocomplete for command ${interaction.commandName}`, err);
    }
  }

  private static async checkCommandPermission(
    command: SlashCommand | ContextMenu | PrefixCommand,
    context: any,
  ): Promise<boolean> {
    const { allowed, reason, cooldown } = CommandValidator.isAllowedCommand(
      command,
      context.user || context.author,
      context.channel,
      context.guild,
      context.member,
    );

    if (allowed) return true;

    const reply = cooldown?.timeLeft
      ? config.deniedCommandReplies.cooldowns[cooldown.type]?.replace('{time}', cooldown.timeLeft.toString())
      : config.deniedCommandReplies.specific[reason ?? ''] || config.deniedCommandReplies.general;

    const replyEmbed: EmbedBuilder = new EmbedBuilder().setColor(Colors.Red).setTitle(reply);

    await (context.reply?.({
      embeds: [replyEmbed],
      flags: [MessageFlags.Ephemeral],
    }) || context.channel.send({ embeds: [replyEmbed] }));
    return false;
  }

  private static async sendUsageLog(
    context: Interaction | ContextMenuCommandInteraction | Message,
    commandName: string,
    commandType: string,
  ): Promise<void> {
    try {
      const logChannelConfig: LogChannelConfig | undefined = config.logChannelConfig;
      if (!logChannelConfig || logChannelConfig.channelId.length !> 0) return;

      const channel: Channel | null = await client.channels.fetch(logChannelConfig.channelId);
      if (!channel) return;

      if (channel.isSendable()) {
        await channel.send(await logChannelConfig.message(context, commandName, commandType));
      }
    } catch (err) {
      LogManager.logError(`Error sending command usage log for command ${commandName}`, err);
    }
  }
}
