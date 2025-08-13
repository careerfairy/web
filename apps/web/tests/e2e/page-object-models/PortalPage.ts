import { expect, Locator, Page } from "@playwright/test"
import { CommonPage } from "./CommonPage"

export class PortalPage extends CommonPage {
   readonly cookieAcceptButton: Locator
   readonly UpcomingEventsHeader: Locator
   readonly NextEventsHeader: Locator
   readonly skipVideoButton: Locator

   constructor(page: Page) {
      super(page)
      this.cookieAcceptButton = page.locator("id=rcc-confirm-button")
      this.skipVideoButton = this.page.getByRole("button", {
         name: "Skip video",
      })
   }

   async assertWelcomeDialog() {
      await expect(this.skipVideoButton).toBeVisible()
      await this.skipVideoButton.click()

      // welcome view
      await expect(this.page.getByText("Welcome to CareerFairy!")).toBeVisible()
   }

   async assertWelcomeText(userName: string) {
      await expect(this.page.getByText(`Welcome, ${userName}!`)).toBeVisible()
   }
}
