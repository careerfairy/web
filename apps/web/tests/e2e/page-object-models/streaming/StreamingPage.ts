import { expect } from "@playwright/test"
import { CommonPage } from "../CommonPage"

/**
 * Common functionality between the new Streamer and Viewer pages
 * /streaming/host/:id
 * /streaming/viewer/:id
 */
export class StreamingPage extends CommonPage {
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
}
