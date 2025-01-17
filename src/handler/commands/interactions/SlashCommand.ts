import { BaseCommand } from '../base/BaseCommand';
import { RegisterType } from '../../types/RegisterType';
import type { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

type SlashCommandExecutor = (interaction: ChatInputCommandInteraction) => Promise<void>;
type AutocompleteExecutor = (interaction: AutocompleteInteraction) => Promise<void>;

export class SlashCommand extends BaseCommand {
  readonly registerType: RegisterType;
  readonly data: SlashCommandBuilder;
  readonly execute: SlashCommandExecutor;
  readonly autocomplete?: AutocompleteExecutor;

  constructor(
    options: BaseCommand & {
      data: SlashCommandBuilder;
      registerType?: RegisterType;
      execute: SlashCommandExecutor;
      autocomplete?: AutocompleteExecutor;
    },
  ) {
    super(options);
    this.data = options.data;
    this.registerType = options.registerType ?? RegisterType.Guild;
    this.execute = options.execute;
    this.autocomplete = options.autocomplete;
  }
}
