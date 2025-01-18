import { EmbedBuilder, ButtonInteraction, TextChannel } from "discord.js";
import { Button } from '../../handler';

export default new Button({
	customId: "sendMessage",
    async execute(interaction: ButtonInteraction): Promise<void> {
	   let getMessageContent = await interaction.message.embeds
	   let messageContent = getMessageContent[0].data.image

	   let targetChannel = '1235663450152374272'
	   const channel: TextChannel = interaction.guild.channels.cache.get(targetChannel) as TextChannel 
	   let embed = new EmbedBuilder ()
	        .setImage(messageContent.proxy_url) 
	    	.setColor('#E91E63')
	   await channel.send({embeds: [embed]})
	   await interaction.channel.send("image posted to <#1235663450152374272>")
    }
});
