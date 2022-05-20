import { Locator, Page } from "@playwright/test"
import { sleep } from "../utils"

export class CommonPage {
   constructor(protected readonly page: Page) {}

   exactText(str: string) {
      return this.page.locator(`text="${str}"`)
   }

   text(str: string) {
      return this.page.locator(`text=${str}`)
   }

   async resilientClick(
      locator: string,
      tries: number = 3,
      eachTryTimeout: number = 1000,
      forceSecondTry: boolean = true
   ) {
      while (tries-- > 0) {
         const clickPromise = this.page.locator(locator).click()

         try {
            await promiseTimeout(clickPromise, eachTryTimeout)

            if (forceSecondTry) {
               await sleep(500)
               if (await this.page.locator(locator).isVisible()) {
                  try {
                     await this.page
                        .locator(locator)
                        .click({ timeout: eachTryTimeout })
                  } catch (e) {
                     // sometimes the button might be visible but not clickable (transitioning)
                     // try to continue to the next step anyway
                  }
               }
            }

            return
         } catch (e) {
            if (e !== "timeout") {
               throw e
            }
         }
      }
      if (await this.page.locator(locator).isVisible()) {
         throw new Error("Could not click, exceeded tries")
      }
   }

   /**
    * Sometimes the navigation fails randomly, e.g
    * - Navigation interrupted by another one
    *
    * Try several times and ignore exceptions
    *
    * @param url
    * @param tries
    * @param finalWait
    */
   async resilientGoto(
      url: string,
      tries: number = 3,
      finalWait: number = 500
   ) {
      while (tries-- > 0) {
         try {
            await this.page.goto(url)
            await sleep(finalWait)
            return
         } catch (e) {}
      }
   }

   async resilientCheck(locator: Locator, check: boolean = true) {
      await locator.hover() // to ensure actionability

      try {
         if (check) {
            await locator.check()
         } else {
            await locator.uncheck()
         }
      } catch {
         // @ts-ignore
         await locator.evaluate((node) => (node.checked = check))
      }
   }
}

const promiseTimeout = (promise, timeoutInMilliseconds) => {
   return Promise.race([
      promise,
      new Promise(function (resolve, reject) {
         setTimeout(function () {
            reject("timeout")
         }, timeoutInMilliseconds)
      }),
   ])
}
