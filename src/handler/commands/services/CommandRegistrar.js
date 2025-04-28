import path from 'path';
import config from '../../../config';
import { Features } from '../../types/Features';
import { LogManager } from '../../utils/LogManager';
import { PrefixCommand } from '../prefix/PrefixCommand';
import { ContextMenu } from '../interactions/ContextMenu';
import { ModuleManager } from '../../utils/ModuleManager';
import { SlashCommand } from '../interactions/SlashCommand';
import { emptyCommandCollections } from '../../types/CommandCollections';
export class CommandRegistrar {
    static folderPath = path.join(__dirname, `../../../${config.commandsFolder}`);
    static async registerCommands(client) {
        try {
            const commandFiles = await ModuleManager.getAllModulePaths(this.folderPath);
            const commandModules = await Promise.all(commandFiles.map(ModuleManager.importModule));
            commandModules.forEach((module, index) => this.registerCommand(client, module, commandFiles[index]));
        }
        catch (err) {
            LogManager.logError('Error registering commands', err);
        }
    }
    static async reloadCommands(client) {
        try {
            client.commands = emptyCommandCollections;
            await ModuleManager.clearModulesInDirectory(this.folderPath);
            await this.registerCommands(client);
        }
        catch (err) {
            LogManager.logError('Error reloading commands', err);
        }
    }
    static registerCommand(client, commandModule, filePath) {
        const { default: command } = commandModule;
        if (!this.isValidCommand(command)) {
            LogManager.logError(`Invalid command in file: ${filePath}. Expected an instance of a Command class.`);
            return;
        }
        if (command instanceof SlashCommand && client.isEnabledFeature(Features.SlashCommands)) {
            client.commands.slash.set(command.data.name, command);
        }
        else if (command instanceof ContextMenu && client.isEnabledFeature(Features.ContextMenus)) {
            client.commands.context.set(command.data.name, command);
        }
        else if (command instanceof PrefixCommand && client.isEnabledFeature(Features.PrefixCommands)) {
            client.commands.prefix.set(command.name, command);
            if (command.aliases) {
                command.aliases.forEach((alias) => {
                    client.commands.prefixAliases.set(alias, command.name);
                });
            }
        }
    }
    static isValidCommand(command) {
        return command instanceof SlashCommand || command instanceof ContextMenu || command instanceof PrefixCommand;
    }
}
