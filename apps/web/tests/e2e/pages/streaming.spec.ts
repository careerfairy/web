import { expect, test as base } from "@playwright/test"
import LivestreamSeed, {
   createLivestreamGroupQuestions,
} from "@careerfairy/seed-data/dist/livestreams"
import { LoginPage } from "../page-object-models/LoginPage"
import UserSeed from "@careerfairy/seed-data/dist/users"
import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/dist/emulators"
import { StreamerPage, ViewerPage } from "../page-object-models/StreamingPage"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { sleep } from "../utils"
import GroupSeed from "@careerfairy/seed-data/dist/groups"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
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

      const userData = await UserSeed.createUser(credentials.correctEmail)

      await LoginPage.login(page)

      await use(userData)
   },
   streamerPage: async ({ page, user, context }, use) => {
      const streamerPage = new StreamerPage(page)

      await use(streamerPage)
   },
   viewerPage: async ({ context, page, user }, use) => {
      const viewerTabPage = await context.newPage()

      const viewerPage = new ViewerPage(viewerTabPage)

      await use(viewerPage)
   },
})

test.describe("Streaming Journey", () => {
   // Only run those tests on chromium
   // Firefox headless (macos) doesn't seem to load the camera/mic
   // webkit (safari) has an open issue: https://github.com/microsoft/playwright/issues/2973
   test.skip(
      ({ browserName }) => browserName !== "chromium",
      "Safari/Firefox browser support for webrtc tests is not great atm, skipping."
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

      // Viewer asks a question
      const question = "My viewer question"
      await viewerPage.askQuestion(question)

      // Streamer should see the question
      await streamerPage.clickQuestions()
      await expect(streamerPage.exactText(question)).toBeVisible()
      await expect(streamerPage.questionVotesLocator).toBeVisible()

      // Streamer answers with a reaction
      const reaction = "Streamer reaction to question"
      await streamerPage.sendAQuestionReaction(reaction)

      // Viewer should see the reaction
      await expect(viewerPage.exactText("1 reaction")).toBeVisible()
      await expect(viewerPage.exactText(reaction)).toBeVisible()

      // viewer up votes the question
      await expect(viewerPage.questionVotesLocator).toBeVisible()
      await viewerPage.upvoteQuestion()
      await expect(viewerPage.questionVotesLocator).toContainText("1")
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
      const name = user.firstName + " " + user.lastName.charAt(0)
      await streamerPage.hideEmulatorWarning()
      await streamerPage.openChat()
      await streamerPage.sendChatMessage(message)

      // viewer receives the message
      await viewerPage.hideEmulatorWarning()
      await viewerPage.openChat(1)
      await expect(viewerPage.text(`${message}${name}`)).toBeVisible()

      // viewer answers
      const response = "Viewer Response"
      await viewerPage.sendChatMessage(response)

      // streamer receives the response
      await expect(
         streamerPage.text(`${response}${user.firstName}`)
      ).toBeVisible()
   })

   test("streamer creates a poll", async ({ streamerPage, viewerPage }) => {
      const { livestream } = await setupStreamer(streamerPage)

      await viewerPage.open(livestream.id)

      const poll = {
         question: "My first poll",
         option1: "First answer",
         option2: "Second answer",
      }

      // Streamer creates the poll
      await streamerPage.clickPolls()
      await streamerPage.clickCreatePoll()
      await streamerPage.fillPollDialog(
         poll.question,
         poll.option1,
         poll.option2
      )
      await streamerPage.askQuestionToTheAudience()

      // viewer sees the poll and answers
      await expect(viewerPage.exactText(poll.question)).toBeVisible()
      await viewerPage.votePollAnswer(poll.option1)

      // streamer sees the answer
      await expect(
         streamerPage.page.locator(
            `div[role="button"]:has-text("${poll.option1} [1 Vote]")`
         )
      ).toBeVisible()

      // end poll
      // navigate away and back to polls
      await streamerPage.clickHandRaise()
      await streamerPage.clickPolls()
      await streamerPage.closePoll()
      await expect(viewerPage.exactText("No current poll")).toBeVisible()
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
      await viewerPage.assertConnectionInterruptedDialogOpens()
      await streamerPage.assertConnectionInterruptedDialogOpens()

      // after some time we have the button to refresh the page
      await expect(
         streamerPage.connectionInterruptedTroubleMessageLocator
      ).toBeVisible({ timeout: 15000 })
      await expect(
         streamerPage.connectionInterruptedTroubleRefreshButtonLocator
      ).toBeVisible()

      // re-connect the browser, the dialog should disappear
      await streamerPage.page.context().setOffline(false)
      await expect(
         streamerPage.connectionInterruptedTroubleRefreshButtonLocator
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
         viewerPage.page.locator("text=CLICK HERE TO FORCE CONNECTION")
      ).toBeVisible()
   })

   test("livestream event group requires filling some questions on sign up", async ({
      streamerPage,
      viewerPage,
   }) => {
      test.skip()
      const { livestream } = await setupStreamer(streamerPage, {
         setupGroup: true,
      })

      await viewerPage.open(livestream.id)
      await viewerPage.selectRandomCategoriesFromEvent(livestream)

      await viewerPage.enterEvent()
      await viewerPage.assertStreamerDetailsExist()
   })

   test("Streamer hand raise functionality", async ({
      streamerPage,
      viewerPage,
      user,
   }) => {
      const { livestream } = await setupStreamer(streamerPage)
      await viewerPage.open(livestream.id)

      // Streamer activates hand raise
      await streamerPage.activateHandRaise()

      // Viewer requests to join
      await viewerPage.requestToJoinHandRaise()

      // Streamer accepts the request
      await streamerPage.acceptUserRequestToJoinHandRaise()

      // hand raiser details are being shown
      const userName = `${user.firstName} ${user.lastName.charAt(0)}`
      await expect(streamerPage.text(userName)).toBeVisible({ timeout: 8000 })
      await expect(
         streamerPage.page.locator("text=✋ Hand Raiser")
      ).toBeVisible()

      // viewer is connected
      await expect(
         viewerPage.page.locator("text=You are connected")
      ).toBeVisible()
      // central video element is visible
      await expect(viewerPage.page.locator("video").nth(1)).toBeVisible()
   })

   test("Streamer cannot create breakout rooms because he is not a main streamer", async ({
      streamerPage,
   }) => {
      await setupStreamer(streamerPage)

      await streamerPage.manageBreakoutRooms()
      await expect(
         streamerPage.exactText(
            "Please wait for the main streamer/host to create breakout rooms"
         )
      ).toBeVisible()
   })

   test("Main Streamer creates breakout room and viewer joins", async ({
      streamerPage,
      viewerPage,
   }) => {
      const { livestream } = await setupStreamer(streamerPage, {
         isMainStreamer: true,
      })

      // Hide hint to focus
      await viewerPage.page.addInitScript(() => {
         // it fails to import from the constants file at this time
         window.localStorage.setItem("hasSeenFocusModeActivateKey", "true")
      })
      await viewerPage.open(livestream.id)

      // Streamer creates a breakout room
      await streamerPage.manageBreakoutRooms()
      await streamerPage.createSingleBreakoutRoom()

      // Viewer enters the new breakout room through bottom notification
      await viewerPage.exactText("Checkout").click()
      await viewerPage.clickFirstBreakoutRoomBannerLink()
      // streamer is not connected yet
      await viewerPage.assertWaitingForStreamerText()
      expect(viewerPage.page.url()).toContain(
         `/streaming/${livestream.id}/breakout-room/`
      )

      // streamer joins breakout room
      await streamerPage.joinBreakoutRoom()
      await expect(streamerPage.text("ROOM: Breakout Room 1")).toBeVisible()

      // viewer sees the streamer on the breakout room
      await viewerPage.assertStreamerDetailsExist()

      // viewer goes back to main stream
      await viewerPage.backToMainRoom()
      expect(viewerPage.page.url()).toContain(
         `/streaming/${livestream.id}/viewer`
      )
   })
})

type SetupStreamerOptions = {
   setupGroup?: boolean
   isMainStreamer?: boolean
}

async function setupStreamer(
   streamerPage: StreamerPage,
   options: SetupStreamerOptions = {
      setupGroup: false,
      isMainStreamer: false,
   }
) {
   const { livestream, secureToken, group } = await setupData(
      options.setupGroup
   )
   await streamerPage.openAndFillStreamerDetails(livestream.id, {
      secureToken,
      isMainStreamer: options.isMainStreamer,
   })
   await streamerPage.joinWithCameraAndMicrophone()

   return { livestream, secureToken, group }
}

async function setupData(setupGroup: boolean = false) {
   let group: Group
   let overrideLivestreamDetails: Partial<LivestreamEvent> = {}

   if (setupGroup) {
      group = await GroupSeed.createGroup(Object.assign({}))
      const groupQuestions = createLivestreamGroupQuestions(group.id)

      // associate the group with the livestream
      overrideLivestreamDetails = {
         groupIds: [group.id],
         groupQuestionsMap: {
            [group.id]: groupQuestions,
         },
      }
   }

   const livestream = await LivestreamSeed.createLive(overrideLivestreamDetails)

   const secureToken = await LivestreamSeed.generateSecureToken(livestream.id)

   return { livestream, secureToken, group }
}
