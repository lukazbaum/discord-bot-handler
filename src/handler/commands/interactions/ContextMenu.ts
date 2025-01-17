import { BaseCommand } from '../base/BaseCommand';
import { RegisterType } from '../../types/RegisterType';
import type { ContextMenuCommandBuilder, ContextMenuCommandInteraction } from 'discord.js';

type ContextMenuExecutor = (interaction: ContextMenuCommandInteraction) => Promise<void>;

export class ContextMenu extends BaseCommand {
  readonly registerType: RegisterType;
  readonly data: ContextMenuCommandBuilder;
  readonly execute: ContextMenuExecutor;

  constructor(
    options: BaseCommand & {
      data: ContextMenuCommandBuilder;
      registerType?: RegisterType;
      execute: ContextMenuExecutor;
    },
  ) {
    super(options);
    this.data = options.data;
    this.registerType = options.registerType ?? RegisterType.Guild;
    this.execute = options.execute;
    Object.assign(this, options);
  }
}
