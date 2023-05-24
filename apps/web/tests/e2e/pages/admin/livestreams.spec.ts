import { groupAdminFixture as test } from "../../fixtures"
import LivestreamSeed from "@careerfairy/seed-data/dist/livestreams"

test.describe("Group Admin Livestreams", () => {
   test("Create a draft livestream from the main page", async ({
      groupPage,
      interests,
   }) => {
      const livestream = LivestreamSeed.random({
         interestsIds: [interests[0].id, interests[1].id],
      })

      // create draft
      await groupPage.clickCreateNewLivestreamTop()
      await groupPage.fillLivestreamForm(livestream)
      await groupPage.clickCreateDraft()

      // assert draft is visible
      await groupPage.goToLivestreams()
      await groupPage.clickDraftsTab()
      await groupPage.assertTextIsVisible(livestream.title)
   })
})
