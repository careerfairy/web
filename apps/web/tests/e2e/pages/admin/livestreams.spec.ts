import { groupAdminFixture as test } from "../../fixtures"
import LivestreamSeed from "@careerfairy/seed-data/dist/livestreams"

test.describe("Group Admin Livestreams", () => {
   // Only run those tests on chromium
   test.skip(({ browserName }) => browserName !== "chromium")

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
      const livestreamsPage = await groupPage.goToLivestreams()
      await livestreamsPage.clickDraftsTab()
      await livestreamsPage.assertTextIsVisible(livestream.title)
   })

   test.skip("Publish a draft livestream and edit its title", async ({
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

      // publish draft
      const livestreamsPage = await groupPage.goToLivestreams()
      await livestreamsPage.clickDraftsTab()
      await livestreamsPage.launchEditModal()
      await livestreamsPage.publish()
      await livestreamsPage.clickUpcomingTab()

      // assert livestream is published in the upcoming tab
      await livestreamsPage.assertTextIsVisible(livestream.title)
      await groupPage.open()
      // should also be in the main page
      await groupPage.assertTextIsVisible(livestream.title)

      // edit livestream title
      const title = "Livestream New Title"
      await groupPage.clickManageLivestream()
      await groupPage.fillLivestreamForm({ title })
      await groupPage.clickUpdate()

      // new title should be visible
      await groupPage.goToLivestreams()
      await groupPage.assertTextIsVisible(title)
   })
})
