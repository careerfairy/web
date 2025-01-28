import {
   CreateLivestreamPollRequest,
   Speaker,
} from "@careerfairy/shared-lib/livestreams"
import { expect } from "@playwright/test"
import { getFormattedName } from "components/views/streaming-page/util"
import { pdfSamplePath, streaming } from "tests/constants"
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
      speaker: Speaker,
      options?: {
         secureToken?: string
      }
   ) {
      await this.open(livestreamId, options)
      await this.page
         .locator(
            `text=${getFormattedName(speaker.firstName, speaker.lastName)}`
         )
         .click()
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
      ).not.toHaveValue("", { timeout: 12000 })
      await this.page.locator('button:has-text("Join live stream")').click()
   }

   public async commentOnQuestion(text: string) {
      const locator = this.page.locator('[placeholder="Answer with text"]')
      await locator.click()
      await locator.pressSequentially(text)
      return locator.press("Enter")
   }

   public async createPoll(poll: Partial<CreateLivestreamPollRequest>) {
      await this.page.locator('textarea[name="question"]').click()
      await this.page.locator('textarea[name="question"]').fill(poll.question)
      // Iterate over the poll options and fill them dynamically
      for (const [index, option] of poll.options.entries()) {
         const optionSelector = `input[name="options.${index}.text"]`
         await this.page.locator(optionSelector).click()
         await this.page.locator(optionSelector).fill(option.text)
      }

      await this.page.locator('button:has-text("Create poll")').click()
   }

   public async startPoll() {
      await this.page.locator('button:has-text("Start poll")').click()
   }

   public async closePoll() {
      await this.page.locator('button:has-text("Close poll")').click()
   }

   public async activateHandRaise() {
      await this.page.locator("text=Activate Hand Raise").click()
      return expect(
         this.page.locator(
            "text=Hand raise active: Your audience can now request to join via audio and video."
         )
      ).toBeVisible({ timeout: 8000 })
   }

   public async acceptUserRequestToJoinHandRaise() {
      await expect(this.text("Approve")).toBeVisible()
      await this.page.locator('button:has-text("Approve")').click()
   }

   public clickShareContent() {
      return this.page.locator('[id="share-content-button"]').click()
   }

   public async stopSharingPDF() {
      this.page.locator('[id="stop-sharing-button"]').click()
   }

   public async sharePDF() {
      await this.page.locator('[id="share-content-button"]').click()
      await this.page.locator('li:has-text("Share PDF presentation")').click()
      const fileChooserPromise = this.page.waitForEvent("filechooser")
      await this.page.getByText("Browse files").click()
      const fileChooser = await fileChooserPromise
      await fileChooser.setFiles(pdfSamplePath)
      await this.page.locator('button:has-text("Share slides")').click()
   }
}
