import { ButtonInteraction, GuildChannel, ChannelType, EmbedBuilder} from "discord.js";
import { ComponentModule, ComponentTypes } from "../../handler/types/Component";

export = {
    id: "channel_unlock",
    type: ComponentTypes.Button,
    async execute(interaction: ButtonInteraction): Promise<void>{
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
    }
} as ComponentModule;
