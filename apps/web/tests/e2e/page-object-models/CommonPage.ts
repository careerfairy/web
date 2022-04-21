import { Locator, Page } from "@playwright/test"

export class CommonPage {
   readonly page: Page
   readonly cookieAcceptButton: Locator

   constructor(page: Page) {
      this.page = page
      this.cookieAcceptButton = page.locator("id=rcc-confirm-button")
   }

   async acceptCookies() {
      return this?.cookieAcceptButton.click()
   }
}
