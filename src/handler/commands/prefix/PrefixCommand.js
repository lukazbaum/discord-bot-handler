import { BaseCommand } from '../base/BaseCommand';
export class PrefixCommand extends BaseCommand {
    name;
    aliases;
    execute;
    constructor(options) {
        super(options);
        this.name = options.name;
        this.aliases = options.aliases;
        this.execute = options.execute;
    }
}
