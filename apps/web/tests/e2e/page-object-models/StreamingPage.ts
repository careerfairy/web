import { CommonPage } from "./CommonPage"
import { pdfSamplePath, streaming } from "../../constants"
import { expect } from "@playwright/test"

/**
 * Common functionality between Streamer and Viewer pages
 * /streaming/:id/joining-streamer
 * /streaming/:id/viewer
 */
class StreamingPage extends CommonPage {
   public questionVotesLocator = this.page.locator(
      '[data-testid="streaming-question-votes"]'
   )

   public connectionInterruptedTroubleMessageLocator = this.page.locator(
      "text=We're having trouble connecting you with CareerFairy:"
   )
   public connectionInterruptedTroubleRefreshButtonLocator = this.page.locator(
      'button:has-text("Refresh")'
   )

   public backToMainRoom() {
      return Promise.all([
         this.page.waitForNavigation({ waitUntil: "commit" }),
         this.page.locator('[aria-label="Back to main room"]').click(),
      ])
   }

   public assertConnectionInterruptedDialogOpens() {
      return expect(
         this.page.locator(
            "text=It seems like the connection got interrupted. Attempting to reconnect..."
         )
      ).toBeVisible()
   }

   public assertWaitingForStreamerText() {
      return this.assertTextIsVisible("Waiting for streamer")
   }

   public async assertStreamerDetailsExist() {
      const streamerName = `${streaming.streamer.firstName} ${streaming.streamer.lastName}`
      await expect(this.exactText(streamerName)).toBeVisible()
      return expect(this.exactText(streaming.streamer.occupation)).toBeVisible()
   }

   public clickHandRaise() {
      return this.page.locator('[data-testid="streaming-Hand Raise"]').click()
   }

   public clickQuestions() {
      return this.page.locator('[data-testid="streaming-Q\\&A"]').click()
   }

   public clickPolls() {
      return this.page.locator('[data-testid="streaming-Polls"]').click()
   }

   public async sendAQuestionReaction(reactionMessage: string) {
      await this.page
         .locator('[placeholder="Send a reaction\\.\\.\\."]')
         .fill(reactionMessage)
      return this.page
         .locator('[placeholder="Send a reaction\\.\\.\\."]')
         .press("Enter")
   }

   public openChat(expectedNotifications: number = 0) {
      return this.page
         .locator(`div[role="button"]:has-text("${expectedNotifications}Chat")`)
         .click()
   }

   public async sendChatMessage(message: string) {
      const locator = this.page.locator(
         '[placeholder="Post in the chat\\.\\.\\."]'
      )
      await locator.click()
      await locator.fill(message)
      return locator.press("Enter")
   }
}

/**
 * Streamer page functionality
 * /streaming/:id/joining-streamer
 */
export class StreamerPage extends StreamingPage {
   public readonly shareButton = this.page.locator('[data-testid="Share"]')

   public manageBreakoutRooms() {
      return this.page.locator('[aria-label="Manage breakout rooms"]').click()
   }

   public open(
      livestreamId: string,
      options?: {
         secureToken?: string
         isMainStreamer?: boolean
      }
   ) {
      const queryString = "?token=" + options?.secureToken

      const path = options?.isMainStreamer
         ? "main-streamer"
         : "joining-streamer"

      return this.page.goto(
         `/streaming/${livestreamId}/${path}${
            options?.secureToken ? queryString : ""
         }`,
         {
            waitUntil: "commit",
         }
      )
   }

   public async activateHandRaise() {
      await this.page.locator("text=Activate Hand Raise").click()
      return expect(
         this.page.locator("text=Waiting for viewers to raise their hands...")
      ).toBeVisible()
   }

   public acceptUserRequestToJoinHandRaise() {
      return this.page.locator("text=Invite to speak").click()
   }

   public clickCreatePoll() {
      return this.page.locator("text=Create Poll").click()
   }

   public async fillPollDialog(
      question: string,
      option1: string,
      option2: string
   ) {
      await this.page
         .locator(
            '[placeholder="Write down your question or poll to your audience"]'
         )
         .fill(question)
      await this.page
         .locator(
            'text=Option 1Option 1 >> [placeholder="Write down your option"]'
         )
         .fill(option1)
      await this.page
         .locator(
            'text=Option 2Option 2 >> [placeholder="Write down your option"]'
         )
         .fill(option2)
      return this.page.locator('div[role="dialog"] >> text=Create Poll').click()
   }

   public askQuestionToTheAudience() {
      return this.page.locator("text=Ask the Audience Now").click()
   }

   public closePoll() {
      return this.page.locator("text=Close Poll").click()
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
      options?: {
         secureToken?: string
         isMainStreamer?: boolean
      }
   ) {
      await this.open(livestreamId, options)
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
      await this.exactText("Activate Camera").click()
      await this.exactText("Activate Microphone").click()
      await this.page.locator('button:has-text("Join as streamer")').click()
   }

   public assertIsLive() {
      return expect(this.exactText("YOU ARE LIVE")).toBeVisible()
   }

   public async joinBreakoutRoom() {
      await Promise.all([
         this.page.waitForNavigation({ waitUntil: "commit" }),
         this.exactText("Join Room").click(),
      ])
      await this.exactText("Join now").click()
      return this.page.locator('button:has-text("Join as streamer")').click()
   }

   public async createSingleBreakoutRoom() {
      await this.exactText("Create Rooms").click()
      return this.page.locator('[aria-label="Expand"] >> text=Open').click()
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
      return this.page.goto(`/streaming/${livestreamId}/viewer`, {
         waitUntil: "commit",
      })
   }

   public async askQuestion(question: string) {
      await this.page.locator("text=Add a Question").click()
      await this.page.locator('[placeholder="Your question goes here"]').click()
      await this.page
         .locator('[placeholder="Your question goes here"]')
         .fill(question)
      return this.page.locator("text=Submit").click()
   }

   public upvoteQuestion() {
      return this.page.locator('button:has-text("UPVOTE")').click()
   }

   public votePollAnswer(answer: string) {
      return this.page.locator(`button:has-text("${answer}")`).click()
   }

   public async requestToJoinHandRaise() {
      await this.page
         .locator("text=Request to Join with video and audio")
         .click()
      await this.page.locator("text=Confirm Hand Raise").click()
      return expect(
         this.page.locator(
            "text=Your hand raise request has been sent, please wait to be invited."
         )
      ).toBeVisible()
   }

   public async clickFirstBreakoutRoomBannerLink() {
      return Promise.all([
         this.page.locator('[data-testid="breakout-room-banner-item"]').click(),
         this.page.waitForNavigation({ waitUntil: "commit" }),
      ])
   }

   public async clickJobsTab() {
      return this.page.locator('[data-testid="streaming-Jobs"]').click()
   }

   public async clickJobButton(jobName: string) {
      return this.page.getByRole("button", { name: jobName }).click()
   }

   public async clickUploadCvButton() {
      return this.page
         .getByRole("button", { name: "Upload New CV [.pdf]" })
         .click()
   }

   public async uploadCv() {
      return this.clickAndUploadFiles(
         this.page.getByRole("button", {
            name: "Upload New CV [.pdf]",
         }),
         pdfSamplePath
      )
   }

   public async clickApplyButton() {
      return this.page.getByRole("button", { name: "Apply Now" }).click()
   }

   public async assertJobApplyCongratsMessage() {
      return expect(
         this.page.getByRole("heading", {
            name: "Congrats! You have already applied to this job!",
         })
      ).toBeVisible()
   }
}
