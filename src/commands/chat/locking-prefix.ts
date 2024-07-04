import {CommandTypes, PrefixCommandModule} from "../../handler/types/Command";
import { Message, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
const {addedusers, getisland, isOwner} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "lock",
    aliases: ["unlock"],
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
		let checkOwner = await isOwner(message.author.id)
                let checkStaff = await  message.guild.members.cache.get(message.author.id)

                if(checkOwner[0].channel !== message.channel.id ){
                        if(checkStaff.roles.cache.has('1148992217202040942')){
                                // continue
                        }else{
                                await message.reply('you must be an owner/cowner of this channel to run this command')
                                         return;
                        }
                }
		let island = await getisland(message.channel.id)
		let addids = await addedusers(message.channel.id)
		let userlist = " "

                for (let i = 0;i < addids.length; i++) {
                        userlist = await userlist.concat(`\n added: <@!${addids[i].user}>`)
                }
		
		let ownerlist = ""
		let cowners = [island.user,
				island.cowner1,
				island.cowner2,
				island.cowner3,
				island.cowner4,
				island.cowner5,
				island.cowner6,
				island.cowner7]

		const filteredOwners: string[] = cowners.filter((s): s is string => !!(s));

        	for(let i = 0; i < filteredOwners.length; i++) {
			ownerlist = await ownerlist.concat(`\nco-owner: <@!${filteredOwners[i]}>`)
			}

       		let embed = new EmbedBuilder()
	       	    .setTitle("Channel Locking")
		    .setDescription(`
				    *Locking Channels removes the ability for all users to chat except added users.*
				    *Channel is still publicly visible. hide/unhide affects visibility*\n
				    __Members Not Affected by Lock:__
				     ${userlist}
				     ${ownerlist}
				     `)
                    .setColor('#097969')

		const row: any = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("channel_lock")
					.setLabel("Lock Channel")
					.setStyle(ButtonStyle.Primary)
					.setEmoji("🔐"),
				new ButtonBuilder()
					.setCustomId("channel_unlock")
					.setLabel("Unlock Channel")
					.setStyle(ButtonStyle.Primary)
					.setEmoji("🔓"),
				new ButtonBuilder()
					.setCustomId("cancel")
					.setLabel("Cancel")
					.setStyle(ButtonStyle.Danger)
					.setEmoji("✖️")
				)
		await message.reply({embeds:[embed], components: [row], });
	}catch(err)
  	{console.log(err)}
    }
} as PrefixCommandModule;

