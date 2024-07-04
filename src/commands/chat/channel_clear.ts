import {  Message, TextChannel, GuildChannelManager, ChannelType, Guild, PermissionsBitField, EmbedBuilder}  from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { isOwner, getisland, addedusers, bannedusers } = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "clear",
    aliases: ["Clear", "delete", "Delete"],
    type: CommandTypes.PrefixCommand,
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1147864509344661644'],
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
		if(message.channel.type !== ChannelType.GuildText) return;
		
		let stringContent = message.content
		console.log(stringContent)
		if(Number(stringContent)) {
			if(Number(stringContent) === 0){
				await message.reply('please supply a number between 1 and 100')
                                return;

			}else if(Number(stringContent) >= 101){
				await message.reply('please supply a number between 1 and  100')
				return;
			} else {
				const getValue = a => [].concat(a).at(0);
				await message.channel.bulkDelete(getValue(stringContent))
			}
		}else{
			await message.reply('please supply a number between 1 and 100') 
			return;
		}

		let embed = new EmbedBuilder()
                    .setTitle("Channel Manager: Delete Messages")
		    .setDescription(`${stringContent}  messages have been deleted`)
               	await message.channel.send({embeds: [embed]})
             } catch (err)
                {console.error(err)}
    		}
} as PrefixCommandModule;

