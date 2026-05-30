const fs = require("fs-extra");
const path = require("path");
const { downloadVideo } = require("sagor-video-downloader");

module.exports = {
	config: {
		name: "autolink",
		version: "2.0.0",
		author: "Hridoy X Akash",
		role: 0,
		countDown: 3,
		shortDescription: "Auto Download Videos",
		category: "Media"
	},

	onStart: async function () {},

	onChat: async function ({ api, event }) {
		try {
			const { body, threadID, messageID } = event;

			if (!body) return;

			const links = body.match(/(https?:\/\/[^\s]+)/gi);
			if (!links) return;

			const uniqueLinks = [...new Set(links)];

			api.setMessageReaction("⏳", messageID, () => {}, true);

			let success = 0;
			let failed = 0;

			for (const url of uniqueLinks) {
				try {
					const data = await downloadVideo(url);

					if (!data || !data.filePath)
						throw new Error("Download Failed");

					const videoPath = data.filePath;

					if (!fs.existsSync(videoPath))
						throw new Error("File Missing");

					const stats = fs.statSync(videoPath);
					const sizeMB = stats.size / 1024 / 1024;

					if (sizeMB > 25) {
						fs.unlinkSync(videoPath);
						failed++;
						continue;
					}

					const info =
`Here's Your Video Baby >😘`;

					await api.sendMessage(
						{
							body: info,
							attachment: fs.createReadStream(videoPath)
						},
						threadID,
						() => {
							if (fs.existsSync(videoPath))
								fs.unlinkSync(videoPath);
						}
					);

					success++;

				} catch (err) {
					console.log("[AUTOLINK ERROR]", err);
					failed++;
				}
			}

			let reaction = "❌";

			if (success > 0 && failed === 0)
				reaction = "✅";
			else if (success > 0 && failed > 0)
				reaction = "⚠️";

			api.setMessageReaction(reaction, messageID, () => {}, true);

		} catch (e) {
			console.log(e);
		}
	}
};
