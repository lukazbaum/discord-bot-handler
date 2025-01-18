import {
	Message,
	ChannelType,
	EmbedBuilder,
} from "discord.js";
import {PrefixCommand} from "../../handler";

export default new PrefixCommand({
	name: "rolecheck",

	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767'],
	allowedRoles: ["1148992217202040942",
		'1113407924409221120', // epic wonderland staff
		'845499229429956628', // Blackstone Staff
		],

	optionalAllowedCategories: [
		"1147909067172483162",
		"1147909156196593787",
		"1147909539413368883",
		"1147909373180530708",
		"1147909282201870406",
		"1147909200924643349",
		"1140190313915371530",
		'1113414355669753907',// epic wonderland staff
		'967657150769942578', // Blackstone Staff

	],
	optionalAllowedChannels: [
		"1147233774938107966",
		"1138531756878864434",
		"1151411404071518228",
	],
	async execute(message: Message): Promise<void> {
		try {
			if (message.channel.type !== ChannelType.GuildText) return;

			let messageContent = message.content.toString().toLowerCase().trim();
			let getRoleInput;

			console.log(messageContent)


			getRoleInput = message.content.toString().toLowerCase().trim();
			if (!getRoleInput) {
				await message.reply("usage: `ep rolecheck rolename/ID`");
				return;
			}

			let roleId: string | undefined;
			let roleName: string | undefined;

			// Check if input is a role ID (numeric value)
			if (!isNaN(Number(getRoleInput))) {
				roleId = getRoleInput;
				let role = message.guild.roles.cache.get(roleId);
				if (role) {
					roleName = role.name;
				}
			} else {
				// Otherwise, find by role name
				let role = message.guild.roles.cache.find(
					(r) => r.name.toLowerCase() === getRoleInput.toLowerCase()
				);
				if (!role) {
					await message.reply("Role name or ID is invalid");
					return;
				}
				roleId = role.id;
			}

			// Check permissions for the role in the channel
			let permissions = message.channel.permissionsFor(roleId);
			if (!permissions) {
				await message.reply("Unable to retrieve permissions for the specified role.");
				return;
			}

			let permArray = permissions.toArray();
			let permissionList = "";

			for (let i = 0; i < permArray.length; i++) {
				permissionList = permissionList.concat(`\n> ✅ - **${permArray[i]}**`);
			}

			let embed = new EmbedBuilder()
				.setTitle("Staff Manager: Role Permission In Channel Info")
				.setDescription(`__Role__: **${roleName}**\n__Permission List__:\n${permissionList}`);

			await message.reply({ embeds: [embed] });
		} catch (err) {
			console.log(err);
		}
	},
});
