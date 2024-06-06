import { CommandInteraction, EmbedBuilder, Interaction, Message, MessageReaction, ButtonBuilder, ButtonStyle } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";

const page = require('discord-pagination-advanced');

export = {
    name: "help",
    aliases: ["halp", "parkmanhelp", "Help"],
    type: CommandTypes.PrefixCommand,
    async execute(message: Message): Promise<void> {
	try{

		let userpage1 = new EmbedBuilder ()
			.setTitle("Parkman Help Menu: Channel Commands pt. 1")
			.setAuthor({ name: `🧩 Epic Park User Help`})
        		.setFooter({ text: `🧩 Parkman Help`})
			.setColor(`#097969`)
			.setDescription("Parkman commands all start with `ep <commandName>` \n\nChannel command availability is based on channel category.\n\nall Epic Park Users can access the channel favorites and AI features\n\nstaff specific commands are found in `ep help staff` \n"
			)
			.addFields(
				{name:"➡ Channel Favorites List", value: "> favs, chanfav, ch, chfav, fav", inline:false},
				{name:"➡ Add Channel Favorites", value: "> addfav, Addfav", inline:false},
				{name:"➡ Remove Channel Favorites", value: "> addfav, Addfav", inline:false},
				{name:"➡ **coming soon** Use AI Chat", value: "> askai, askme, ask", inline:false},
				{name:"➡ **coming soon** Use AI Image Maker", value: "> images, aiimage, makeimage", inline: false},
			)


		let userpage2 = new EmbedBuilder ()
			.setTitle("Parkman Help: Channel Commands pt. 2")
                        .setAuthor({ name: `🧩 Epic Park User Help`})
                        .setFooter({ text: `🧩 Parkman Help`})
			.setColor(`#097969`)
                        .setDescription("parkman commands all start with `ep <commandName>` \n\n> **Skater Park**: Channel Info, Enable and Disable Events, Make Channel Public/Private, Lock Channel\n> **Picnic Pavilian**: All Above\n> **Adventure Trails**: All Above\n> **Tropical Lounge**: All Above\n> **Park Peaks**: All Above\n> **Booosters**: All Commands\n"
					)
			.addFields(
				{name:"➡ Channel Information ", value: "> info, channelinfo, chinfo, Info", inline:false},
				{name:"➡ Enable Events", value: "> events, enableevents, ee, event", inline:false},
                                {name:"➡ Disable Events", value: "> noevents, disableevents, de, disableevent", inline:false},
                                {name:"➡ Make Channel Private", value: "> hide", inline:false},
                                {name:"➡ Make Channel Public", value: "> unhide", inline:false},
                                {name:"➡ Lock Channel (messages from added users only) ", value: "> lock", inline:false},
                                {name:"➡ UnLock Channel (Make Public) ", value: "> unlock", inline:false},
			)

		let userpage3 = new EmbedBuilder ()
                        .setTitle("Parkman Help: Channel Commands pt. 3 ")
                        .setAuthor({ name: `🧩 Epic Park User Help`})
                        .setFooter({ text: `🧩 Parkman Help`})
                        .setDescription("parkman commands all start with `ep <commandName>` \n\n> **Skater Park**: Add Users, Remove Users, Pin\n> **Picnic Pavilian**: All Above\n> **Adventure Trails**: All Above\n> **Tropical Lounge**: All Above\n> **Park Peaks**: All Above + Add Channel Cowner/Remove Channel Cowner\n> **Booosters**: All Commands\n"
                                       )
                        .setColor(`#097969`)
                        .addFields(
                                {name:"➡ Add User To Channel", value: "> add, Add, adduser, Adduser", inline:false},
                                {name:"➡ Ban User/Bot From  Channel", value: "> ban, Ban", inline:false},
                                {name:"➡ Remove User From Channel", value: "> removeuser, Removeuser, remuser, rem", inline:false},
                                {name:"➡ Pin Message", value: "> pin, pinn, Pin", inline:false},
                                {name:"➡ Remove Pin", value: "unpin, Unpin, removepin", inline:false},
                                {name:"➡ Add Channel Cowner", value: "> addcowner, Addcowner, addowner, addco", inline:false},
                                {name:"➡ Remove Channel Cowner", value: "> removeco, removecowner, rmco, remoco", inline:false}
                        )

		let userpage4 = new EmbedBuilder ()
			.setTitle("Parkman Help: Channel Commands pt. 4")
                        .setAuthor({ name: `🧩 Parkman User Help `})
                        .setFooter({ text: `🧩 Parkman Help`})
                        .setColor(`#097969`)
                        .setDescription("parkman commands all start with `ep <commandName>` \n\n> **Skater Park**: Upgrade\n> **Picnic Pavilian**: All Above + Change Channel Name\n> **Adventure Trails**: All Above + Change Channel Description\n> **Tropical Lounge**: All Above\n> **Park Peaks**: All Above\n> **Booosters**: All Commands\n"
                                       )
			.addFields(
                                {name:"➡ Change Channel Description", value: "> desc", inline:false},
                                {name:"➡ Change Channel Name ex. `ep name # ✅ channelname`", value: "> name", inline:false},
                                {name:"➡ Upgrade Channel", value: "> upgrade, Upgrade, up", inline:false},
				{name:"➡ Slowmode On", value: ">slowmode, smon, Slowmodeon, slowon", inline:false},
				{name:"➡ Slowmode Off", value: ">slowmodeoff, smoff, Slowmodeoff, slowoff", inline:false},
                        )

		let staffpage1 = new EmbedBuilder ()
		 	.setTitle("Parkman Help: Staff Commands pt. 1")
                        .setAuthor({ name: `🧩 Parkman Staff Help `})
                        .setFooter({ text: `🧩 Parkman Help`})
                        .setColor(`#097969`)
                        .setDescription("parkman commands all start with `ep <commandName>` \n\nStaff Members have access to all user commands\n\nCommands listed here are for staff members only\n"
			)
			.addFields(
				{name:"➡ User Information", value:"> userinfo, ui, chaninfo, Chaninfo (will take both @user & #channelname", inline:false},
				{name:"➡ Channel Quaruntine", value:"> quaruntine, Quaruntine, qch", inline:false},
				{name:"➡ Channel Recover", value: "> recover, Recover, rch, rc", inline:false},
				{name:"➡ Channel Unassign (unrecoverable)", value: "> unassign, uc, uch"},
				{name:"➡ Channel Assign: ex: `ep assign @user # ✅ channelname`", value: "> assign, Assign, ac, assignchannel, assignch", inline:false},
				{name:"➡ Channel List: lists all channels and their non-pinged owners", value:"> channellist, Channellist, cl", inline:false},
				{name:"➡ Channel Role Check: checks a specific roles permission in channel", value: "> rolecheck", inline:false},
			)

		const userpages = [userpage1, userpage2, userpage3, userpage4]		
		const staffpages = [staffpage1, userpage1, userpage2, userpage3, userpage4]
		const options =  {
			timeout: 600000, 
    			deleteMessage: true, 
    			editReply: true, 
   			emojis: ["⬅", "➡", "❌", "⏮️", "⏭️",], 
   			buttonConfig: [ 
    			{
        			label: "Left",
        			style: "SECONDARY",
    			},
    			{
        			label: "Right",
        			style: "SECONDARY",
    			},
    			{
        			label: "Close",
        			style: "SECONDARY",
    			},
    			{
        			label: "First Page",
        			style: "SECONDARY",
    			},
    			{
       	 			label: "Last Page",
        			style: "SECONDARY",
    			}],
    			pageSkip: true, // enables the 5 button mode
		}

		let stringContent = message.content.toString()
                let commandName = stringContent.split("help")
		if(stringContent.endsWith("help")){
			page(message, userpages, options);
		}else if(commandName[0] === "staff"){
			page(message, staffpages, options);
		}else{
		 	page(message, userpages, options);
		}
	
	}catch(err)
        {console.log(err)}

	}
} as PrefixCommandModule;

