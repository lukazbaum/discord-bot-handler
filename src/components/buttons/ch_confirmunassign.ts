import { Message, TextChannel, ChannelType, Guild, PermissionsBitField, ButtonInteraction, GuildChannel, EmbedBuilder} from "discord.js";
import { ComponentModule, ComponentTypes,} from "../../handler/types/Component";
const { removeuser, removeislanduser, getisland, bannedusers, addedusers, removeban} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    id: "confirm_uc",
    type: ComponentTypes.Button,
    async execute(interaction: ButtonInteraction): Promise<void>{
	    if(!interaction.channel) return;
            if(interaction.channel.type !== ChannelType.GuildText) return;
	    try{
		let getMessageContent = await interaction.message.fetchReference()
		let channelGrab = getMessageContent.content.split('#')
		let channelId = channelGrab[1].replace(">", "")
                let channelInfo = await getisland(channelId)
                let cowners = ''
                let user = `${channelInfo.user}`
                let banlist = await bannedusers(channelId)
                let addedlist = await addedusers(channelId)
                let getName = await interaction.guild.channels.fetch(channelId)
                let channelName = getName.name
                let channel = interaction.guild.channels.cache.find(channel => channel.name === channelName) as TextChannel;
		let serverId = interaction.guild.id

		// guild specific setup

		const quaruntineParentList: { [key: string]: string } = {
                        "1135995107842195550": "1219009472593399909",
                        "801822272113082389": "1152037896841351258",
                 };
		const quaruntineParent = Object.entries(quaruntineParentList).find(([key, val]) => key === serverId)?.[1];

		const channelOwnerRoles: { [key: string]: string } = {
			"1135995107842195550": "1147864509344661644",
                        "801822272113082389": "1262566008405622879",
		};

		const chrole =  Object.entries(channelOwnerRoles).find(([key, val]) => key === serverId)?.[1];

		const publicViewRoleList: { [key: string]: string } = {
                        "1135995107842195550": "1143236724718317673",
                        "801822272113082389": "807811542057222176",
                };

		const publicRole = Object.entries(publicViewRoleList).find(([key, val]) => key === serverId)?.[1];


		if(banlist.length){
                        for(let i = 0; i < banlist.length; i++) {
                                await removeban(banlist[i].user, channelId)
                                channel.permissionOverwrites.delete(banlist[i].user)
                  	}
		}
		if(addedlist.length) {
                        for(let i = 0; i < addedlist.length; i++) {
                                channel.permissionOverwrites.delete(addedlist[i].user)
                                await removeuser(addedlist[i].user, channelId)
                         }
                }
	 	if(await removeislanduser(user) === "Deleted!") {
                        const member = interaction.guild.members.cache.get(user)
                        await channel.permissionOverwrites.edit(member, {ViewChannel:false, SendMessages: false})
                        await channel.permissionOverwrites.edit(publicRole, {ViewChannel:false, SendMessages: false})
                        await channel.setParent(quaruntineParent), {reason: "unassigned ownwers"}
			await member.roles.remove(chrole)
                };

		await interaction.update({
			embeds: [ new EmbedBuilder()
                            .setTitle("Staff Channel Manager: Unassign Channel")
			    .setDescription(`The Channel <#${channelId}>, owned by <@!${user}> has been succesfully unassigned and archived`)
                            .setColor('#097969') ],
                    components: []
        	 });
		 let embed2 = new EmbedBuilder()
                 	.setTitle("Channel Manager: Channel Unassigned")
                 	.setDescription(`<@!${user}> is no longer the owner of: channel: ${channelGrab}`) 
                 	.addFields({name:"**--Channel Marked for Deletion--**", value: new Date().toLocaleString(), inline: true},
                          	  {name:"**--Channel Unassigned By--**", value: `${getMessageContent.author}`, inline: true},
                 	)	
		 if(serverId === '1135995107842195550'){
		  var qlog = await interaction.guild.channels.cache.find(channel => channel.name === `quaruntine-logs`) as TextChannel;
		    qlog.send({embeds: [embed2]})
		 }

    }catch(err) {console.log(err)}
    
}} as ComponentModule;
