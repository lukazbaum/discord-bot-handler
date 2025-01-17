import type { ButtonInteraction } from 'discord.js';

type ButtonExecutor = (interaction: ButtonInteraction, uniqueId: string | null) => Promise<void>;

interface ButtonData {
  customId: string;
  disabled?: boolean;
  execute: ButtonExecutor;
}

export class Button {
  readonly customId: string;
  readonly disabled: boolean;
  readonly execute: ButtonExecutor;

  constructor({ customId, disabled = false, execute }: ButtonData) {
    this.customId = customId;
    this.disabled = disabled;
    this.execute = execute;
  }
}
