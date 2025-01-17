import { Event } from '../base/Event';
import { Events, type Interaction } from 'discord.js';
import { CommandHandler } from '../../commands/services/CommandHandler';
import { ComponentHandler } from '../../components/services/ComponentHandler';

export default new Event({
  name: Events.InteractionCreate,
  async execute(interaction: Interaction): Promise<void> {
    if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
      await CommandHandler.handleSlashCommandInteraction(interaction);
    } else if (interaction.isContextMenuCommand()) {
      await CommandHandler.handleContextMenuInteraction(interaction);
    } else if (interaction.isButton()) {
      await ComponentHandler.handleButtonInteraction(interaction);
    } else if (interaction.isAnySelectMenu()) {
      await ComponentHandler.handleAnySelectMenuInteraction(interaction);
    } else if (interaction.isModalSubmit()) {
      await ComponentHandler.handleModalInteraction(interaction);
    }
  },
});
