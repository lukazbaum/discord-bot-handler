<h1 align="center"><b>Discord Bot Handler</b></h1>
<p align="center"><b>🚀 Elevate Your Discord Programming Experience with Advanced Features!</b></p>
<p align="center">
  Transform your Discord bot development with our advanced handler. It simplifies command management, event handling, and offers robust solutions for seamless bot operations.
</p>
<p align="center">
  <img src="https://img.shields.io/badge/node-v20.7+-228B22" alt="node - v20.7+">
  <img src="https://img.shields.io/badge/npm-v10.1+-orange" alt="npm - v10.1+">
  <img src="https://img.shields.io/badge/discord.js-v14.15.2-5865F2" alt="discord.js - v14.14.1">
  <img src="https://img.shields.io/badge/Maintenance-Active-green.svg" alt="Maintenance - Active">
</p>

## 🤔 Why?
- **Focused Development:** Craft your bot with intuitive tools that make development both enjoyable and powerful.

- **Rich Feature Set:** Equipped with a wide range of capabilities, from simple command structures to advanced functionalities.

- **TypeScript Powered:** Leverage TypeScript's robustness for error-free coding and enhanced performance.

- **Scalability Made Simple:** Designed for ease of use by beginners and adaptability for complex projects as you grow.

- **Cutting-Edge Updates:** Stay ahead with regular updates that incorporate the latest features of Discord.js.

- **Community-Driven Potential:** Join a growing platform where contributions from developers are welcomed, paving the way for shared learning and continuous enhancement.


## 🌟 Features
This Discord Bot comes packed with a variety of features designed to enhance your server's functionality and user experience:

- **Command Handling**
  - Slash Commands
  - Prefix Commands
  - Message Commands
  - Ping Commands
  - Autocomplete Commands
  - Context Menus

- **Component Handling**
  - Buttons
  - Select Menus
  - Modals

- **Event Handling**
  - Efficient and easy

- **Advanced Options**
  - Command Cooldowns
  - Many Command Options
  - Customizable Config

- **Automatic Intent Handling**
  - No need to specify Intents yourself

- **Utility Features**
  - Colored Message Builder
  - Discord Timestamp Formatter

- **And More...**
  - Continuously updated with new features and enhancements

## 🚀 Getting Started
Follow these steps to install and set up the Discord Bot Handler.

### 1. 📋 Prerequisites
Before you begin, ensure you have the following:
- Node.js (v20.7 or higher)
- npm (v10.1 or higher)
- A Discord Bot Application (see [Discord's developer portal](https://discord.com/developers/applications) to create a bot)
- Ensure the Discord Bot is configured with the `MESSAGE CONTENT` Privileged Gateway Intent enabled. You can set this in the Bot section under Settings on the [Discord's developer portal](https://discord.com/developers/applications).
**Note:** If you prefer not to use this intent, you have the option to disable it in the configuration file.
- Make sure the bot invite link includes the `applications.commands` scope to enable slash commands. Update the link in the OAuth2 section on the [Discord's developer portal](https://discord.com/developers/applications) if needed.

### 2. 📥 Cloning the Repository
Clone the repository using Git:
```bash
git clone https://github.com/lukazbaum/discordjs-command-handler
```
Alternatively, [download](https://github.com/lukazbaum/discordjs-command-handler/archive/refs/heads/master.zip) it as a ZIP file and extract it.

Navigate to the directory:
```bash
cd discord-bot-handler
```

### 3. 🔧 Installing Dependencies
Install the necessary Node.js packages:
```bash
npm install 
# or
yarn install
```

### 4. ⚙️ Configuration
Rename `.env.example` to `.env` in your project root and fill in your details:

The `CLIENT_ID` can be found in your Bot Application under OAuth2.
```text
CLIENT_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_discord_guild_id
```

When using Linux as operating system change this line in the `package.json` file:
```json
"compile": "npm run clean-windows && tsc",
```
to this
```json
"compile": "npm run clean-linux && tsc",
```

### 5. 🤖 Running the Bot
Use the following commands to compile and start your bot:

- Compile the Typescript project:
  ```bash
  npm run compile
  # or
  yarn run compile
  ```
- Start the compiled code:
  ```bash
  npm run start
  # or
  yarn run start
  ```
- Alternatively, run both compile and start with a single command:
  ```bash
  npm run cs
  # or
  yarn run cs
  ```

## 📚 Documentation
Explore the documentation for in-depth insights on using and optimizing the Discord Bot Handler in your projects.

### 🛠️ Command Arguments
Command arguments are optional settings that can be applied to each command to control its behavior. These settings allow for flexible command management, including permissions and usage restrictions. Here are the base command arguments you can use:

- `cooldown?`: Number of seconds to wait before the command can be used again. Defaults to no cooldown if not specified.
- `ownerOnly?`: If true, only the bot owner (as defined in the config) can use the command.
- `userWhitelist?`: Array of user IDs allowed to use the command. An empty array means no restrictions.
- `userBlacklist?`: Array of user IDs prohibited from using the command.
- `channelWhitelist?`: Array of channel IDs where the command can be used.
- `channelBlacklist?`: Array of channel IDs where the command cannot be used.
- `categoryWhitelist?`: Array of category IDs where the command can be used.
- `categoryBlacklist?`: Array of category IDs where the command cannot be used.
- `guildWhitelist?`: Array of guild IDs where the command can be used.
- `guildBlacklist?`: Array of guild IDs where the command cannot be used.
- `roleWhitelist?`: Array of role IDs allowed to use the command.
- `roleBlacklist?`: Array of role IDs prohibited from using the command.
- `optionalUserWhitelist?`: Array of user IDs optionally allowed to use the command.¹
- `optionalChannelWhitelist?`: Array of channel IDs optionally allowed to use the command.¹
- `optionalCategoryWhitelist?`: Array of category IDs optionally allowed to use the command.¹
- `optionalGuildWhitelist?`: Array of guild IDs optionally allowed to use the command.¹
- `optionalRoleWhitelist?`: Array of role IDs optionally allowed to use the command.¹
- `nsfw?`: If true, the command can only be used in age-restricted (NSFW) channels.
- `disabled?`: If true, the command won't be registered and thus, will be unavailable for use.

¹ **Note on Optional Whitelists**:
When using optional whitelists, the command will be allowed to execute if any one of the optional whitelist conditions is met.

#### 🛠️ Example Usage:
```typescript
export = {
    cooldown: 10,
    ownerOnly: false,
    channelWhitelist: ["123456789012345678", "987654321098765432"]
    // ... other arguments
} as SlashCommandModule;
```

### ⚔️ Slash Commands
Below is an example of a typical Slash Command module:

```typescript
interface SlashCommandModule {
  type: CommandTypes.SlashCommand;
  register: RegisterTypes;
  data: SlashCommandBuilder;
  execute: (...args: any[]) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}
```

- `type: CommandTypes.Slashcommand`: Identifies the command as a slash command.
- `register: RegisterTypes`: Determines where the command should be registered. Use `.Guild` for server-specific commands or `.Global` for commands available across all servers where the bot is present.
- `data: SlashcommandBuilder`: Defines the command's details, including name, description, and options. You can also set permissions required to use the command here.
- `execute: (interaction: CommandInteraction) => Promise<void>`: The function that will be executed when the Slash Command is triggered.
- `autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>`: A function for handling autocomplete interactions.

#### ⚔️ Example Slash Command:
Here's a practical example of a Slash Command:

```typescript
export = {
  type: CommandTypes.SlashCommand,
  register: RegisterTypes.Guild,
  data: new SlashCommandBuilder()
          .setName("ping")
          .setDescription("Replies with pong!")
          .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({ content: "Pong" });
  }
} as SlashCommandModule;
```

### 🔧 Prefix/Ping/Message Commands
Prefix, Ping and Message Commands follow the same structure. Below is an example of a typical Prefix Command module:

```typescript
interface PrefixCommandModule {
  name: string;
  aliases?: string[];
  permissions?: string[];
  type: CommandTypes.PrefixCommand;
  execute: (message: Message) => Promise<void>;
}
```

- `name`: Specifies the unique name of the command.
- `aliases?`: An array of alternative names for the command. Use these to provide users with flexibility in invoking the command.
- `permissions?`: An array of required permissions for using the command. Define the necessary permissions to control access to the command.
- `type: CommandTypes.PrefixCommand`: Identifies the command as a prefix command (`.PingCommand` or `.MessageCommand`).
- `execute: (message: Message) => Promise<void>`: The function that will be executed when the Command is triggered.

#### 🔧 Example Prefix Command:
Here's a practical example of a Prefix Command:

```typescript
export = {
  name: "pong",
  aliases: ["poong"],
  type: CommandTypes.PrefixCommand,
  async execute(message: Message): Promise<void> {
    await message.reply("Ping!");
  }
} as PrefixCommandModule;
```

### 📑 Context Menus
Context Menus in Discord bots allow users to interact with your bot through right-click context options in the Discord interface. Just like with other commands, standard command arguments can be applied to Context Menus for added flexibility and control. Here is a typical structure of a Context Menu module:

```typescript
interface ContextMenuCommandModule {
  type: CommandTypes.ContextMenu;
  register: RegisterTypes;
  data: ContextMenuCommandBuilder;
  execute: (interaction: ContextMenuCommandInteraction) => Promise<void>;
}
```
- `register: RegisterTypes`: Determines where the command should be registered. Use `.Guild` for server-specific commands or `.Global` for commands available across all servers where the bot is present.
- `type: CommandTypes.ContextMenu`: Identifies the command as a context menu.
- `data: ContextMenuCommandBuilder`: Defines the command's details, including name, description, and options. You can also set permissions required to use the command here.
- `execute: (interaction: ContextMenuCommandInteraction) => Promise<void>`: The function that will be executed when the Context Menu is triggered.

#### 📑 Example Context Menu:
Here's a practical example of a Context Menu:

```typescript
export = {
  type: CommandTypes.ContextMenu,
  register: RegisterTypes.Guild,
  data: new ContextMenuCommandBuilder()
          .setName("Get Message ID")
          .setType(ApplicationCommandType.Message),
  async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
    await interaction.reply({ content: `Message ID: ${interaction.targetId}` });
  }
} as ContextMenuCommandModule;
```

### 🗃️ Components
On Discord, Components are interactive elements like buttons, select menus, and modals that enhance user interaction. These can be implemented individually or grouped for complex interactions. Below is a typical structure of a Component module:

```typescript
interface ComponentModule {
  id?: string;
  group?: string;
  type: ComponentTypes;
  execute: (interaction: any) => Promise<void>;
}
```
- `id?`: Specifies a unique identifier (customId) for the component.
- `group?`: Defines the group to which the component belongs, aiding in group handling.
- `type: ComponentTypes`:  Identifies the type of the component (Button, SelectMenu, Modal).
- `execute: (interaction: any) => Promise<void>`: The function that will be executed when a user interacts with the component.

#### 🗃️ Example using ids:

**Creating and sending a button:**

This example creates a button with a specific id for distinct handling.

```typescript
const row: any = new ActionRowBuilder()
        .addComponents(
                new ButtonBuilder()
                        .setCustomId("deleteMessage")
                        .setLabel("Delete message")
                        .setStyle(ButtonStyle.Danger)
        );
await interaction.reply({ content: "Example", components: [row] });
```

**Handling the button interaction:**

The following code handles the interaction for the previously created button.
```typescript
export = {
  id: "deleteMessage",
  type: ComponentTypes.Button,
  async execute(interaction: ButtonInteraction): Promise<void> {
    await interaction.message.delete();
  }
} as ComponentModule;
```

#### 🗃️ Example using groups:

**Creating and sending grouped buttons:**

For buttons that are part of a group, the group name is prepended to the customId for easy identification and handling.
```typescript
const row: any = new ActionRowBuilder()
        .addComponents(
                new ButtonBuilder()
                        .setCustomId("group=subscription;confirm")
                        .setLabel("Click to confirm")
                        .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                        .setCustomId("group=subscription;cancel")
                        .setLabel("Click to cancel")
                        .setStyle(ButtonStyle.Secondary)
        );
await interaction.reply({ content: "Example", components: [row] });
```

**Handling grouped button interactions::**

This example shows how to handle interactions for buttons that are part of a group.
```typescript
export = {
  group: "subscription",
  type: ComponentTypes.Button,
  async execute(interaction: ButtonInteraction): Promise<void> {
    if (interaction.customId === "confirm") {
      await interaction.reply({ content: "Pressed confirm" });
    } else if (interaction.customId === "cancel") {
      await interaction.reply({ content: "Pressed cancel" });
    }
  }
} as ComponentModule;
```
This approach allows for more organized and scalable interaction handling, especially when dealing with multiple components grouped under a single category or function.

The examples provided for handling button interactions are also applicable to select menus and modals, which can be found in the code.

### 🎉 Events
Below is an example of a typical Event module:

```typescript
interface EventModule {
  name: Events;
  once?: boolean;
  execute: (...args: any[]) => Promise<void>;
}
```
- `name: Events`: Specifies the type of event to handle, as defined in the `Events` enum.
- `once?`: If set to true, the event will be executed only once.
- `execute: (...args: any[]) => Promise<void>`: The function that will be executed when the specified event occurs.

#### 🎉 Example Event:
Here's an example handling the `ClientReady` event:

```typescript
export = {
  name: Events.ClientReady,
  once: true,
  async execute(client: DiscordClient): Promise<void> {
    if (!client.user) return;

    client.user.setStatus(UserStatus.ONLINE);
    client.user.setActivity("Development", { type: ActivityType.Watching });
    Logger.log(`Ready! Logged in as ${client.user.tag}`);
  }
} as EventModule;
```

### 🌈 Colored Message Builder
The `ColoredMessageBuilder` class is designed to enhance the visual appeal of your Discord bot's messages. It allows for various text formatting options, including text color, background color, and styling. This feature can be particularly useful for highlighting important information or making responses more engaging.

#### 🌈 Example usage:

```typescript
const msg: string = new ColoredMessageBuilder()
        .add("Hello, ", Color.Red)
        .add("World!", Color.Blue, BackgroundColor.DarkBlue, Format.Underline)
        .addNewLine()
        .addRainbow("This is cool!", Format.Bold)
        .build();
```

Alternatively, for simpler text formatting needs, you can use the `colored` or `rainbow` functions:

```typescript
const simpleColoredMsg = colored("Simple Colored Message", Color.GREEN);
const simpleRainbowMsg = rainbow("Simple Rainbow Message");
```

### 🔨 Utility
The `formatTimestamp` function simplifies timestamp formatting for Discord, ensuring 
a user-friendly display of time in your bot's messages. All possible format styles are
supported and can be found in the source code.

#### 🔨 Example usage:
```typescript
const discordTimestamp = formatTimestamp(unixTimestamp, TimestampStyle.ShortDate);
```
**Output:** `01/23/2024`

## 📝 License
This project is licensed under the [MIT] License, chosen for its permissive nature, allowing developers to freely use, modify, and distribute the code.
See the [LICENSE](LICENSE) file for details.

## 👥 Contributing
Contributions & Issues are welcome! Please follow our [Contribution Guidelines](.github/CONTRIBUTING.md).

## 📜 Code of Conduct
For a detailed understanding of our community's values and standards, please refer to our [Code of Conduct](.github/CODE_OF_CONDUCT.md).
We are committed to building a welcoming, inclusive, and respectful community.


## ✨ Showcase Your Project
Are you using our handler in your open-source bot? We'd love to feature it!
Let's highlight the fantastic work you've achieved with our Discord Bot Handler.

To share your project details, connect with us on [Discord](https://discord.com/users/lukasbaum). We're excited to showcase your
creation to the community.

## ❤️ Show Your Support
If you find the Discord Bot Handler useful, please consider giving it a star on GitHub. This not only
helps us understand which projects the community values, but also increases the visibility of our
work. Your support means a lot!

🌟 Star us on GitHub — it helps!
