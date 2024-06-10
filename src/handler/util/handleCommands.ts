import { glob } from "glob";
import Logger from "./Logger";
import { client } from "../../index";
import { DiscordClient } from "./DiscordClient";
import { commandsFolderName, ownerId } from "../../config";
import {
    CommandModule,
    CommandTypes,
    RegisterCommandOptions,
    RegisterTypes,
} from "../types/Command";
import {
    APIInteractionGuildMember,
    ApplicationCommandType,
    Channel,
    Collection,
    Guild,
    GuildMember,
    REST,
    Routes,
    TextChannel,
    User
} from "discord.js";

export async function registerCommands(client: DiscordClient, options: RegisterCommandOptions): Promise<void> {
    await getCommandModules(client);
    if (options.deploy) await deploySlashCommands(client);
}

async function getCommandModules(client: DiscordClient): Promise<void> {
    const commandPaths: string[] = await glob(`**/${commandsFolderName}/**/**/*.js`);

    for (const commandPath of commandPaths) {
        const importPath: string = `../..${commandPath.replace(/^dist[\\\/]|\\/g, "/")}`;

        try {
            const module: CommandModule = (await import(importPath)).default;

            if (module.type === CommandTypes.SlashCommand && (!module.data.name || !module.data.description)) {
                return Logger.error(`No name or description for command at ${importPath} set.`);
            }

            if (module.disabled) {
                continue;
            }

            if (module.type === CommandTypes.SlashCommand) client.commands[module.type].set(module.data.name, module);
            else if (module.type === CommandTypes.ContextMenu) client.commands[module.type].set(module.data.name, module);
            else if (module.type === CommandTypes.PrefixCommand) client.commands[module.type].set(module.name, module);
            else if (module.type === CommandTypes.MessageCommand) client.commands[module.type].set(module.name, module);
            else if (module.type === CommandTypes.PingCommand) client.commands[module.type].set(module.name, module);

            if ((
                module.type === CommandTypes.PrefixCommand
                || module.type === CommandTypes.MessageCommand
                || module.type === CommandTypes.PingCommand
            ) && module.aliases
            ) {
                for (const alias of module.aliases) {
                    client.commands.aliases[module.type].set(alias, module.name);
                }
            }
        } catch (err) {
            Logger.error(`Failed to load command at ${importPath}`, err);
        }

        if (client.commands.slash.size > 100) {
            Logger.error("You can only register 100 Slash Commands.");
            process.exit();
        }

        if ((client.commands.context.filter(
            command => command.data.type === ApplicationCommandType.Message)).size > 5
        ) {
            Logger.error("You can only register 5 Message Context Menus.");
            process.exit();
        }

        if ((client.commands.context.filter(
            command => command.data.type === ApplicationCommandType.User)).size > 5
        ) {
            Logger.error("You can only register 5 Message User Menus.");
            process.exit();
        }
    }
}

async function deploySlashCommands(client: DiscordClient): Promise<void> {
    let guildCommands: any[] = [];
    let globalCommands: any[] = [];

    for (const module of client.commands.slash) {
        if (module[1].register === RegisterTypes.Guild) guildCommands.push(module[1].data);
        if (module[1].register === RegisterTypes.Global) globalCommands.push(module[1].data);
    }

    for (const module of client.commands.context) {
        if (module[1].register === RegisterTypes.Guild) guildCommands.push(module[1].data);
        if (module[1].register === RegisterTypes.Global) globalCommands.push(module[1].data);
    }

    if (guildCommands.length > 0) await uploadSlashCommands(RegisterTypes.Guild, guildCommands);
    if (globalCommands.length > 0) await uploadSlashCommands(RegisterTypes.Global, globalCommands);
}

async function uploadSlashCommands(type: RegisterTypes, commands: Array<any>): Promise<void> {
    if (!process.env.CLIENT_TOKEN) {
        return Logger.error("No process.env.TOKEN set.");
    }

    if (!process.env.CLIENT_ID) {
        return Logger.error("No process.env.CLIENT_ID set.");
    }

    if (RegisterTypes.Guild && !process.env.GUILD_ID) {
        return Logger.error("No process.env.GUILD_ID set.");
    }

    const rest: REST = new REST({ version: "10" }).setToken(process.env.CLIENT_TOKEN);
    try {
        Logger.log(`Started refreshing ${commands.length} application commands.`);

        await rest.put(
            Routes[type](process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands }
        );

        Logger.log(`Successfully reloaded ${commands.length} application commands.`);
    } catch (err) {
        Logger.error("Error while uploading slash commands.", err);
    }
}

export async function deleteCommands(commandIds: string[], type: RegisterTypes): Promise<void> {
    if (!process.env.CLIENT_ID) {
        return Logger.error("No process.env.CLIENT_ID set!");
    }

    if (RegisterTypes.Guild && !process.env.GUILD_ID) {
        return Logger.error("No process.env.GUILD_ID set!");
    }

    const rest: REST = new REST({ version: "10" }).setToken(process.env.CLIENT_TOKEN);
    const route = type === RegisterTypes.Guild
        ? Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID || "", "")
        : Routes.applicationCommand(process.env.CLIENT_ID, "");

    for (const commandId of commandIds) {
        await rest.delete(`${route}${commandId}`)
            .then(() => Logger.log(`Successfully deleted ${type === RegisterTypes.Guild ? "guild" : "global"} command: ${commandId}`))
            .catch(console.error);
    }
}

export async function deleteAllCommands(type: RegisterTypes): Promise<void> {
    if (!process.env.CLIENT_ID) {
        Logger.error("No process.env.CLIENT_ID set!");
        return;
    }

    if (type === RegisterTypes.Guild && !process.env.GUILD_ID) {
        Logger.error("No process.env.GUILD_ID set!");
        return;
    }

    const rest: REST = new REST({ version: "10" }).setToken(process.env.CLIENT_TOKEN);
    const route = type === RegisterTypes.Guild
        ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID || "")
        : Routes.applicationCommands(process.env.CLIENT_ID);

    try {
        await rest.put(route, { body: [] });
        Logger.log(`Successfully deleted all ${type === RegisterTypes.Guild ? "guild" : "global"} commands`);
    } catch (err) {
        Logger.error(`Error deleting ${type === RegisterTypes.Guild ? "guild" : "global"} commands`, err);
    }
}

export function isAllowedCommand(
    command: any,
    user: User | undefined,
    guild: Guild | null,
    channel: Channel | null,
    member: GuildMember | APIInteractionGuildMember | null
): boolean {
    if (!user || !member) return false;

    const memberRoles: any = member.roles;

    const notAllowedConditions = [
        command.ownerOnly && user.id !== ownerId,
        command.userWhitelist && !command.userWhitelist.includes(user.id),
        command.userBlacklist && command.userBlacklist.includes(user.id),
        command.channelWhitelist && channel && !command.channelWhitelist.includes(channel.id),
        command.channelBlacklist && channel && command.channelBlacklist.includes(channel.id),
        command.categoryWhitelist && channel && !channel.isDMBased() && !command.categoryWhitelist.includes(channel.parentId),
        command.categoryBlacklist && channel && !channel.isDMBased() && command.categoryBlacklist.includes(channel.parentId),
        command.guildWhitelist && guild && !command.guildWhitelist.includes(guild.id),
        command.guildBlacklist && guild && command.guildBlacklist.includes(guild.id),
        command.roleWhitelist && !command.roleWhitelist.some((roleId: string) => memberRoles.cache.has(roleId)),
        command.roleBlacklist && command.roleBlacklist.some((roleId: string) => memberRoles.cache.has(roleId)),
        command.nsfw && channel && !(channel as TextChannel).nsfw
    ];

    if (notAllowedConditions.some(Boolean)) return false;

    if(
        !command.optionalUserWhitelist
        && !command.optionalChannelWhitelist
        && !command.optionalCategoryWhitelist
        && !command.optionalGuildWhitelist
        && !command.optionalRoleWhitelist
    ) return true;

    const allowedByOptionalList = [
        command.optionalUserWhitelist && command.optionalUserWhitelist.includes(user.id),
        command.optionalChannelWhitelist && channel && command.optionalChannelWhitelist.includes(channel.id),
        command.optionalCategoryWhitelist && channel && !channel.isDMBased() && command.optionalCategoryWhitelist.includes(channel.parentId),
        command.optionalGuildWhitelist && guild && command.optionalGuildWhitelist.includes(guild.id),
        command.optionalRoleWhitelist && command.optionalRoleWhitelist.some((roleId: string) => memberRoles.cache.has(roleId))
    ];

    return allowedByOptionalList.some(Boolean);
}

export function hasCooldown(userId: string, commandName: string, cooldown: number | undefined): boolean | number {
    if (!cooldown) return true;

    const currentTimestamp: number = Math.floor(Date.now() / 1000);
    let commandCollection: Collection<string, number> = client.cooldowns.user.get(commandName) || new Collection<string, number>();
    client.cooldowns.user.set(commandName, commandCollection);

    const userCooldown: number | undefined = commandCollection.get(userId);
    if (userCooldown && currentTimestamp < userCooldown) {
        return userCooldown - currentTimestamp;
    }

    commandCollection.set(userId, currentTimestamp + cooldown);
    return true;
}