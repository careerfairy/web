import LivestreamSeed from "@careerfairy/seed-data/livestreams"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { setupLivestreamData } from "tests/e2e/setupData"
import { groupAdminFixture as test } from "../../fixtures"

test.describe("Group Admin Livestreams", () => {
   // Only run those tests on chromium
   test.skip(({ browserName }) => browserName !== "chromium")

   test("Create a draft livestream from the main page", async ({
      groupPage,
   }) => {
      // TODO-WG: Confirm cannot use in beforeAll
      await setupLivestreamData()

      // Some required fields will be missing
      const livestream = LivestreamSeed.randomDraft({})

      // create draft
      await groupPage.clickCreateNewLivestreamTop()
      await groupPage.fillLivestreamForm(livestream)

      // assert draft is visible
      const livestreamsPage = await groupPage.goToLivestreams()
      await livestreamsPage.clickDraftsTab()
      await livestreamsPage.assertTextIsVisible(livestream.title)
   })

   test("Publish a draft livestream and edit its title", async ({
      groupPage,
      fieldOfStudyIds,
      levelOfStudyIds,
   }) => {
      // TODO-WG: Confirm cannot use in beforeAll
      await setupLivestreamData()

      const livestream = LivestreamSeed.randomDraft({})

      // create draft
      await groupPage.clickCreateNewLivestreamTop()
      await groupPage.fillLivestreamForm(livestream)

      // publish draft
      const livestreamsPage = await groupPage.goToLivestreams()
      await livestreamsPage.clickDraftsTab()
      await livestreamsPage.launchEditModal()

      // fill in missing required fields

      const overrideFields = {
         ...livestream,
         businessFunctionsTagIds: null, // Mandatory field which is already filled, and during updates set to null to not remove
         levelOfStudyIds: levelOfStudyIds.slice(0, 1).map((f) => f.id),
         fieldOfStudyIds: fieldOfStudyIds.slice(0, 3).map((l) => l.id),
      }

      delete overrideFields["contentTopicsTagIds"]
      delete overrideFields["summary"]

      const livestreamToPublish: LivestreamEvent =
         LivestreamSeed.random(overrideFields)

      await groupPage.fillLivestreamForm(livestreamToPublish, true)

      // Should be in upcoming after filling missing fields
      await groupPage.goToLivestreams()
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
      // new title should be visible
      await groupPage.goToLivestreams()
      await groupPage.assertTextIsVisible(title)
   })
})
