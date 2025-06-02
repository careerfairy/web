import { expect } from "@playwright/test"
import { StreamingPage } from "./StreamingPage"

/**
 * Viewer page functionality
 * /streaming/:id/viewer
 */
export class ViewerPage extends StreamingPage {
   public open(livestreamId: string) {
      return this.page.goto(`/streaming/viewer/${livestreamId}`, {
         waitUntil: "commit",
      })
   }

   public assertWaitingRoomText() {
      return this.assertTextIsVisible(
         "Get ready!\nThe live stream starts soon."
      )
   }

   public async askQuestion(question: string) {
      const locator = this.page.locator('[placeholder="Ask your question"]')
      await locator.click()
      await locator.pressSequentially(question)
      return locator.press("Enter")
   }

   public async upvoteQuestion() {
      await expect(
         this.page.locator('button:has-text("0 likes")')
      ).toBeVisible()
      await this.page.locator('button:has-text("0 likes")').click()
   }

   public votePollAnswer(answer: string) {
      return this.page.locator(`button:has-text("${answer}")`).click()
   }

   public async requestToJoinHandRaise() {
      await expect(
         this.page.locator("text=Would you like to proceed?")
      ).toBeVisible()

      await this.page.locator(`button:has-text("Yes")`).click()

      await expect(this.text("Raise hand")).toBeVisible()
      await expect(
         this.page.locator('input[id="select-microphone"]')
      ).not.toHaveValue("")
      await this.page.locator('button:has-text("Raise hand")').click()

      return expect(
         this.page.locator(
            "text=Hand raise active: Your connection request has been sent, please wait to be invited."
         )
      ).toBeVisible()
   }
}
