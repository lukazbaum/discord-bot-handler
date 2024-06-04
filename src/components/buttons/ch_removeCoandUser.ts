import { ButtonInteraction, GuildChannel, ChannelType, TextChannel, Guild, Message, PermissionsBitField, EmbedBuilder} from "discord.js";
import { ComponentModule, ComponentTypes } from "../../handler/types/Component";
const {addedusers, removeuser, getisland, removecowners} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    id: "remove_coanduser",
    type: ComponentTypes.Button,
    async execute(interaction: ButtonInteraction): Promise<void>{
	try{
		if(!interaction.channel) return;
            	if(interaction.channel.type !== ChannelType.GuildText) return;
		let getMessageContent = await interaction.message.fetchReference()
                let userGrab = getMessageContent.content.split('<')
		let cleanid = userGrab[1].replace('@','').replace('>', '')
                const checkAdds = await addedusers(interaction.message.channel.id)
                const channelInfo = await getisland(interaction.message.channel.id)
                const isAdded = checkAdds.some((added) => added.user === cleanid)
                const cownersArray = [channelInfo.cowner1,
                                        channelInfo.cowner2,
                                        channelInfo.cowner3,
                                        channelInfo.cowner4,
                                        channelInfo.cowner5,
                                        channelInfo.cowner6,
                                        channelInfo.cowner7]
                const filteredOwners: string[] = cownersArray.filter((s): s is string => !!(s));
                let channelID = interaction.message.channel.id
                let channel = interaction.guild.channels.cache.find(channel => channel.id === channelID) as TextChannel;
		let cowners = ' '
                let cownerRole = '1246691890183540777'

		if(isAdded) {
                        await removeuser(cleanid, interaction.message.channel.id)
                }

		Object.entries(channelInfo).forEach(([key, value]) => {
                	cowners = cowners.concat(`${key}:${value},`)
                });

		let cownersTemp = cowners.split(",").map(pair => pair.split(":"));
                const result = Object.fromEntries(cownersTemp);

		function getOwner(obj, value) {
                        return Object.keys(obj)
                                .filter(key => obj[key] === value);
                }

                let remuser = getOwner(result, cleanid)
                if(remuser[0]){
                        let ownerLocationid = remuser[0].slice(-1)
                        await removecowners(interaction.message.channel.id, ownerLocationid)
                        let channelCowner = interaction.message.guild.members.cache.get(cleanid)
                        await channelCowner.roles.remove(cownerRole)
                }

		await channel.permissionOverwrites.delete(cleanid)

	   	await interaction.update({
                	embeds: [ new EmbedBuilder()
                        	.setTitle("Channel Manager: Remove Cowner")
                            	.setDescription("User no longer a cowner and removed from channel")],
                    		components: []
        	})
	}catch(err)
        {console.log(err)}

    }
} as ComponentModule;
