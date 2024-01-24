import { CommandTypes, ContextMenuCommandModule, RegisterTypes } from "../../handler/types/Command";
import { ContextMenuCommandBuilder, ApplicationCommandType, ContextMenuCommandInteraction } from "discord.js";

export = {
    type: CommandTypes.ContextMenu,
    register: RegisterTypes.Guild,
    data: new ContextMenuCommandBuilder()
        .setName("Get Message ID")
        .setType(ApplicationCommandType.Message),
    async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
        await interaction.reply({ content: `Message ID: ${interaction.targetId}` });
    }
} as ContextMenuCommandModule;