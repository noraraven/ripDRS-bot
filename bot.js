const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// CONFIG
const CHANNEL_ID = process.env.CHANNEL_ID;
const TOKEN = process.env.BOT_TOKEN;

// Hard-coded subreddit
const SUBREDDIT = "formuladank";

let lastPost = null;

// Fetch latest posts
async function getLatestPost() {
    const url = `https://www.reddit.com/r/${SUBREDDIT}/new.json?limit=1`;

    const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 ripDRS bot" }
    });

    const data = await res.json();

    if (!data.data.children.length) return null;

    return data.data.children[0].data;
}

async function checkReddit() {
    try {
        const post = await getLatestPost();
        if (!post) return;

        const postId = post.id;
        if (postId === last.lastPost) return;
        lastPost = postId;

        const channel = await bot.channels.fetch(CHANNEL_ID);

        const title = post.title;
        const url = `https://reddit.com${post.permalink}`;

        // IMAGE
        const image = post.url_overridden_by_dest;

        // VIDEO
        const video = post.secure_media?.reddit_video?.fallback_url;

        // Build embed
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setURL(url)
            .setColor("#ff4500");

        if (
            image &&
            (image.endsWith(".jpg") ||
             image.endsWith(".png") ||
             image.endsWith(".jpeg") ||
             image.includes("i.redd.it"))
        ) {
            embed.setImage(image);
        }

        // Send embed
        await channel.send({ embeds: [embed] });

        // Send video separately if exists
        if (video) {
            await channel.send(`🎥 Video:\n${video}`);
        }

        console.log(`Posted: ${title}`);

    } catch (err) {
        console.log("Error:", err.message);
    }
}

bot.once("ready", () => {
    console.log(`ripDRS bot online — watching ONLY r/formuladank 🏎️⚰️`);

    checkReddit();
    setInterval(checkReddit, 60000); // 1 min
});

bot.login(TOKEN);

