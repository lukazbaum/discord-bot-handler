import { RegisterType, SlashCommand } from '../../../handler';
import {
  ActionRowBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';

export default new SlashCommand({
  registerType: RegisterType.Guild,

  data: new SlashCommandBuilder()
    .setName('selectmenu')
    .setDescription('Choose your favorite animal!')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const menu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
      .setCustomId('selectMenu')
      .setPlaceholder('Choose wisely...')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        {
          label: 'Cats',
          description: 'Choose this if you like cats',
          value: 'cats',
          emoji: '🐱',
        },
        {
          label: 'Dogs',
          description: 'Choose this if you like dogs',
          value: 'dogs',
          emoji: '🐶',
        },
        {
          label: 'Birds',
          description: 'Choose this if you like birds',
          value: 'birds',
          emoji: '🐦',
        },
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
    await interaction.reply({ content: 'Pick your favorite animal:', components: [row] });
  },
});
