import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/emulators"
import UserSeed from "@careerfairy/seed-data/users"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { test as base, expect } from "@playwright/test"
import { sleep } from "components/helperFunctions/HelperFunctions"
import { credentials } from "tests/constants"
import { StreamerPage } from "tests/e2e/page-object-models/streaming/StreamerPage"
import { setupLivestreamData } from "tests/e2e/setupData"
import { LoginPage } from "../../page-object-models/LoginPage"
import { ViewerPage } from "../../page-object-models/streaming/ViewerPage"

/**
 * Test Fixture
 * Setup Pages and requirements
 */
const test = base.extend<{
   streamerPage: StreamerPage
   viewerPage: ViewerPage
   user: UserData
}>({
   streamerPage: async ({ page }, use) => {
      const streamerPage = new StreamerPage(page)

      await use(streamerPage)
   },
   // eslint-disable-next-line no-empty-pattern
   user: async ({}, use) => {
      await clearAuthData()
      await clearFirestoreData()

      const userData = await UserSeed.createUser(credentials.correctUserEmail)

      await use(userData)
   },

   viewerPage: async ({ context, user }, use) => {
      const viewerTabPage = await context.newPage()

      const viewerPage = new ViewerPage(viewerTabPage)
      await LoginPage.login(viewerTabPage, { email: user.userEmail })

      await use(viewerPage)
   },
})

test.describe("New Streaming Interactions", () => {
   // Only run those tests on chromium
   // Firefox headless (macos) doesn't seem to load the camera/mic
   // webkit (safari) has an open issue: https://github.com/microsoft/playwright/issues/2973
   test.skip(
      ({ browserName }) => browserName !== "chromium",
      "Safari/Firefox browser support for webrtc tests is not great atm, skipping."
   )

   test("viewer - ask questions and upvote", async ({
      streamerPage,
      viewerPage,
   }) => {
      test.skip()
      await setupEnvironment(streamerPage, viewerPage)

      // Viewer asks a question
      await viewerPage.clickQuestions()
      const question = "What is the interview process like?"
      await viewerPage.askQuestion(question)

      // Streamer should see the question and comment on it
      await streamerPage.clickQuestions()
      await expect(streamerPage.exactText(question)).toBeVisible()
      const reaction = "Streamer comment to question"
      await streamerPage.commentOnQuestion(reaction)

      // Viewer should see the reaction
      await expect(viewerPage.exactText(reaction)).toBeVisible()

      // viewer up votes the question
      await viewerPage.upvoteQuestion()
      await expect(streamerPage.exactText("1 likes")).toBeVisible()
   })

   test("streamer and viewer chat messages", async ({
      user,
      streamerPage,
      viewerPage,
   }) => {
      test.skip()
      const { livestream } = await setupEnvironment(streamerPage, viewerPage)

      // streamer posts a chat message
      const message = "First chat entry"
      const speakerName =
         livestream.speakers[0].firstName +
         " " +
         livestream.speakers[0].lastName
      await streamerPage.hideEmulatorWarning()
      await streamerPage.clickChat()
      await streamerPage.sendChatMessage(message)

      // viewer receives the message
      await viewerPage.hideEmulatorWarning()
      await viewerPage.clickChat()
      await expect(viewerPage.text(`${message}`)).toBeVisible()
      await expect(viewerPage.text(`${speakerName} (Host)`)).toBeVisible()

      // viewer answers
      const response = "Viewer Response"
      const userName = user.firstName + " " + user.lastName
      await viewerPage.sendChatMessage(response)

      // streamer receives the response
      await expect(streamerPage.text(`${response}`)).toBeVisible()
      await expect(viewerPage.text(`${userName}`)).toBeVisible()
   })

   test("streamer creates a poll and viewer votes", async ({
      streamerPage,
      viewerPage,
   }) => {
      await setupEnvironment(streamerPage, viewerPage)

      const poll = {
         question: "My first poll",
         option1: { text: "First answer" },
         option2: { text: "Second answer" },
      }

      // Streamer creates the poll
      await streamerPage.clickPolls()
      await streamerPage.createPoll({
         question: poll.question,
         options: [poll.option1, poll.option2],
      })

      await streamerPage.startPoll()

      // viewer sees the poll and answers
      await expect(viewerPage.exactText(poll.question)).toBeVisible()
      await viewerPage.votePollAnswer(poll.option1.text)

      // streamer sees the answer
      await expect(streamerPage.exactText("1 votes")).toBeVisible()

      // end poll
      await streamerPage.closePoll()
      await expect(viewerPage.exactText("Closed poll")).toBeVisible()
   })

   test("Viewer hand raises", async ({ streamerPage, viewerPage, user }) => {
      test.skip()
      await setupEnvironment(streamerPage, viewerPage)

      // Streamer activates hand raise
      await streamerPage.clickHandRaise()
      await streamerPage.activateHandRaise()

      // Viewer requests to join
      await viewerPage.clickHandRaise()
      await viewerPage.requestToJoinHandRaise()

      // Streamer accepts the request
      await streamerPage.acceptUserRequestToJoinHandRaise()

      // hand raiser details are being shown
      const userName = `${user.firstName} ${user.lastName}`
      await expect(streamerPage.text(userName)).toBeVisible({ timeout: 8000 })

      // viewer is connected
      await expect(
         viewerPage.page.locator("text=You are connected")
      ).toBeVisible()
      // central video element is visible
      await expect(viewerPage.page.locator("video").nth(1)).toBeVisible()
   })

   test("streamer - share pdf presentation", async ({
      streamerPage,
      viewerPage,
   }) => {
      await setupEnvironment(streamerPage, viewerPage)

      // Streamer starts to share a pdf
      await streamerPage.sharePDF()

      const presentationCanvas = viewerPage.page.locator(
         ".react-pdf__Page__canvas"
      )
      // Viewer should see the action on their end
      await expect(presentationCanvas).toBeVisible()

      // Stop sharing
      await streamerPage.stopSharingPDF()
      await sleep(1500) // give some time for action to propagate between agora and viewer
      await expect(presentationCanvas).not.toBeVisible()
   })
})

type SetupEnvironmentOptions = {
   livestreamType?: "create" | "createLive" | "createPast"
   overrideLivestreamDetails?: Partial<LivestreamEvent>
}

async function setupEnvironment(
   streamerPage: StreamerPage,
   viewerPage: ViewerPage,
   options: SetupEnvironmentOptions = {
      livestreamType: "createLive",
      overrideLivestreamDetails: {},
   }
) {
   const defaultLivestreamDetails: Partial<LivestreamEvent> = {
      groupQuestionsMap: null,
   }

   const { livestream, secureToken } = await setupLivestreamData(null, {
      livestreamType: options.livestreamType,
      overrideLivestreamDetails: {
         ...defaultLivestreamDetails,
         ...options.overrideLivestreamDetails,
      },
   })

   viewerPage.open(livestream.id)

   const speaker = livestream.speakers[0]

   await streamerPage.selectAndJoinWithSpeaker(livestream.id, speaker, {
      secureToken,
   })

   await streamerPage.joinWithCameraAndMicrophone()

   return { livestream, secureToken, speaker }
}
