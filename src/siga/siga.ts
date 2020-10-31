import puppeteer, { Browser, Page } from 'puppeteer'
import selectors from './selectors.json'

let browser: Browser
let page: Page

async function startBrowser(headless: boolean) {
    browser = await puppeteer.launch({ headless, devtools: false })
}

async function goToSiga() {
    try {
        page = await browser.newPage()
        page.goto('https://sigasocial.com.br/login')
    } catch (error) {
        throw new Error('Erro no Siga')
    }
}


async function login(user: string, password: string) {
    try {

        const inputLogin = await page.waitForSelector(selectors.inputLogin)
        await inputLogin.type(user)

        const inputPassword = await page.waitForSelector(selectors.inputPassword)
        await inputPassword.type(password)

        const btnLogin = await page.waitForSelector(selectors.btnLogin)
        await btnLogin.click()
    } catch (error) {
        throw new Error('Erro login in Siga')
    }
}

async function waitLogin() {
    const newWindowTarget = await browser.waitForTarget(target => target.url() === 'https://sigasocial.com.br/dashboard');
    page = await newWindowTarget.page()
}

async function goToDoActions () {
    try {
      await page.goto('https://sigasocial.com.br/actions')
    } catch (error) {
      /* loggerError('Error in clickConnectEndWin')
      console.error(error) */
      throw new Error('Erro ao tentar conectar ao Siga')
    }
  }



async function start() {
    await startBrowser(false)
    await goToSiga()
    await login('lu.anderson142011@gmail.com', 'Cfx2j45152016')
    await waitLogin()
    await goToDoActions()
}


start()