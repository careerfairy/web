import { CommonPage } from "./CommonPage"
import { Locator, expect, Page } from "@playwright/test"

export class PortalPage extends CommonPage {
   readonly cookieAcceptButton: Locator
   readonly UpcomingEventsHeader: Locator
   readonly NextEventsHeader: Locator
   readonly skipVideoButton: Locator
   readonly logo: Locator

   constructor(page: Page) {
      super(page)
      this.UpcomingEventsHeader = page.locator("text=COMING UP NEXT")
      this.NextEventsHeader = page.locator("text=MY NEXT EVENTS")
      this.cookieAcceptButton = page.locator("id=rcc-confirm-button")
      this.logo = page.locator("href=/")
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
}
