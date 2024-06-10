import Logger from "./Logger";
import { client } from "../../index";
import { hasCooldown, isAllowedCommand } from "./handleCommands";
import { CommandTypes, ContextMenuCommandModule, SlashCommandModule } from "../types/Command";
import { getCommandNotAllowedEmbed, getCommandOnCooldownEmbed } from "../../config";
import { AutocompleteInteraction, CommandInteraction, ContextMenuCommandInteraction, Interaction } from "discord.js";

export async function handleInteractionCommands(interaction: Interaction): Promise<void> {
    if (interaction.isChatInputCommand()) await handleCommand(CommandTypes.SlashCommand, interaction);
    else if (interaction.isContextMenuCommand()) await handleCommand(CommandTypes.ContextMenu, interaction);
    else if (interaction.isAutocomplete()) await handleAutocomplete(interaction);
}

async function handleCommand(
    type: CommandTypes.SlashCommand | CommandTypes.ContextMenu,
    interaction: CommandInteraction | ContextMenuCommandInteraction
): Promise<void> {
    const commandModule: SlashCommandModule | ContextMenuCommandModule | undefined = client.commands[type].get(interaction.commandName);
    if (!commandModule) {
        return Logger.error(`No command matching ${interaction.commandName} was found.`);
    }

    const cooldown: boolean | number = hasCooldown(interaction.user.id, commandModule.data.name, commandModule.cooldown);
    if (typeof cooldown === "number") {
        await interaction.reply({
            embeds: [getCommandOnCooldownEmbed(cooldown, commandModule.data.name)],
            ephemeral: true
        });
        return;
    }

    if (
        !isAllowedCommand(commandModule, interaction.user, interaction.guild, interaction.channel, interaction.member)
    ) {
        await interaction.reply({
            embeds: [getCommandNotAllowedEmbed(interaction as Interaction)],
            ephemeral: true
        });
        return;
    }

    try {
        await commandModule.execute(interaction as any);
    } catch (err) {
        return Logger.error(`Error executing ${interaction.commandName}`, err);
    }
}

async function handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const command: SlashCommandModule | undefined = client.commands.slash.get(interaction.commandName);
    if (!command) {
        return Logger.error(`No command matching ${interaction.commandName} was found.`);
    }

    if (!command.autocomplete) {
        return Logger.error(`No autocomplete in ${interaction.commandName} was found.`)
    }

    try {
        await command.autocomplete(interaction);
    } catch (err) {
        return Logger.error(`Error autocompleting ${interaction.commandName}`, err);
    }
}