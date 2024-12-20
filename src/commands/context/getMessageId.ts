import { ContextMenu, RegisterType } from '../../handler';
import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  type ContextMenuCommandType,
} from 'discord.js';

export default new ContextMenu({
  registerType: RegisterType.Guild,

  data: new ContextMenuCommandBuilder()
    .setName('Get Message ID')
    .setType(ApplicationCommandType.Message as ContextMenuCommandType),

  async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
    await interaction.reply({ content: `Message ID: ${interaction.targetId}`, ephemeral: true });
  },
});
