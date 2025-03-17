import { ChannelType, Message,  EmbedBuilder,} from "discord.js";
import { PrefixCommand } from '../../handler';
const {isOwner, adduser, addedusers, removeban} = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
	name: "adduser",
	aliases:  ["useradd","addusers", "Adduser", "au"],
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767'],
	allowedRoles: ['1147864509344661644', '1148992217202040942', '1246691890183540777','1246691890183540777',
		'807826290295570432',
		'1073788272452579359',
		'807826290295570432',
		'1262566008405622879',
		'1113414355669753907',// epic wonderland play land staff
		'1115772256052846632', /// epic wonderland staff
		'1113451646031241316', // epic wonderland users
		'845499229429956628', // Blackstone Staff
		'839731097633423389' // Blackstone Users
	],
	allowedCategories: ['1147909067172483162',
		'1147909156196593787',
		'1147909282201870406',
		'1147909539413368883',
		'1147909373180530708',
		'1147909282201870406',
		'1147909200924643349',
		'1140190313915371530',
		'1203928376205905960',
		'1232728117936914432',
		'1192106199404003379',
		'1192108950049529906',
		'1225165761920630845',
		'966458661469839440',
		'808109909266006087',
		'825060923768569907',
		'1113414355669753907',// epic wonderland staff
		'1113414451912257536', // epic wonderland booster
		'1115072766878691428', // epic wonderland supreme land
		'1151855336865665024', // epic wonderland supreme land 1
		'1320055421561471048', // epic wonderland supreme land 2
		'1115357822222348319', // epic wonderland Epic Host Land
		'839731102813913107', // Blackstone Squires Corner
		'839731102281105409', // Blackstone Knights Hall
		'839731101885923345', // Blackstone wizards tower
		'839731101622075415', // Blackstone Dragon Cave
		'872692223488184350', // Blackstone Nitro Islands
		'839731101391781906', // Blackstone Kingdom Elite
		'967657150769942578', // Blackstone Royal Wing
		'1019301054120210482', // Blackstone Donors
		'967657150769942578', // Blackstone Staff
	],
	async execute(message: Message): Promise<void> {
		try {
			if (message.channel.type !== ChannelType.GuildText) return;

			const initialReply = await message.reply("Processing your request...");

			let getOwner = await isOwner(message.author.id);
			let checkStaff = await message.guild.members.cache.get(message.author.id);
			let channel = String(message.channel.id);
			let serverId = String(message.guild.id);

			let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel)


			const modRoleList: { [key: string]: string } = {
				"1135995107842195550": "1148992217202040942",
				"1113339391419625572": "1113407924409221120",
				"839731097473908767": "845499229429956628",
			};

			const roleId = Object.entries(modRoleList).find(([key]) => key === serverId)?.[1];

			if (!checkOwner) {
				if (!checkStaff.roles.cache.has(roleId)) {
					await message.reply("You must be an owner/cowner of this channel to run this command.");
					return;
				}
			}	else if(checkStaff.roles.cache.has(roleId)){
			console.log("Addcowner Ran In: ", message.channel.id, "by", message.author.id)
			}

			let messageContent = message.content.toLowerCase();
			let messageContentSplit = messageContent.split(" ");
			let userName = message.mentions.users.first();
			let id;

			if (!userName) {
				if (Number.isInteger(Number(messageContentSplit[0]))) {
					id = messageContentSplit[0];
				} else {
					await initialReply.edit("Please specify a valid user ID or username.");
					return;
				}
			} else {
				id = userName.id;
			}

			const checkAdds = await addedusers(message.channel.id);
			let cleanid = id.replace(/\D/g, '');
			const isAdded = checkAdds && checkAdds.some((added) => added.user === cleanid);

			if (isAdded) {
				await initialReply.edit("User is already added.");
				return;
			} else {
				await adduser(cleanid, message.channel.id);
				await removeban(cleanid, message.channel.id);
				await message.channel.permissionOverwrites.edit(cleanid, {
					ViewChannel: true,
					SendMessages: true,
				});
			}

			let addlist = "";
			const alladds = await addedusers(message.channel.id);
			for (let i = 0; i < alladds.length; i++) {
				addlist += `\n> ${i + 1}. <@!${alladds[i].user}>`;
			}

			const embed1 = new EmbedBuilder()
				.setTitle("Channel Manager: Add Channel User")
				.setDescription(`__Current List of Added Users__\n${addlist}\n\n*To ban a user, use command ban*`)
				.setColor(`#097969`);

			await initialReply.edit({ content: null, embeds: [embed1] });
		} catch (err) {
			console.error(err);
		}
	},
});
