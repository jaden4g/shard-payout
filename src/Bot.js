import Discord from 'discord.js'

import path from 'path'

const channelId = '477915621649285120'

class Bot {
  constructor (botToken, sheet) {
    this.main = this.main.bind(this)

    this.botToken = botToken

    this.client = new Discord.Client()
    this.client.on("ready", async () => {
      this.channel = this.client.channels.get(channelId)

      await this.initializeBot()
      console.log('Bot initialized')
    })
    this.client.on("error", async e => {
      console.log(e);
    })
    this.client.on("reconnecting", async () => {
      console.log("Bot reconnecting");
    })
    this.client.on("disconnect", async e => {
      console.log(e);
      process.exit(1);
    })

this.client.login(botToken)

    this.sheet = sheet
    this.parsejson()

    this.main()
  }

  async main () {
    try {
      if (this.message) {
        this.calculateSecondsUntilPayout()
        await this.sendMessage()
      }
    } catch (err) {
      console.log(err)
    } finally {
      setTimeout(this.main, 60000 - Date.now() % 60000)
    }
  }

  async initializeBot () {
    const messages = await this.channel.fetchMessages()
    if (messages.array().length === 0) {
      try {
        this.message = await this.channel.send({embed: new Discord.RichEmbed()})
      } catch (err) {
        console.log(err)
      }
    } else {
      if (messages.first().embeds.length === 0) {
        await messages.first().delete()
        this.message = await this.channel.send({embed: new Discord.RichEmbed()})
      } else {
        this.message = messages.first()
      }
    }
  }

  parsejson () {
    this.mates = []
    for (let i in this.sheet) {
      const user = this.sheet[i]
      this.mates.push({
        name: user.Name,
        swgoh: user.SWGOH,
        payout: user.UTC.split(":").map(Number)
      })
    }
    const matesByTime = {}
    for (let i in this.mates) {
      const mate = this.mates[i]
      if (!matesByTime[mate.payout]) {
        matesByTime[mate.payout] = {
          payout: mate.payout,
          mates: []
        }
      }
      matesByTime[mate.payout].mates.push(mate)
    }
    this.mates = Object.values(matesByTime)
  }

  calculateSecondsUntilPayout () {
    const now = new Date()
    for (let i in this.mates) {
      const mate = this.mates[i]
      const p = new Date()
      p.setUTCHours(mate.payout[0], mate.payout[1])
      if (p < now) p.setDate(p.getDate() + 1)
      mate.timeUntilPayout = p.getTime() - now.getTime()
      let dif = new Date(mate.timeUntilPayout)
      const round = dif.getTime() % 60000
      if (round < 30000) {
        dif.setTime(dif.getTime() - round)
      } else {
        dif.setTime(dif.getTime() + 60000 - round)
      }
      mate.time = `${String(dif.getUTCHours()).padStart(2, '00')}:${String(dif.getUTCMinutes()).padStart(2, '00')}`
    }
    this.mates.sort((a, b) => {
      return a.timeUntilPayout - b.timeUntilPayout
    })
  }

  async sendMessage () {
    let embed = new Discord.RichEmbed().setColor(0x00AE86)
    let desc = '**Time until next payout**:'
    for (let i in this.mates) {
      let fieldName = `${this.mates[i].time}`
      let fieldText = ""
      for (let j in this.mates[i].mates) {
        const mate = this.mates[i].mates[j]
        // check to see if we've already added names
        if (fieldText.length > 0) {fieldText += "\n";}
        fieldText += `• [${mate.name}](${mate.swgoh})`
      }
      embed.addField(fieldName,fieldText,true)
    }
    embed.setDescription(desc)
    await this.message.edit({embed})
  }
}

export default Bot;
