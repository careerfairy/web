import { COMMING_UP_NEXT_EVENT_TITLE } from "components/views/portal/events-preview/ComingUpNextEvents"
import { CommonPage } from "./CommonPage"
import { Locator, expect, Page } from "@playwright/test"
import { MY_NEXT_EVENTS_TITLE } from "components/views/portal/events-preview/MyNextEvents"

export class PortalPage extends CommonPage {
   readonly cookieAcceptButton: Locator
   readonly UpcomingEventsHeader: Locator
   readonly NextEventsHeader: Locator
   readonly skipVideoButton: Locator

   constructor(page: Page) {
      super(page)
      this.UpcomingEventsHeader = page.locator(
         `text=${COMMING_UP_NEXT_EVENT_TITLE}`
      )
      this.NextEventsHeader = page.locator(`text=${MY_NEXT_EVENTS_TITLE}`)
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
