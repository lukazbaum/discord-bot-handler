import { RegisterType, SlashCommand } from '../../../handler';
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';

export default new SlashCommand({
  registerType: RegisterType.Guild,

  data: new SlashCommandBuilder()
    .setName('modal')
    .setDescription('Share your favorite color and hobbies'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const modal: ModalBuilder = new ModalBuilder()
      .setCustomId('askModal')
      .setTitle('Tell us about yourself!');

    const colorInput: TextInputBuilder = new TextInputBuilder()
      .setCustomId('favoriteColor')
      .setLabel("What's your favorite color?")
      .setPlaceholder('e.g., Blue')
      .setStyle(TextInputStyle.Short);

    const hobbiesInput: TextInputBuilder = new TextInputBuilder()
      .setCustomId('hobbies')
      .setLabel("What's one of your favorite hobbies?")
      .setPlaceholder('e.g., Reading books')
      .setStyle(TextInputStyle.Paragraph);

    const colorRow = new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput);
    const hobbiesRow = new ActionRowBuilder<TextInputBuilder>().addComponents(hobbiesInput);

    modal.addComponents(colorRow, hobbiesRow);

    await interaction.showModal(modal);
  },
});
