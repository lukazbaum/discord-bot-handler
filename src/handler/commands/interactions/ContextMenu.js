import { BaseCommand } from '../base/BaseCommand';
import { RegisterType } from '../../types/RegisterType';
export class ContextMenu extends BaseCommand {
    registerType;
    data;
    execute;
    constructor(options) {
        super(options);
        this.data = options.data;
        this.registerType = options.registerType ?? RegisterType.Guild;
        this.execute = options.execute;
        Object.assign(this, options);
    }
}
