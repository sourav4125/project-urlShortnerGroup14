const express = require('express')
const router = express.Router()
const {createUrl,getUrl} = require("../controller/urlController")
router.get('/test-me',function(req,res){
    res.send({get:"done"})
})

router.post('/url/shorten', createUrl)
router.get('/:urlCode',getUrl)

router.all("/*", function (req, res) {
    res.status(404).send({ status: false, msg: "page not found" });
  });

module.exports = router