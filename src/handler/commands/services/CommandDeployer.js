import { ConfigManager } from './ConfigManager';
import { LogManager } from '../../utils/LogManager';
export class CommandDeployer {
    static async deployCommands(registerType, commands) {
        const rest = ConfigManager.setupREST();
        const route = ConfigManager.getRoute(registerType);
        if (!rest || !route)
            return;
        try {
            const data = commands
                .map((command) => command.data)
                .filter(Boolean);
            await rest.put(route, { body: data });
            LogManager.log(`Successfully uploaded ${data.length} ${registerType} commands.`);
        }
        catch (err) {
            LogManager.logError('Error uploading commands.', err);
        }
    }
    static async deleteCommands(registerType, commandIds) {
        const rest = ConfigManager.setupREST();
        const route = ConfigManager.getRoute(registerType);
        if (!rest || !route)
            return;
        try {
            await Promise.all(commandIds.map((commandId) => rest.delete(`${route}/${commandId}`)));
            LogManager.log(`Successfully deleted ${commandIds.length} ${registerType} commands.`);
        }
        catch (err) {
            LogManager.logError('Error deleting commands.', err);
        }
    }
}
