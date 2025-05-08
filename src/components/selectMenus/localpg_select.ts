import { AnySelectMenuInteraction } from 'discord.js';
import { SelectMenu } from '../../handler';
import { getPaginationSession } from '../../utils/paginateEmbedWithSelect';

export default new SelectMenu({
  customId: 'localpg_select',
  async execute(interaction: AnySelectMenuInteraction, values: string[]): Promise<void> {
    const session = getPaginationSession('localpg');
    if (!session) {
      await interaction.reply({ content: '❌ Pagination session not found.', ephemeral: true });
      return;
    }
    const page = parseInt(values[0]);
    await interaction.deferUpdate();
    await session.jumpTo(page);
  },
});