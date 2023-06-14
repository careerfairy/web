import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { Locator, Page, expect } from "@playwright/test"
import { CommonPage } from "./CommonPage"

export default class LivestreamDialogPage extends CommonPage {
   public cancelRegistrationButton: Locator

   constructor(page: Page, public livestream: LivestreamEvent) {
      super(page)

      this.cancelRegistrationButton = page.getByRole("link", {
         name: "Cancel registration",
      })
   }

   async openDialog() {
      await this.page
         .getByRole("link", {
            name: this.livestream.title,
         })
         .first() // there might be multiple cards for the same livestream (recommended, upcoming)
         .click()

      await expect(
         this.page.getByRole("tab", { name: "About The Live Stream" })
      ).toBeVisible()
   }

   /**
    * Completes the registration process for a livestream
    * by going through all the views and filling out the required information
    */
   async completeSuccessfulRegistration() {
      // register
      await this.page.getByTestId("livestream-registration-button").click()

      // dialog views
      await this.completeGroupConsentView()
      await this.completeLivestreamQuestionsView()
      await this.completeJoinTalentPoolView(false)
      await this.completeRegistrationSuccessView()
   }

   async completeGroupConsentView() {
      if (this.livestream.groupQuestionsMap) {
         await this.selectRandomCategoriesFromEvent(this.livestream)
      }

      await this.page.getByRole("button", { name: "Answer & Proceed" }).click()
   }

   async completeLivestreamQuestionsView({
      questionToAsk,
   }: { questionToAsk?: string } = {}) {
      if (questionToAsk) {
         await this.page
            .getByPlaceholder("Write your question")
            .fill(questionToAsk)
         await this.page.getByRole("button", { name: "Submit" }).click()

         // question should be become visible
         await expect(this.page.getByText(questionToAsk)).toBeVisible()
         await expect(this.page.getByText("a few seconds ago")).toBeVisible()
      }

      await this.page.getByRole("button", { name: "Next" }).click()
   }

   async completeJoinTalentPoolView(join: boolean = true) {
      if (join) {
         await this.page
            .getByRole("button", { name: "Join talent pool" })
            .click()
      } else {
         await this.page.getByRole("button", { name: "Maybe later" }).click()
      }
   }

   async completeRegistrationSuccessView() {
      await expect(
         this.page.getByRole("heading", { name: "Registration Successful" })
      ).toBeVisible()
   }

   async closeDialog() {
      await this.page.getByTestId("livestream-dialog-close").click()
   }
}
