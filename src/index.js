const express = require('express')
const route = require('./routes/route')
const mongoose = require('mongoose')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

mongoose.set('strictQuery', false)

mongoose.connect("mongodb+srv://Abhi_functionup:dBalIHuDvBLH2uZK@abhi1.m5k3ewv.mongodb.net/group14Database", {
        useNewUrlParser: true
    })
    .then(() => console.log("MongoDB is connected"))
    .catch(err => console.log(err))

app.use("/", route)

app.listen(3000, function() {
    console.log("Express app running on port 3000")
})