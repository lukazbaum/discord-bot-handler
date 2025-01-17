import { SelectMenu } from '../../handler';
import type { AnySelectMenuInteraction } from 'discord.js';

<<<<<<< HEAD
export = {
    id: "select",
    type: ComponentTypes.SelectMenu,
    disabled: true,
    async execute(interaction: AnySelectMenuInteraction): Promise<void> {
        await interaction.reply({ content: `You selected ${interaction.values}` })
    }
} as ComponentModule;
=======
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
>>>>>>> 1ba7b721051224c5ba87ccd88f479c8eccdc8e84
