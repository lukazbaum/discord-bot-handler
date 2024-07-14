import {  Role, BitField, PermissionsBitField, GuildChannel, GuildMember,  ChannelType, Message, ChannelManager,  EmbedBuilder} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getCoChannels, getcowners, checkisland, bannedusers, addedusers, getisland } = require('/home/ubuntu/ep_bot/extras/functions');
const { amarikey } = require('/home/ubuntu/ep_bot/extras/settings')
const { AmariBot } = require("amaribot.js");
const amariclient = new AmariBot(amarikey);

export = {
    name: "boostercheck",
    aliases: ["bc", "boosts"],
    type: CommandTypes.PrefixCommand,
    roleWhitelist:["1148992217202040942"],
    CategoryWhitelist: ["1137072690264551604","1140190313915371530"],
    async execute(message: Message): Promise<void> {
    try{
	    if(message.channel.type !== ChannelType.GuildText) return;

	    let boosterUsers = [ ]
	    let boosterChannels = [ ]

	    let getUsers = message.guild.roles.cache.get('1142141020218347601').members.map(m=>m.user.tag);
	    for(let i = 0; i < getUsers.length; i++) {
		    let userTag = getUsers[i] 
		    const member = message.guild.members.cache.find(member => member.user.tag === userTag);
		    const getChannel = await checkisland(member.user.id)
		    boosterUsers.push([member.user.tag, getChannel.channel])

	    }
	   // let Channel = message.guild.channels.cache.find(x => x.parent.id === "1147909067172483162") 


	    let getChannels = message.guild.channels.cache.get("1147909067172483162")



    }catch(err)
    {console.log(err)}
  }
} as PrefixCommandModule;
