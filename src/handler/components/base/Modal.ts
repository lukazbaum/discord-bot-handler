import { ModalSubmitFields, type ModalSubmitInteraction } from 'discord.js';

type ModalExecutor = (interaction: ModalSubmitInteraction, fields: ModalSubmitFields) => Promise<void>;

interface ModalData {
  customId: string;
  disabled?: boolean;
  execute: ModalExecutor;
}

export class Modal {
  readonly customId: string;
  readonly disabled: boolean;
  readonly execute: ModalExecutor;

  constructor({ customId, disabled = false, execute }: ModalData) {
    this.customId = customId;
    this.disabled = disabled;
    this.execute = execute;
  }
}
