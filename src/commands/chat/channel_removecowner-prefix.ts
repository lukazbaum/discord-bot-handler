import { GuildChannel, GuildMember,  ChannelType, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle  } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {isOwner, getisland} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "removecowner",
    aliases: ["removeco","Removecowner", "remco", "rmco"],
    type: CommandTypes.PrefixCommand,
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1246691890183540777'],
    categoryWhitelist: ['1147909067172483162',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1147909282201870406',
                        '1147909200924643349',
                        '1140190313915371530'],
    async execute(message: Message): Promise<void> {
	try{
		if(message.channel.type !== ChannelType.GuildText) return;
                // This whole Block checks for the channel owner and if not channel owner
                 // if its not the channel owner, checks for the staff role
                 // if user is a staff member, they can run the command
                 // if user is a channel owner or a cowner on the channel / mentioned channel,
                 // then they are authorized.

                let getOwner = await isOwner(message.author.id)
                let checkStaff = await  message.guild.members.cache.get(message.author.id)
                let channel = message.channel.id

                //handles null values
                let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel)

                if(!checkOwner){
                        if(!(checkStaff.roles.cache.has('1148992217202040942'))){
                                await message.reply('you must be an owner/cowner of this channel to run this command')
                                return;

                        }else if(checkStaff.roles.cache.has('1148992217202040942')){
                                console.log("Channel Remove Cowner Ran In: ", message.channel.id, "by", message.author.id)
                        }
                }

	    	if (!message.mentions.users.map(m => m).length) {
			await message.reply('Did you forget to add the user?')
		    	return;
	    	}
		const id = await message.mentions.users.first().id
	    	if(id  === message.author.id){
                	await message.reply("Seriously? <a:ep_bozabonk:1164312811468496916>")
		  	return;
	    	}

	    	let embed = new EmbedBuilder()
	    		.setTitle("Channel Manager: Remove User")
			.setDescription(`<@!${message.mentions.members.first().id}> has been removed
				 \n *to add user back use ep adduser*`)
			.setColor(`#097969`)

		const row: any = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("remove_co")
					.setLabel("Remove Cowner Only")
					.setStyle(ButtonStyle.Primary)
					.setEmoji("👮"),
				new ButtonBuilder()
					.setCustomId("remove_coanduser")
					.setLabel("Remove From Channel and Cowners")
					.setStyle(ButtonStyle.Primary)
					.setEmoji("💔"),
				new ButtonBuilder()
					.setCustomId("cancel")
					.setLabel("Cancel")
					.setStyle(ButtonStyle.Danger)
					.setEmoji("✖️")
			)

	   	await message.reply({embeds:[embed], components: [row], });
	}catch(err)
  	{console.log(err)}
    },
} as PrefixCommandModule;
