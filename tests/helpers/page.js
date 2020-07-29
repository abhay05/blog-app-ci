const puppeteer = require('puppeteer')
const sessionFactory=require('../factories/sessionFactory')
const userFactory=require('../factories/userFactory')


class CustomPage{
    static async build(){
        const browser=await puppeteer.launch({
            //headless:false
            headless:true,
            args:['--no-sandbox']
        })
        const page=await browser.newPage()
        const custompage=new CustomPage(page)
        return new Proxy(custompage,{
            get:function(target,property){
                return target[property]||browser[property]||page[property]
                // if browser is not ahead of page then page.close will run, it will close
                // the page but not the browser so we should put browser ahead of page
            }
        })

    }
    constructor(page){
        this.page=page
    }

    async login(){
        const user=await userFactory()
        const {sessionId,sessionSig}=sessionFactory(user)
    
       // console.log(sessionSig,sessionId)
        await this.page.setCookie({name:'session',value:sessionId})
        await this.page.setCookie({name:'session.sig',value:sessionSig})
        await this.page.goto('http://localhost:3000/blogs')  // need to refresh the page to verify the credentials
    
        //test may fail because we are trying to fetch an element which might not be even loaded
        // so its' better to use wait for function to wait till that element is loaded
    
        await this.page.waitFor("a[href='/auth/logout']")
    }

    async getContentsOf(selector){
        return this.page.$eval(selector,el=>el.innerHTML)
    }

    get(path){
        //console.log("GET called")
        return this.page.evaluate(
            (_path)=>{
                return fetch(_path,{
                    method:'POST',
                    credentials:'same-origin',
                    headers:{
                        'Content-Type':'application/json'
                    },
                }).then(res=>res.json())
            },path
        )
    }

    post(path,data){
       // console.log("POST called")
        return this.page.evaluate(
            (_path,_data)=>{
                return fetch(_path,{
                    method:'POST',
                    credentials:'same-origin',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify(_data)
                }).then(res=>res.json())
            },path,data
        )
        //var reso=await postPromise
       //console.log("Hello ",reso)
       //co
       //return postPromise
    }

    execRequests(actions){
      return  Promise.all( actions.map(({method,path,data})=>{
         //console.log(this[method](path,data)
         var z=this[method](path,data)
         //console.log("Promise ",z)
           return z
        }))
    
    }

}

module.exports=CustomPage