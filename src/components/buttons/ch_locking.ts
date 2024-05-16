import { ButtonInteraction, GuildChannel, ChannelType, EmbedBuilder} from "discord.js";
import { ComponentModule, ComponentTypes } from "../../handler/types/Component";

export = {
    id: "channel_lock",
    type: ComponentTypes.Button,
    async execute(interaction: ButtonInteraction): Promise<void>{
	    if(!interaction.channel) return;
            if(interaction.channel.type !== ChannelType.GuildText) return;
	    await interaction.channel.permissionOverwrites.edit(`1143236724718317673`, {
		    SendMessages: false
	   });
	   await interaction.update({
                    embeds: [ new EmbedBuilder()
                            .setTitle("Channel Locked")
                            .setDescription("Messages can only be sent by added users\n*to disable use ep unlock*") ],
                    components: []
        })
    }
} as ComponentModule;
