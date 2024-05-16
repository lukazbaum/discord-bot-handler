import { client } from "../../index";
import { Message } from "discord.js";
import { hasCooldown, isAllowedCommand } from "./handleCommands";
import { getCommandOnCooldownEmbed, prefix } from "../../config";
import { CommandTypes, MessageCommandModule, PingCommandModule, PrefixCommandModule } from "../types/Command";

export async function handleMessageCommands(message: Message): Promise<void> {
    if (!client.user) return;
    if (message.content.startsWith(prefix)) await handleCommand(CommandTypes.PrefixCommand, message);
    else if (message.content.startsWith(`<@${client.user.id}>`)) await handleCommand(CommandTypes.PingCommand, message);
    else await handleCommand(CommandTypes.MessageCommand, message);
}

async function handleCommand(
    type: CommandTypes.PrefixCommand
        | CommandTypes.PingCommand
        | CommandTypes.MessageCommand,
    message: Message
): Promise<void> {
    if (!client.user) return;
    let commandName: string = "";

    if (type === CommandTypes.PrefixCommand) {
        const matches = prefix.match(/\s/g);
        const whitespaceAmount: number = matches ? matches.length : 0;
        commandName = message.content.split(" ")[whitespaceAmount].replace(prefix, "");
        message.content = message.content.replace(`${prefix}${commandName} `, "");
    }

    else if (type === CommandTypes.PingCommand) {
        commandName = message.content.split(" ")[1].replace(/ /g, "");
        message.content = message.content.replace(`<@${client.user.id}> ${commandName} `, "");
    }

    else if (type === CommandTypes.MessageCommand) {
        commandName = message.content.split(" ")[0];
    }

    let commandModule: PrefixCommandModule | PingCommandModule | MessageCommandModule | string | undefined =
        client.commands[type].get(commandName) || client.commands.aliases[type].get(commandName);
    if (typeof commandModule === "string") commandModule = client.commands[type].get(commandModule);

    if (commandModule) {
        if (commandModule.permissions && !hasPermissions(message.member, commandModule.permissions)) {
            return;
        }

        const cooldown: number | boolean = hasCooldown(message.author.id, commandModule.name, commandModule.cooldown);
        if (typeof cooldown === "number") {
            await message.reply({
                embeds: [getCommandOnCooldownEmbed(cooldown, commandModule.name)]
            });
            return;
        }

        if (!await isAllowedCommand(commandModule, message.member?.user, message.guild, message.channel, message.member)) {
            await commandModule.execute(message);
        }
    }
}

function hasPermissions(member: any, permissions: string[]): boolean {
    return permissions.every(permission => member.permissions.has(permission));
}