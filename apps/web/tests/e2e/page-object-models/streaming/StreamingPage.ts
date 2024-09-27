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
}
