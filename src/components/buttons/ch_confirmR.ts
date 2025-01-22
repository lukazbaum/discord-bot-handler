import {
    TextChannel,
    ChannelType,
    ButtonInteraction,
    EmbedBuilder,
    GuildMember,
} from "discord.js";
import { Button } from "../../handler";
import { resolveUserOrRole } from "../../handler/utils/resolveUserOrRole";
const { getisland, bannedusers, addedusers } = require('/home/ubuntu/ep_bot/extras/functions');

export default new Button({
    customId: "confirm_rc_old",
    async execute(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.channel) return;
        if (interaction.channel.type !== ChannelType.GuildText) return;

        try {
            const guild = interaction.guild;
            if (!guild) {
                console.error("Interaction not in a guild.");
                return;
            }

            await interaction.deferUpdate(); // Defer the interaction to avoid timeout

            const channelName = interaction.message.mentions.channels.first();

            if (!channelName) {
                await interaction.followUp({
                    content: "No channel mentioned in the message.",
                    ephemeral: true,
                });
                return;
            }

            const channelId = channelName.id;
            const chrole = '1147864509344661644';
            const baseParent = '1147909200924643349';

            const channelInfo = await getisland(channelId);
            if (!channelInfo) {
                await interaction.followUp({
                    content: "Channel information could not be retrieved.",
                    ephemeral: true,
                });
                return;
            }

            const userId = `${channelInfo.user}`;
            const banlist = await bannedusers(channelId);
            const addedlist = await addedusers(channelId);

            const getName = await guild.channels.fetch(channelId);
            if (!getName || getName.type !== ChannelType.GuildText) {
                await interaction.followUp({
                    content: "Specified channel is invalid or not found.",
                    ephemeral: true,
                });
                return;
            }

            const channel = getName as TextChannel;
            await channel.setParent(baseParent, { reason: "Recover channel" });
            await channel.lockPermissions();

            // Restore banned users
            if (banlist.length) {
                for (const banned of banlist) {
                    const resolvedUser = await resolveUserOrRole(guild, banned.user);
                    if (resolvedUser) {
                        await channel.permissionOverwrites.edit(banned.user, {
                            ViewChannel: false,
                            SendMessages: false,
                        });
                    }
                }
            }

            // Restore added users
            if (addedlist.length) {
                for (const added of addedlist) {
                    const resolvedUser = await resolveUserOrRole(guild, added.user);
                    if (resolvedUser) {
                        await channel.permissionOverwrites.edit(added.user, {
                            ViewChannel: true,
                            SendMessages: true,
                        });
                    }
                }
            }

            const owner = await resolveUserOrRole(guild, userId);

            if (owner) {
                if (owner instanceof GuildMember) {
                    await owner.roles.add(chrole); // Add the role to the GuildMember
                } else {
                    console.warn("Resolved entity is not a GuildMember.");
                }
            } else {
                console.warn("Owner could not be resolved.");
            }

            // Add a specific role with permissions
            await channel.permissionOverwrites.edit('1143236724718317673', {
                ViewChannel: true,
                SendMessages: true,
            });

            // Restore co-owner permissions
            const cownersArray = [
                channelInfo.cowner1,
                channelInfo.cowner2,
                channelInfo.cowner3,
                channelInfo.cowner4,
                channelInfo.cowner5,
                channelInfo.cowner6,
                channelInfo.cowner7,
            ].filter((id): id is string => !!id);

            for (const coownerId of cownersArray) {
                const coowner = await resolveUserOrRole(guild, coownerId);
                if (coowner) {
                    await channel.permissionOverwrites.edit(coownerId, {
                        ViewChannel: true,
                        SendMessages: true,
                    });
                }
            }

            // Update interaction
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                      .setTitle("Staff Channel Manager: Recover Channel")
                      .setDescription(
                        `The Channel <#${channelId}>, owned by <@!${userId}>, has been recovered.

                            Channel moved to base category <#${baseParent}>. 
                            Channel owner can use *ep upgrade* to move to the correct category.`
                      )
                      .setColor('#097969'),
                ],
                components: [],
            });

            // Log recovery in quarantine-logs channel
            const embed2 = new EmbedBuilder()
              .setTitle("Channel Manager: Channel Recover")
              .setDescription(`<@!${userId}> is now the owner of channel: <#${channelId}>`)
              .addFields(
                { name: "**--Channel Recovered At--**", value: new Date().toLocaleString(), inline: true },
                { name: "**--Channel Recovered By--**", value: `${interaction.user.tag}`, inline: true },
              );

            const qlog = guild.channels.cache.find(channel => channel.name === `quaruntine-logs`) as TextChannel;
            if (qlog) {
                await qlog.send({ embeds: [embed2] });
            } else {
                console.warn("Quarantine logs channel not found.");
            }
        } catch (err) {
            console.error(err);
        }
    },
});