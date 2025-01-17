import { client } from '../../../index';
import { RegisterType, SlashCommand } from '../../../handler';
import { type ChatInputCommandInteraction, Colors, EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';

export default new SlashCommand({
  restrictedToOwner: true,
  registerType: RegisterType.Guild,

  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads all events, commands, and components.'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed: EmbedBuilder = new EmbedBuilder();

    try {
      await client.reloadEvents();
      await client.reloadCommands();
      await client.reloadComponents();

      embed
          .setTitle('Reload Successful')
          .setColor(Colors.Green);
    } catch (err) {
      embed
          .setTitle('Reload Failed')
          .setDescription('An error occurred while reloading.')
          .setColor(Colors.Red);
    }

    await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  },
});
