import { Message, TextChannel, ChannelType, Guild, PermissionsBitField, ButtonInteraction, GuildChannel, EmbedBuilder} from "discord.js";
import { ComponentModule, ComponentTypes,} from "../../handler/types/Component";
const { getisland, bannedusers, addedusers} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    id: "confirm_qc",
    type: ComponentTypes.Button,
    async execute(interaction: ButtonInteraction): Promise<void>{
	    if(!interaction.channel) return;
            if(interaction.channel.type !== ChannelType.GuildText) return;
	    try{
		let getMessageContent = await interaction.message.fetchReference()
		let channelGrab = getMessageContent.content.split('#')
		let channelId = channelGrab[1].replace(">", "")
                let chrole = interaction.guild.roles.cache.get('1147864509344661644')
                let quaruntineParent = '1219009472593399909'
                let channelInfo = await getisland(channelId)
                let cowners = ''
                let user = `${channelInfo.user}`
                let banlist = await bannedusers(channelId)
                let addedlist = await addedusers(channelId)
                let getName = await interaction.guild.channels.fetch(channelId)
                let channelName = getName.name
                let channel = interaction.guild.channels.cache.find(channel => channel.name === channelName) as TextChannel;

		if(banlist.length){
                        for(let i = 0; i < banlist.length; i++) {
                                channel.permissionOverwrites.delete(banlist[i].user)
                  	}
		}
		if(addedlist.length) {
                        for(let i = 0; i < addedlist.length; i++) {
				channel.permissionOverwrites.delete(addedlist[i].user)
                         }
                }

                await channel.permissionOverwrites.edit(`${user}`, {ViewChannel:false, SendMessages: false})
                await channel.permissionOverwrites.edit(`1143236724718317673`, {ViewChannel:false, SendMessages: false})
                await channel.setParent(quaruntineParent), {reason: "quaruntine channel"}

		await interaction.update({
			embeds: [ new EmbedBuilder()
                            .setTitle("Staff Channel Manager: Quaruntine Channel")
			    .setDescription(`The Channel <#${channelId}>, owned by <@!${user}>, has been succesfully quarantined. Use **ep recover #CHANNEL NAME** to recover channel.`)
                            .setColor('#097969')],
                    components: []
        });
    }catch(err) {console.log(err)}
    
}} as ComponentModule;
