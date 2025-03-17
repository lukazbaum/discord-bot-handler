import { ButtonInteraction, ChannelType, EmbedBuilder } from "discord.js";
import { Button } from '../../handler';
const { getisland } = require('/home/ubuntu/ep_bot/extras/functions');

export default new Button({
  customId: "channel_hide",
  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) return;
    let serverId = interaction.guild?.id;

    // Guild setup
    const publicViewRoleList: { [key: string]: string } = {
      "1135995107842195550": "1143236724718317673", // EPic Park
      "1113339391419625572": "1113451646031241316", // Epic Wonderland
      "839731097473908767" : "839731097473908767", // Blackstone
    };

    // Validate publicRole
    const publicRoleId = publicViewRoleList[serverId];
    if (!publicRoleId) {
      await interaction.reply({ content: "Error: No public role found for this server.", ephemeral: true });
      return;
    }

    const role = interaction.guild.roles.cache.get(publicRoleId);
    if (!role) {
      await interaction.reply({ content: "Error: Role ID is invalid or does not exist in this server.", ephemeral: true });
      return;
    }

    try {
      await interaction.channel.permissionOverwrites.edit(role, {
        ViewChannel: false,
        SendMessages: false
      });

      await interaction.update({
        embeds: [new EmbedBuilder()
          .setTitle("Channel Hidden")
          .setDescription("Channel visible to added users only\n*to open channel use ep unhide*")],
        components: []
      });

      return;
    } catch (error) {
      console.error("Permission overwrite error:", error);
      await interaction.reply({ content: "Error: Failed to update permissions.", ephemeral: true });
      return;
    }
  }
});