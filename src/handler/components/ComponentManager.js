import { ComponentRegistrar } from './services/ComponentRegistrar';
export class ComponentManager {
    static async registerComponents(client) {
        await ComponentRegistrar.registerComponents(client);
    }
    static async reloadComponents(client) {
        await ComponentRegistrar.reloadComponents(client);
    }
}
