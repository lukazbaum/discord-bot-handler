import { CommandTypes, RegisterTypes, SlashCommandModule } from "../../handler";
import { AutocompleteInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export = {
    type: CommandTypes.SlashCommand,
    register: RegisterTypes.Guild,
    disabled: true,
    data: new SlashCommandBuilder()
        .setName("autocomplete")
        .setDescription("Example of the autocomplete feature!")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addStringOption(option =>
            option.setName("query")
                .setDescription("Phrase to search for")
                .setAutocomplete(true)
                .setRequired(true)
        ),

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focusedValue = interaction.options.getFocused();
        const choices: string[] = [
            "Popular Topics: Threads", "Sharding: Getting started", "Library: Voice Connections",
            "Interactions: Replying to slash commands", "Popular Topics: Embed preview"
        ];

        const filtered: string[] = choices.filter(choice => choice.startsWith(focusedValue));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice }))
        );
    },

    async execute(interaction): Promise<void> {
        const selectedOption = interaction.options.getString("query");
        await interaction.reply(`You selected ${selectedOption}`);
    }
} as SlashCommandModule;
