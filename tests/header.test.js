const Page = require('./helpers/page')

// This file tests the Blogger header(which contains title, login option)

//jest.setTimeout=40000
var page

beforeEach(async ()=>{
    
    // browser= await puppeteer.launch({
    //     headless:false
    // })
    // pages= await browser.newPage()
    page=await Page.build() // never forget to put await if it is async function 
    //page=new Page()
    //page.build()
    await page.goto('http://localhost:3000')
})

afterEach(async ()=>{
    //await browser.close()

    await page.close()
})

test('Header text is checking',async ()=>{
    const text=await page.$eval('a.brand-logo',el=>el.innerHTML)
    expect(text).toEqual('Blogster')
})

test('check the Oauth link',async ()=>{
    await page.click('a[href="/auth/google"]')
    const url=await page.url()
    expect(url).toMatch(/accounts\.google\.com/)
})

test('logout button after login',async ()=>{
   // const id="5f0ad6529f72480520c7bed1"

    await page.login()
    const logout=await page.getContentsOf('.right li:nth-child(2) a')
    //can also use a[href="/auth/logout"]
    expect(logout).toEqual('Logout')
})