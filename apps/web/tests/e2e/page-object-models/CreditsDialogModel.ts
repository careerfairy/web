import { Locator, Page } from "@playwright/test"
import { CommonPage } from "./CommonPage"

const creditsItemButton = "credits-dialog-item-button"

export class CreditsDialogModel extends CommonPage {
   readonly backButton: Locator
   readonly uploadCVItem: Locator
   readonly attendFirstLivestreamItem: Locator
   readonly referFirstFriends: Locator
   readonly itemButton: Locator

   constructor(page: Page) {
      super(page)

      this.backButton = page.getByTestId("credits-dialog-back-button")
      this.uploadCVItem = page.getByTestId("credits-dialog-item-Upload your CV")
      this.attendFirstLivestreamItem = page.getByTestId(
         "credits-dialog-item-Attend first live stream"
      )
      this.referFirstFriends = page.getByTestId(
         "credits-dialog-item-Refer to 3 friends"
      )

      this.itemButton = page.getByTestId(creditsItemButton)
   }

   public async enterCVUpload() {
      await this.uploadCVItem.getByTestId(creditsItemButton).click()
   }

   public async enterFirstAttendance() {
      await this.attendFirstLivestreamItem
         .getByTestId(creditsItemButton)
         .click()
   }
}
