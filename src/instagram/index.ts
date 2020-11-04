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

    /**
        * force: Force the new login
    */
    public async login(user: string, password: string, force?: boolean) {
        try {
            const hasSessionSaved = await this.checkIfFileExists(path.join(__dirname, 'sessions', `${user}.txt`))
            if(!hasSessionSaved || force){
                await this.clickInBtnFollowBeforeLogin()
                await this.insertCredentialsForLogin(user, password)
    
                const btnLogin = await this.page.waitForSelector(selectors.btnLogin)
                await btnLogin.click()
                
                await this.waitLogin()

                await this.saveSession(user)
                
                await this.discardSaveInformation()
                
            }else {
                const cookies = await this.getSession(user)
                await this.setSession(cookies)
                await this.page.reload()
            }

        } catch (error) {
            console.error(error)
            throw new Error('Erro ao tentar fazer login no instagram, verifique sua conta')
        }
    }
    
    private checkIfFileExists(pathToFile: string) {
        console.log('')
        return new Promise<boolean>((resolve, reject) => {
            fs.stat(pathToFile, (err, stats) => {
                if(!err && stats.isFile()){
                    resolve(true)
                }
                if(err && err.code === 'ENOENT'){
                    resolve(false)
                }
                if (err) reject(err)
                
            })
        })
    }

    public async saveSession(user: string) {
        const cookies = await this.page.cookies()

        return new Promise<void>((resolve, reject) => {
            fs.writeFile(path.join(__dirname, 'sessions', `${user}.txt`), JSON.stringify(cookies), (err) => {
                if (err) reject(reject)
                resolve()
            })
        })
    }

    public getSession(user: string) {
        return new Promise<Cookies[]>((resolve, reject) => {
            fs.readFile(path.join(__dirname, 'sessions', `${user}.txt`), 'utf8', (err, data) => {
                if (err) reject(err)
                resolve(JSON.parse(data))
            })

        })
    }

    public async setSession(cookies: Cookies[]) {
        await this.page.setCookie(...cookies)
        await this.page.reload()
    }

}


export default Instagram