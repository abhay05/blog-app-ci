const Page=require('./helpers/page')
let page
beforeEach(async ()=>{
    page= await Page.build()
    await page.goto('http://localhost:3000')

})
 
 afterEach(async ()=>{
    await page.close()}
 )
 

describe('When logged in',async ()=>{

    beforeEach(async ()=>{
        await page.login()
        await page.click('a.btn-floating')
    })
     
     afterEach(async ()=>{
        await page.close()}
     )
     
     test('check for form',async ()=>{
         const text=await page.getContentsOf('form label')// form may change overtime so select text which doesn't change
         expect(text).toEqual('Blog Title')
     })

     describe('And using invalid inputs',async ()=>{

        beforeEach(async ()=>{
            await page.click('form button')
        })

        test('this test shows an error message',async ()=>{
            const titleError=await page.getContentsOf('.title .red-text')
            const contentError=await page.getContentsOf('.content .red-text')

            expect(titleError).toEqual('You must provide a value')
            expect(contentError).toEqual('You must provide a value')
        })
     })

     describe('When valid inputs',async ()=>{
        beforeEach(async ()=>{
            await page.type('.title input',"My title")
            await page.type('.content input',"My content")
            await page.click('form button')
        })
        test('Submitting takes user to review screen',async ()=>{
            const text=await page.getContentsOf('h5')
            expect(text).toEqual('Please confirm your entries')
        })
        
        test('Submitting then saving adds blog to index page',async ()=>{
            await page.click('form button.green')
            await page.waitFor('.card') // wait for the page to appear
    
           const title = await page.getContentsOf('.card-title')
           const content  = await page.getContentsOf('p')
    
           expect(title).toEqual('My title')
           expect(content).toEqual('My content')
        })
    })    

})

describe('When not logged in',async ()=>{

    actions=[
        {
            method:'get',
            path:'/api/blogs'
        },{
            method:'post',
            path:'/api/blogs',
            data:{title:'My title',content:'My content'}
        }
    ]

    test('User cannot create blogposts',async ()=>{
        const result = await page.post('/api/blogs',{title:'My title',content:'My content'})
        expect(result).toEqual({error:"You must log in!"})
    })

    test('User cannot view blogposts',async ()=>{
        const result = await page.get('/api/blogs')
        expect(result).toEqual({error:"You must log in!"})
    })

    test('User cannot perform any action',async ()=>{
        
        const results= await page.execRequests(actions)
        //console.log("size ",results.length)
        //console.log(results[0]," ",results[1])
        // var result in results -> range of the array 0 to size(array)
        for(var result of results ){
           // console.log(result)
            expect(result).toEqual({error:"You must log in!"})
        }
    })
})
