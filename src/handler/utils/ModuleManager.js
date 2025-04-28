import path from 'path';
import { readdir } from 'fs/promises';
import { LogManager } from './LogManager';
export class ModuleManager {
    static async getAllModulePaths(directory) {
        const dirents = await readdir(directory, { withFileTypes: true });
        const files = await Promise.all(dirents.map(async (dirent) => {
            const res = path.resolve(directory, dirent.name);
            if (dirent.isDirectory()) {
                return ModuleManager.getAllModulePaths(res);
            }
            else if (dirent.name.endsWith('.ts') || dirent.name.endsWith('.js')) {
                return res;
            }
            return null;
        }));
        return files.flat().filter((file) => file !== null);
    }
    static async importModule(modulePath) {
        try {
            return await import(modulePath);
        }
        catch (err) {
            LogManager.logError(`Error importing module: ${modulePath}`, err);
            return null;
        }
    }
    static clearModuleCache(modulePath) {
        const resolvedPath = require.resolve(modulePath);
        if (require.cache[resolvedPath]) {
            delete require.cache[resolvedPath];
        }
    }
    static async clearModulesInDirectory(directory) {
        try {
            const dirents = await readdir(directory, { withFileTypes: true });
            const clearPromises = dirents.map(async (dirent) => {
                const modulePath = path.resolve(directory, dirent.name);
                if (dirent.isDirectory()) {
                    await ModuleManager.clearModulesInDirectory(modulePath);
                }
                else if (dirent.name.endsWith('.ts') || dirent.name.endsWith('.js')) {
                    ModuleManager.clearModuleCache(modulePath);
                }
            });
            await Promise.all(clearPromises);
        }
        catch (err) {
            LogManager.logError(`Error clearing modules in directory: ${directory}`, err);
        }
    }
}
