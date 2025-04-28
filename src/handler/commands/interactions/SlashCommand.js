import { BaseCommand } from '../base/BaseCommand';
import { RegisterType } from '../../types/RegisterType';
export class SlashCommand extends BaseCommand {
    registerType;
    data;
    execute;
    autocomplete;
    constructor(options) {
        super(options);
        this.data = options.data;
        this.registerType = options.registerType ?? RegisterType.Guild;
        this.execute = options.execute;
        this.autocomplete = options.autocomplete;
    }
}
