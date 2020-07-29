const {clearCache}=require('../services/cache')
module.exports=async (req,res,next)=>{
    await next() // we wait for the blog to get saved before clearing the cache 
    // so we use this trick
    // but if there is some error while saving the blog post where it is called out
    clearCache(req.user.id)
    //next()
}