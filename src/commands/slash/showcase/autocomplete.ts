import { RegisterType, SlashCommand } from '../../../handler';
import { type AutocompleteInteraction, type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default new SlashCommand({
  registerType: RegisterType.Guild,

  data: new SlashCommandBuilder()
    .setName('autocomplete')
    .setDescription('Explore the autocomplete feature!')
    .addStringOption((option) =>
      option
        .setName('topic')
        .setDescription('Choose a topic from the suggestions')
        .setAutocomplete(true)
        .setRequired(true),
    ) as SlashCommandBuilder,

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue: string = interaction.options.getFocused().toLowerCase();
    const choices: string[] = [
      'Getting Started with Discord.js',
      'Building Slash Commands',
      'Understanding Permissions',
      'Working with Autocomplete',
      'Creating Buttons and Select Menus',
      'Error Handling in Discord Bots',
    ];

    const filtered: string[] = choices.filter((choice) => choice.toLowerCase().includes(focusedValue));
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const selectedTopic: string = interaction.options.getString('topic', true);
    await interaction.reply({
      content: `You selected: **${selectedTopic}**`,
    });
  },
});
