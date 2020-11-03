import path from 'path'
import fs from 'fs'

import { Page, ElementHandle } from 'puppeteer'


import selectors from './selectors.json'
import * as utils from '../utils'


interface Cookies {
    name: string,
    value: string,
    domain: string,
    path: string,
    expires: number,
    size: number,
    httpOnly: boolean,
    secure: boolean,
    session: boolean
}

class Instagram {
    private page: Page
    constructor(page: Page) {
        this.page = page
    }

    public async clickInBtnFollowBeforeLogin() {
        try {
            const btn = await this.page.waitForSelector(selectors.btnFollowBeforeLogin2)
            await btn.click()
        } catch (error) {
            throw new Error('Erro ao clicar em follow para fazer login no instagram')
        }
    }

    private async insertCredentialsForLogin(user: string, password: string) {
        try {
            const inputUsername = await this.page.waitForSelector(selectors.inputLogin)
            await inputUsername.type(user)

            const inputPassword = this.page.waitForSelector(selectors.inputPassword)
            await (await inputPassword).type(password)
        } catch (error) {
            throw new Error('Erro ao tentar fazer login no instagram')
        }
    }

    private async waitLogin() {
        try {
            let cardLogin: null | ElementHandle
            let contLoading = 0
            do {
                cardLogin = await this.page.$(selectors.cardLogin)

                await utils.timeout(1000, false)
                contLoading++
            } while (cardLogin !== null && contLoading <= 20)

            if (contLoading >= 20) {
                throw new Error('Erro ao tentar fazer login no instagram, verifique sua conta')
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    private async discardSaveInformation() {
        try {
            const btn = await this.page.waitForSelector(selectors.btnDiscardSaveInformation)
            await btn.click()
        } catch (error) {
            throw new Error('Erro, em não salvar as informações')
        }
    }

    public async login(user: string, password: string) {
        try {
            await this.insertCredentialsForLogin(user, password)

            const btnLogin = await this.page.waitForSelector(selectors.btnLogin)
            await btnLogin.click()

            await this.waitLogin()

            await this.discardSaveInformation()
        } catch (error) {
            console.error('Error in login')
            console.error(error)
            throw new Error('Erro ao tentar fazer login no instagram, verifique sua conta')
        }
    }

    public async saveSession(user: string){
        const cookies = await this.page.cookies()
        
        fs.writeFile(path.join(__dirname, 'sessions', `${user}.txt`), JSON.stringify(cookies), (err) => {
            if(err) throw err
        })
    }

    public getSession(user: string){
        return new Promise<Cookies>((resolve, reject) => {
            fs.readFile(path.join(__dirname, 'sessions', `${user}.txt`), 'utf8', (err, data) => {
                if(err) reject(err)
                resolve(JSON.parse(data))
            })

        })
    }

    public async setSession(cookies: Cookies[]){
        await this.page.setCookie(...cookies)
        await this.page.reload()
    }

}


export default Instagram