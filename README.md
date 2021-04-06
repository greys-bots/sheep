# Sheep
*A color changing bot for Discord*

**Sheep** was created as an alternative to Hex, as Hex was recently deleted. The bot can be used like Hex to create custom color roles for users in your server.

## Getting Started
Use [this link](https://discordapp.com/api/oauth2/authorize?client_id=585271178180952064&permissions=268495936&scope=bot) to invite Sheep to your server. After this, make sure they can see messages, manage roles, embed links, and read whatever channel you plan to use them in.

You can use `s!help` to get a rundown of the commands, or visit their website [here](https://sheep.greysdawn.com)

If you've previously used Hex and still have the roles it creates, you can use `s!cu` to remove the USER- prefix on all of them, making them work with Sheep

## Features
### Color changing
Sheep's primary function is to change username colors in servers. It accomplishes this using short, easy commands (like `s!c`) with plenty of flexibility.  
When changing your color, you can use hex, hsv/l, rgb, and color names from [this list](https://www.w3schools.com/colors/colors_names.asp).

It also comes with the added bonus of previewing colors using a sheep. Who doesn't like those?

### Saving colors
On top of the color names mentioned before, you can also create your own names to use! The `s!save` command allows you to save color values (eg. hex codes) to use with a friendly name. You even have the option to overwrite existing color names if you prefer a certain hex over the default one.  
On top of this, you can export and import colors, making it easy to share your presets between friends and alternate accounts.

### Role linking
You can link your color role to another user's, so that you both share it. This means that both of you can control what the color is for both of your accounts. This is primarily intended for users with multiple accounts, but can be used for other reasons as wel.

### Server-based colors
Sheep uses *user-based* colors by default. What this means is that everyone gets a color role specifically for them (aside from linking). If this puts too much strain on your server's role list, you can switch to using *server-based* colors.

Server-based colors are a set of roles that users have to choose from. Think of it a bit like self roles, but intended specifically for colors. To get set up, use `s!tg` to toggle to server-based roles, then start setting them up with `s!rl`.

### Automatic hoisting
When using user-based colors, roles are automatically moved below any role with `sheep` in its name that the bot has been given. In most cases, this is the role automatically created when the bot is invited; however, you can also create a custom role for this. Put that role wherever you want colors to be and the bot should move them up automatically!

### Automatic cleanup
User-based colors should automatically be deleted once a member leaves a server. Saves you lots of time *and* lots of headaches!

## Self hosting
### Requirements
**Node:** 14.0 or higher  
**Postgres:** any version  
**Tech:** a VPS or a computer that's always online  
You'll also want some basic know-how when it comes to coding, especially if you plan to make changes

### Steps
(Assuming you have all the requirements set up)
1. Download this repository and unzip (if applicable) to wherever you want it
2. Open a terminal in the root folder and use `npm i` to install dependencies
3. Copy the `.env.example` rename it to `.env`. Fill it with the correct values
4. Use `node bot` to run the bot

You're all set! The bot should now be working.

## Support and Contact
If you're having trouble with the bot, feel free to join the support server [here](https://discord.gg/EvDmXGt) or send us a friend request at (GS)#6969 on Discord

If you'd like to support *us*, check out these links:  
[patreon](https://patreon.com/greysdawn)  
[ko-fi](https://ko-fi.com/greysdawn)
