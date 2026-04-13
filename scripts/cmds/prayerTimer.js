const moment = require("moment-timezone");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "prayerTimer",
  version: "1.1",
  role: 0,
  author: "Hridoy",
  description: "নামাজ টাইমে ভিডিও + Random Dua সহ মেসেজ যাবে",
  category: "Utility",
  countDown: 5,
};

// ✅ GLOBAL LOCK (important)
if (!global.prayerTimerState) {
  global.prayerTimerState = {
    lastSentKey: null,
    intervalStarted: false
  };
}

module.exports.onLoad = async function ({ api }) {

  // 🔥 prevent multiple intervals
  if (global.prayerTimerState.intervalStarted) return;
  global.prayerTimerState.intervalStarted = true;

  const prayerTimes = {
    "05:00 AM": "🕌 ফজরের নামাজের সময় হয়েছে",
    "01:15 PM": "🕌 যোহরের নামাজের সময় হয়েছে",
    "04:30 PM": "🕌 আসরের নামাজের সময় হয়েছে",
    "06:15 PM": "🕌 মাগরিবের নামাজের সময় হয়েছে",
    "08:00 PM": "🕌 এশার নামাজের সময় হয়েছে"
  };

  const duas = [
    "🤲 اللّهُمَّ اغْفِرْ لِي وَارْحَمْنِي\nহে আল্লাহ, আমাকে ক্ষমা করুন ও দয়া করুন",
    "🤲 رَبِّ زِدْنِي عِلْمًا\nহে আমার রব, আমার জ্ঞান বৃদ্ধি করুন",
    "🤲 اللّهُمَّ اهْدِنِي الصِّرَاطَ الْمُسْتَقِيمَ\nহে আল্লাহ, আমাকে সরল পথে পরিচালিত করুন",
    "🤲 رَبَّنَا تَقَبَّلْ مِنَّا\nহে আমাদের রব, আমাদের আমল কবুল করুন",
    "🤲 اللّهُمَّ ارْزُقْنِي حَلَالًا طَيِّبًا\nহে আল্লাহ, আমাকে হালাল রিযিক দান করুন"
  ];

  const cacheDir = path.join(__dirname, "cache");
  const filePath = path.join(cacheDir, "azan.mp4");

  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  if (!fs.existsSync(filePath)) {
    const res = await axios({
      url: "https://files.catbox.moe/gr8zqw.mp4",
      method: "GET",
      responseType: "stream"
    });

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);
      res.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }

  const checkPrayer = async () => {

    const now = moment().tz("Asia/Dhaka");
    const timeKey = now.format("hh:mm A");
    const dateKey = now.format("DD-MM-YYYY");

    const sendKey = `${dateKey}_${timeKey}`;

    // 🔥 IMPORTANT: prevent duplicate send
    if (prayerTimes[timeKey] && global.prayerTimerState.lastSentKey !== sendKey) {

      global.prayerTimerState.lastSentKey = sendKey;

      const randomDua = duas[Math.floor(Math.random() * duas.length)];

      const finalMsg =
`━━━━━━━━━━━━━━━━━━
${prayerTimes[timeKey]}
🕒 সময়: ${timeKey}
📅 তারিখ: ${dateKey}
━━━━━━━━━━━━━━━━━━

📿 দোয়া:
${randomDua}

◢◤━━━━━━━━━━━━━━━━◥◣
🤲 সবাই নামাজ আদায় করুন
◥◣━━━━━━━━━━━━━━━━◢◤`;

      try {
        const allThreads = await api.getThreadList(100, null, ["INBOX"]);
        const groupThreads = allThreads.filter(t => t.isGroup);

        for (const thread of groupThreads) {
          await api.sendMessage({
            body: finalMsg,
            attachment: fs.createReadStream(filePath)
          }, thread.threadID);
        }

        console.log("✅ Prayer message sent once");

      } catch (err) {
        console.error("❌ Error:", err);
      }
    }

    // 🔄 reset daily at midnight
    if (now.format("HH:mm") === "00:00") {
      global.prayerTimerState.lastSentKey = null;
    }
  };

  setInterval(checkPrayer, 30000); // 30s safe interval
};

module.exports.onStart = () => {};
