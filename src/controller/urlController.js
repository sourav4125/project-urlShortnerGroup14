const urlModel = require("../models/urlModel.js")
const shortId = require("shortid")
const redis = require("redis");
const { promisify } = require("util");
const axios = require("axios")


//1. Connect to the redis server
const redisClient = redis.createClient({
    url: "redis://default:T0Z9CXqETT5xITyCKQhALVb4oS6YUM3s@redis-12303.c305.ap-south-1-1.ec2.cloud.redislabs.com:12303"
})
redisClient.on('error', (err) => console.log('Redis Client Error', err))
console.log("Connected to Redis..")


//set and get functions of redis
const SETEX_ASYNC = promisify(redisClient.SETEX).bind(redisClient); //to store data in cache memory.
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient); //to get data from cache memory.



//---------------------------------------------------POST API---------------------------------------------

const createUrl = async function(req, res) {
    try {
        let longUrl = req.body.longUrl
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "please enter url !!" })

        if ((typeof longUrl) != "string") return res.status(400).send({ status: false, message: "url must be string" })

        if (!longUrl.trim()) return res.status(400).send({ status: false, message: "please enter url first" })

        let urlData = await GET_ASYNC(`${longUrl}`)
        let url = JSON.parse(urlData)
        if (url)
            return res.status(200).send({
                status: true,
                message: "URL already shorten come from cache",
                data: url
            })

        let urlFound = await axios.get(longUrl)
            .then(() => longUrl)
            .catch((err) => {});
        if (!urlFound) return res.status(400).send({ status: false, message: "Invalid Url" })



        let urlExist = await urlModel.findOne({ longUrl }).select({ longUrl: 1, urlCode: 1, shortUrl: 1, _id: 0 })
        if (urlExist) {
            await SETEX_ASYNC(`${longUrl}`, 86400, JSON.stringify(urlExist))
            return res.status(200).send({
                status: true,
                message: "Url already shortend",
                data: urlExist
            })
        }
        let urlCode = shortId.generate()
        let shortUrl = `${req.protocol}://${req.headers.host}/` + urlCode;
        let result = { longUrl: longUrl, shortUrl: shortUrl, urlCode: urlCode }
        await urlModel.create(result)

        return res.status(201).send({ status: true, data: result })

    } catch (err) {
        res.status(500).send({ errorType: err.name, message: err.message })
    }
}


//----------------------------------------------GET API-----------------------------------------------

const getUrl = async function(req, res) {
    try {
        let urlCode = req.params.urlCode
        let urldata = await GET_ASYNC(`${urlCode}`)
        let data = JSON.parse(urldata);
        if (data) {
            console.log(data)
            return res.status(302).redirect(data.longUrl);
        }

        const getPage = await urlModel.findOne({ urlCode: urlCode })
        if (getPage) {
            console.log("DB call")
            await SETEX_ASYNC(`${urlCode}`, 86400, JSON.stringify(getPage))
            return res.status(302).redirect(getPage.longUrl)
        }
        return res.status(404).send({ status: false, message: "Urlcode does not exist " })

    } catch (err) {
        res.status(500).send({ errorType: err.name, message: err.message })
    }
}


module.exports = { createUrl, getUrl }