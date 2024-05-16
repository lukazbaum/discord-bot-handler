import { EmbedBuilder, ButtonInteraction, GuildChannel, ChannelType} from "discord.js";
import { ComponentModule, ComponentTypes } from "../../handler/types/Component";

export = {
    id: "2_sec",
    type: ComponentTypes.Button,
    async execute(interaction: ButtonInteraction): Promise<void>{
	    if (!interaction.channel) return;
            if (interaction.channel.type !== ChannelType.GuildText) return;
	    await interaction.channel.setRateLimitPerUser(2)
	    await interaction.update({
		    embeds: [ new EmbedBuilder()
			    .setTitle("Slowmode On")
		   	    .setDescription("2 Second Slowmode Enabled\n*to disable use ep slowoff*") ],
  		    components: []
	})
    }
} as ComponentModule;
