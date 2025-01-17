import { RegisterType, SlashCommand } from '../../../handler';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

export default new SlashCommand({
  registerType: RegisterType.Guild,

  data: new SlashCommandBuilder()
    .setName('buttons')
    .setDescription('Try out these interactive buttons!'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('buttons:confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('buttons:cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('buttons:info')
        .setLabel('More Info')
        .setStyle(ButtonStyle.Primary),
    );

    await interaction.reply({
      content: 'Here are some interactive buttons. Try them out!',
      components: [row],
      flags: [MessageFlags.Ephemeral],
    });
  },
});
