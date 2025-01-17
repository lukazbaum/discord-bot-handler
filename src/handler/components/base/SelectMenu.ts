import type { AnySelectMenuInteraction } from 'discord.js';

type SelectMenuExecutor = (
  interaction: AnySelectMenuInteraction,
  values: string[],
  uniqueIds: (string | null)[],
) => Promise<void>;

interface SelectMenuData {
  customId: string;
  disabled?: boolean;
  execute: SelectMenuExecutor;
}

export class SelectMenu {
  readonly customId: string;
  readonly disabled: boolean;
  readonly execute: SelectMenuExecutor;

  constructor({ customId, disabled = false, execute }: SelectMenuData) {
    this.customId = customId;
    this.disabled = disabled;
    this.execute = execute;
  }
}
