import JobsSeed from "@careerfairy/seed-data/jobs"
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

   /**
    * This test runs various edits on a single live stream event, creating a draft first with missing fields,
    * then updating the draft filling the missing fields and lastly doing another update after its published
    * changing only the title.
    *
    * Beware as the new live stream form auto saves and the data is already filled for existing streams, and for the selectable chips,
    * namely (contentTopicsTagIds, businessFunctionsTagIds, fieldOfStudyIds and levelOfStudyIds) to prevent them from being cleared
    * when filling the form for the 2nd time (editing a previously created form) they can be set as null in the override fields, thus impeding the form
    * from updating those values. If the form would update those values it would result in clicking them again, deselecting the values which might not
    * be intended.
    */
   test("Publish a draft livestream and edit its title", async ({
      groupPage,
      fieldOfStudyIds,
      levelOfStudyIds,
   }) => {
      // TODO-WG: Confirm cannot use in beforeAll
      await setupLivestreamData()

      const livestream = LivestreamSeed.randomDraft({})

      // create draft - with missing required fields
      await groupPage.clickCreateNewLivestreamTop()
      await groupPage.fillLivestreamForm(livestream)

      // 1. - publish draft
      const livestreamsPage = await groupPage.goToLivestreams()
      await livestreamsPage.clickDraftsTab()
      await livestreamsPage.launchEditModal()

      // 1.1 - fill in missing required fields

      const overrideFields = {
         ...livestream,
         businessFunctionsTagIds: null, // Mandatory field which is already filled, and during updates set to null to not remove
         levelOfStudyIds: levelOfStudyIds.slice(0, 1).map((f) => f.id),
         fieldOfStudyIds: fieldOfStudyIds.slice(0, 3).map((l) => l.id),
      }

      // Deleting before calling random to force recalculation, if not these values would be transported from the base stream
      delete overrideFields["contentTopicsTagIds"]
      delete overrideFields["summary"]

      const livestreamToPublish: LivestreamEvent =
         LivestreamSeed.random(overrideFields)

      // 1.2 - fill form and publish after auto save
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

   test.extend({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      options: async ({ options }, use) => {
         await use({
            atsGroupType: "COMPLETE",
            createUser: true,
            completedGroup: true,
         })
      },
   })(
      "Create a draft live stream with job openings",
      async ({ groupPage, group, customJobs }) => {
         console.log("🚀 ~ customJobs:", customJobs)
         // TODO-WG: Confirm cannot use in beforeAll

         await setupLivestreamData(group)

         const livestreamJobAssociations = JobsSeed.getJobAssociations(
            customJobs.slice(0, 1)
         )

         const livestream = LivestreamSeed.randomDraft({
            jobs: livestreamJobAssociations,
         })

         await groupPage.clickCreateNewLivestreamTop()
         await groupPage.fillLivestreamForm(livestream)
      }
   )
})
