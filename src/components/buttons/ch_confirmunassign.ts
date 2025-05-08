import {
  TextChannel,
  ChannelType,
  ButtonInteraction,
  EmbedBuilder
} from "discord.js";
import { Button } from "../../handler";
const {
  removeuser,
  removeislanduser,
  getisland,
  bannedusers,
  addedusers,
  removeban
} = require("/home/ubuntu/ep_bot/extras/functions");

export default new Button({
  customId: "confirm_uc",
  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) return;

    try {
      // Extract channelId from original confirmation message
      const originalMsg = await interaction.message.fetchReference();
      const channelId = originalMsg.content.split("#")[1]?.replace(">", "").trim();
      const serverId = interaction.guild.id;
      const channelInfo = await getisland(channelId);

      if (!channelId) {
        await interaction.reply({ content: "❌ Could not extract channel ID.", ephemeral: true });
        return;
      }

      if (!channelInfo || !channelInfo.user) {
        await interaction.reply({ content: "❌ Channel info not found in database.", ephemeral: true });
        return;
      }

      const user = channelInfo.user;
      const banlist = await bannedusers(channelId) || [];
      const addedlist = await addedusers(channelId) || [];
      const guildChannel = await interaction.guild.channels.fetch(channelId) as TextChannel;

      // Configs by guild
      const quarantineParents = {
        "1135995107842195550": "1219009472593399909",
        "801822272113082389": "1152037896841351258",
        "871269916085452870": "1088211276943073360"
      };

      const ownerRoles = {
        "1135995107842195550": "1147864509344661644",
        "801822272113082389": "1262566008405622879",
        "871269916085452870": "1173220944882450564"
      };

      const publicRoles = {
        "1135995107842195550": "1143236724718317673",
        "801822272113082389": "807811542057222176",
        "871269916085452870": "1130783135156670504"
      };

      const quarantineParent = quarantineParents[serverId];
      const chrole = ownerRoles[serverId];
      const publicRole = publicRoles[serverId];

      // Remove all banned users
      for (const ban of banlist) {
        await removeban(ban.user, channelId);
        await guildChannel.permissionOverwrites.delete(ban.user);
      }

      // Remove all added users
      for (const add of addedlist) {
        await removeuser(add.user, channelId);
        await guildChannel.permissionOverwrites.delete(add.user);
      }

      // Remove channel owner
      const deletionResult = await removeislanduser(user, channelId);
      console.log(`🧹 Channel removal DB result: ${deletionResult}`);

      if (deletionResult === "Deleted!") {
        const member = interaction.guild.members.cache.get(user);
        if (member) {
          await guildChannel.permissionOverwrites.edit(member, {
            ViewChannel: false,
            SendMessages: false
          });
          await member.roles.remove(chrole).catch(() => {});
        }

        await guildChannel.permissionOverwrites.edit(publicRole, {
          ViewChannel: false,
          SendMessages: false
        });

        if (quarantineParent) {
          await guildChannel.setParent(quarantineParent, {
            reason: "Unassigned owner"
          });
        }
      }

      // Confirmation response to button press
      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setTitle("Staff Channel Manager: Unassign Channel")
            .setDescription(`The channel <#${channelId}>, owned by <@!${user}>, has been successfully unassigned and archived.`)
            .setColor("#097969")
        ],
        components: []
      });

      // Optional log for Epic Park
      if (serverId === "1135995107842195550") {
        const qlog = interaction.guild.channels.cache.find(c => c.name === "quaruntine-logs") as TextChannel;
        if (qlog) {
          const logEmbed = new EmbedBuilder()
            .setTitle("Channel Manager: Channel Unassigned")
            .setDescription(`<@!${user}> is no longer the owner of channel: <#${channelId}>`)
            .addFields(
              { name: "**--Channel Marked for Deletion--**", value: new Date().toLocaleString(), inline: true },
              { name: "**--Channel Unassigned By--**", value: `${originalMsg.author}`, inline: true }
            );
          await qlog.send({ embeds: [logEmbed] });
        }
      }
    } catch (err) {
      console.error("❌ Error during unassign process:", err);
      await interaction.reply({ content: "❌ An error occurred while unassigning. Check logs.", ephemeral: true });
    }
  }
});