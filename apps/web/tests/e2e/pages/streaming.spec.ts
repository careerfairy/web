import { test as base, expect } from "@playwright/test"
import LivestreamSeed from "@careerfairy/seed-data/dist/livestreams"
import { LoginPage } from "../page-object-models/LoginPage"
import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/dist/emulators"
import { StreamerPage, ViewerPage } from "../page-object-models/StreamingPage"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { sleep } from "../utils"
import GroupSeed from "@careerfairy/seed-data/dist/groups"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { credentials } from "../../constants"

/**
 * Test Fixture
 * Setup Pages and requirements
 */
const test = base.extend<{
   streamerPage: StreamerPage
   viewerPage: ViewerPage
   user: UserData
}>({
   user: async ({ page }, use) => {
      await clearAuthData()
      await clearFirestoreData()

      const user = await LoginPage.login(page)

      await use(user)
   },
   streamerPage: async ({ page, user }, use) => {
      const streamerPage = new StreamerPage(page)

      await use(streamerPage)
   },
   viewerPage: async ({ context, page, user }, use) => {
      const viewerPage = new ViewerPage(await context.newPage())

      await use(viewerPage)
   },
})

test.describe("Streaming Journey", () => {
   // todo: enable firefox and test
   // skip safari browser for all tests
   test.skip(
      ({ browserName }) => browserName !== "chromium",
      "Safari browser support for webrtc tests is not great atm, skipping."
   )

   test("streamer is able to join and viewer sees him", async ({
      streamerPage,
      viewerPage,
   }) => {
      const { livestream } = await setupStreamer(streamerPage)
      // Confirm the livestream is live and the streamer card is present
      await streamerPage.assertIsLive()
      await streamerPage.assertStreamerDetailsExist()

      // Streamer card should also be visible on the viewer page
      await viewerPage.open(livestream.id)
      await viewerPage.assertStreamerDetailsExist()
   })

   test("viewer - waiting for streamer", async ({ viewerPage }) => {
      const { livestream } = await setupData()
      await viewerPage.open(livestream.id)
      await viewerPage.assertWaitingForStreamerText()
   })

   test("streamer - share pdf presentation", async ({
      streamerPage,
      viewerPage,
   }) => {
      const { livestream } = await setupStreamer(streamerPage)

      // Viewer setup
      await viewerPage.open(livestream.id)
      await expect(viewerPage.textWaitForUploadSlidesLocator).not.toBeVisible()

      // Streamer starts to share a pdf
      await streamerPage.sharePDF()

      // Viewer should see the action on their end
      await expect(viewerPage.textWaitForUploadSlidesLocator).toBeVisible()

      // Stop sharing
      await streamerPage.stopSharingPDF()
      await sleep(2500) // give some time for action to propagate between agora and viewer
      await expect(viewerPage.textWaitForUploadSlidesLocator).not.toBeVisible()
   })

   test("viewer - ask questions and upvote", async ({
      streamerPage,
      viewerPage,
   }) => {
      const { livestream } = await setupStreamer(streamerPage)

      await viewerPage.open(livestream.id)

      const question = "My viewer question"
      // Viewer asks a question
      await viewerPage.page.locator("text=Add a Question").click()
      await viewerPage.page
         .locator('[placeholder="Your question goes here"]')
         .click()
      await viewerPage.page
         .locator('[placeholder="Your question goes here"]')
         .fill(question)
      await viewerPage.page.locator("text=Submit").click()

      // Streamer should see the question
      await streamerPage.page
         .locator("text=Hand RaisePollsQ&A >> #interaction-selector-action-3")
         .click()
      await expect(streamerPage.page.locator("text=" + question)).toBeVisible()
      await expect(
         await streamerPage.page.locator(
            '#scrollable-container span:has-text("0")'
         )
      ).toBeVisible()

      const reaction = "Streamer reaction to question"
      await streamerPage.page
         .locator('[placeholder="Send a reaction\\.\\.\\."]')
         .fill(reaction)
      await streamerPage.page
         .locator('[placeholder="Send a reaction\\.\\.\\."]')
         .press("Enter")

      await expect(viewerPage.exactText("1 reaction")).toBeVisible()
      await expect(viewerPage.exactText(reaction)).toBeVisible()

      // viewer upvotes the question
      await expect(
         streamerPage.page.locator("#scrollable-container >> text=0")
      ).toBeVisible()
      await viewerPage.page.locator('button:has-text("UPVOTE")').click()
      await expect(
         streamerPage.page.locator('#scrollable-container span:has-text("1")')
      ).toBeVisible()
   })

   test("chat messages between streamer and viewer", async ({
      user,
      streamerPage,
      viewerPage,
   }) => {
      const { livestream } = await setupStreamer(streamerPage)

      await viewerPage.open(livestream.id)

      // streamer posts a chat message
      const message = "First chat entry"
      await streamerPage.page
         .locator('div[role="button"]:has-text("0Chat")')
         .click()
      await streamerPage.page
         .locator('[placeholder="Post in the chat\\.\\.\\."]')
         .click()
      await streamerPage.page
         .locator('[placeholder="Post in the chat\\.\\.\\."]')
         .fill(message)
      await streamerPage.page
         .locator('[placeholder="Post in the chat\\.\\.\\."]')
         .press("Enter")

      // viewer receives the message
      await viewerPage.page
         .locator('div[role="button"]:has-text("1Chat")')
         .click()
      await expect(
         viewerPage.page.locator(`text=${message}Streamer`)
      ).toBeVisible()

      // viewer answers
      const response = "Viewer Response"
      await viewerPage.page
         .locator('[placeholder="Post in the chat\\.\\.\\."]')
         .fill(response)
      await viewerPage.page
         .locator('[placeholder="Post in the chat\\.\\.\\."]')
         .press("Enter")

      await expect(
         streamerPage.page.locator(`text=${response}${user.firstName}`)
      ).toBeVisible()
   })

   test("streamer creates a poll", async ({ streamerPage, viewerPage }) => {
      const { livestream } = await setupStreamer(streamerPage)

      await viewerPage.open(livestream.id)

      await streamerPage.page
         .locator('text=Hand RaisePollsQ&A >> button[role="menuitem"]')
         .nth(2)
         .click()
      await streamerPage.page.locator("text=Create Poll").click()
      await streamerPage.page
         .locator(
            '[placeholder="Write down your question or poll to your audience"]'
         )
         .fill("My first poll")
      await streamerPage.page
         .locator(
            'text=Option 1Option 1 >> [placeholder="Write down your option"]'
         )
         .fill("First answer")
      await streamerPage.page
         .locator(
            'text=Option 2Option 2 >> [placeholder="Write down your option"]'
         )
         .fill("Second answer")
      await streamerPage.page
         .locator('div[role="dialog"] >> text=Create Poll')
         .click()
      await streamerPage.page.locator("text=Ask the Audience Now").click()

      // viewer sees the poll and answers
      await expect(viewerPage.page.locator("text=My first poll")).toBeVisible()
      await viewerPage.page.locator('button:has-text("First answer")').click()

      // streamer sees the answer
      await expect(
         streamerPage.page.locator(
            'div[role="button"]:has-text("First answer [1 Vote]")'
         )
      ).toBeVisible()

      // end poll
      // navigate away and back to polls
      await streamerPage.page
         .locator('text=Hand RaisePollsQ&A >> button[role="menuitem"]')
         .nth(3)
         .click()
      await streamerPage.page
         .locator('text=Hand RaisePollsQ&A >> button[role="menuitem"]')
         .nth(2)
         .click()
      await streamerPage.page.locator("text=Close Poll").click()
      await expect(
         viewerPage.page.locator("text=No current poll")
      ).toBeVisible()
   })

   test("browser becomes offline, reconnect dialog shows up", async ({
      streamerPage,
      viewerPage,
   }) => {
      const { livestream } = await setupStreamer(streamerPage)

      await viewerPage.open(livestream.id)
      await viewerPage.assertStreamerDetailsExist()

      await streamerPage.page.context().setOffline(true)

      // dialog with a loading spinner should show up
      await expect(
         viewerPage.page.locator(
            "text=It seems like the connection got interrupted. Attempting to reconnect..."
         )
      ).toBeVisible()
      await expect(
         streamerPage.page.locator(
            "text=It seems like the connection got interrupted. Attempting to reconnect..."
         )
      ).toBeVisible()

      // after some time we have the button to refresh the page
      await expect(
         streamerPage.page.locator(
            "text=We're having trouble connecting you with CareerFairy:"
         )
      ).toBeVisible({ timeout: 15000 })
      await expect(
         streamerPage.page.locator("text=Click here to refresh once done")
      ).toBeVisible()

      // re-connect the browser, the dialog should disappear
      await streamerPage.page.context().setOffline(false)
      await expect(
         streamerPage.page.locator("text=Click here to refresh once done")
      ).not.toBeVisible()
   })

   test("duplicate tab should open a dialog to close it", async ({
      streamerPage,
      viewerPage,
   }) => {
      const { livestream } = await setupStreamer(streamerPage)

      await viewerPage.open(livestream.id)
      await viewerPage.assertStreamerDetailsExist()

      // Open a duplicated viewer tab
      const duplicateViewerPage = new ViewerPage(
         await viewerPage.page.context().newPage()
      )
      await duplicateViewerPage.open(livestream.id)
      await duplicateViewerPage.assertStreamerDetailsExist()

      // first viewer tab should open a dialog to close it since its duplicated
      await expect(
         viewerPage.page.locator(
            "text=You seem to have the stream open on another window:"
         )
      ).toBeVisible()
      await expect(
         viewerPage.page.locator("text=Close the stream and continue here")
      ).toBeVisible()
   })

   test("livestream event group requires filling some questions on sign up", async ({
      streamerPage,
      viewerPage,
   }) => {
      const { livestream, group } = await setupStreamer(streamerPage, true)

      await viewerPage.open(livestream.id)
      await viewerPage.selectRandomCategoriesFromGroup(group)

      await viewerPage.page.locator("text=Enter event").click()
      await viewerPage.assertStreamerDetailsExist()
   })
})

// assert agora logs for publish / subscribe events

async function setupStreamer(
   streamerPage: StreamerPage,
   setupGroup: boolean = false
) {
   const { livestream, secureToken, group } = await setupData(setupGroup)
   await streamerPage.openAndFillStreamerDetails(livestream.id, secureToken)
   await streamerPage.joinWithCameraAndMicrophone()

   return { livestream, secureToken, group }
}

async function setupData(setupGroup: boolean = false) {
   let group: Group
   let overrideLivestreamDetails = {}

   if (setupGroup) {
      group = await GroupSeed.createGroup(
         Object.assign({
            adminEmails: [credentials.correctEmail],
         })
      )

      // associate the group with the livestream
      overrideLivestreamDetails = {
         groupIds: [group.id],
      }
   }

   const livestream = await LivestreamSeed.createLive(overrideLivestreamDetails)

   const secureToken = await LivestreamSeed.generateSecureToken(livestream.id)

   return { livestream, secureToken, group }
}
