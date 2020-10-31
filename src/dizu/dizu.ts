import { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import selectors from './selectors.json'
import * as utils from '../utils'

puppeteer.use(StealthPlugin())

let browser: Browser
let page: Page

async function startBrowser(headless: boolean) {
    browser = await puppeteer.launch({ headless, devtools: true })
}

async function goToDizu() {
    try {
        page = await browser.newPage()
        page.goto('https://dizu.com.br/login')
    } catch (error) {
        throw new Error('Erro no Siga')
    }
}

async function login(user: string, password: string) {
    try {

        const inputLogin = await page.waitForSelector(selectors.inputLogin)
        await inputLogin.type(user.substring(0, user.length / 2))
        await utils.timeout(utils.getRandomNotInt(3) * 1000, false)
        await inputLogin.type(user.substring(user.length / 2))


        const inputPassword = await page.waitForSelector(selectors.inputPassword)
        await inputPassword.type(password.substring(0, password.length / 2))
        await utils.timeout(utils.getRandomNotInt(3) * 1000, false)
        await inputPassword.type(password.substring(password.length / 2))

        const btnLogin = await page.waitForSelector(selectors.btnLogin)
        await btnLogin.click()
    } catch (error) {
        throw new Error('Erro ao fazer login no Dizu')
    }
}

async function waitLogin() {
    try {
        const newWindowTarget = await browser.waitForTarget(target => target.url() === 'https://dizu.com.br/painel');
        page = await newWindowTarget.page()
    } catch (error) {
        throw new Error('Erro ao esperar o login')
    }
}

async function goToConnectEndWin() {
    try {
        await page.goto('https://dizu.com.br/painel/conectar')
    } catch (error) {
        throw new Error('Erro ao acessar o painel "Conectar e ganhar"')
    }
}

async function getAllProfiles () {
    try {
      let getAccount
      let cont = 2
      const accounts = []
      await page.waitForSelector('#instagram_id')
      do {
        getAccount = await page.waitForSelector(`#instagram_id > option:nth-child(${cont})`).catch(() => { })

        if (getAccount !== undefined) {
          accounts.push(await getAccount.getText())
          cont += 1
        }
      } while (findAccounts !== undefined)

      return accounts
    } catch (error) {
      /* loggerError('Error in getAllProfiles')
      console.error(error) */
      throw new Error('Erro ao tentar conectar ao Dizu')
    }
  }



async function start() {
    try {
        await startBrowser(false)
        await goToDizu()
        await login('lu-anderson1@hotmail.com', 'Cfx2j45152020')
        await waitLogin()
        await goToConnectEndWin()
    } catch (error) {
        console.log(error)
    }
}

start()