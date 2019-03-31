# SWGOH Shard Payout

A Discord bot that parses a .json file to display payouts in a Discord channel

## Installation

- install the latest stable version of Node.js (https://nodejs.org/en/download/)
- download and unzip the repository
- run `npm install` in the repository's root folder
- visit www.discordapp.com/developers/applications/me and create a new application, then convert it to a bot
- copy your bot token from the Bot tab in Developer Portal
- make a file `src/secret.js` containing the string `export const botToken = 'Your bot token here'`
- add the bot to your Discord server (https://www.techjunkie.com/add-bots-discord-server/)
- make a dedicated channel for the payouts and give the bot full access to it
- enable dev options in Discord (User Settings -> Appearance -> Advanced)
- get the channel ID for the payout channel (right-click the channel and copy ID)
- go to `src/Bot.js` and change the value for `channelId` to the channel ID you just copied
- make your changes to the payouts.json file without changing its layout
- run `npm start`

OR

- (optional) if you want to run it indefinitely, I suggest using pm2:
  - run `npm i -g pm2` (only required on first run)
  - run `npm run compile` (only rquired after a payouts.json update)
  - run `pm2 start ./lib --name="swgoh-payout"`
