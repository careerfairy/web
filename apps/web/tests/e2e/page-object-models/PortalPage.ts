import { CommonPage } from "./CommonPage"
import { Locator, expect, Page } from "@playwright/test"

export class PortalPage extends CommonPage {
   readonly cookieAcceptButton: Locator
   readonly UpcomingEventsHeader: Locator
   readonly NextEventsHeader: Locator
   readonly skipVideoButton: Locator

   constructor(page: Page) {
      super(page)
      this.UpcomingEventsHeader = page.locator(`text=Upcoming live streams`)
      this.NextEventsHeader = page.locator(`text=My registrations`)
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
}
