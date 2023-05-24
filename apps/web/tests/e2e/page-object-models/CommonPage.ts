import { expect, Locator, Page } from "@playwright/test"
import { sleep } from "../utils"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

export class CommonPage {
   constructor(public readonly page: Page) {}

   exactText(str: string) {
      return this.page.locator(`text="${str}"`)
   }

   text(str: string) {
      return this.page.locator(`text=${str}`)
   }

   assertTextIsVisible(text: string, exact: boolean = true) {
      const locatorFn = exact ? "exactText" : "text"
      return expect(this[locatorFn](text)).toBeVisible()
   }

   async clickAndUploadFiles(locator: Locator, files: string[] | string) {
      const [fileChooser] = await Promise.all([
         this.page.waitForEvent("filechooser"),
         locator.click(),
      ])

      await fileChooser.setFiles(files)
   }

   async resilientClick(
      locator: string,
      tries: number = 3,
      eachTryTimeout: number = 1000,
      forceSecondTry: boolean = true,
      confirmVisible: boolean = true
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
      if (confirmVisible && (await this.page.locator(locator).isVisible())) {
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

   // Multiple pages might need to fill the event group questions
   // when joining a livestream event
   async selectRandomCategoriesFromEvent(livestream: LivestreamEvent) {
      // wait for the questions tab to appear
      await this.assertTextIsVisible("Would Like To Know More About You", false)

      for (let groupQuestions of Object.values(livestream.groupQuestionsMap)) {
         for (let question of Object.values(groupQuestions.questions)) {
            let inputId = `#${groupQuestions.groupId}\\.questions\\.${question.id}\\.selectedOptionId`

            const options = Object.values(question.options)
            const randomOption =
               options[Math.floor(Math.random() * options.length)]

            if (
               this.page.context().browser().browserType().name() === "webkit"
            ) {
               // mui seems to use native select/options for webkit
               await this.page
                  .locator(`input[name="${inputId.substring(1)}"]`)
                  .fill(randomOption.id)
            } else {
               await materialSelectOption(this.page, randomOption.name, inputId)
            }
         }
      }
   }

   public enterEvent() {
      return this.resilientClick("text=Enter event")
   }
}

/**
 * Select option from MaterialUI Select Input
 * An approach to solve the flakiness of the tests
 *
 * Taken from https://stackoverflow.com/a/61856762
 * @param page
 * @param newSelectedValue
 * @param cssSelector
 * @constructor
 */
const materialSelectOption = async (page, newSelectedValue, cssSelector) => {
   return page.evaluate(
      ({ newSelectedValue, cssSelector }) => {
         let clickEvent = document.createEvent("MouseEvents")
         clickEvent.initEvent("mousedown", true, true)
         let selectNode = document.querySelector(cssSelector)
         selectNode.dispatchEvent(clickEvent)
         ;[...document.querySelectorAll("li")]
            .filter((el) => el.innerText == newSelectedValue)[0]
            .click()
      },
      {
         newSelectedValue,
         cssSelector,
      }
   )
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
