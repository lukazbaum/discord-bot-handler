import {  Message, TextChannel, GuildChannelManager, ChannelType, Guild, PermissionsBitField, EmbedBuilder}  from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { getisland, addedusers, bannedusers } = require('/home/ubuntu/ep_bot/extras/functions');
const { amarikey } = require('../../../../ep_bot/extras/settings')
const { AmariBot } = require("amaribot.js");
const amariclient = new AmariBot(amarikey);

export = {
    name: "upgrade",
    aliases: ["Upgrade", "up"],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    async execute(message: Message): Promise<void> {
         try{
		let island = await getisland(message.channel.id)
		let myamari = await amariclient.getUserLevel(message.guild.id, `${island.user}`)
		let level = parseInt(`${myamari.level}`)
            	let user = `${island.user}`
		let memberTarget = message.guild.members.cache.get(user)
		let cowner = ' '

		let boosterRole = "1142141020218347601"
		let staffRole = "1148992217202040942"
		let staffParent = "1140190313915371530"
		let boosterParent = "1147909067172483162"
		let skaterPark = "1147909200924643349"
		let parkPavilion = "1147909282201870406"
		let adventureTrails = "1147909373180530708"
		let tropicalLounge = "1147909539413368883"
		let parkPeaks = "1147909156196593787"
		
		const channel = message.guild.channels.cache.find(channel => channel.id === `${island.channel}`) as TextChannel;

		if(memberTarget.roles.cache.has(staffRole)){
                    if(channel.parentId === staffParent) {
                        message.reply('You cant move staff channels')
			return;
                    }else{
                            await channel.setParent(staffParent);
                            await channel.permissionOverwrites.create(user, {SendMessages:true, ViewChannel: true})
                            message.reply('Since you have the staff role, you are moved to staff area')
                    }

                }else if(memberTarget.roles.cache.has(boosterRole)){
                        if(channel.parentId !== boosterParent){
                                await channel.setParent(boosterParent);
                                await channel.permissionOverwrites.create(user, {SendMessages:true, ViewChannel: true})
                                message.reply('Your Channel Has Been Moved to Booster Fields')
                        }else{
                                message.reply('You are a booster and at the highest category')
				return;
                             }
                } else if(level <= 39){
                                message.reply('Reach Amari Level 40+ for channel upgrades')
				return;
		}else if((level >= 40) && (level <= 59)){
                        if(channel.parentId === parkPavilion) {
                                message.reply("no upgrade available till amari lvl. 60")
				return;
                        }else{
				await channel.setParent(parkPavilion), {reason: "channel upgrade"}
                                await channel.permissionOverwrites.create(user, {SendMessages:true, ViewChannel: true})
                                message.reply('Your Channel Has Moved to Picnic Pavlilion')
                        }
		}else if((level >= 60) && (level <= 79)){
                        if(channel.parentId === adventureTrails) {
                                message.reply("no upgrade availble until Amari lvl 80")
				return;
                        }else{await channel.setParent(adventureTrails), {reason: 'channel upgrade'}
                                await channel.permissionOverwrites.create(user, {SendMessages:true, ViewChannel: true})
                                message.reply('Your Channel Has Moved to Adventure Trails')
                        }
		}else if((level >= 80) && (level <= 119)){
                        if(channel.parentId === tropicalLounge ) {
                                message.reply("no upgrade availble until Amari lvl 120")
				return;
                        } else {await channel.setParent(tropicalLounge), {reason: 'channel upgrade'}
                                await channel.permissionOverwrites.create(user, {SendMessages:true, ViewChannel: true})
                                message.reply('Your Channel Has Moved to Tropical Lounge')
                        }
		}else if(level >= 120){
                        if(channel.parentId === parkPeaks) {
                                message.reply('Channel Fully Upgraded Already!')
				return;
                        }else {await channel.setParent(parkPeaks), {reason: 'channel upgrade'}
                                await channel.permissionOverwrites.create(user, {SendMessages:true, ViewChannel: true})
                                message.reply('Your Channel Has Moved to Park Peaks')
                        }
                }else{
			message.reply("something happened, contact a dev")
		}
                for(let i = 1; i <= 7; i++) {
                	if(i ===1){ cowner = island.cowner1
			}else if(i===2){ cowner = island.cowner2
			}else if(i===3){ cowner = island.cowner3
			}else if(i===4){ cowner = island.cowner4
			}else if(i===5){ cowner = island.cowner5
			}else if(i===6){ cowner = island.cowner6
			}else if(i===7){ cowner = island.cowner7
			}
                	if(cowner) {
                        	await channel.permissionOverwrites.create(cowner,{SendMessages:true, ViewChannel: true})
                    	}
		}

                let addids = await addedusers(channel.id)
                let addlist = []

                if(addids.length){
                    for(let i = 0; i < addids.length; i++) {
                            addlist = await addlist.concat(`${addids.map(l=>l.user)[i]}`)
                            await channel.permissionOverwrites.create(addlist[i],{SendMessages:true, ViewChannel: true})
                   }
                }
                let banids = await bannedusers(channel.id)
                let banlist = []
                if(banids.length) {
                    for(let i = 0; i < banids.length; i++) {
                            banlist = await banlist.concat(`${banids.map(l => l.user)[i]}`)
                            await channel.permissionOverwrites.create(banlist[i],{SendMessages:false, ViewChannel: false})
                        }
                }
		let embed = new EmbedBuilder()
                    .setTitle("Channel Manager: Channel Upgrade")
		    .setDescription("Channel Has Been Upgraded. *NOTE* Channel is Hidden. Use `ep unhide` to make it public")
                	await message.reply({embeds: [embed]})
             } catch (err)
                {console.error(err)}
                message.reply('something happened, contact an Admin')
    		}
} as PrefixCommandModule;

