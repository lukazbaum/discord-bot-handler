import { Message, TextChannel, ChannelType, Guild, PermissionsBitField, ButtonInteraction, GuildChannel, EmbedBuilder} from "discord.js";
import { ComponentModule, ComponentTypes,} from "../../handler/types/Component";
const { getisland, bannedusers, addedusers} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    id: "confirm_rc",
    type: ComponentTypes.Button,
    async execute(interaction: ButtonInteraction): Promise<void>{
	    if(!interaction.channel) return;
            if(interaction.channel.type !== ChannelType.GuildText) return;
	    try{
		let getMessageContent = await interaction.message.fetchReference()
		let channelGrab = getMessageContent.content.split('#')
		let channelId = channelGrab[1].replace(">", "")
                let chrole = '1147864509344661644'
                let baseParent = '1147909200924643349'
                let channelInfo = await getisland(channelId)
                let cowners = ''
                let user = `${channelInfo.user}`
                let banlist = await bannedusers(channelId)
                let addedlist = await addedusers(channelId)
                let getName = await interaction.guild.channels.fetch(channelId)
                let channelName = getName.name
                let channel = interaction.guild.channels.cache.find(channel => channel.name === channelName) as TextChannel;
		await channel.setParent(baseParent), {reason: "recover channel"}
		await channel.lockPermissions()

		if(banlist.length){
                        for(let i = 0; i < banlist.length; i++) {
                                channel.permissionOverwrites.edit(banlist[i].user,
								  {ViewChannel:false, 
								   SendMessages: false})
                  	}
		}
		if(addedlist.length) {
                        for(let i = 0; i < addedlist.length; i++) {
				channel.permissionOverwrites.edit(addedlist[i].user, 
								  {ViewChannel: true,
								   SendMessages: true})
                         }
                }

	        const member = interaction.guild.members.cache.get(user)
		await member.roles.add(chrole)
                await channel.permissionOverwrites.edit(`${user}`, 
							{ViewChannel:true, 
							SendMessages: true})
                await channel.permissionOverwrites.edit(`1143236724718317673`, 
							{ViewChannel:true, 
							SendMessages: true})

		
		var cownersArray = [channelInfo.cowner1,
				     channelInfo.cowner2,
				     channelInfo.cowner3,
				     channelInfo.cowner4,
				     channelInfo.cowner5,
				     channelInfo.cowner6,
				     channelInfo.cowner7]
            	var filteredOwners: string[] = cownersArray.filter((s): s is string => !!(s));
		for(let i = 0; i < filteredOwners.length; i++) {
			if(interaction.guild.members.cache.get(`${filteredOwners[i]}`)) {
				await channel.permissionOverwrites.edit(`${filteredOwners[i]}`, 
									 {ViewChannel:true,
                                	                        	SendMessages: true})
			}
		}

		await interaction.update({
			embeds: [ new EmbedBuilder()
                            .setTitle("Staff Channel Manager:  Recover Channel")
			    .setDescription(`The Channel <#${channelId}>, owned by <@!${user}>, has been recovered. 

					    channel moved to base category <#1147909200924643349> . 
					    Channel owner  can use *ep upgrade* to move to right category.`)
                            .setColor('#097969')],
                    components: []
        	});
		let embed2 = new EmbedBuilder()
                        .setTitle("Channel Manager: Channel Recover")
                        .setDescription(`<@!${user}> is now the owner of channel: <#${channelId}>`)
                        .addFields({name:"**--Channel Recovered At--**", value: new Date().toLocaleString(), inline: true},
                                  {name:"**--Channel Assigned By--**", value: `${getMessageContent.author}`, inline: true},
                        )
                var qlog = await interaction.guild.channels.cache.find(channel => channel.name === `quaruntine-logs`) as TextChannel;
                qlog.send({embeds: [embed2]})
    }catch(err) {console.log(err)}
    
}} as ComponentModule;
