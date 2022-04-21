import { Locator, Page } from "@playwright/test"
import CommonPage from "./CommonPage"
import { Group } from "@careerfairy/shared-lib/dist/groups"

export default class UpcomingLivestreamPage extends CommonPage {
   public readonly buttonEventOver: Locator
   public readonly buttonAlreadyBooked: Locator

   constructor(page: Page) {
      super(page)

      this.buttonEventOver = this.exactText("The event is over")
      this.buttonAlreadyBooked = this.text("You're booked")
   }

   open(livestreamId: string) {
      return this.page.goto(`/upcoming-livestream/${livestreamId}`)
   }

   attend() {
      return this.exactText("I'll attend").click()
   }

   async selectRandomCategoriesFromGroup(group: Group) {
      for (let category of group.categories) {
         await this.page
            .locator(`text=New!​${category.name} >> div[role="button"]`)
            .click()

         const randomOption =
            category.options[
               Math.floor(Math.random() * category.options.length)
            ]

         await this.page.locator(`[data-value="${randomOption.id}"]`).click()
      }
   }

   modalAttend() {
      return this.page
         .locator('div[role="dialog"] >> text=I\'ll attend')
         .click()
   }

   modalSubmit() {
      return this.page.locator('div[role="dialog"] >> text=Submit').click()
   }

   joinTalentPool() {
      return this.page
         .locator('div[role="dialog"] >> text=Join Talent Pool')
         .click()
   }

   skip() {
      return this.page.locator("text=Skip").click()
   }

   finish() {
      return this.page.locator("text=See all our events").click()
   }

   cancel() {
      return this.page.locator("text=Cancel").click()
   }

   async fillQuestion(question: string) {
      const input = this.page.locator(
         'text=ASK YOUR QUESTION. GET THE ANSWER DURING THE LIVE STREAM.Your QuestionYour Quest >> [placeholder="What would like to ask our speaker\\?"]'
      )

      await input.click()
      await input.fill(question)
   }
}
