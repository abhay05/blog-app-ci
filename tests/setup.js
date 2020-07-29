jest.setTimeout(200000);
require('../models/User')

const keys = require('../config/keys')
const mongoose=require('mongoose')

mongoose.Promise=global.Promise // for record keeping; promise library
mongoose.connect(keys.mongoURI,{useMongoClient:true}) // useMongoClient: true => no depracetion warning