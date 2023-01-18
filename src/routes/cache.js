const redis = require("redis");
const { promisify } = require("util");
require('dotenv').config()
const redisClient = redis.createClient(
    12303,
    "redis-12303.c305.ap-south-1-1.ec2.cloud.redislabs.com", { no_ready_check: true },

);
redisClient.auth("T0Z9CXqETT5xITyCKQhALVb4oS6YUM3s", function(err) {
    if (err) throw err;
});

redisClient.on("connect", async function() {
    console.log("Connected to RedisDB");
});

//set and get functions of redis
const SETEX_ASYNC = promisify(redisClient.SETEX).bind(redisClient); //to create data in cache memory.
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient); //to get data from cache memory.

module.exports = { redisClient, SETEX_ASYNC, GET_ASYNC }