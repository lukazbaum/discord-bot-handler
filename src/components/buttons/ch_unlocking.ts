import { ButtonInteraction, GuildChannel, ChannelType, EmbedBuilder} from "discord.js";
import { ComponentModule, ComponentTypes } from "../../handler/types/Component";
const {getisland} = require('/home/ubuntu/ep_bot/extras/functions');
export = {
    id: "channel_unlock",
    type: ComponentTypes.Button,
    async execute(interaction: ButtonInteraction): Promise<void>{
	 try{
	    if (!interaction.channel) return;
            if (interaction.channel.type !== ChannelType.GuildText) return;

	    await interaction.channel.permissionOverwrites.edit(`1143236724718317673`,{
		    ViewChannel: true, 
		    SendMessages: true 
	    }); 
	    await interaction.update({
                    embeds: [ new EmbedBuilder()
                            .setTitle("Channel Unlocked")
                            .setDescription("Channel allows public messsages again") ],
                    components: []
        	})
	}catch(err)
        {console.log(err)}
    }
} as ComponentModule;
