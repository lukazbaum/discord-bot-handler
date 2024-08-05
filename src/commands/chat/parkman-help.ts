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
			.setAuthor({ name: `🧩 Parkman Commands `})
        		.setFooter({ text: `🧩 Parkman Help`})
			.setColor(`#097969`)
			.setDescription("Parkman commands all start with `ep <commandName>` \n\nChannel command availability is based on Server Availability.\n\nstaff specific commands are found in `ep help staff` \n"
			)
			.addFields(
				{name:"➡ Channel Favorites List", value: "> favs, chanfav, ch, chfav, fav", inline:false},
				{name:"➡ Add Channel Favorites", value: "> addfav, Addfav", inline:false},
				{name:"➡ Remove Channel Favorites", value: "> addfav, Addfav", inline:false},
				{name:"➡ Use AI Chat", value: "> ai, askai, askme, ask", inline:false},
				{name:"➡ Use AI Image Maker", value: "> makeimage, mi", inline: false},
				{name:"➡ Server Emojis", value: "> emojis, emojilist, allemojis", inline: false},
				{name:"➡ Gratitude Scoreboard", value: "> score, scores, myscore, ms", inline: false},
				{name:"➡ Give Love", value: "> love, loves, gl, givelove", inline: false},
				{name:"➡ Give Hugs", value: "> hug, Hug, hugs, gh", inline: false},
				{name:"➡ Give Thanks", value: "> thanks, thank, thankyou, ty", inline: false},
				{name:"➡ Give Bonks", value: "> Bonks, bonk, bonkyou, by", inline: false},
			)


		let userpage2 = new EmbedBuilder ()
			.setTitle("Parkman Help: Channel Commands pt. 2")
                        .setAuthor({ name: `🧩 Channel Owner Commands `})
                        .setFooter({ text: `🧩 Parkman Help`})
			.setColor(`#097969`)
                        .setDescription("parkman commands all start with `ep <commandName>` \n\n"
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
                        .setAuthor({ name: `🧩 Channel Owner Commands`})
                        .setFooter({ text: `🧩 Parkman Help`})
                        .setDescription("parkman commands all start with `ep <commandName>` \n\n>" 
                                       )
                        .setColor(`#097969`)
                        .addFields(
                                {name:"➡ Add User To Channel", value: "> useradd, adduser, Adduser, au", inline:false},
                                {name:"➡ Ban User/Bot From  Channel", value: "> ban, Ban", inline:false},
                                {name:"➡ Remove User From Channel", value: "> removeuser, Removeuser, remuser, rem", inline:false},
                                {name:"➡ Pin Message", value: "> pin, pinn, Pin", inline:false},
                                {name:"➡ Remove Pin", value: "unpin, Unpin, removepin", inline:false},
                                {name:"➡ Add Channel Cowner", value: "> addcowner, Addcowner, addowner, addco", inline:false},
                                {name:"➡ Remove Channel Cowner", value: "> removeco, removecowner, rmco, remoco", inline:false}
                        )

		let userpage4 = new EmbedBuilder ()
			.setTitle("Parkman Help: Channel Commands pt. 4")
                        .setAuthor({ name: `🧩 Parkman Channel Owner Commands `})
                        .setFooter({ text: `🧩 Parkman Help`})
                        .setColor(`#097969`)
                        .setDescription("parkman commands all start with `ep <commandName>` \n\n>" 
                                       )
			.addFields(
                                {name:"➡ Change Channel Description", value: "> desc", inline:false},
                                {name:"➡ Change Channel Name ex. `ep name # ✅ channelname`", value: "> name", inline:false},
                                {name:"➡ Upgrade Channel", value: "> upgrade, Upgrade, up", inline:false},
				{name:"➡ Slowmode On", value: "> slowmode, smon, Slowmodeon, slowon", inline:false},
				{name:"➡ Slowmode Off", value: "> slowmodeoff, smoff, Slowmodeoff, slowoff", inline:false},
				{name:"➡ Message Clear", value: "> clear, Clear, delete, clear", inline:false},
                        )

		let staffpage1 = new EmbedBuilder ()
		 	.setTitle("Parkman Help: Staff Commands pt. 1")
                        .setAuthor({ name: `🧩 Parkman Staff Help `})
                        .setFooter({ text: `🧩 Parkman Help`})
                        .setColor(`#097969`)
                        .setDescription("parkman commands all start with `ep <commandName>` \n\nStaff Members have access to all user commands\n\nCommands listed here are for staff members only\n\n >Not All Commands Are Enabled By Default"
			)
			.addFields(
				{name:"➡ User Information", value:"> userinfo, ui, chaninfo, Chaninfo (will take both @user & #channelname", inline:false},
				{name:"➡ Channel Quaruntine", value:"> quaruntine, Quaruntine, qch", inline:false},
				{name:"➡ Channel Recover", value: "> recover, Recover, rch, rc", inline:false},
				{name:"➡ Channel Unassign (unrecoverable)", value: "> unassign, uc, uch"},
				{name:"➡ Channel Assign: ex: `ep assign @user # ✅ channelname`", value: "> assign, Assign, ac, assignchannel, assignch", inline:false},
				{name:"➡ Channel List: lists all channels and their non-pinged owners", value:"> channellist, Channellist, cl", inline:false},
			)
		let staffpage2 = new EmbedBuilder()
			.setTitle("Parkman Help: Staff Commands pt. 2")
                        .setAuthor({ name: `🧩 Parkman Staff Help `})
                        .setFooter({ text: `🧩 Parkman Help`})
                        .setColor(`#097969`)
			.addFields(
                                {name:"➡ Channel Role Check: checks a specific roles permission in channel", value: "> rolecheck", inline:false},
                                {name:"➡ Channel Clear Messages: Bulk deletes a specified amount of messages in a channel", value: "> clear, delete", inline:false},
                                {name:"➡ Channel Upgrades: moves channel to appropriate area", value: "> staffupgrade, sup, changecat ", inline:false},
                                {name:"➡ Booster Channel Audit: Audits Booster Channels", value: "> boostercheck, bc, boosts", inline:false},
                                {name:"➡ Server Ban User", value:"> banserver, bs, serverban, sb", inline:false},
                                {name:"➡ Remove Server Ban", value:"> removeserverban, ub, rsb, ubuser, usb, sub", inline:false},
			)


		const userpages = [userpage1, userpage2, userpage3, userpage4]		
		const staffpages = [staffpage1, staffpage2, userpage1, userpage2, userpage3, userpage4]
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

