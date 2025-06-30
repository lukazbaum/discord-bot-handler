import { ChannelType, Message, EmbedBuilder } from "discord.js";
import { PrefixCommand } from "../../handler";
const { checkisland, getisland } = require("/home/ubuntu/ep_bot/extras/functions");

export default new PrefixCommand({
  name: "boostercheck",
  aliases: ["bc", "boosts"],
  allowedGuilds: ["1135995107842195550"],
  allowedRoles: ["1136168655172947988"],
  allowedCategories: ["1137072690264551604", "1140190313915371530"],
  async execute(message: Message): Promise<void> {
    console.log("boostercheck command started!");

    if (message.channel.type !== ChannelType.GuildText) return;

    try {
      const boosterRoleId = "1142141020218347601";
      const boosterCategoryId = "1147909067172483162";
      const excludedChannelId = "1246550644479885312"; // Excluded channel ID
      const ignoreUserId = "936693149114449921"; // your user ID

      await message.guild.members.fetch();

      // Don't fetch all members—just use role cache
      const boosterRole = message.guild.roles.cache.get(boosterRoleId);
      if (!boosterRole) {
        await message.reply("❌ Could not find booster role in this server.");
        return;
      }
      boosterRole.members.forEach((member, id) => {
        console.log("Booster member:", id, member.user?.username);
      });

      const boosterMembers = boosterRole.members.map(m => m.user);
      const filteredBoosters = boosterMembers.filter(u => u.id !== ignoreUserId);
      console.log(
        "Filtered boosters (excluding yourself):",
        filteredBoosters.map(u => `${u.id} (${u.username})`).join(", ")
      );
      console.log(
        "boosterMembers:",
        boosterMembers.map(u => `${u.id} (${u.username})`).join(", ")
      );



      const boosterUsers = [];
      const noChannelBoosters = [];

      function isChannelMissing(userChannel) {
        if (!userChannel) return true;
        if (Array.isArray(userChannel) && userChannel.length === 0) return true;
        if (
          typeof userChannel === "object" &&
          !Array.isArray(userChannel) &&
          Object.keys(userChannel).length === 0
        )
          return true;
        if (
          !userChannel.channel ||
          userChannel.channel === "null" ||
          userChannel.channel === null
        )
          return true;
        return false;
      }


      for (const user of filteredBoosters) {
        if (user.id === ignoreUserId) continue;
        let userChannel = null;
        try {
          userChannel = await checkisland(user.id, message.guild.id);
          if (Array.isArray(userChannel)) {
            console.log(
              "user channel",
              user.id,
              "(array):",
              JSON.stringify(userChannel)
            );
          } else {
            console.log("user channel", user.id, userChannel);
          }
        } catch (err) {
          console.warn(`DB error for user ${user.id}:`, err);
        }
        if (isChannelMissing(userChannel)) {
          noChannelBoosters.push(`<@!${user.id}>`);
          console.log("DBG: no channel for", user.id, userChannel);
        }
        boosterUsers.push({ userId: user.id, channel: userChannel?.channel });
        console.log("booster users", user.id, userChannel);
      }

      // Channel scan as before
      const boosterChannels = [];
      const channelsWithoutBoosters = [];
      let channelsList = "";

      const categoryChannels = message.guild.channels.cache.filter(
        channel =>
          channel.parentId === boosterCategoryId &&
          channel.id !== excludedChannelId
      );

      for (const channel of categoryChannels.values()) {
        boosterChannels.push(channel.id);
        channelsList += `\n> <#${channel.id}>`;

        const channelData = await getisland(channel.id); // returns first found row (possibly cross-guild)
        const ownerId = channelData?.user;

        if (!ownerId) {
          channelsWithoutBoosters.push(`<#${channel.id}>`);
          continue;
        }

        // Use checkisland to verify this user actually has a channel in THIS guild
        const ownerChannelData = await checkisland(ownerId, message.guild.id);
        if (!ownerChannelData || ownerChannelData.channel !== channel.id) {
          channelsWithoutBoosters.push(`<#${channel.id}>`);
          continue;
        }

        const ownerMember = await message.guild.members.fetch(ownerId).catch(() => null);
        if (!ownerMember || !ownerMember.roles.cache.has(boosterRoleId)) {
          channelsWithoutBoosters.push(`<#${channel.id}>`);
        }
      }

      const noChannelList = noChannelBoosters.length
        ? noChannelBoosters.join("\n")
        : "> All boosters have channels";

      const orphanChannelsList = channelsWithoutBoosters.length
        ? channelsWithoutBoosters.join("\n")
        : "> All channels have valid boosters";

      const allChannelsList =
        channelsList || "> No channels found in booster category";

      const embed = new EmbedBuilder()
        .setTitle("Staff Channel Manager: Booster Channels")
        .setDescription(
          "Boosters and Their Channels. Use `ep upgrade` to resolve issues."
        )
        .addFields(
          {
            name: "__Channels Without Boosters__",
            value: orphanChannelsList,
            inline: true,
          },
          {
            name: "__Boosters Without Channels__",
            value: noChannelList,
            inline: true,
          },
          {
            name: "__All Booster Channels__",
            value: allChannelsList,
            inline: false,
          }
        )
        .setColor("#097969");

      await message.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Outer error:", err);
      try {
        await message.reply(
          "An error occurred while processing the command. Please check logs."
        );
      } catch (e) {
        // Already replied
      }
    }
  },
});