const urlModel = require("../models/urlModel.js")
const validator = require("validator")
const shortId = require("shortid")
const axios = require('axios')
const { SET_ASYNC, GET_ASYNC } = require("../routes/cache")

const createUrl = async function (req, res) {
    try {

        let reqLongUrl = req.body.longUrl
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "please enter url !!" })

        if ((typeof reqLongUrl) != "string") return res.status(400).send({ status: false, message: "url must be string" })

        if (!reqLongUrl.trim()) return res.status(400).send({ status: false, message: "please enter url first" })
        let urlData = await GET_ASYNC(`${reqLongUrl}`)
        let url = JSON.parse(urlData)
        if (url)
            return res.status(200).send({
                status: true,
                message: "URL already shorten come from cache",
                data: url
            })
        const response = await axios.get(reqLongUrl)
            .then(() => reqLongUrl)
            .catch(() => null)
        if (!response) return res.status(400).send({ status: false, msg: `The URL ${reqLongUrl} is not valid` })

        const findUrl = await urlModel.findOne({ longUrl: reqLongUrl }).select({ urlCode: 1, longUrl: 1, shortUrl: 1, _id: 0 })

        if (findUrl) {
            await SET_ASYNC(`${reqLongUrl}`, 100, JSON.stringify(findUrl))
            return res.status(200).send({ status: true, message: "URL already shorten", data: findUrl })
        }

        let uniqueUrlCode = shortId.generate()
        data['urlCode'] = uniqueUrlCode

        let shortUrl = `${req.protocol}://${req.get('host')}/` + uniqueUrlCode
        data['shortUrl'] = shortUrl
        data['longUrl'] = reqLongUrl

        const crteateData = await urlModel.create(data)


        let shortnerUrl = { urlCode: crteateData.urlCode, longUrl: crteateData.longUrl, shortUrl: crteateData.shortUrl }

        res.status(201).send({ status: true, data: shortnerUrl })

    } catch (err) {
        res.status(500).send({ errorType: err.name, message: err.message })
    }
}


const getUrl = async function (req, res) {
    try {
        let reqUrl = req.params.urlCode
        let cacheUrl = await GET_ASYNC(`${reqUrl}`)
        console.log("Abhi")
        cacheUrl = JSON.parse(cacheUrl)
        if (cacheUrl) {
            return res.status(302).redirect(cacheUrl.longUrl)
        }

        const url = await urlModel.findOne({ urlCode: reqUrl })

        if (!url) return res.status(404).send({ status: true, message: "The URL is not found." })

        await SET_ASYNC(`${reqUrl}`, 89, JSON.stringify(url))
        console.log("abhi")
        return res.status(302).redirect(url.longUrl)
    }
    catch (err) {
        res.status(500).send({ errorType: err.name, message: err.message })
    }
}
module.exports = { createUrl, getUrl }