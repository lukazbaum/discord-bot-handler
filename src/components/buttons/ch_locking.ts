import { ButtonInteraction, GuildChannel, ChannelType, EmbedBuilder } from "discord.js";
import { Button } from '../../handler';
const { getisland } = require('/home/ubuntu/ep_bot/extras/functions');

export default new Button({
  customId: "channel_lock",
  async execute(interaction: ButtonInteraction): Promise<void> {
    try {
      if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) return;
      const serverId = interaction.guild.id;

      // Guild configuration
      const publicViewRoleList: { [key: string]: string } = {
        "1135995107842195550": "1143236724718317673", // EPic Park
        "1113339391419625572": "1113451646031241316", // Epic Wonderland
        "839731097473908767": "839731097473908767",  // Blackstone
	"871269916085452870": "1130783135156670504", //Luminescent
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

      await interaction.channel.permissionOverwrites.edit(role, {
        SendMessages: false
      });

      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setTitle("🔒 Channel Locked")
            .setDescription("Messages can only be sent by added users.\n*Use `ep unlock` to reverse this.*")
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
