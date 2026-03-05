const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;
const { redisClient } = require("./redis");
const { ipKeyGenerator } = require("express-rate-limit");

function createRateLimiter({
  windowMinutes,
  maxRequests,
  keyType = "ip"
}) {

  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args)
    }),

    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,

    // ⭐ IPv6 Safe
    keyGenerator: (req) => {
      if (keyType === "user") {
        return req.user?._id?.toString() || ipKeyGenerator(req);
      }
      return ipKeyGenerator(req);
    },

    standardHeaders: true,
    legacyHeaders: false,

    message: {
      status: 429,
      message: "Too many requests"
    }
  });
}


/**
 * =====================================
 * Predefined Limiters From ENV
 * =====================================
 */

const loginLimiter = () =>
  createRateLimiter({
    windowMinutes: parseInt(process.env.LOGIN_RATE_WINDOW_MINUTES || "15"),
    maxRequests: parseInt(process.env.LOGIN_RATE_MAX_REQUESTS || "5"),
  });

const publicLimiter = () =>
  createRateLimiter({
    windowMinutes: parseInt(process.env.PUBLIC_RATE_WINDOW_MINUTES || "15"),
    maxRequests: parseInt(process.env.PUBLIC_RATE_MAX_REQUESTS || "100"),
  });

const userLimiter = () =>
  createRateLimiter({
    windowMinutes: parseInt(process.env.USER_RATE_WINDOW_MINUTES || "15"),
    maxRequests: parseInt(process.env.USER_RATE_MAX_REQUESTS || "200"),
    keyType: "user"
  });

module.exports = {
  createRateLimiter,
  loginLimiter,
  publicLimiter,
  userLimiter
};