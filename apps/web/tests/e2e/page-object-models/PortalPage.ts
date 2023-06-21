import { Locator, Page } from "@playwright/test"
import { CommonPage } from "./CommonPage"

export class PortalPage extends CommonPage {
   readonly cookieAcceptButton: Locator
   readonly UpcomingEventsHeader: Locator
   readonly NextEventsHeader: Locator

   constructor(page: Page) {
      super(page)
      this.UpcomingEventsHeader = page.locator("text=COMING UP NEXT")
      this.NextEventsHeader = page.locator("text=MY NEXT EVENTS")
      this.cookieAcceptButton = page.locator("id=rcc-confirm-button")
   }
}
