import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/emulators"
import UserSeed from "@careerfairy/seed-data/users"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { test as base } from "@playwright/test"
import { credentials, streaming } from "tests/constants"
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

      const userData = await UserSeed.createUser(credentials.correctEmail)

      await use(userData)
   },

   viewerPage: async ({ context, user }, use) => {
      const viewerTabPage = await context.newPage()

      const viewerPage = new ViewerPage(viewerTabPage)
      await LoginPage.login(viewerTabPage, { email: user.userEmail })

      await use(viewerPage)
   },
})

test.describe("New Streaming Journey", () => {
   // Only run those tests on chromium
   // Firefox headless (macos) doesn't seem to load the camera/mic
   // webkit (safari) has an open issue: https://github.com/microsoft/playwright/issues/2973
   test.skip(
      ({ browserName }) => browserName !== "chromium",
      "Safari/Firefox browser support for webrtc tests is not great atm, skipping."
   )

   test("streamer is able to join room and viewer sees him", async ({
      streamerPage,
      viewerPage,
   }) => {
      const { livestream } = await setupEnvironment(streamerPage, viewerPage)

      // Confirm the livestream is live and the streamer card is present
      await streamerPage.assertIsLive()
      await streamerPage.assertStreamerDetailsExist(livestream.speakers[0])

      // Streamer card should also be visible on the viewer page
      await viewerPage.open(livestream.id)
      await viewerPage.assertStreamerDetailsExist(livestream.speakers[0])
   })

   test("connection breaks, reconnect dialog shows up", async ({
      streamerPage,
      viewerPage,
   }) => {
      const { livestream } = await setupEnvironment(streamerPage, viewerPage)

      await viewerPage.assertStreamerDetailsExist(livestream.speakers[0])

      await streamerPage.page.context().setOffline(true)

      // dialog with a loading spinner should show up
      await viewerPage.assertConnectionInterruptedDialogOpens()
      await streamerPage.assertConnectionInterruptedDialogOpens()

      // re-connect the browser, the dialog should disappear
      await streamerPage.page.context().setOffline(false)
      await viewerPage.assertConnectionInterruptedDialogIsClosed()
      await streamerPage.assertConnectionInterruptedDialogIsClosed()
   })

   test("duplicate tab should open a dialog to close it", async ({
      streamerPage,
      viewerPage,
   }) => {
      const { livestream } = await setupEnvironment(streamerPage, viewerPage)

      await viewerPage.assertStreamerDetailsExist(livestream.speakers[0])

      // Open a duplicated viewer tab
      const duplicateViewerPage = new ViewerPage(
         await viewerPage.page.context().newPage()
      )
      await duplicateViewerPage.open(livestream.id)
      await duplicateViewerPage.assertStreamerDetailsExist(
         livestream.speakers[0]
      )

      // first viewer tab should open a dialog to close it since its duplicated
      viewerPage.assertStreamIsOpenOnOtherBrowserDialogOpen()
   })

   test("viewer is redirected to waiting room", async ({ viewerPage }) => {
      await setupEnvironment(null, viewerPage, {
         livestreamType: "create",
      })

      await viewerPage.assertWaitingRoomText()
   })

   test("streamer joins with ad-hoc speaker", async ({
      streamerPage,
      viewerPage,
   }) => {
      await setupEnvironment(streamerPage, viewerPage, {
         streamerType: "adHoc",
      })

      // Confirm the livestream is live and the streamer card is present
      await streamerPage.assertIsLive()
      await streamerPage.assertStreamerDetailsExist(streaming.streamer)

      // Streamer card should also be visible on the viewer page
      await viewerPage.assertStreamerDetailsExist(streaming.streamer)
   })

   test("livestream requires filling some questions on registration", async ({
      viewerPage,
   }) => {
      const { livestream } = await setupLivestreamData(null, {
         livestreamType: "createLive",
      })

      await viewerPage.open(livestream.id)

      await viewerPage.selectRandomCategoriesFromEvent(livestream)

      await viewerPage.page
         .locator(`button:has-text("Answer & Proceed")`)
         .click()
      await viewerPage.assertIsLive()
   })
})

type SetupEnvironmentOptions = {
   streamerType?: "adHoc" | "none"
   livestreamType?: "create" | "createLive" | "createPast"
   overrideLivestreamDetails?: Partial<LivestreamEvent>
}

async function setupEnvironment(
   streamerPage: StreamerPage,
   viewerPage: ViewerPage,
   options: SetupEnvironmentOptions = {}
) {
   const defaultOptions: SetupEnvironmentOptions = {
      livestreamType: "createLive",
      overrideLivestreamDetails: {
         groupQuestionsMap: null,
      },
      ...options,
   }

   const { livestream, secureToken } = await setupLivestreamData(null, {
      livestreamType: defaultOptions.livestreamType,
      overrideLivestreamDetails: defaultOptions.overrideLivestreamDetails,
   })

   viewerPage.open(livestream.id)

   const speaker = livestream.speakers[0]
   if (streamerPage) {
      if (defaultOptions.streamerType === "adHoc") {
         await streamerPage.createAndJoinWithAdHocSpeaker(livestream.id, {
            secureToken,
         })
      } else {
         await streamerPage.selectAndJoinWithSpeaker(livestream.id, speaker, {
            secureToken,
         })
      }
      await streamerPage.joinWithCameraAndMicrophone()
   }

   return { livestream, secureToken, speaker }
}
