const redis = require("redis");
const { promisify } = require("util");
require('dotenv').config()
const redisClient = redis.createClient(
    10209,
    "redis-10209.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth(process.env.AUTH_PASS, function (err) {
    if (err) throw err;
  });     
  
  redisClient.on("connect", async function () {
    console.log("Connected to RedisDB");
  }); 

  //set and get functions of redis
  const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);//to create data in cache memory.
  const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);//to get data from cache memory.

  module.exports ={redisClient,SET_ASYNC,GET_ASYNC}