import type { ExtendedClient } from '../core/ExtendedClient';
import { ComponentRegistrar } from './services/ComponentRegistrar';

export class ComponentManager {
  static async registerComponents(client: ExtendedClient): Promise<void> {
    await ComponentRegistrar.registerComponents(client);
  }

  static async reloadComponents(client: ExtendedClient): Promise<void> {
    await ComponentRegistrar.reloadComponents(client);
  }
}
