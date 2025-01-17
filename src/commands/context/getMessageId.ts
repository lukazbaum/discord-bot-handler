import { ContextMenu, RegisterType } from '../../handler';
import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  type ContextMenuCommandType,
  MessageFlags,
} from 'discord.js';

<<<<<<< HEAD
export = {
    type: CommandTypes.ContextMenu,
    register: RegisterTypes.Guild,
    data: new ContextMenuCommandBuilder()
        .setName("Get Message ID")
	//@ts-ignore
        .setType(ApplicationCommandType.Message),
    async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
        await interaction.reply({ content: `Message ID: ${interaction.targetId}` });
    }
} as ContextMenuCommandModule;
=======
export default new ContextMenu({
  registerType: RegisterType.Guild,

  data: new ContextMenuCommandBuilder()
    .setName('Get Message ID')
    .setType(ApplicationCommandType.Message as ContextMenuCommandType),

  async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
    await interaction.reply({ content: `Message ID: ${interaction.targetId}`, flags: [MessageFlags.Ephemeral] });
  },
});
>>>>>>> 1ba7b721051224c5ba87ccd88f479c8eccdc8e84
