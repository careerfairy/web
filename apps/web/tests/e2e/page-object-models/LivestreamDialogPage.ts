import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"
import { Locator, Page, expect } from "@playwright/test"
import { CommonPage } from "./CommonPage"

type CompleteLivestreamQuestionsViewOptions = {
   questionToAsk?: string
}

export default class LivestreamDialogPage extends CommonPage {
   public cancelRegistrationButton: Locator
   public registrationButton: Locator
   public notEnoughCreditsButton: Locator
   public buyRecordingButton: Locator
   public signUpToWatchButton: Locator
   public backButton: Locator

   constructor(page: Page, public livestream: LivestreamEvent) {
      super(page)

      this.cancelRegistrationButton = page.getByRole("link", {
         name: "Cancel registration",
      })

      this.registrationButton = page.getByTestId(
         "livestream-registration-button"
      )

      this.notEnoughCreditsButton = page.getByTestId(
         "livestream-not-enough-credits-button"
      )

      this.buyRecordingButton = page.getByTestId(
         "livestream-unlock-recording-button"
      )

      this.signUpToWatchButton = page.getByTestId(
         "livestream-signup-watch-button"
      )

      this.backButton = page.getByTestId("livestream-dialog-back-button")
   }

   async openDialog(waitForTitle: boolean = true) {
      await this.page.reload()
      await this.page
         .getByRole("link", {
            name: this.livestream.title,
         })
         .first() // there might be multiple cards for the same livestream (recommended, upcoming)
         .click()

      if (waitForTitle) {
         await expect(
            this.page.getByRole("tab", { name: "About The Live Stream" })
         ).toBeVisible()
      }
   }

   /**
    * Completes the registration process for a livestream
    * by going through all the views and filling out the required information
    */
   async completeSuccessfulRegistration({
      groupConsentRequired,
      joinTalentPool,
      questionsViewArgs,
   }: {
      groupConsentRequired?: boolean
      joinTalentPool?: boolean
      questionsViewArgs?: CompleteLivestreamQuestionsViewOptions
   } = {}) {
      // Wait for dialog to open fully
      await this.page.waitForTimeout(500)

      // register
      await this.clickRegistrationButton()

      // dialog views
      await this.completeGroupConsentView(groupConsentRequired ?? false)
      await this.completeLivestreamQuestionsView(questionsViewArgs)
      await this.completeJoinTalentPoolView(joinTalentPool ?? true)
      await this.completeRegistrationSuccessView()
   }

   async completeGroupConsentView(consentRequired: boolean = false) {
      const answerButtonText = "Answer & Proceed"
      const acceptButtonText = "Accept & Proceed"

      if (this.livestream.groupQuestionsMap) {
         await this.selectRandomCategoriesFromEvent(this.livestream)

         let buttonText = answerButtonText
         if (consentRequired) {
            buttonText = acceptButtonText
         }

         await this.page.getByRole("button", { name: buttonText }).click()

         return
      }

      if (consentRequired) {
         await this.page.getByRole("button", { name: acceptButtonText }).click()
      }
   }

   async completeLivestreamQuestionsView({
      questionToAsk,
   }: CompleteLivestreamQuestionsViewOptions = {}) {
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
         this.page.getByRole("heading", { name: "Successfully Registered" })
      ).toBeVisible()
   }

   async closeDialog() {
      await this.page.getByTestId("livestream-dialog-close").click()
   }

   async clickOnDialogBackButton() {
      await this.backButton.click()
   }

   async cancelRegistrationClick() {
      await this.cancelRegistrationButton.click()
   }

   async clickRegistrationButton() {
      await this.registrationButton.click()
   }

   async assertRecordingVideoIsVisible() {
      // play button
      await expect(
         this.page.getByTestId("PlayArrowRoundedIcon").locator("path")
      ).toBeVisible()
   }

   public async assertJobsAreVisible(jobs: LivestreamJobAssociation[]) {
      await Promise.all(
         jobs.map(async (job) => {
            await expect(this.page.getByText(job.name)).toBeVisible()
         })
      )
   }
}
