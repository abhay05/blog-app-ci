const AWS=require('aws-sdk')
const uuid=require('uuid/v1')
const requireLogin=require('../middlewares/requireLogin')
const keys=require('../config/keys')

const s3 = new AWS.S3({accessKeyId:keys.accessKeyId,secretAccessKey:keys.secretAccessKey
            ,signatureVersion: 'v4',region: 'ap-south-1'})

module.exports=app=>{
    app.get('/api/upload',requireLogin,(req,res)=>{
       // key='2016118896.jpeg'
        key=`${req.user.id}/${uuid()}.jpeg`
        s3.getSignedUrl('putObject',{
            Bucket:'blog-app-ci-electroworm',
            ContentType:'image/jpeg',
            Key:key
        },(err,url)=>{res.send({url,key})})
    })
}