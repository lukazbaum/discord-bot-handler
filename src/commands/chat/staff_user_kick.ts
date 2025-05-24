import { TextChannel, Message, ChannelType, EmbedBuilder } from "discord.js";
import { PrefixCommand } from '../../handler';
const { guildBan } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
  name: "kickuser",
  aliases: ["ku", "kick"],
  // 1113339391419625572 - Epic Wonderland
  // 1135995107842195550 - Epic Park
  // 839731097473908767 - Blackstone
  allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767','871269916085452870'],
  allowedRoles: [
    "1148992217202040942", // epic park staff
    "1113407924409221120", // epic staff
    '845499229429956628', // Blackstone Staff
    '871393325389844521', // Luminescent Lieutenant
  ],
  async execute(message: Message): Promise<void> {
    try {
      if (message.channel.type !== ChannelType.GuildText) return;

      const content = message.content.trim();
      // Split content into prefix, command, target, and rest
      const parts = content.split(/\s+/);
      const commandName = parts[1]?.toLowerCase();
      const target = parts[2];
      const rest = parts.slice(3);

      console.log(content);
      console.log(commandName);
      console.log(target);

      if (!target) {
        await message.channel.send('Please specify a user to kick (mention or ID).');
        return;
      }

      // Determine target user ID
      const mentionMatch = target.match(/^<@!?(\d+)>$/);
      let userId: string | null = null;

      if (mentionMatch) {
        userId = mentionMatch[1];
      } else if (/^\d{17,19}$/.test(target)) {
        userId = target;
      } else {
        await message.channel.send('Please provide a valid user mention or user ID.');
        return;
      }

      // Fetch member from guild
      const member = await message.guild?.members.fetch(userId).catch(() => null);
      if (!member) {
        await message.channel.send('User not found in this server.');
        return;
      }

      // Build reason from rest of message
      const reason = rest.join(' ').trim() || 'no reason supplied';

      // Kick the member
      await member.kick(reason);
      await message.channel.send(`Kicked ${member.user.tag} successfully.`);

      // Log the action in database or audit
      const date = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
      await guildBan(member, 'kick', reason, message.author.id, date);

      // Prepare embed for logs
      const embed = new EmbedBuilder()
        .setTitle('Staff Manager: Kick User')
        .setDescription(
          `**Action**: Kicked User\n` +
          `**User**: ${member.user.tag} (${member.id})\n` +
          `**Reason**: ${reason}\n` +
          `**Date**: ${date}\n` +
          `**Set By**: ${message.author.tag}`
        )
        .setColor('DarkRed');

      // Map of guild IDs to log channel IDs
      const banChannelMap: Record<string, string> = {
        '1135995107842195550': '1160751610771820554', // epic park
        '1113339391419625572': '1115941478007582740', // epic wonderland staff
        '839731097473908767': '839731097754533897', // blackstone warn logs
        '871269916085452870': '997111935952748575', // Luminescent Admin Logs
      };

      const logChannelId = banChannelMap[message.guild.id];
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId) as TextChannel;
        if (logChannel) await logChannel.send({ embeds: [embed] });
      }

      // Reply with embed
      await message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Kick command error:', error);
      if (message.channel.type === ChannelType.GuildText) {
        await message.channel.send('Failed to kick the user. Ensure the bot has the correct permissions and role hierarchy.');
      }
    }
  }
});