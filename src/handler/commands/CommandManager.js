import { RegisterType } from '../types/RegisterType';
import { CommandDeployer } from './services/CommandDeployer';
import { CommandRegistrar } from './services/CommandRegistrar';
export class CommandManager {
    static async registerCommands(client) {
        await CommandRegistrar.registerCommands(client);
    }
    static async reloadCommands(client) {
        await CommandRegistrar.reloadCommands(client);
    }
    static async deployCommands(client) {
        const { guildCommands, globalCommands } = this.categorizeCommands(client);
        await Promise.all([
            guildCommands.length && CommandDeployer.deployCommands(RegisterType.Guild, guildCommands),
            globalCommands.length && CommandDeployer.deployCommands(RegisterType.Global, globalCommands),
        ]);
    }
    static async deleteCommands(registerType, commandIds) {
        await CommandDeployer.deleteCommands(registerType, commandIds);
    }
    static categorizeCommands(client) {
        const guildCommands = [];
        const globalCommands = [];
        [client.commands.slash, client.commands.context].forEach((commandCollection) => {
            commandCollection.forEach((command) => {
                (command.registerType === RegisterType.Guild ? guildCommands : globalCommands).push(command);
            });
        });
        return { guildCommands, globalCommands };
    }
}
