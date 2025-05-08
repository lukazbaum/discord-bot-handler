import { ButtonInteraction } from 'discord.js';
import { Button } from '../../handler';
import { getPaginationSession } from '../../utils/paginateEmbedWithSelect';

export default new Button({
  customId: 'localpg_prev',
  async execute(interaction: ButtonInteraction): Promise<void> {
    const session = getPaginationSession('localpg');
    if (!session) {
      await interaction.reply({ content: '❌ Pagination session not found.', ephemeral: true });
      return;
    }
    await interaction.deferUpdate();
    await session.updatePage(-1);
  },
});