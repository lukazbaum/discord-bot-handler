import { CommandTypes, ContextMenuCommandModule, RegisterTypes } from "../../handler";
import { ContextMenuCommandBuilder, ApplicationCommandType, ContextMenuCommandInteraction } from "discord.js";

export = {
    type: CommandTypes.ContextMenu,
    register: RegisterTypes.Guild,
    data: new ContextMenuCommandBuilder()
        .setName("Get Message ID")
	//@ts-ignore
        .setType(ApplicationCommandType.Message),
    async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
        await interaction.reply({ content: `Message ID: ${interaction.targetId}` });
    }
} as ContextMenuCommandModule;
