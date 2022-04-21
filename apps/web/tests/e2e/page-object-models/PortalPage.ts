import { Locator, Page } from "@playwright/test"

export class PortalPage {
   readonly page: Page
   readonly cookieAcceptButton: Locator
   readonly UpcomingEventsHeader: Locator
   readonly NextEventsHeader: Locator

   constructor(page: Page) {
      this.page = page
      this.UpcomingEventsHeader = page.locator("text=COMING UP NEXT")
      this.NextEventsHeader = page.locator("text=MY NEXT EVENTS")
      this.cookieAcceptButton = page.locator("id=rcc-confirm-button")
   }
}
