const redis = require("redis");
const { promisify } = require("util");



const client = redis.createClient({
  url:process.env.REDIS_URL
})
client.on('error',(err)=>console.log('Redis Client Error',err))
console.log("Connected to Redis..")
// require('dotenv').config()
// const redisClient = redis.createClient(
//     10209,
//     "redis-10209.c264.ap-south-1-1.ec2.cloud.redislabs.com",
//     { no_ready_check: true }
//   );
//   redisClient.auth(process.env.AUTH_PASS, function (err) {
//     if (err) throw err;
//   });     
  
//   redisClient.on("connect", async function () {
//     console.log("Connected to RedisDB");
//   }); 

  //set and get functions of redis
  const SET_ASYNC = promisify(client.SETEX).bind(client);//to create data in cache memory.
  const GET_ASYNC = promisify(client.GET).bind(client);//to get data from cache memory.

  module.exports ={SET_ASYNC,GET_ASYNC}