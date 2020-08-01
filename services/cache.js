const mongoose=require('mongoose')
const redis = require('redis')
const util=require('util')
const keys=require('../config/keys')

//const redisUrl='redis://127.0.0.1:6379'
const client = redis.createClient(keys.redisUrl)
client.hget = util.promisify(client.hget)
const exec=mongoose.Query.prototype.exec

mongoose.Query.prototype.cache=function(option={}){ // defined so that we can decide if we want to cache or not
    this._cache=true
    this.hashKey=JSON.stringify(option.key||'')
    return this // for making the function chainable return this
}

mongoose.Query.prototype.exec= async function(){
    if(!this._cache){
        return exec.apply(this,arguments)
    }
   // console.log('Run a query')
    const key = JSON.stringify(Object.assign({},this.getQuery(),{collection:this.mongooseCollection.name}))
    // if modify the result of this.getQuery it might change the actual function

    const cacheValue=await client.hget(this.hashKey,key)
    // Use anonymous function for top-level await code
    if(cacheValue){
     //   console.log(this)
      //  return new this.model(JSON.parse(cacheValue)) -> doesn't work because JSON.parse(cacheValue) actually returns
      // array of objects rather than single object
        // same as new Blog({tille:'Hi',content:'Helllo'})

        //return JSON.parse(cacheValue)
        const doc=JSON.parse(cacheValue)
        return Array.isArray(doc)
          ?doc.map(d=>new this.model(d))
          :new this.model(doc)
    }
    
    const result = await exec.apply(this,arguments)
    // result looks like JSON data but it is actually a mongoose document
    // so we need to convert the mongoose document to json string to store in redis

    client.hset(this.hashKey,key,JSON.stringify(result))
    return result
}

module.exports={
    clearCache(haskKey){
        client.del(JSON.stringify(haskKey))
    }
}