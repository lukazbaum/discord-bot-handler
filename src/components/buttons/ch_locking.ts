import { ButtonInteraction, ChannelType, EmbedBuilder } from "discord.js";
import { Button } from '../../handler';
const { getisland, addedusers } = require('/home/ubuntu/ep_bot/extras/functions');

export default new Button({
  customId: "channel_lock",
  async execute(interaction: ButtonInteraction): Promise<void> {
    try {
      if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) return;
      const serverId = interaction.guild.id;

      // Guild configuration for public role
      const publicViewRoleList: { [key: string]: string } = {
        "1135995107842195550": "1143236724718317673", // Epic Park
        "1113339391419625572": "1113451646031241316", // Epic Wonderland
        "839731097473908767": "839731097633423389",   // Blackstone
        "871269916085452870": "1130783135156670504",  // Luminescent
      };

      const roleId = publicViewRoleList[serverId];
      if (!roleId) {
        await interaction.reply({ content: "❌ This server isn't configured with a public view role.", ephemeral: true });
        return;
      }
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) {
        await interaction.reply({ content: "❌ Public view role not found in this guild.", ephemeral: true });
        return;
      }

      // 1. Lock public role from sending messages
      await interaction.channel.permissionOverwrites.edit(role, { SendMessages: false });

      // 2. Grant send permission to owners, co-owners, and added users
      const island = await getisland(interaction.channel.id);
      const addids = await addedusers(interaction.channel.id);

      // Main owner
      const allowIds = [];
      if (island.user) allowIds.push(island.user);

      // Co-owners (excluding duplicates)
      const cowners = [
        island.cowner1, island.cowner2, island.cowner3,
        island.cowner4, island.cowner5, island.cowner6, island.cowner7
      ].filter(Boolean).filter(uid => uid !== island.user);
      allowIds.push(...cowners);

      // Added users
      for (const u of addids) allowIds.push(u.user);

      // Remove duplicate IDs
      const uniqueAllowIds = [...new Set(allowIds)];

      // Grant send permissions for all
      for (const uid of uniqueAllowIds) {
        await interaction.channel.permissionOverwrites.edit(uid, { SendMessages: true, ViewChannel: true });
      }

      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setTitle("🔒 Channel Locked")
            .setDescription("Messages can only be sent by added users and channel owners.\n*Use `<prefix> unlock` to reverse this.*")
            .setColor("#ff5555")
        ],
        components: []
      });

    } catch (err) {
      console.error("❌ Error in channel_lock button:", err);
      await interaction.reply({ content: "❌ Something went wrong trying to lock the channel.", ephemeral: true });
    }
  }
});