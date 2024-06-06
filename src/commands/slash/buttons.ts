import { CommandTypes, RegisterTypes, SlashCommandModule } from "../../handler";
import {
    ActionRowBuilder,
    ButtonBuilder,
    CommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    ButtonStyle
} from "discord.js";

export = {
    type: CommandTypes.SlashCommand,
    register: RegisterTypes.Guild,
    disabled: true,
    data: new SlashCommandBuilder()
        .setName("buttons")
        .setDescription("Replies with buttons!")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction: CommandInteraction): Promise<void> {
        const row: any = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("group=subscription;confirm")
                    .setLabel("Click to confirm")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("group=subscription;cancel")
                    .setLabel("Click to cancel")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("deleteMessage")
                    .setLabel("Delete message")
                    .setStyle(ButtonStyle.Danger)
            );
        await interaction.reply({ content: "Button examples", components: [row] });
    }
} as SlashCommandModule;
