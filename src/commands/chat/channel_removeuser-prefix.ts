import { GuildChannel, GuildMember,  ChannelType, Message, ChannelManager,  EmbedBuilder,  MessageMentions} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {isOwner, removeuser, removecowners, getisland, addedusers} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "removeuser",
    aliases: ["Removeuser", "remuser", "rem"],
    type: CommandTypes.PrefixCommand,
    // 1113339391419625572 - Epic Wonderland
    // 801822272113082389 - Epic
    // 1135995107842195550 - Epic Park
    guildWhitelist: ['1135995107842195550', '801822272113082389','1113339391419625572'],
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1246691890183540777', '807811542057222176',
                    '1113407924409221120'], // epic wonderland staff],
    categoryWhitelist: ['1147909067172483162',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1147909282201870406',
                        '1147909200924643349',
                        '1140190313915371530', 
  	                    '1203928376205905960',
                        '1232728117936914432',
                        '1192106199404003379',
                        '1192108950049529906',
                        '1225165761920630845',
                        '966458661469839440',
	    		        '808109909266006087',
                        '825060923768569907',
                        '1113414355669753907',// epic wonderland staff
                        '1113414451912257536', // epic wonderland booster
                        '1115072766878691428', // epic wonderland supreme land
                        '1151855336865665024' // epic wonderland supreme land 1
    ],
    async execute(message: Message): Promise<void> {
	try{
		if(message.channel.type !== ChannelType.GuildText) return;
                // This whole Block checks for the channel owner and if not channel owner
                 // if its not the channel owner, checks for the staff role
                 // if user is a staff member, they can run the command
                 // if user is a channel owner or a cowner on the channel / mentioned channel,
                 // then they are authorized.

        let getOwner = await isOwner(message.author.id)
        let checkStaff = await  message.guild.members.cache.get(message.author.id)
        let channel = message.channel.id
		let serverId = message.guild.id

                //handles null values
        let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel)

                // object is guildId:RoleId

        const modRoleList: { [key: string]: string } = {
            "1135995107842195550": "1148992217202040942",
            "801822272113082389": "807826290295570432",
            "1113339391419625572":"1113407924409221120", // epic wonderland staff
        };

        const roleId = Object.entries(modRoleList).find(([key, val]) => key === serverId)?.[1];

        if(!checkOwner){
            if(!(checkStaff.roles.cache.has(roleId))){
                await message.reply('you must be an owner/cowner of this channel to run this command')
                    return;

            }else if(checkStaff.roles.cache.has(roleId)){
                console.log("Remove user Ran In: ", message.channel.id, "by", message.author.id)
            }
        }

		let messageContent = message.content.toString().toLowerCase();
        let messageContentSplit = messageContent.split(" ");
        let userName = message.mentions.users.first();
        let id;
        if(!userName){
            if(Number.isInteger(Number(messageContentSplit[0]))){
                id = messageContentSplit[0]
            }else{
                await message.reply("please specify a valid userid or username")
                    return;
            }
        }else if(userName) {
            id = message.mentions.users.first().id
        }

		let cleanid = await id.replace(/\D/g, '');
        const checkAdds = await addedusers(message.channel.id)
        const channelInfo = await getisland(message.channel.id)
        const isAdded = checkAdds.some((added) => added.user === cleanid)
        const cownersArray = [channelInfo.cowner1,
                                    channelInfo.cowner2,
	    				            channelInfo.cowner3,
                                    channelInfo.cowner4,
                                    channelInfo.cowner5,
                                    channelInfo.cowner6,
                                    channelInfo.cowner7]
        const filteredOwners: string[] = cownersArray.filter((s): s is string => !!(s));
           
        let cowners = ' '
        let cownerRole = '1246691890183540777'

        if(id  === message.author.id){
            await message.reply("Seriously? <a:ep_bozabonk:1164312811468496916>")
		  	    return;
        }

        if(isAdded) {
	    		await removeuser(cleanid, message.channel.id)
        }

        Object.entries(channelInfo).forEach(([key, value]) => {
            cowners = cowners.concat(`${key}:${value},`)
		});

        let cownersTemp = cowners.split(",").map(pair => pair.split(":"));
        const result = Object.fromEntries(cownersTemp);

        function getOwners(obj, value) {
			return Object.keys(obj)
		    		.filter(key => obj[key] === value);
        }

        let remuser = getOwners(result, cleanid)
        if(remuser[0]){
            let ownerid = remuser[0].slice(-1)
		    	await removecowners(message.channel.id, ownerid)
        }
        await message.channel.permissionOverwrites.delete(cleanid)

        let embed = new EmbedBuilder()
            .setTitle("Channel Manager: Remove User")
			.setDescription(`<@!${cleanid}> has been removed
				 \n *to add user back use ep adduser*`)
			.setColor(`#097969`)

	   	await message.reply({embeds:[embed]})
	}catch(err)
  	{console.log(err)}
    },
} as PrefixCommandModule;
