import { ActionRowBuilder, 
	CommandInteraction, 
	EmbedBuilder, 
	Interaction, 
	Message, 
	MessageReaction, 
	ButtonBuilder, 
	ButtonStyle,
	TextChannel,
	ChannelType
} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { OPENAI_API_KEY} = require('../../../../ep_bot/extras/settings')
const OpenAI = require("openai");
const openai = new OpenAI({
          apiKey: OPENAI_API_KEY,
            });

export = {
    name: "makeimage",
    aliases: ["mi"],
    type: CommandTypes.PrefixCommand,
    async execute(message: Message): Promise<void> {
	try{
		if(message.channel.type !== ChannelType.GuildText) return;
		let imagecall = message.content.toString()
		message.channel.sendTyping();
                const completion = await openai.images.generate({
                        model:"dall-e-3",
                        prompt: `${imagecall}`,
                        size: "1024x1024",
                        style: "vivid",
                        quality: "standard",
                        n: 1,
                        user: `${message.author.id}`,
                        })
		let data = (`${completion.data[0].url}`)
                if(data.length < 20) {
                        await message.reply('no image generated')
			return;
                }
                else if(data.length > 21) {
			let embed = new EmbedBuilder()
				.setColor('#E91E63')
				.setAuthor({name:"Park Man AI", 
					    iconURL: "https://i.ibb.co/mTK77bJ/img-p-VG4b4qu8-MOOe4lz22zr-Fko-S.png"})
				.setImage(`${data}`)
				.setDescription(`download your image and post to <#1235663450152374272>`)
				.setTimestamp() 
			 const row: any = new ActionRowBuilder()
                        	.addComponents(
                                	new ButtonBuilder()
                                        	.setLabel("Download Image")
                                        	.setStyle(ButtonStyle.Link)
                                        	.setURL(`${data}`),
				)
                await message.channel.send({embeds:[embed], components: [row], });

               }
		
	}catch(err){
	    message.reply('Sorry, I cant generate this image for you.');
            console.log(err)}

	}
} as PrefixCommandModule;

