import type { Collection } from 'discord.js';
import { RegisterType } from '../types/RegisterType';
import { CommandDeployer } from './services/CommandDeployer';
import type { ExtendedClient } from '../core/ExtendedClient';
import type { ContextMenu } from './interactions/ContextMenu';
import { CommandRegistrar } from './services/CommandRegistrar';
import type { SlashCommand } from './interactions/SlashCommand';

export class CommandManager {
  static async registerCommands(client: ExtendedClient): Promise<void> {
    await CommandRegistrar.registerCommands(client);
  }

  static async reloadCommands(client: ExtendedClient): Promise<void> {
    await CommandRegistrar.reloadCommands(client);
  }

  static async deployCommands(client: ExtendedClient): Promise<void> {
    const { guildCommands, globalCommands } = this.categorizeCommands(client);
    await Promise.all([
      guildCommands.length && CommandDeployer.deployCommands(RegisterType.Guild, guildCommands),
      globalCommands.length && CommandDeployer.deployCommands(RegisterType.Global, globalCommands),
    ]);
  }

  static async deleteCommands(registerType: RegisterType, commandIds: string[]): Promise<void> {
    await CommandDeployer.deleteCommands(registerType, commandIds);
  }

  private static categorizeCommands(client: ExtendedClient) {
    const guildCommands: (SlashCommand | ContextMenu)[] = [];
    const globalCommands: (SlashCommand | ContextMenu)[] = [];

    [client.commands.slash, client.commands.context].forEach(
      (commandCollection: Collection<string, SlashCommand | ContextMenu>): void => {
        commandCollection.forEach((command: SlashCommand | ContextMenu): void => {
          (command.registerType === RegisterType.Guild ? guildCommands : globalCommands).push(command);
        });
      },
    );

    return { guildCommands, globalCommands };
  }
}
