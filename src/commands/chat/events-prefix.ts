import { Message } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { getisland,  enableevents, isOwner} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "events",
    aliases: ["enableevents", "ee", "event"],
    type: CommandTypes.PrefixCommand,
    // 1113339391419625572 - Epic Wonderland
    // 801822272113082389 - Epic
    // 1135995107842195550 - Epic Park
    guildWhitelist: ['1135995107842195550', '801822272113082389','1113339391419625572'],
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1147864509344661644','807811542057222176',
                    '1113407924409221120'], // epic wonderland staff
    categoryWhitelist: ['1147909067172483162',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1147909282201870406',
                        '1147909200924643349',
                        '1137072690264551604',
                        '1140190313915371530',
                        '1203928376205905960',
                        '1232728117936914432',
                        '1192106199404003379',
                        '1192108950049529906',
                        '1225165761920630845',
                        '966458661469839440',
                        '825060923768569907'
                        '1113414355669753907'], // epic wonderland staff
    async execute(message: Message): Promise<void> {
	try{
		let getOwner = await isOwner(message.author.id)
        let checkStaff = await  message.guild.members.cache.get(message.author.id)
        let channel = message.channel.id
        let serverId = message.guild.id
                //handles null values
        let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel)

        // object is guildId:RoleId

        const modRoleList: { [key: string]: string } = {
            "1135995107842195550": "1148992217202040942", // epic park
            "801822272113082389": "807826290295570432",   // epic
            "1113339391419625572":"1113407924409221120", // epic wonderland staff
        };

        const roleId = Object.entries(modRoleList).find(([key, val]) => key === serverId)?.[1];

        if(!checkOwner){
            if(!(checkStaff.roles.cache.has(roleId))){
                await message.reply('you must be an owner/cowner of this channel to run this command')
                    return;
            }else if(checkStaff.roles.cache.has(roleId)){
                console.log("Clear Ran In: ", message.channel.id, "by", message.author.id)
            }
        }

        let is = await getisland(message.channel.id)
        	if(!is){ 
			    await message.reply("This channel isn't assigned to a user.")
		}else{
	       		await enableevents(message.channel.id)
        		await message.reply("eRPG/Idle Event Alerts Are Enabled use `ep noevents` to disable")
		}
	}catch(err)
  	{console.log(err)}
    }
} as PrefixCommandModule;
