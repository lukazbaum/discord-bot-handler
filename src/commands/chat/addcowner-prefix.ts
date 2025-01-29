import {ChannelType, Message,  EmbedBuilder, } from "discord.js";
import { PrefixCommand } from '../../handler';
const { insertcowner, getisland, addedusers, isOwner} = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
	name: "addcowner",
	aliases: ["Addcowner", "addowner", "addco"],
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767'],
	allowedRoles: ['807826290295570432',
			'1262566008405622879',
			'1147864509344661644',
			'1148992217202040942',
			'1246691890183540777',
			'1073788272452579359',
			'807826290295570432',
			'1113407924409221120', // epic wonderland staff
			'1113451646031241316', // epic wonderland users
			'845499229429956628', // Blackstone Staff
			'839731097633423389' // Blackstone Users
	],
	allowedCategories: ['1147909156196593787', '1147909067172483162','1140190313915371530',
			'1143954459030986812',
			'1203928376205905960',
			'1232728117936914432',
			'1192106199404003379',
			'1192108950049529906',
			'1225165761920630845',
			'966458661469839440',
			'808109909266006087',
			'825060923768569907',
			'1219009472593399909', //epic park quaruntine
			'1113414355669753907',// epic wonderland staff
			'1113414451912257536', // epic wonderland booster
			'1115072766878691428', // epic wonderland supreme land
			'1151855336865665024', // epic wonderland supreme land 1
			'1320055421561471048', // epic wonderland supreme land 2
			'872692223488184350', // Blackstone Nitro Islands
			'1019301054120210482', // Blackstone Donors
			'967657150769942578', // Blackstone Staff
			'839731101622075415', // Blackstone Dragon Caves
			'839731101391781906', // Blackstone Kingdoms Elite
	],
	async execute(message: Message): Promise<void> {
	 try{
		if(message.channel.type !== ChannelType.GuildText) return;
				// This whole Block checks for the channel owner and if not channel owner
				 // if its not the channel owner, checks for the staff role
				 // if user is a staff member, they can run the command
				 // if user is a channel owner or a cowner on the channel,
				 // then they are authorized.
		 let getOwner = await isOwner(message.author.id)
		 let checkStaff = await  message.guild.members.cache.get(message.author.id)
		 let channel = String(message.channel.id)
		 let serverId = String(message.guild.id)
		 let cowner = message.mentions.users.first()
		 if(!cowner){
				   await message.reply('please specify a valid @user')
						   return;
				}

				//handles null values
		 let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel)

		// object is guildId:RoleId 

		const modRoleList: { [key: string]: string } = {
			"1135995107842195550": "1148992217202040942",
			"801822272113082389": "807826290295570432",
			"1149713429561622609": "1250373005750566954",
			"1113339391419625572": "1113407924409221120", // epic wonderland staff
			"839731097473908767": "845499229429956628", // blackstone staff royal guards
			};

		const roleId = Object.entries(modRoleList).find(([key, val]) => key === serverId)?.[1];

		if(!checkOwner){
			if(!(checkStaff.roles.cache.has(roleId))){
				await message.reply('you must be an owner/cowner of this channel to run this command')
					return;

			}else if(checkStaff.roles.cache.has(roleId)){
				console.log("Addcowner Ran In: ", message.channel.id, "by", message.author.id)
					}
				}

		const id = await message.mentions.users.first().id
		const cleanid = await id.replace(/\D/g, '');
		const checkAdds = await addedusers(message.channel.id);
		const channelInfo = await getisland(message.channel.id);
		const isAdded = checkAdds && checkAdds.some((added) => added.user === cleanid)
		 let cowners = ' '
		 let addlist = ' '


		 if(id  === message.author.id){
			 await message.reply("Seriously? <a:ep_bozabonk:1164312811468496916>")
				return;
		 }

		 Object.entries(channelInfo).forEach(([key, value]) => {
			   cowners = cowners.concat(`${key}:${value},`) 
		 });

		 let cownersTemp = cowners.split(",")
						.map(pair => pair.split(":"));
		 const result = Object.fromEntries(cownersTemp);
	   
		 function getOwners(obj, value) {
			 return Object.keys(obj)
				.filter(key => obj[key] === value);
		 }

		 let cownersArray = [channelInfo.cowner1,
						channelInfo.cowner2,
						channelInfo.cowner3,
						channelInfo.cowner4,
						channelInfo.cowner5,
						channelInfo.cowner6,
						channelInfo.cowner7]
		 let filteredOwners: string[] = cownersArray.filter((s): s is string => !!(s));
		 let cownersList = ' '

		 if(filteredOwners.length >= 7){
				await message.reply("You have the max amount of cowners. Remove a cowner to make room")
					return;
		 }

		 if(Object.values(result).indexOf(cleanid) >= 0) {
			 await message.reply("user is already a cowner")
			 return;
		 }

		 let availableSpot = getOwners(result, 'null')
		 let channelCowner = message.guild.members.cache.get(cleanid)
		 await insertcowner(message.channel.id, `${availableSpot[0]}`, cleanid)
		 await message.channel.permissionOverwrites.edit(cleanid, {
						ViewChannel:true,
						SendMessages: true,
		 });

		 let embed1 = new EmbedBuilder()
			.setTitle("Channel Manager: Add CO-owner")
			.setDescription(`<@!${cleanid}> has been added as a cowner

					*to remove a cowner, use command ep remcowner*`)
			.setColor(`#097969`)

		await message.reply({embeds:[embed1]})

		}catch(err)
		{console.log(err)}
		}
});
