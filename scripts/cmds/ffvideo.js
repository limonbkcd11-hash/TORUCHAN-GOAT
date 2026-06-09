const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
        const response = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return response.data.mahmud;
};

module.exports = {
        config: {
                name: "ffvideo",
                version: "1.7",
                author: "Hridoy",
                countDown: 10,
                role: 0,
                description: "Free Fire video noprefix + command support",
                category: "Media"
        },

        langs: {
                en: {
                        wait: "Loading Free Fire video...",
                        noResult: "No video found!",
                        success: "Here is your Free Fire video 🔥",
                        error: "Error: %1"
                }
        },

        // ✅ REQUIRED (fix error)
        onStart: async function () {},

        // ✅ REAL NOPREFIX LOGIC HERE
        onChat: async function ({ api, event, message, getLang }) {

                const body = (event.body || "").toLowerCase();

                const triggers = ["ffvideo", ""];

                if (!triggers.some(t => body.includes(t))) return;

                const cacheDir = path.join(__dirname, "cache");
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

                const filePath = path.join(cacheDir, `ff_${event.senderID}.mp4`);

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);

                        const waitMsg = await message.reply(getLang("wait"));

                        const apiUrlBase = await mahmud();
                        const res = await axios.get(`${apiUrlBase}/api/album/mahmud/videos/freefire?userID=${event.senderID}`);

                        if (!res.data.success || !res.data.videos.length) {
                                if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
                                return message.reply(getLang("noResult"));
                        }

                        const url = res.data.videos[Math.floor(Math.random() * res.data.videos.length)];

                        const videoStream = await axios({
                                url,
                                method: "GET",
                                responseType: "stream",
                                headers: { "User-Agent": "Mozilla/5.0" }
                        });

                        const writer = fs.createWriteStream(filePath);
                        videoStream.data.pipe(writer);

                        writer.on("finish", () => {
                                if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);

                                message.reply({
                                        body: getLang("success"),
                                        attachment: fs.createReadStream(filePath)
                                }, () => {
                                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                                });
                        });

                        writer.on("error", () => {
                                throw new Error("Download failed");
                        });

                } catch (err) {
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        return message.reply(getLang("error", err.message));
                }
        }
};
