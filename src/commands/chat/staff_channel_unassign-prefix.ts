import { Message, ButtonStyle, ButtonBuilder, ActionRowBuilder, EmbedBuilder}  from "discord.js";
import { PrefixCommand } from '../../handler';
const { getisland } = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
    name: "unassign",
    aliases: ["Unassign", "uc", "uch"],
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	// 871269916085452870 - Luminescent

	allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767','871269916085452870'],
	allowedRoles:["1148992217202040942","807826290295570432", "1073788272452579359", '1113407924409221120',
					'1113407924409221120', // epic wonderland staff
					'845499229429956628', // Blackstone Staff
				'871393325389844521', // Luminescent
		],
	optionalAllowedChannels:["1142401741866946702","1147233774938107966", "1138531756878864434",
								"1151411404071518228","1142401741866946702","1158570345100488754"],
	optionalAllowedCategories:["1137072690264551604","1203928376205905960","1152037896841351258",
		'1113414355669753907',// epic wonderland play land staff
		'1115772256052846632', /// epic wonderland staff
		'967657150769942578', // Blackstone Staff
    '1128607975972548711', // Luminescent Staff
    '890214306615021648', //luminescent mods only
		],
    async execute(message: Message): Promise<void> {
	    try{ 
		if(message.mentions.channels.map(m => m).length){
			//pass;
		}else{
                        await message.reply("you must specifiy a valid channel including the #")
                        return;
                }
		let channelTemp = message.mentions.channels.first()
		let channelId = `${channelTemp.id}`
		let channelInfo = await getisland(channelId)
		if(!channelInfo) {
			message.reply('Channel is not assigned')
			return;
		}
		let confirmEmbed = new EmbedBuilder()
                    .setTitle("Staff Channel Manager: Unassign Channel")
                    .setDescription("Unassigning a channel is permenant and unrecoverable") 
                    .setColor('#097969')

        	const row: any = new ActionRowBuilder()
        		.addComponents(
                		new ButtonBuilder()
                        		.setCustomId("confirm_uc")
                        		.setLabel("Confirm")
                        		.setStyle(ButtonStyle.Primary)
                        		.setEmoji("✅"),
                		new ButtonBuilder()
                        		.setCustomId("cancel")
                        		.setLabel("Cancel")
                        		.setStyle(ButtonStyle.Danger)
            				.setEmoji("✖️")
			)

                await message.reply({embeds:[confirmEmbed], components: [row] });
                
	    }catch(err)
	    {console.log(err)}
    }
});
