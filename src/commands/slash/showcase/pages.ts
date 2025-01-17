import { EmbedPaginator, RegisterType, SlashCommand } from '../../../handler';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';

export default new SlashCommand({
  registerType: RegisterType.Guild,

  data: new SlashCommandBuilder()
    .setName('pages')
    .setDescription('Browse through pages of information!'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const pages = [
      new EmbedBuilder()
        .setTitle('Welcome to the Paginator')
        .setDescription('This is **Page 1** of the paginator.')
        .setColor(Colors.Blue),
      {
        embed: new EmbedBuilder()
          .setTitle('Page 2 with Buttons')
          .setDescription('Here is **Page 2** with custom buttons.')
          .setColor(Colors.Green),
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('buttons:confirm')
              .setLabel('Confirm')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('buttons:cancel')
              .setLabel('Cancel')
              .setStyle(ButtonStyle.Danger),
          ),
        ],
      },
      new EmbedBuilder()
        .setTitle('Page 3')
        .setDescription('Finally, this is **Page 3**. Enjoy!')
        .setColor(Colors.Red),
    ];

    const paginator: EmbedPaginator = new EmbedPaginator({
      pages,
      timeout: 60,
      autoPageDisplay: true,
    });

    await paginator.send({ context: interaction });
  },
});
