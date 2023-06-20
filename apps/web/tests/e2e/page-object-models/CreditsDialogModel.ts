import { Locator, Page } from "@playwright/test"
import { CommonPage } from "./CommonPage"

const creditsItemButton = "credits-dialog-item-button"

export class CreditsDialogModel extends CommonPage {
   readonly backButton: Locator
   readonly uploadCVItem: Locator
   readonly itemButton: Locator

   constructor(page: Page) {
      super(page)

      this.backButton = page.getByTestId("credits-dialog-back-button")
      this.uploadCVItem = page.getByTestId("credits-dialog-item-Upload your CV")
      this.itemButton = page.getByTestId(creditsItemButton)
   }

   public async enterCVUpload() {
      await this.uploadCVItem.getByTestId(creditsItemButton).click()
   }
}
