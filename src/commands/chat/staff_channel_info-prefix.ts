import { PermissionsBitField, ChannelType, Message, EmbedBuilder } from "discord.js";
import { PrefixCommand } from "../../handler";
const { getCoChannels, checkisland, bannedusers, addedusers, getisland } = require("/home/ubuntu/ep_bot/extras/functions");
const { amarikey } = require("/home/ubuntu/ep_bot/extras/settings");
const { AmariBot } = require("amaribot.js");
const amariclient = new AmariBot(amarikey);

export default new PrefixCommand({
	name: "userinfo",
	aliases: ["Userinfo", "ui", "chaninfo", "Chaninfo"],
	allowedGuilds: ["1135995107842195550", "1113339391419625572", "839731097473908767","871269916085452870"],
	allowedRoles: [
		"1148992217202040942",
		"807826290295570432",
		"1113407924409221120",
		"845499229429956628",
		'871393325389844521', // Luminescent Leiutenint
	],
	allowedCategories: [
		"1140190313915371530",
		"1147909156196593787",
		"1147909539413368883",
		"1147909373180530708",
		"1137072690264551604",
		"1147909282201870406",
		"1147909200924643349",
		"1147909067172483162",
		"1203928376205905960",
		"1232728117936914432",
		"1192106199404003379",
		"1192108950049529906",
		"1225165761920630845",
		"966458661469839440",
		"825060923768569907",
		"1219009472593399909",
		"839731098456293420",
		"967657150769942578",
		'1113414355669753907',// epic wonderland play land staff
		'1115772256052846632', /// epic wonderland staff
		'1128607975972548711', // Luminescent Staff'
	],

	async execute(message: Message): Promise<void> {
		try {
			if (message.channel.type !== ChannelType.GuildText) return;

			function isNumber(value: any): boolean {
				return typeof value === "string" && /^\d+$/.test(value);
			}

			let content = message.content.toString().replace(/\s/g, "");
			let user = "";
			let channel = "";
			let serverId = message.guild.id;
			let channelInfo;
			let userName = message.mentions.users.first();
			let channelName = message.mentions.channels.first();
			let getUsername;

			if (isNumber(content)) {
				getUsername = message.guild.members.cache.get(content);
				if (!getUsername) {
					await message.reply(`${content} this user ID is not a guild member`);
					return;
				}
			} else if (!message.mentions.users.size && !message.mentions.channels.size) {
				await message.reply("Please specify either a user or #channelName");
				return;
			}

			if (userName) {
				user = userName.id;
				channelInfo = await checkisland(user, serverId);
				channel = channelInfo?.channel;
			} else if (getUsername?.user?.username) {
				user = getUsername.id;
				channelInfo = await checkisland(user, serverId);
				channel = channelInfo?.channel;
			} else if (channelName) {
				channel = channelName.id;
				channelInfo = await getisland(channel);
				user = channelInfo?.user;
			} else {
				await message.reply("Something went wrong, contact a Dev.");
				return;
			}

			const verifiedRoleList: { [key: string]: string } = {
				"1135995107842195550": "1143236724718317673",
				"1113339391419625572": "1113407924409221120",
				"839731097473908767": "839731097473908767",
				"871269916085452870": "1130783135156670504", // Luminescent

			};

			const verifiedRoleId = verifiedRoleList[serverId];
			if (!verifiedRoleId) {
				console.log("verifiedRoleId is undefined for guild:", serverId);
				return;
			}

			const member = message.guild.members.cache.get(user);
			if (!member) {
				console.log(`User ${user} not found in the guild.`);
				await message.reply("User not found in this server.");
				return;
			}

			let cowner_channels = await getCoChannels(user) || [];
			let roleList = "";
			let ignoredRoles = ["1143223395350229172", "1223728995879616573", "1142826359178149971"];
			let roleMap = member.roles.cache.sort((a, b) => b.position - a.position).map(r => r);

			if (roleMap.length > 30) {
				roleList = "**... too many to list**";
			} else {
				roleList = roleMap
					.filter(role => !ignoredRoles.includes(role.id))
					.map((role, index) => `\n> ${index + 1}. ${role}`)
					.join("");
			}

			let isHidden = "Unknown (No Role Permissions)";
			const rolePermissions = message.channel.permissionsFor(verifiedRoleId);
			if (rolePermissions) {
				let permArray = new PermissionsBitField(rolePermissions.bitfield).toArray();
				isHidden = permArray.includes("ViewChannel") && permArray.includes("SendMessages")
					? "Public"
					: permArray.includes("ViewChannel")
						? "Locked"
						: "Hidden";
			}

			let addList = "";
			let bannedList = "";
			let cowners = "";
			let chCownerList = "";
			let eventsState = "Off";

			if (channelInfo) {
				const allAdds = await addedusers(channel);
				const allBans = await bannedusers(channel);
				const cownersList = [
					channelInfo.cowner1,
					channelInfo.cowner2,
					channelInfo.cowner3,
					channelInfo.cowner4,
					channelInfo.cowner5,
				].filter(Boolean);

				addList = allAdds.length > 30 ? "**... too many to list**" : allAdds.map((u, i) => `\n> ${i + 1}. <@!${u.user}>`).join("");
				bannedList = allBans.map((u, i) => `\n> ${i + 1}. <@!${u.user}>`).join("");
				cowners = cownersList.map((id, i) => `\n> ${i + 1}. <@!${id}>`).join("");
				if (!Array.isArray(cowner_channels)) {
					console.log("getCoChannels() did not return an array:", cowner_channels);
					cowner_channels = [];
				}

				chCownerList = cowner_channels.length > 0

					? cowner_channels.map((ch, i) => `\n> ${i + 1}. <#${ch.channel}>`).join("")
					: "None";
				if (channelInfo.events === 1) eventsState = "On";
			}

			let myamari;
			if (serverId === "1135995107842195550") {
				myamari = await amariclient.getUserLevel(serverId, `${user}`);
			}

			let embed = new EmbedBuilder()
				.setTitle("Staff User Info View")
				.setDescription(`**User Info For:** <@!${user}> ${channel ? `\n**User Owns Channel:** <#${channel}>` : ""}`)
				.addFields(
					{ name: "__Channel Users__", value: addList || "None", inline: true },
					{ name: "__Channel Cowners__", value: cowners || "None", inline: true },
					{ name: "__Channel Banned__", value: bannedList || "None", inline: true },
					{ name: "__Channel Events__", value: eventsState, inline: true },
					{ name: "__Channel Visibility__", value: isHidden, inline: true },
					{ name: "__User ID__", value: member.id, inline: true },
					{ name: "__Global Name__", value: member.user.globalName || "None", inline: true },
					{ name: "__User Tag__", value: member.user.tag, inline: true },
					{ name: "__Amari Level__", value: myamari ? myamari.level.toString() : "N/A", inline: true },
					{ name: "__Date Joined__", value: member.joinedAt?.toDateString() || "Unknown", inline: true },
					{ name: "__Joined Discord__", value: member.user.createdAt.toDateString(), inline: true },
					{ name: "__Assigned Roles__", value: roleList || "None", inline: true },
					{ name: "__Cowner On Channels__", value: chCownerList || "None", inline: true }
				)
				.setColor("#097969");

			await message.reply({ embeds: [embed] });
		} catch (err) {
			console.error(err);
		}
	},
});