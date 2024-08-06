Adding a new server to parkman is not super difficult but there is no master veriable doc. Each command will need an edit. 

Informaiton you will need; 

1. The Guild ID
2. The global public role like 'verified'. This is what will be used when channel is unhidden 
3. The servers moderator, admin roles. If the server owner wannts to limit commands to just admins and not mods, you can set this. We just need one but isolating commands to specific roles, they shoudl be clear on
4. the channel cateogries that user commands will be allowed in 
5. the channel categories or channels that commands should be ran from 
6. the channel category where archived channels should go 
7. custom embeds for the server is up to whoever is adding them. Youll have to add logic for the embed to look for serverId 

where updates happen

GuildWhiteList
categoryWhiteList
roleWhitelist 

optional category white list is if you want to specify both category and channel whitelists. 

in command arrays that look for serverids and roles 
```
                const modRoleIdList: { [key: string]: string } = {
                        "1135995107842195550": "1148992217202040942",
                        "801822272113082389": "807826290295570432",
                 };
```
this logic needs to be changed everywhere in src/commands/chat and check src/components/buttons. This array will give permission for server mods to execute any command in any channel, even if there is no channel owner 

8. check all commands in src/commands/chat and src/components/buttons 
9. AI and AI Imaging making is isolated to Epic Park. If this feature is asked for talk to jennyb@ as there is a cost
10. Event pings are managed in a seperate bot on ~/ep_bot/index.events.only A new bot will have to be made if servers want the ability to turn on or off pings in specific channels 

11. ep will only assign channels to one owner. However, if you want multiple owners on a channel ( like to control a community channel with parkman). An example wold be if they want to lock or hide a channel using the command. You will have to manually insert the record into mysql.Maybe i might make this a command. 

12. slash commands are coming as of 8/5 

 
