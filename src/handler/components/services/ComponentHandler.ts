import { client } from '../../../index';
import type { Modal } from '../base/Modal';
import type { Button } from '../base/Button';
import { LogManager } from '../../utils/LogManager';
import type { SelectMenu } from '../base/SelectMenu';
import type { ButtonInteraction, AnySelectMenuInteraction, ModalSubmitInteraction } from 'discord.js';

interface BaseComponent {
  customId: string;
  disabled: boolean;
}

export class ComponentHandler {
  private static async executeComponent<T extends BaseComponent>(
    component: T | undefined,
    execute: () => Promise<void>,
  ): Promise<void> {
    if (!component || component.disabled) return;
    try {
      await execute();
    } catch (err) {
      LogManager.logError(`Error executing component for customId: ${component.customId}`, err);
    }
  }

  static async handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
    // ✅ Skip all miniboss buttons
    if (interaction.customId.startsWith('mblist:')) return;
    if (interaction.customId.startsWith("localpg_")) return;

    const [customId, uniqueId] = interaction.customId.split(':');
    const component: Button | undefined = client.components.button.get(customId) as Button | undefined;
    await this.executeComponent(component, () => component!.execute(interaction, uniqueId || null));
  }

  static async handleAnySelectMenuInteraction(interaction: AnySelectMenuInteraction): Promise<void> {
    if (interaction.customId.startsWith("localpg_")) return;

    const customId: string = interaction.customId;
    const component: SelectMenu | undefined = client.components.selectMenu.get(customId) as SelectMenu | undefined;
    const values: string[] = interaction.values.map((item: string) => item.split(':')[0]);
    const uniqueIds: (string | null)[] = interaction.values.map((item: string) => item.split(':')[1] || null);
    await this.executeComponent(component, () => component!.execute(interaction, values, uniqueIds));
  }

  static async handleModalInteraction(interaction: ModalSubmitInteraction): Promise<void> {
    const customId: string = interaction.customId;
    const component: Modal | undefined = client.components.modal.get(customId) as Modal | undefined;
    await this.executeComponent(component, () => component!.execute(interaction, interaction.fields));
  }
}
