import { ContextMenu, RegisterType } from '../../handler';
import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  type ContextMenuCommandType,
  MessageFlags,
} from 'discord.js';

export default new ContextMenu({
  registerType: RegisterType.Guild,

  data: new ContextMenuCommandBuilder()
    .setName('Get User ID')
    .setType(ApplicationCommandType.User as ContextMenuCommandType),

  async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
    await interaction.reply({ content: `User ID: ${interaction.targetId}`, flags: [MessageFlags.Ephemeral] });
  },
});
