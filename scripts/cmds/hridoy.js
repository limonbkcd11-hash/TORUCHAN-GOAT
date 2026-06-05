const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "hridoy",
    version: "3.0",
    author: "Hridoy",
    role: 0,
    shortDescription: "Auto Profile (Optimized)",
    category: "Admin"
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    const msg = (event.body || "").toLowerCase();

    const TARGET_UID = "100048786044500";
    const isNameMatch = msg.includes("hridoy");
    const isMentioned = event.mentions && Object.keys(event.mentions).includes(TARGET_UID);

    if (!isNameMatch && !isMentioned) return;

    const profileText = `
✦━━━━━━〔 𝑷𝑹𝑶𝑭𝑰𝑳𝑬 〕━━━━━━✦
✨ NAME   ➤ HRIDOY
✨ AGE    ➤ 20+
✨ STATUS ➤ SINGLE
✨ LOC    ➤ JASHORE

✦━━━━━━〔 𝑺𝑶𝑪𝑰𝑨𝑳〕━━━━━━✦
🌐 FB   ➤ fb.me/100048786044500
📧 MAIL ➤ hridoyhossen049@gmail.com
📱 WA   ➤ 01744-******

✦━━━━━━━━━━━━━━━━━━━━✦
⚡ SYSTEM STATUS : ONLINE
`;

    try {
      const imgUrl = "https://i.imgur.com/6dpggxq.jpeg";

      // 🚀 stream directly (NO file write = no lag)
      const imageStream = await axios.get(imgUrl, {
        responseType: "stream",
        timeout: 10000
      });

      return api.sendMessage(
        {
          body: profileText,
          attachment: imageStream.data
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error(err);
      return api.sendMessage(
        "❌ Image load failed!",
        event.threadID,
        event.messageID
      );
    }
  }
};
