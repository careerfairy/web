import { Locator, Page } from "@playwright/test"
import { CommonPage } from "./CommonPage"

export default class UpcomingLivestreamPage extends CommonPage {
   public readonly buttonEventOver: Locator
   public readonly buttonPastEventNoLogin: Locator
   public readonly buttonAlreadyBooked: Locator

   constructor(page: Page) {
      super(page)

      this.buttonEventOver = this.exactText("The event is over")
      this.buttonPastEventNoLogin = this.exactText("Sign Up to Watch")
      this.buttonAlreadyBooked = this.text("You're registered")
   }

   /**
    * Open the upcoming livestream page
    *
    * If the livestream is live, there will be an automatic redirect
    * to /streaming/livestreamId where the user will have to answer group questions
    *
    * @param livestreamId
    * @param handleRedirectAfterwards
    */
   async open(livestreamId: string, handleRedirectAfterwards: boolean = false) {
      const path = `/upcoming-livestream/${livestreamId}`

      if (handleRedirectAfterwards) {
         // probably there is a redirect, don't wait for the page load
         return this.page.goto(path, { waitUntil: "commit" })
      }

      return this.resilientGoto(path)
   }

   attend() {
      return this.resilientClick(
         `data-testid=livestream-registration-button`,
         3,
         1000,
         true,
         false
      )
   }

   async modalAttend() {
      return this.resilientClick('div[role="dialog"] >> text=Attend Event')
   }

   modalSubmit() {
      return this.resilientClick('div[role="dialog"] >> text=Submit')
   }

   joinTalentPool() {
      return this.resilientClick('div[role="dialog"] >> text=Join Talent Pool')
   }

   skip() {
      return this.page.locator('button:has-text("Skip")').click()
   }

   finish() {
      return this.resilientClick("text=Discover more live streams")
   }

   cancel() {
      return this.resilientClick("text=Cancel")
   }

   async fillQuestion(question: string) {
      const input = this.page.locator(
         'text=ASK YOUR QUESTION. GET THE ANSWER DURING THE LIVE STREAM.Your QuestionYour Quest >> [placeholder="What would like to ask our speaker\\?"]'
      )

      await input.click()
      await input.fill(question)
   }
}
