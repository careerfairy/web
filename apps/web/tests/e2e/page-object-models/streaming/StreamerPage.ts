import { expect } from "@playwright/test"
import { StreamingPage } from "./StreamingPage"

/**
 * Streamer page functionality
 * /streaming/host/:id
 */
export class StreamerPage extends StreamingPage {
   public open(
      livestreamId: string,
      options?: {
         secureToken?: string
      }
   ) {
      const queryString = "?token=" + options?.secureToken

      return this.page.goto(
         `/streaming/host/${livestreamId}/${
            options?.secureToken ? queryString : ""
         }`,
         {
            waitUntil: "commit",
         }
      )
   }

   public async selectAndJoinWithSpeaker(
      livestreamId: string,
      name: string,
      options?: {
         secureToken?: string
      }
   ) {
      await this.open(livestreamId, options)
      await this.page.locator(`text=${name}`).click()
      await this.page.locator('button:has-text("Join live stream")').click()
   }

   public async joinWithCameraAndMicrophone() {
      await expect(this.text("Join live stream")).toBeVisible()
      await expect(
         this.page.locator('input[id="select-microphone"]')
      ).not.toHaveValue("")
      await this.page.locator('button:has-text("Join live stream")').click()
   }

   public assertIsLive() {
      return expect(this.exactText("LIVE")).toBeVisible()
   }
}
