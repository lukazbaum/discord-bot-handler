import {  Message, TextChannel, GuildChannelManager, ChannelType, Guild, PermissionsBitField, EmbedBuilder}  from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { isOwner, getisland, addedusers, bannedusers } = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "clear",
    aliases: ["Clear", "delete", "Delete"],
    type: CommandTypes.PrefixCommand,
    guildWhitelist: ['1135995107842195550', '801822272113082389'],
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1147864509344661644','807811542057222176'],
    categoryWhitelist: ['1147909067172483162',
	    		'1142846259321913486',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1147909282201870406',
                        '1147909200924643349',
	    		'1137072690264551604',
                        '1140190313915371530',
    			'1203928376205905960',
    			'1232728117936914432',
    			'1192106199404003379',
    			'1192108950049529906',
    			'1225165761920630845',
    			'966458661469839440',
    			'825060923768569907'
    			],
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
		let serverId = message.guild.id

                //handles null values
                let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel)

                // object is guildId:RoleId 

                const modRoleList: { [key: string]: string } = {
                        "1135995107842195550": "1148992217202040942",
                        "801822272113082389": "807826290295570432",
                        };

                const roleId = Object.entries(modRoleList).find(([key, val]) => key === serverId)?.[1];


                if(!checkOwner){
                        if(!(checkStaff.roles.cache.has(roleId))){
                                await message.reply('you must be an owner/cowner of this channel to run this command')
                                return;

                        }else if(checkStaff.roles.cache.has(roleId)){
                                console.log("Clear Ran In: ", message.channel.id, "by", message.author.id)
                        }
                }


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

