const fs = require("fs-extra");
const path = require("path");
const https = require("https");

module.exports = {
  config: {
    name: "prefix",
    version: "18.0",
    author: "Hridoy",
    description: "Advanced Prefix System",
    category: "Utility"
  },

  // ================= START =================
  onStart: async function ({ message, event, api, args }) {

    const prefixFile = path.join(__dirname, "prefixData.json");

    // Create prefix data file
    if (!fs.existsSync(prefixFile)) {
      fs.writeFileSync(prefixFile, JSON.stringify({}, null, 2));
    }

    // Get Prefix
    const getPrefix = (threadID) => {
      const data = JSON.parse(
        fs.readFileSync(prefixFile)
      );

      return (
        data[threadID] ||
        global.GoatBot.config.prefix ||
        "."
      );
    };

    // Set Prefix
    const setPrefix = (threadID, newPrefix) => {
      const data = JSON.parse(
        fs.readFileSync(prefixFile)
      );

      data[threadID] = newPrefix;

      fs.writeFileSync(
        prefixFile,
        JSON.stringify(data, null, 2)
      );
    };

    const botPrefix =
      global.GoatBot.config.prefix || ".";

    const groupPrefix =
      getPrefix(event.threadID);

    // ================= PREFIX SET =================
    if (args && args[0] === "set") {

      // Group Admin Check
      if (event.isGroup) {

        const threadInfo =
          await api.getThreadInfo(event.threadID);

        const isAdmin =
          threadInfo.adminIDs.some(
            item => item.id == event.senderID
          );

        if (!isAdmin) {
          return message.reply(
            "❌ | Only group admins can change prefix."
          );
        }
      }

      const newPrefix = args[1];

      if (!newPrefix) {
        return message.reply(
          "❌ | Example: prefix set !"
        );
      }

      // Save Prefix
      if (event.isGroup) {
        setPrefix(event.threadID, newPrefix);
      }
      else {
        global.GoatBot.config.prefix =
          newPrefix;
      }

      return message.reply(
        `✅ | Prefix Changed Successfully!\n\n🔹 New Prefix: ${newPrefix}`
      );
    }

    // ================= INFO =================
    const ping = event.timestamp
      ? Date.now() - event.timestamp
      : 0;

    const day = new Date().toLocaleString(
      "en-US",
      { weekday: "long" }
    );

    const BOTNAME =
      global.GoatBot.config.nickNameBot ||
      "KakashiBot";

    const BOTPREFIX = botPrefix;
    const GROUPPREFIX = groupPrefix;

    // ================= GIFS =================
    const gifs = [
      "https://i.imgur.com/zex8uo7.gif",
      "https://i.imgur.com/4ki8eBI.gif",
      "https://i.imgur.com/AMKQCJc.gif",
      "https://i.imgur.com/rkjO7YV.gif",
      "https://i.imgur.com/SgNPn8E.gif",
      "https://i.imgur.com/u3qB5y2.gif",
      "https://i.imgur.com/KUFxWlF.gif",
      "https://i.imgur.com/FV9krHV.gif",
      "https://i.imgur.com/lFrFMEn.gif",
      "https://i.imgur.com/KrEez4A.gif"
    ];

    // ================= TEXT STYLE =================
    const textFrames = [

`🌟╔══༶•PREFIX INFO•༶══╗🌟
🕒 Ping: ${ping}ms
📅 Day: ${day}
💠 Bot Prefix: ${BOTPREFIX}
💬 Group Prefix: ${GROUPPREFIX}
🤖 Bot Name: ${BOTNAME}
🌟╚═════༶• END •༶════╝🌟`,

`╭━━━•PREFIX STATUS•━━━╮
⏱ Ping: ${ping}ms
📆 Day: ${day}
🔹 Bot Prefix: ${BOTPREFIX}
🔹 Group Prefix: ${GROUPPREFIX}
🤖 Bot: ${BOTNAME}
╰━━━━━━━━━━━━━━━━╯`,

`┏━━━━ PREFIX INFO ━━━━┓
🕒 Ping: ${ping}ms
📅 Day: ${day}
💠 Bot Prefix: ${BOTPREFIX}
💬 Group Prefix: ${GROUPPREFIX}
🤖 Bot: ${BOTNAME}
┗━━━━━━━━━━━━━━━━┛`,

`╔════════════════════╗
      ✨ PREFIX SYSTEM ✨
╠════════════════════╣
🕒 Ping: ${ping}ms
📅 Day: ${day}
⚡ Bot Prefix: ${BOTPREFIX}
💬 Group Prefix: ${GROUPPREFIX}
🤖 Bot Name: ${BOTNAME}
╚════════════════════╝`
    ];

    const randomGif =
      gifs[Math.floor(Math.random() * gifs.length)];

    const randomText =
      textFrames[
        Math.floor(
          Math.random() * textFrames.length
        )
      ];

    // ================= CACHE =================
    const cacheFolder = path.join(
      __dirname,
      "cache"
    );

    if (!fs.existsSync(cacheFolder)) {
      fs.mkdirSync(cacheFolder);
    }

    const fileName =
      path.basename(randomGif);

    const filePath = path.join(
      cacheFolder,
      fileName
    );

    // ================= DOWNLOAD GIF =================
    if (!fs.existsSync(filePath)) {

      try {

        await new Promise(
          (resolve, reject) => {

            const file =
              fs.createWriteStream(filePath);

            https.get(randomGif, (res) => {

              if (res.statusCode !== 200) {
                return reject(
                  new Error(
                    "Failed to download gif"
                  )
                );
              }

              res.pipe(file);

              file.on("finish", () =>
                file.close(resolve)
              );

            }).on("error", (err) => {

              fs.unlink(filePath, () => {});
              reject(err);

            });
          }
        );

      }
      catch (e) {
        console.log(e);
      }
    }

    // ================= SEND =================
    return api.sendMessage(
      {
        body: randomText,

        attachment:
          fs.existsSync(filePath)
            ? fs.createReadStream(filePath)
            : null
      },

      event.threadID
    );
  },

  // ================= ON CHAT =================
  onChat: async function ({
    event,
    message,
    api
  }) {

    if (!event.body) return;

    const body =
      event.body.trim().toLowerCase();

    const currentPrefix =
      global.GoatBot.config.prefix || ".";

    // "." দিলে শুধু ছোট reply
    if (body === currentPrefix) {

      return message.reply(
        " 🎀> ιт'ѕ ʝυѕт му ρяєƒιχ"
      );
    }

    // prefix set !
    if (body.startsWith("prefix set")) {

      const args = body.split(" ");

      return this.onStart({
        message,
        event,
        api,
        args
      });
    }

    // এখানে "prefix" আর trigger হবে না
    // কারণ command নিজেই handle করবে
  }
};
