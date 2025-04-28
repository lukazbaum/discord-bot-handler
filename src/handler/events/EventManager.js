import path from 'path';
import config from '../../config';
import { Event } from './base/Event';
import { Features } from '../types/Features';
import { LogManager } from '../utils/LogManager';
import { ModuleManager } from '../utils/ModuleManager';
export class EventManager {
    static DEFAULT_LISTENER_PATH = path.join(__dirname, '../../handler/events/listeners');
    static folderPaths = [
        path.join(__dirname, `../../${config.eventsFolder}`),
        this.DEFAULT_LISTENER_PATH,
    ];
    static async registerEvents(client) {
        const pathsToLoad = client.isEnabledFeature(Features.Events)
            ? this.folderPaths
            : [this.DEFAULT_LISTENER_PATH];
        try {
            for (const folderPath of pathsToLoad) {
                const eventFiles = await ModuleManager.getAllModulePaths(folderPath);
                const eventModules = await Promise.all(eventFiles.map(ModuleManager.importModule));
                eventModules.forEach((module, index) => {
                    const event = module?.default;
                    if (event instanceof Event) {
                        this.registerEvent(client, event, eventFiles[index]);
                    }
                    else {
                        LogManager.logError(`Invalid event in file: ${eventFiles[index]}. Expected an instance of Event.`);
                    }
                });
            }
        }
        catch (err) {
            LogManager.logError('Error registering events', err);
        }
    }
    static async reloadEvents(client) {
        if (!client.isEnabledFeature(Features.Events))
            return;
        try {
            client.events = [];
            client.removeAllListeners();
            await Promise.all(this.folderPaths.map(ModuleManager.clearModulesInDirectory));
            await this.registerEvents(client);
        }
        catch (err) {
            LogManager.logError('Error reloading events', err);
        }
    }
    static registerEvent(client, event, filePath) {
        if (!client.events.includes(event.name))
            client.events.push(event.name);
        client[event.once ? 'once' : 'on'](event.name, (...args) => {
            event.execute(...args).catch((err) => LogManager.logError(`Error executing event ${event.name}:`, err));
        });
    }
}
