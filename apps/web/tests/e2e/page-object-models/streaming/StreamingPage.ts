import { expect } from "@playwright/test"
import { CommonPage } from "../CommonPage"

/**
 * Common functionality between the new Streamer and Viewer pages
 * /streaming/host/:id
 * /streaming/viewer/:id
 */
export class StreamingPage extends CommonPage {
   public assertIsLive() {
      return expect(this.exactText("LIVE")).toBeVisible()
   }

   public async assertStreamerDetailsExist(streamer) {
      const streamerName = `${streamer.firstName} ${streamer.lastName}`
      expect(this.exactText(streamerName)).toBeVisible()
      return expect(this.exactText(streamer.position)).toBeVisible()
   }

   public async assertConnectionInterruptedDialogOpens() {
      return await expect(
         this.page.locator("text=Your connection got interrupted")
      ).toBeVisible()
   }

   public async assertConnectionInterruptedDialogIsClosed() {
      return await expect(
         this.page.locator("text=Your connection got interrupted")
      ).not.toBeVisible()
   }

   public async assertStreamIsOpenOnOtherBrowserDialogOpen() {
      await expect(
         this.page.locator("text=Session conflict detected")
      ).toBeVisible()
      await expect(
         this.page.locator("text=Click here to force connection")
      ).toBeVisible()
   }

   public clickQuestions() {
      return this.page.locator('[id="qanda-button"]').click()
   }

   public clickPolls() {
      return this.page.locator('[id="polls-button"]').click()
   }

   public clickChat() {
      return this.page.locator('[id="chat-button"]').click()
   }

   public clickHandRaise() {
      return this.page.locator('[id="hand-raise-button"]').click()
   }

   public async sendChatMessage(message: string) {
      const locator = this.page.locator('[placeholder="Write your message"]')
      await locator.click()
      await locator.pressSequentially(message)
      return locator.press("Enter")
   }
}
