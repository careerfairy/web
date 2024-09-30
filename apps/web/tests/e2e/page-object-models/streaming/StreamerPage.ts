import { expect } from "@playwright/test"
import { streaming } from "tests/constants"
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

   public async createAndJoinWithAdHocSpeaker(
      livestreamId: string,
      options?: {
         secureToken?: string
      }
   ) {
      await this.open(livestreamId, options)
      await this.page.locator('text="Add speaker"').click()
      await this.page.locator('input[name="firstName"]').click()
      await this.page
         .locator('input[name="firstName"]')
         .fill(streaming.streamer.firstName)
      await this.page.locator('input[name="lastName"]').click()
      await this.page
         .locator('input[name="lastName"]')
         .fill(streaming.streamer.lastName)
      await this.page.locator('input[name="position"]').click()
      await this.page
         .locator('input[name="position"]')
         .fill(streaming.streamer.position)
      await this.page.locator('input[name="email"]').click()
      await this.page
         .locator('input[name="email"]')
         .fill(streaming.streamer.email)

      const fileChooserPromise = this.page.waitForEvent("filechooser")
      await this.page.getByText("Upload speaker picture").click()
      const fileChooser = await fileChooserPromise
      await fileChooser.setFiles(streaming.streamer.avatar)

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
