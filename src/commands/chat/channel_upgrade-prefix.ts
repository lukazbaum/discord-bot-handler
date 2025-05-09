import {
  Message,
  TextChannel,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import { PrefixCommand } from "../../handler";
import { resolveUserOrRole } from "../../handler/utils/resolveUserOrRole";

const { isOwner, getisland, addedusers, bannedusers } = require('/home/ubuntu/ep_bot/extras/functions');
const { amarikey } = require('../../../../ep_bot/extras/settings');
const { AmariBot } = require("amaribot.js");
const amariclient = new AmariBot(amarikey);

export default new PrefixCommand({
  name: "upgrade",
  aliases: ["Upgrade", "up"],
  allowedGuilds: ['1135995107842195550'],
  allowedRoles: ['1147864509344661644', '1148992217202040942', '1147864509344661644'],
  allowedCategories: [
    '1147909067172483162',
    '1147909156196593787',
    '1147909539413368883',
    '1147909373180530708',
    '1147909282201870406',
    '1147909200924643349',
    '1140190313915371530',
    '1320055421561471048', // Epic Wonderland Supreme Land 2
    '1137072690264551604', // epic park staff area
    '1128607975972548711', // Luminescent Staff

  ],
  async execute(message: Message): Promise<void> {
    try {
      if (message.channel.type !== ChannelType.GuildText) return;

      const guild = message.guild;
      if (!guild) {
        await message.reply("This command can only be used in a server.");
        return;
      }

      let targetChannel = message.channel.id;
      const channelName = message.mentions.channels.first();
      if (channelName) targetChannel = channelName.id;

      const getOwner = await isOwner(message.author.id);
      const checkStaff = guild.members.cache.get(message.author.id);
      const isOwnerOrCowner = getOwner && getOwner.some((auth) => auth.channel === targetChannel);

      if (!isOwnerOrCowner && !checkStaff?.roles.cache.has('1148992217202040942')) {
        await message.reply('You must be an owner/cowner or staff to run this command.');
        return;
      }

      const island = await getisland(targetChannel);
      if (!island.channel) {
        await message.reply('Channel is not registered to a user.');
        return;
      }

      const memberTarget = await guild.members.fetch(island.user).catch(() => null);
      if (!memberTarget) {
        await message.reply('Owner of the channel is no longer a valid member.');
        return;
      }

      const channel = (await guild.channels.fetch(island.channel)) as TextChannel;
      if (!channel || channel.type !== ChannelType.GuildText) {
        await message.reply('Target channel is invalid.');
        return;
      }

      const boosterRole = "1142141020218347601";
      const staffRole = "1148992217202040942";
      const staffParent = "1140190313915371530";
      const boosterParent = "1147909067172483162";
      const skaterPark = "1147909200924643349";
      const parkPavilion = "1147909282201870406";
      const adventureTrails = "1147909373180530708";
      const tropicalLounge = "1147909539413368883";
      const parkPeaks = "1147909156196593787";

      const myAmari = await amariclient.getUserLevel(message.guild.id, `${island.user}`);
      const level = parseInt(`${myAmari.level}`);

      let newParent = null;

      // Upgrade Logic Based on Level
      switch (true) {
        case memberTarget.roles.cache.has(staffRole):
          newParent = staffParent;
          break;
        case memberTarget.roles.cache.has(boosterRole):
          newParent = boosterParent;
          break;
        case level >= 20 && level <= 39:
          newParent = skaterPark;
          break;
        case level >= 40 && level <= 59:
          newParent = parkPavilion;
          break;
        case level >= 60 && level <= 79:
          newParent = adventureTrails;
          break;
        case level >= 80 && level <= 119:
          newParent = tropicalLounge;
          break;
        case level >= 120:
          newParent = parkPeaks;
          break;
        default:
          await message.reply('You do not meet the requirements for a channel upgrade.');
          return;
      }

      // Move channel to the new category and lock permissions
      if (newParent) {
        await channel.setParent(newParent, { reason: "Channel upgrade" });
        await channel.lockPermissions();

        // Add owner permissions
        await channel.permissionOverwrites.create(island.user, { ViewChannel: true, SendMessages: true });
      }

      // Add permissions for co-owners
      const coOwners = [
        island.cowner1,
        island.cowner2,
        island.cowner3,
        island.cowner4,
        island.cowner5,
        island.cowner6,
        island.cowner7,
      ].filter(Boolean);

      for (const coOwner of coOwners) {
        const resolvedCoOwner = await resolveUserOrRole(guild, coOwner);
        if (resolvedCoOwner) {
          await channel.permissionOverwrites.create(resolvedCoOwner, { ViewChannel: true, SendMessages: true });
        }
      }

      // Add permissions for added users
      const addedUsers = await addedusers(channel.id) || [];
      for (const addedUser of addedUsers) {
        const resolvedUser = await resolveUserOrRole(guild, addedUser.user);
        if (resolvedUser) {
          await channel.permissionOverwrites.create(resolvedUser, { ViewChannel: true, SendMessages: true });
        }
      }

      const bannedUsers = await bannedusers(channel.id) || [];
      for (const bannedUser of bannedUsers) {
        const resolvedUser = await resolveUserOrRole(guild, bannedUser.user);
        if (resolvedUser) {
          await channel.permissionOverwrites.create(resolvedUser, { ViewChannel: false, SendMessages: false });
        }
      }

      const embed = new EmbedBuilder()
        .setTitle("Channel Manager: Channel Upgrade")
        .setDescription(
          "Channel upgrade is complete. The channel is now hidden. Use `ep unhide` to make it public."
        )
        .setColor('#097969');

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during channel upgrade:", error);
      await message.reply("An error occurred while processing the channel upgrade. Please contact the dev team.");
    }
  },
});