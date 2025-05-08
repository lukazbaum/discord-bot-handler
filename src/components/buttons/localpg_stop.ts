// src/components/buttons/localpg_stop.ts

import { ButtonInteraction } from 'discord.js';
import { Button } from '../../handler';

export default new Button({
  customId: 'localpg_stop',
  async execute(interaction: ButtonInteraction): Promise<void> {
    try {
      // Disable all components and mark session as stopped
      await interaction.update({
        content: '⏹️ Pagination manually stopped.',
        components: []
      });
    } catch (error: any) {
      if (error.code === 10062) {
        console.warn("⚠️ Interaction expired or invalid (code 10062).");
        return;
      }
      console.error('❌ Error in localpg_stop button:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Failed to stop pagination.', ephemeral: true });
      }
    }
  }
});