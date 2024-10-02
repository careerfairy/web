import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/emulators"
import GroupSeed from "@careerfairy/seed-data/groups"
import LivestreamSeed, {
   createLivestreamGroupQuestions,
} from "@careerfairy/seed-data/livestreams"
import UserSeed from "@careerfairy/seed-data/users"
import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { test as base } from "@playwright/test"
import { getFormattedName } from "components/views/streaming-page/util"
import { credentials, streaming } from "../../constants"
import { LoginPage } from "../page-object-models/LoginPage"
import { StreamerPage } from "../page-object-models/streaming/StreamerPage"
import { ViewerPage } from "../page-object-models/streaming/ViewerPage"

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
      const { livestream, speaker } = await setupStreamer(streamerPage)

      // Confirm the livestream is live and the streamer card is present
      await streamerPage.assertIsLive()
      await streamerPage.assertStreamerDetailsExist(speaker)

      // Streamer card should also be visible on the viewer page
      await viewerPage.open(livestream.id)
      await viewerPage.assertStreamerDetailsExist(speaker)
   })

   test("connection breaks, reconnect dialog shows up", async ({
      streamerPage,
      viewerPage,
   }) => {
      const { livestream, speaker } = await setupStreamer(streamerPage)

      await viewerPage.open(livestream.id)
      await viewerPage.assertStreamerDetailsExist(speaker)

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
      const { livestream, speaker } = await setupStreamer(streamerPage)

      await viewerPage.open(livestream.id)
      await viewerPage.assertStreamerDetailsExist(speaker)

      // Open a duplicated viewer tab
      const duplicateViewerPage = new ViewerPage(
         await viewerPage.page.context().newPage()
      )
      await duplicateViewerPage.open(livestream.id)
      await duplicateViewerPage.assertStreamerDetailsExist(speaker)

      // first viewer tab should open a dialog to close it since its duplicated
      viewerPage.assertStreamIsOpenOnOtherBrowserDialogOpen()
   })

   test("viewer is redirected to waiting room", async ({ viewerPage }) => {
      const { livestream } = await setupLivestream()
      await viewerPage.open(livestream.id)
      await viewerPage.assertWaitingRoomText()
   })

   test("streamer joins with ad-hoc speaker", async ({
      streamerPage,
      viewerPage,
   }) => {
      const { livestream } = await setupStreamer(streamerPage, {
         adHoc: true,
      })

      // Confirm the livestream is live and the streamer card is present
      await streamerPage.assertIsLive()
      await streamerPage.assertStreamerDetailsExist(streaming.streamer)

      // Streamer card should also be visible on the viewer page
      await viewerPage.open(livestream.id)
      await viewerPage.assertStreamerDetailsExist(streaming.streamer)
   })
})

type SetupStreamerOptions = {
   adHoc?: boolean
}

async function setupStreamer(
   streamerPage: StreamerPage,
   options: SetupStreamerOptions = {
      adHoc: false,
   }
) {
   const { livestream, secureToken, group } = await setupLivestream({
      livestreamType: "live",
   })

   const speaker = livestream.speakers[0]

   if (options.adHoc) {
      await streamerPage.createAndJoinWithAdHocSpeaker(livestream.id, {
         secureToken,
      })
   } else {
      await streamerPage.selectAndJoinWithSpeaker(
         livestream.id,
         getFormattedName(speaker.firstName, speaker.lastName),
         {
            secureToken,
         }
      )
   }

   await streamerPage.joinWithCameraAndMicrophone()

   return { livestream, secureToken, group, speaker }
}

type SetupLivestreamOptions = {
   setupGroup?: boolean
   livestreamType: "upcoming" | "live"
}

async function setupLivestream(
   options: SetupLivestreamOptions = {
      setupGroup: false,
      livestreamType: "upcoming",
   }
) {
   let group: Group
   let overrideLivestreamDetails: Partial<LivestreamEvent> = {}

   if (options.setupGroup) {
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

   let livestream: LivestreamEvent

   if (options.livestreamType == "live") {
      livestream = await LivestreamSeed.createLive({
         ...overrideLivestreamDetails,
         useNewUI: true,
      })
   } else if (options.livestreamType == "upcoming") {
      livestream = await LivestreamSeed.createUpcoming({
         ...overrideLivestreamDetails,
         useNewUI: true,
      })
   }

   const secureToken = await LivestreamSeed.generateSecureToken(livestream.id)

   await LivestreamSeed.addSpeakerToLivestream(livestream.id)

   return { livestream, secureToken, group }
}
