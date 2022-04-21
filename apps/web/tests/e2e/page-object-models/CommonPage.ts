import { Locator, Page } from "@playwright/test"

export default class CommonPage {
   constructor(protected readonly page: Page) {}

   exactText(str: string) {
      return this.page.locator(`text="${str}"`)
   }

   text(str: string) {
      return this.page.locator(`text=${str}`)
   }

   acceptCookies() {
      return this.page.locator("id=rcc-confirm-button").click()
   }

   acceptCookiesEUConfirmation() {
      return this.page.locator("#hs-eu-confirmation-button").click()
   }
}
