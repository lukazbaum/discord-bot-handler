import path from 'path';
import { readdir } from 'fs/promises';
import { LogManager } from './LogManager';

export class ModuleManager {
  static async getAllModulePaths(directory: string): Promise<string[]> {
    const dirents = await readdir(directory, { withFileTypes: true });

    const files: (string | string[] | null)[] = await Promise.all(
      dirents.map(async (dirent): Promise<string | string[] | null> => {
        const res: string = path.resolve(directory, dirent.name);
        if (dirent.isDirectory()) {
          return ModuleManager.getAllModulePaths(res);
        } else if (dirent.name.endsWith('.ts') || dirent.name.endsWith('.js')) {
          return res;
        }
        return null;
      }),
    );

    return files.flat().filter((file: string | null): file is string => file !== null);
  }

  static async importModule(modulePath: string): Promise<any | null> {
    try {
      return await import(modulePath);
    } catch (err) {
      LogManager.logError(`Error importing module: ${modulePath}`, err);
      return null;
    }
  }

  static clearModuleCache(modulePath: string): void {
    const resolvedPath = require.resolve(modulePath);
    if (require.cache[resolvedPath]) {
      delete require.cache[resolvedPath];
    }
  }

  static async clearModulesInDirectory(directory: string): Promise<void> {
    try {
      const dirents = await readdir(directory, { withFileTypes: true });

      const clearPromises: Promise<void>[] = dirents.map(async (dirent): Promise<void> => {
        const modulePath: string = path.resolve(directory, dirent.name);
        if (dirent.isDirectory()) {
          await ModuleManager.clearModulesInDirectory(modulePath);
        } else if (dirent.name.endsWith('.ts') || dirent.name.endsWith('.js')) {
          ModuleManager.clearModuleCache(modulePath);
        }
      });

      await Promise.all(clearPromises);
    } catch (err) {
      LogManager.logError(`Error clearing modules in directory: ${directory}`, err);
    }
  }
}
