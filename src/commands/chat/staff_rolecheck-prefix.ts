import { Message, ChannelType, ChannelManager, Role, GuildChannel, GuildMember, BitField, PermissionsBitField, EmbedBuilder } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";

export = {
    name: "rolecheck",
    type: CommandTypes.PrefixCommand,
    roleWhitelist:["1148992217202040942"],
    optionalCategoryWhitelsit:['1147909067172483162',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1147909282201870406',
                        '1147909200924643349',
                        '1140190313915371530'],
    optionalChannelWhitelist:["1147233774938107966", "1138531756878864434", "1151411404071518228"],
    async execute(message: Message): Promise<void> {
	try{
		if(message.channel.type !== ChannelType.GuildText) return;

		let messageContent = message.content.toString().toLowerCase()
		let getRole;
		let roleId;

		if(messageContent.endsWith("rolecheck")) {
			await message.reply("usage: `ep rolecheck rolename/ID`")
			return;
		}
		getRole = messageContent.split("rolecheck")


		if(!(Number.isFinite(getRole[0]))){
			let roleName = await message.guild.roles.cache.find(role => role.name.toLowerCase() === `${getRole[0]}`)
			roleId = roleName.id
		}else if(Number.isFinite(getRole[0])){
			roleId = getRole[0]
		}else{
			await message.reply("role name or ID is invalid")
			return;
		}

		let bitfield = message.channel.permissionsFor(`${roleId}`).bitfield
		let permArray = new PermissionsBitField(bitfield).toArray()
		let permissionList = " "
		
		for(let i = 0; i < permArray.length; i++) {
			permissionList = permissionList.concat(`\n> ✅ - **${permArray[i]}**`)
		}


		


		let embed = new EmbedBuilder()
			.setTitle("Staff Manager: Role Permision In Channel Info")
			.setDescription(`__Permission List__: 
					${permissionList}`)
			

        	await message.reply({embeds: [embed]})
	}catch(err)
	{console.log(err)}

    }
} as PrefixCommandModule;
