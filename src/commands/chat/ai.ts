import { CommandInteraction, EmbedBuilder, Interaction, Message, MessageReaction, ButtonBuilder, ButtonStyle } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { OPENAI_API_KEY } = require('../../../../ep_bot/extras/settings')
const OpenAI = require("openai");
const openai = new OpenAI({
          apiKey: OPENAI_API_KEY,
                });

export = {
    name: "askai",
    aliases: ["ai", "askme", "ask"],
    type: CommandTypes.PrefixCommand,
    async execute(message: Message): Promise<void> {
	try{
		let progress_bar = await message.channel.send('Progress: =>..');
	   	const completion = await openai.chat.completions.create({
                	 model: "gpt-4o",
                        	messages:[{
                        	role:"system",
                        	content:"Describe the desired AI characteristics, knowledge base, personality, how questions should be answered",},
                        {
                        	role:"user",
                        	content:"Who won the 2020 world series?"},{
                        	role:"assistant",
                        	content:"Los Angeles Dodgers"},{
                        	role:"user",
                        	content:"Where was the 2020 world serie played?"},{
                        	role:"assistant",
                        	content:"Texas"},{
                        	role:"user",
                        	content:"Where there spectators at the 2020 world series"},{
                       	 	role:"assistant",
                        	content:"Due to Covid Lockdowns, no spectators were at the world series"},{
                        	role:"user",
                        	content:`${message}`},
                        	],
                	});
		await progress_bar.edit('Progress: ====>...');
 		let data = (`${completion.choices[0].message.content}`);
		let dataCompleteReason = (`${completion.choices[0].finish_reason}`)

		await progress_bar.edit('Progress: ======>.');
         	if (data.length < 2000) {
          		await message.reply(`${data}`)
          	}else if (data.length > 2000){
          		let partOne = data.substring(0,2000);
          		let partTwo = data.substring(2000,4000);
			let partThree = data.substring(4000,6000);
          		await message.reply(`${partOne}`);
          		await message.reply(`${partTwo}`);
          		await message.reply(`${partThree}`);
          	}
		if(dataCompleteReason === 'content_filter'){
			await message.reply('response was edited or failed due to content filters')
		}
		console.log(dataCompleteReason)
		await progress_bar.edit(`query finished`);
	
	}catch(err) {
	    await message.reply('query failed');
        	console.log(err)}

	}
} as PrefixCommandModule;

