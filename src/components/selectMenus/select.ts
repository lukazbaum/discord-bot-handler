import { SelectMenu } from '../../handler';
import type { AnySelectMenuInteraction } from 'discord.js';


export default new SelectMenu({
  customId: 'selectMenu',

  async execute(interaction: AnySelectMenuInteraction, values: string[], uniqueIds: (string | null)[]): Promise<void> {
    const choice: string = values[0];

    const responses: Record<string, string> = {
      cats: 'You chose cats! 🐱',
      dogs: 'You chose dogs! 🐶',
      birds: 'You chose birds! 🐦',
    };

    await interaction.reply({ content: responses[choice] });
  },
});

