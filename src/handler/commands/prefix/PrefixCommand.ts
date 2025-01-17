import type { Message } from 'discord.js';
import { BaseCommand } from '../base/BaseCommand';

type PrefixCommandExecutor = (message: Message) => Promise<void>;

export class PrefixCommand extends BaseCommand {
  readonly name: string;
  readonly aliases?: string[];
  //readonly permissions?: string[];
  readonly execute: PrefixCommandExecutor;

  constructor(
    options: BaseCommand & {
      name: string;
      aliases?: string[];
      //permissions?: string[];
      //pingable?: boolean;
      execute: PrefixCommandExecutor;
    },
  ) {
    super(options);
    this.name = options.name;
    this.aliases = options.aliases;
    //this.permissions = options.permissions;
    this.execute = options.execute;
  }
}
