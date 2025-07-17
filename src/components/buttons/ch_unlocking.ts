import { ButtonInteraction, ChannelType, EmbedBuilder } from "discord.js";
import { Button } from '../../handler';


export default new Button({
  customId: "channel_unlock",
  async execute(interaction: ButtonInteraction): Promise<void> {
    try {
      if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) return;

      const serverId = interaction.guild.id;

      // Role ID map by server
      const publicViewRoleList: { [key: string]: string } = {
        "1135995107842195550": "1143236724718317673", // Epic Park
        "1113339391419625572": "1113451646031241316", // Epic Wonderland
        "839731097473908767": "839731097633423389",  // Blackstone
        "871269916085452870": "1130783135156670504",  // Luminescent
      };

      const roleId = publicViewRoleList[serverId];
      if (!roleId) {
        await interaction.reply({ content: "❌ This server doesn't have a configured public role.", ephemeral: true });
        return;
      }
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) {
        await interaction.reply({ content: "❌ The public role ID is not valid or cached.", ephemeral: true });
        return;
      }

      // Restore public send/view
      await interaction.channel.permissionOverwrites.edit(role, {
        ViewChannel: true,
        SendMessages: true
      });

      // No user overwrites are deleted; owners/added users maintain access!

      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setTitle("🔓 Channel Unlocked")
            .setDescription("This channel is now open to public messages. Owners, co-owners, and added users keep their access.")
            .setColor("#00cc66")
        ],
        components: []
      });

    } catch (err) {
      console.error("❌ Error unlocking channel:", err);
      await interaction.reply({ content: "❌ Failed to unlock the channel.", ephemeral: true });
    }
  }
});