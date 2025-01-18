import { ButtonInteraction, GuildChannel, ChannelType, EmbedBuilder} from "discord.js";
import { Button } from '../../handler';
const {getisland} = require('/home/ubuntu/ep_bot/extras/functions');

export default new Button({
    customId: "channel_unhide",
    async execute(interaction: ButtonInteraction): Promise<void>{
	    if(!interaction.channel) return;
            if(interaction.channel.type !== ChannelType.GuildText) return;
	    let serverId = interaction.guild.id

            //guild setup
            const publicViewRoleList: { [key: string]: string } = {
                        "1135995107842195550": "1143236724718317673",
                        "801822272113082389": "807811542057222176",
             };
	    
            const publicRole = Object.entries(publicViewRoleList).find(([key, val]) => key === serverId)?.[1];


	    await interaction.channel.permissionOverwrites.edit(publicRole, {
		    ViewChannel: true,
		    SendMessages: true
	   })
	   await interaction.update({
                    embeds: [ new EmbedBuilder()
                            .setTitle("Channel Not Hidden")
                            .setDescription("Channel open to all users\n*to disable use ep hide*") ],
                    components: []
        })
    }
});
