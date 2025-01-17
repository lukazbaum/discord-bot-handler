import { ConfigManager } from './ConfigManager';
import { LogManager } from '../../utils/LogManager';
import type { RegisterType } from '../../types/RegisterType';
import type { ContextMenu } from '../interactions/ContextMenu';
import type { SlashCommand } from '../interactions/SlashCommand';
import type { ContextMenuCommandBuilder, REST, RouteLike, SlashCommandBuilder } from 'discord.js';

export class CommandDeployer {
  static async deployCommands(registerType: RegisterType, commands: (SlashCommand | ContextMenu)[]): Promise<void> {
    const rest: REST | null = ConfigManager.setupREST();
    const route: RouteLike | null = ConfigManager.getRoute(registerType);

    if (!rest || !route) return;

    try {
      const data: (SlashCommandBuilder | ContextMenuCommandBuilder)[] = commands
        .map((command: SlashCommand | ContextMenu) => command.data)
        .filter(Boolean);
      await rest.put(route, { body: data });
      LogManager.log(`Successfully uploaded ${data.length} ${registerType} commands.`);
    } catch (err) {
      LogManager.logError('Error uploading commands.', err);
    }
  }

  static async deleteCommands(registerType: RegisterType, commandIds: string[]): Promise<void> {
    const rest: REST | null = ConfigManager.setupREST();
    const route: string | null = ConfigManager.getRoute(registerType);

    if (!rest || !route) return;

    try {
      await Promise.all(
        commandIds.map((commandId: string): Promise<unknown> => rest.delete(<RouteLike>`${route}/${commandId}`)),
      );
      LogManager.log(`Successfully deleted ${commandIds.length} ${registerType} commands.`);
    } catch (err) {
      LogManager.logError('Error deleting commands.', err);
    }
  }
}
