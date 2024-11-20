import {
    Message,
    TextChannel,
    ChannelType,
    Guild,
    PermissionsBitField,
    ButtonInteraction,
    GuildChannel,
    EmbedBuilder
} from "discord.js";
import {
    ComponentModule,
    ComponentTypes,
} from "../../handler/types/Component";
const { getisland, bannedusers, addedusers } = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    id: "confirm_qc",
    type: ComponentTypes.Button,
    async execute(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.channel) return;
        if (interaction.channel.type !== ChannelType.GuildText) return;
        try {
            let getMessageContent = await interaction.message.fetchReference();
            let channelGrab = getMessageContent.content.split('#');
            let channelId = channelGrab[1].replace(">", "");
            let chrole = interaction.guild.roles.cache.get('1147864509344661644');
            let quarantineParent = '1219009472593399909';
            let channelInfo = await getisland(channelId);
            let cowners = '';
            let user = `${channelInfo.user}`;
            let banlist = await bannedusers(channelId);
            let addedlist = await addedusers(channelId);
            let getName = await interaction.guild.channels.fetch(channelId);
            let channelName = getName.name;
            let channel = interaction.guild.channels.cache.find(channel => channel.name === channelName) as TextChannel;

            if (banlist.length) {
                for (let i = 0; i < banlist.length; i++) {
                    const bannedUser = banlist[i].user;
                    const bannedMember = await interaction.guild.members.fetch(bannedUser).catch(() => null);
                    if (bannedMember) {
                        channel.permissionOverwrites.delete(bannedMember);
                    } else {
                        console.log(`Banned user with ID ${bannedUser} does not exist in the guild.`);
                    }
                }
            }

            if (addedlist.length) {
                for (let i = 0; i < addedlist.length; i++) {
                    const addedUser = addedlist[i].user;
                    const addedMember = await interaction.guild.members.fetch(addedUser).catch(() => null);
                    if (addedMember) {
                        channel.permissionOverwrites.delete(addedMember);
                    } else {
                        console.log(`Added user with ID ${addedUser} does not exist in the guild.`);
                    }
                }
            }

            const ownerMember = await interaction.guild.members.fetch(user).catch(() => null);
            if (ownerMember) {
                await channel.permissionOverwrites.edit(ownerMember, {
                    ViewChannel: false,
                    SendMessages: false
                });
            } else {
                console.log(`User with ID ${user} does not exist in the guild. Skipping permission overwrite.`);
            }

            // Edit permissions for the specific role (if applicable)
            await channel.permissionOverwrites.edit('1143236724718317673', {
                ViewChannel: false,
                SendMessages: false
            });

            await channel.setParent(quarantineParent, { reason: "Quarantine channel" });

            await interaction.update({
                embeds: [new EmbedBuilder()
                    .setTitle("Staff Channel Manager: Quarantine Channel")
                    .setDescription(`The Channel <#${channelId}>, owned by <@!${user}>, has been successfully quarantined. Use **ep recover #CHANNEL NAME** to recover the channel.`)
                    .setColor('#097969')],
                components: []
            });

            let embed2 = new EmbedBuilder()
                .setTitle("Channel Manager: Channel Quarantine")
                .setDescription(`<@!${user}> is no longer the owner of channel: <#${channelId}>`)
                .addFields(
                    { name: "**--Channel Sent to Quarantine--**", value: new Date().toLocaleString(), inline: true },
                    { name: "**--Channel Quarantined By--**", value: `${getMessageContent.author}`, inline: true },
                );

            var qlog = await interaction.guild.channels.cache.find(channel => channel.name === `quarantine-logs`) as TextChannel;
            qlog.send({ embeds: [embed2] });
        } catch (err) {
            console.log(err);
        }
    }
} as ComponentModule;