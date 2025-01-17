const { Client, GuildChannel, GuildMember, ChannelType, ChannelManager, EmbedBuilder } = require('discord.js');
import { Message as DiscordMessage } from 'discord.js';
import { TextChannel as DiscordChannel } from 'discord.js';
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { getcowners, getisland, isOwner } = require('/home/ubuntu/ep_bot/extras/functions');
const fs = require('fs');

interface CommandDetails {
    description: string;
    commands: {
        default: string[];
        roles?: { [roleId: string]: string[] };
    };
}

interface Category {
    [channelId: string]: CommandDetails;
}

interface Server {
    category: Category;
}

interface CommandFile {
    [serverId: string]: Server;
}

// Load the JSON file
const commandFile: CommandFile = JSON.parse(
    fs.readFileSync('/home/ubuntu/new_parkman/src/commands/chat/commands.json', 'utf-8')
);

export = {
    name: "commands",
    aliases: ["cm", "mycommand", "cmd", "cmds"],
    type: CommandTypes.PrefixCommand,
    // 1113339391419625572 - Epic Wonderland
    // 1135995107842195550 - Epic Park
    // 839731097473908767 - Blackstone
    guildWhitelist: ['1135995107842195550','1113339391419625572', '839731097473908767'],
    roleWhitelist: [
        '1147864509344661644', // Epic Park Channel Owner
        '1136168655172947988', // epic park admins
        '1142343829278687285', // epic park moderators
        "1143236724718317673", // epic park verified
        '1113407924409221120', // epic wonderland staff
        '1113451646031241316', // epic wonderland users
        '845499229429956628', // Blackstone Staff
        '839731097633423389'  // Blackstone Users
    ],
    async execute(message: DiscordMessage): Promise<void> {
        if (!message.guild || !message.channel) {
            await message.reply('This command can only be used in a guild channel.');
            return;
        }

        try {
            const serverId = message.guild.id;
            const userId = message.author.id;
            const channelId = message.channel.id;
            const island = await getisland(channelId);
            const channel = message.guild.channels.cache.find(channel => channel.id === `${island.channel}`) as DiscordChannel;

            // Get user ownership details
            const isUserOwner = await isOwner(userId);
            const isUserCoOwner = await getcowners(userId);

            if (!isUserOwner && !isUserCoOwner) {
                await message.reply("You do not own or co-own this channel.");
                return;
            }

            const serverCategories = commandFile[serverId];

            if (!serverCategories || typeof serverCategories !== 'object' || !serverCategories.category) {
                await message.reply('No commands found for this server.');
                return;
            }

            let commandsList: string[] = [];
            const userRoles = message.member?.roles.cache.map(role => role.id) || [];

            // Handle wildcard commands
            const wildcardCategory = serverCategories.category['*'];
            if (typeof wildcardCategory === 'object' && wildcardCategory !== null && 'commands' in wildcardCategory) {
                if (wildcardCategory.commands.default) {
                    commandsList.push(...wildcardCategory.commands.default);
                }

                if (wildcardCategory.commands.roles) {
                    for (const [roleId, roleCommands] of Object.entries(wildcardCategory.commands.roles)) {
                        if (userRoles.includes(roleId)) {
                            commandsList.push(...roleCommands);
                        }
                    }
                }
            }

            // Handle specific categories
            if (typeof serverCategories.category === 'object') {
                Object.entries(serverCategories.category).forEach(([channelCategoryId, details]) => {
                    if (channelCategoryId === channel.parentId && typeof details === 'object' && details !== null && 'commands' in details) {
                        const commandsObject = details as CommandDetails;

                        // Add default commands
                        if (commandsObject.commands.default) {
                            commandsList.push(...commandsObject.commands.default);
                        }

                        // Add role-specific commands
                        if (commandsObject.commands.roles) {
                            for (const [roleId, roleCommands] of Object.entries(commandsObject.commands.roles)) {
                                if (userRoles.includes(roleId)) {
                                    commandsList.push(...roleCommands);
                                }
                            }
                        }
                    }
                });
            }

            // Remove duplicates
            commandsList = [...new Set(commandsList)];

            if (commandsList.length > 0) {
                const formattedCommands = commandsList.map(cmd => `• \`${cmd}\``).join(' ');

                const embed = new EmbedBuilder()
                    .setTitle('Available Commands')
                    .setDescription('Use `ep help` for command functionality\n\n' + formattedCommands)
                    .setColor('#39FF14');
                await message.reply({ embeds: [embed] });
            } else {
                await message.reply("No commands are available for this channel's category.");
            }
        } catch (err) {
            console.error(err);
            await message.reply("An error occurred while retrieving commands.");
        }
    },
} as PrefixCommandModule;