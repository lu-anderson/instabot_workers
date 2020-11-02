import { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import selectors from './selectors.json'
import * as utils from '../utils'

puppeteer.use(StealthPlugin())

let browser: Browser
let page: Page

async function startBrowser(headless: boolean) {
	browser = await puppeteer.launch({ headless, devtools: false })
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

async function getAllProfiles() {
	try {
		let profile
		let cont = 2
		const profiles = []
		await page.waitForSelector(selectors.selectProfile)
		do {
			profile = await page.waitForSelector(`${selectors.selectProfile} > option:nth-child(${cont})`, { timeout: 500 }).catch(() => { })

			if (profile !== undefined) {
				let textProfile = await page.evaluate(element =>
					element.textContent,
					profile)
				profiles.push(textProfile)
				cont += 1
			}
		} while (profile !== undefined)

		return profiles
	} catch (error) {
		throw new Error('Erro ao obter todos os perfils conectados ao Dizu')
	}
}

function findProfile(userInArray: string, user: string) {
	const index = userInArray.indexOf(user)
	return index > -1
}

async function chooseAccount(user: string) {
	try {
		let accountSeleted = 0
		const accounts = await getAllProfiles()
		accountSeleted = accounts.findIndex((e) => findProfile(e, user))

		const selector = `${selectors.selectProfile} > option:nth-child(${accountSeleted + 2})`
		await page.evaluate((selector) => {
			const selectProfileElement = document.querySelector(selector)
			selectProfileElement.selected = true
			selectProfileElement.click()
		}, selector)
	} catch (error) {
		console.log(error)
		throw new Error('Erro ao selecionar conta')
	}
}

async function selectIncludeLike05(checked: boolean) {
	try {
		await page.evaluate((checked, selector) => {
			const includeLike05Element = document.querySelector(selector)
			includeLike05Element.checked = checked
		}, checked, selectors.includeLike05)
	} catch (error) {
		throw new Error('Erro em marcar "incluir Curtidas 0.5"')
	}
}

async function selectIncludeTasks10(checked: boolean) {
	try {
		await page.evaluate((checked, selector) => {
			const includeTask10Element = document.querySelector(selector)
			includeTask10Element.checked = checked
		}, checked, selectors.includeTask10)
	} catch (error) {
		throw new Error('Erro em marcar "incluir tarefas 1.0"')
	}
}


async function clickInStart () {
    try {
      const btnStart = await page.waitForSelector(selectors.btnStart)
      await btnStart.click()
    } catch (error) {
      throw new Error('Erro ao clicar em iniciar')
    }
  }



async function start() {
	try {
		await startBrowser(false)
		await goToDizu()
		await login('lu-anderson1@hotmail.com', 'Cfx2j45152020')
		await waitLogin()
		await goToConnectEndWin()
		await chooseAccount('professor.andrelucas')
		await selectIncludeLike05(true)
		await selectIncludeTasks10(true)
		await clickInStart()

	} catch (error) {
		console.log(error)
	}
}

start()