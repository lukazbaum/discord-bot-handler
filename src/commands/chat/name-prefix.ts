import { Guild,  Message, Emoji, GuildChannel, ChannelType, TextChannel } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";

export = {
    name: "name",
    aliases: [],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    disabled: true, 
    async execute(message: Message): Promise<void> {
	  if(message.channel.type !== ChannelType.GuildText) return;
	  let emojicatch = ":"
	  let newName = ""
	  let stringContent = message.content.toString(),
		  word = "name",
		  substring = '';
    	  if(stringContent.indexOf(word)  -1) {
		  newName = stringContent.substr(stringContent.indexOf(word) + word.length);
	  }
	  if(Number(newName.length) < 1){
		  message.reply("Please specify the name")
		  return;
	  }
	  const regex = new RegExp("(?<=:)[a-zA-Z0-9@._]+(?=:)", 'i')
	  let m;
	                    //@ts-ignore
	  let emojiFind = [ ]
	  if((m = regex.exec(newName)) !== null) {
		  m.forEach((emoji, groupIndex) => {
			  emojiFind.push({name: `${emoji}`, id:null, unicode: null})
			  });
	  }
	  //@ts-ignore
		let emojis = message.guild.emojis.cache.map(e => e.toString()).join(" ")
	   	console.log(JSON.stringify(emojis))

		  //await message.channel.setName(`${newName}`)
    }
} as PrefixCommandModule;
