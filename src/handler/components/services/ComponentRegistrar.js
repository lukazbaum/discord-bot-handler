import path from 'path';
import config from '../../../config';
import { Modal } from '../base/Modal';
import { Button } from '../base/Button';
import { Features } from '../../types/Features';
import { SelectMenu } from '../base/SelectMenu';
import { LogManager } from '../../utils/LogManager';
import { ModuleManager } from '../../utils/ModuleManager';
import { emptyComponentCollections } from '../../types/ComponentCollections';
export class ComponentRegistrar {
    static folderPath = path.join(__dirname, `../../../${config.componentsFolder}`);
    static async registerComponents(client) {
        try {
            const componentFiles = await ModuleManager.getAllModulePaths(this.folderPath);
            const componentModules = await Promise.all(componentFiles.map(ModuleManager.importModule));
            componentModules.forEach((module, index) => this.registerComponent(client, module, componentFiles[index]));
        }
        catch (err) {
            LogManager.logError('Error registering components', err);
        }
    }
    static async reloadComponents(client) {
        try {
            client.components = emptyComponentCollections;
            await ModuleManager.clearModulesInDirectory(this.folderPath);
            await this.registerComponents(client);
        }
        catch (err) {
            LogManager.logError('Error reloading components', err);
        }
    }
    static registerComponent(client, componentModule, filePath) {
        const { default: component } = componentModule;
        if (!this.isValidComponent(component)) {
            LogManager.logError(`Invalid component in file: ${filePath}. Expected an instance of a Component class.`);
            return;
        }
        if (component instanceof Button && client.isEnabledFeature(Features.Buttons)) {
            client.components.button.set(component.customId, component);
        }
        else if (component instanceof SelectMenu && client.isEnabledFeature(Features.SelectMenus)) {
            client.components.selectMenu.set(component.customId, component);
        }
        else if (component instanceof Modal && client.isEnabledFeature(Features.Modals)) {
            client.components.modal.set(component.customId, component);
        }
    }
    static isValidComponent(component) {
        return component instanceof Button || component instanceof SelectMenu || component instanceof Modal;
    }
}
