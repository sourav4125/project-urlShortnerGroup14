const urlModel = require("../models/urlModel.js")
const validator =require("validator")
const shortId = require("shortid")
const {SET_ASYNC,GET_ASYNC} = require("../routes/cache")

const createUrl= async function(req,res){
    try{
        let data = req.body
        let reqLongUrl = data.longUrl
        if(Object.keys(data).length==0) return res.status(400).send({status:false,message:"please enter url !!"})

        if((typeof reqLongUrl)!= "string") return res.status(400).send({status:false,message:"url must be string"})

        if(!reqLongUrl.trim())return res.status(400).send({status:false,message:"please enter url first"})

        if(!validator.isURL(reqLongUrl)) return  res.status(400).send({status:false,message:"enter valid Url"})

        const findUrl = await urlModel.findOne({longUrl:reqLongUrl}).select({urlCode:1,longUrl:1,shortUrl:1,_id:0})

        if(findUrl) return res.status(200).send({status:true,data:findUrl})

        let uniqueUrlCode = shortId.generate()
        data['urlCode'] = uniqueUrlCode
    
        let shortUrl = `${req.protocol}://${ req.get('host')}/` + uniqueUrlCode
        data['shortUrl'] = shortUrl
        data['longUrl'] = reqLongUrl
        
        const crteateData = await urlModel.create(data)
        let shortnerUrl = {urlCode:crteateData.urlCode,longUrl:crteateData.longUrl,shortUrl:crteateData.shortUrl}

        await SET_ASYNC (`${uniqueUrlCode}`,20,JSON.stringify(data))

        res.status(201).send({status:true,data:shortnerUrl})

    }catch(err){
        res.status(500).send({errorType:err.name,message:err.message})
    }
}


const getUrl = async function (req,res){
    try{
        let reqUrl = req.params.urlCode
        let cacheUrl= await GET_ASYNC(`${reqUrl}`)
        // console.log(cacheUrl)
        if(cacheUrl){
            cacheUrl = JSON.parse(cacheUrl)
             return res.status(302).redirect(cacheUrl.longUrl)
        }
        
        const url = await urlModel.findOne({urlCode: reqUrl})
        
        if(!url) return res.status(404).send({status:true, message:"The URL is not found."})

        await SET_ASYNC (`${reqUrl}`,20,JSON.stringify(url))
         return res.status(302).redirect(url.longUrl)
    }
    catch(err){
        res.status(500).send({errorType:err.name,message:err.message})
    }
}
module.exports = {createUrl,getUrl}