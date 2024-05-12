import { CommandTypes, RegisterTypes, SlashCommandModule } from "../../handler/types/Command";
import {
    CommandInteraction,
    ModalBuilder,
    PermissionFlagsBits,
    TextInputStyle,
    SlashCommandBuilder,
    TextInputBuilder,
    ActionRowBuilder
} from "discord.js";

export = {
    type: CommandTypes.SlashCommand,
    register: RegisterTypes.Guild,
    data: new SlashCommandBuilder()
        .setName("modal")
        .setDescription("Replies with a modal!")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction: CommandInteraction): Promise<void> {
        const modal: ModalBuilder = new ModalBuilder()
            .setCustomId("modalExample")
            .setTitle("Modal Example");

        const favoriteColorInput: TextInputBuilder = new TextInputBuilder()
            .setCustomId("favoriteColorInput")
            .setLabel("What's your favorite color?")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Purple");

        const hobbiesInput: TextInputBuilder = new TextInputBuilder()
            .setCustomId("hobbiesInput")
            .setLabel("What's some of your favorite hobbies?")
            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow: any = new ActionRowBuilder().addComponents(favoriteColorInput);
        const secondActionRow: any = new ActionRowBuilder().addComponents(hobbiesInput);

        modal.addComponents(firstActionRow, secondActionRow);
        await interaction.showModal(modal);
    }
} as SlashCommandModule;