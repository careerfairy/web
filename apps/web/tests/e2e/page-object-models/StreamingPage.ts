import { CommonPage } from "./CommonPage"
import { streaming } from "../../constants"
import { expect } from "@playwright/test"

/**
 * Common functionality between Streamer and Viewer pages
 * /streaming/:id/joining-streamer
 * /streaming/:id/viewer
 */
class StreamingPage extends CommonPage {
   public assertWaitingForStreamerText() {
      return this.assertTextIsVisible("Waiting for streamer")
   }

   public async assertStreamerDetailsExist() {
      const streamerName = `${streaming.streamer.firstName} ${streaming.streamer.lastName}`
      await expect(this.exactText(streamerName)).toBeVisible()
      return expect(this.exactText(streaming.streamer.occupation)).toBeVisible()
   }
}

/**
 * Streamer page functionality
 * /streaming/:id/joining-streamer
 */
export class StreamerPage extends StreamingPage {
   public readonly shareButton = this.page.locator('[data-testid="Share"]')

   public open(livestreamId: string, token?: string) {
      const queryString = "?token=" + token

      return this.page.goto(
         `/streaming/${livestreamId}/joining-streamer${
            token ? queryString : ""
         }`
      )
   }

   public async sharePDF() {
      await this.shareButton.click()
      return this.page
         .locator('div[role="button"]:has-text("Share PDF presentation")')
         .click()
   }

   public async stopSharingPDF() {
      await this.shareButton.click()
      return this.page
         .locator(
            'div[role="button"]:has-text("Stop Sharing PDF presentation")'
         )
         .click()
   }

   public async openAndFillStreamerDetails(
      livestreamId: string,
      token?: string
   ) {
      await this.open(livestreamId, token)
      return this.fillStreamerDetails(
         streaming.streamer.firstName,
         streaming.streamer.lastName,
         streaming.streamer.occupation,
         streaming.streamer.linkedin
      )
   }

   public async fillStreamerDetails(
      firstName: string,
      lastName: string,
      occupation: string,
      linkedInUrl?: string
   ) {
      await this.page.locator('input[name="firstName"]').click()
      await this.page.locator('input[name="firstName"]').fill(firstName)
      await this.page.locator('input[name="lastName"]').click()
      await this.page.locator('input[name="lastName"]').fill(lastName)
      await this.page.locator('[placeholder="Lead Engineer"]').click()
      await this.page.locator('[placeholder="Lead Engineer"]').fill(occupation)

      if (!linkedInUrl) {
         await this.page.locator('input[type="checkbox"]').check()
      } else {
         await this.page
            .locator(
               '[placeholder="https\\:\\/\\/linkedin\\.com\\/in\\/your-profile"]'
            )
            .click()
         await this.page
            .locator(
               '[placeholder="https\\:\\/\\/linkedin\\.com\\/in\\/your-profile"]'
            )
            .fill(linkedInUrl)
      }

      return this.page.locator("text=Join now").click()
   }

   public async joinWithCameraAndMicrophone() {
      await this.page.locator("text=Activate Camera").click()
      await this.page.locator("#mui-31").click()
      await this.page.locator('button:has-text("Join as streamer")').click()
   }

   public assertIsLive() {
      return expect(this.exactText("YOU ARE LIVE")).toBeVisible()
   }
}

/**
 * Viewer page functionality
 * /streaming/:id/viewer
 */
export class ViewerPage extends StreamingPage {
   public textWaitForUploadSlidesLocator = this.exactText(
      "Please wait for the presenter to upload slides."
   )

   public open(livestreamId: string) {
      return this.page.goto(`/streaming/${livestreamId}/viewer`)
   }
}
