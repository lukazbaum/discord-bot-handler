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
            let serverId = interaction.guild.id

            //guild setup
            const publicViewRoleList: { [key: string]: string } = {
                        "1135995107842195550": "1143236724718317673",
                        "801822272113082389": "807811542057222176",
             };

            const publicRole = Object.entries(publicViewRoleList).find(([key, val]) => key === serverId)?.[1];


	    await interaction.channel.permissionOverwrites.edit(publicRole,{
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
