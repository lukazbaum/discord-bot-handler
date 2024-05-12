import { ButtonInteraction, GuildChannel, ChannelType, Message} from "discord.js";
import { ComponentModule, ComponentTypes } from "../../handler/types/Component";

export = {
    id: "channel_lock",
    type: ComponentTypes.Button,
    async execute(interaction: ButtonInteraction): Promise<void>{
	    if(!interaction.channel) return;
            if(interaction.channel.type !== ChannelType.GuildText) return;
	    await interaction.deferReply({ ephemeral: true })
	    await interaction.channel.permissionOverwrites.edit(`1143236724718317673`, {
		    SendMessages: false
	   });
	    await interaction.editReply('Channel is Locked')
    }
} as ComponentModule;
