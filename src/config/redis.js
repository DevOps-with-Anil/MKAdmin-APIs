const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL 
});

redisClient.on("connect", () => console.log("Redis connecting..."));
redisClient.on("ready", () => console.log("Redis ready"));
redisClient.on("error", (err) => console.error("Redis Error:", err));

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

module.exports = { redisClient, connectRedis };