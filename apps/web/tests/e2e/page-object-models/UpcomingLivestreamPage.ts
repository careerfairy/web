import { Locator, Page } from "@playwright/test"
import { CommonPage } from "./CommonPage"

export default class UpcomingLivestreamPage extends CommonPage {
   public readonly buttonEventOver: Locator
   public readonly buttonAlreadyBooked: Locator

   constructor(page: Page) {
      super(page)

      this.buttonEventOver = this.exactText("The event is over")
      this.buttonAlreadyBooked = this.text("You're booked")
   }

   async open(livestreamId: string) {
      return this.resilientGoto(`/upcoming-livestream/${livestreamId}`)
   }

   attend() {
      return this.resilientClick(`text="I'll attend"`)
   }

   async modalAttend() {
      return this.resilientClick('div[role="dialog"] >> text=I\'ll attend')
   }

   modalSubmit() {
      return this.resilientClick('div[role="dialog"] >> text=Submit')
   }

   joinTalentPool() {
      return this.resilientClick('div[role="dialog"] >> text=Join Talent Pool')
   }

   skip() {
      return this.text("Skip").click()
   }

   finish() {
      return this.resilientClick("text=See all our events")
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
