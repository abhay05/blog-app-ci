const Buffer=require('safe-buffer').Buffer
const Keygrip=require('keygrip')

const cookieKey=require('../../config/keys').cookieKey
const keygrip=Keygrip([cookieKey])

module.exports=(user)=>{
    const session={
        passport:{
            user:user._id.toString() //user._id is an object so convert it to a string
        }
    }
    
    const sessionId=Buffer.from(JSON.stringify(session)).toString('base64')
    
    const sessionSig=keygrip.sign('session='+sessionId)

    return {sessionId,sessionSig}
}