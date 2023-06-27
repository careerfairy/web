import { expectText } from "../../utils/assertions"
import { groupAdminFixture as test } from "../../fixtures"
import { expect } from "@playwright/test"
import LivestreamSeed from "@careerfairy/seed-data/livestreams"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"

test.describe("ATS Integration", () => {
   test("Can successfully link account & test application", async ({
      groupPage,
   }) => {
      const atsPage = await groupPage.goToATSPage()

      /**
       * Be sure to setup all the route interceptors at the start of
       */
      await Promise.all([
         atsPage.mockATSInitiationRequest(),
         atsPage.mockLinkedAccountRequest(),
         atsPage.mockFetchATSSyncStatusRequest(),
      ])

      await atsPage.linkAccount()

      /**
       * Merge Pop-up dialog flow
       */
      await atsPage.selectATS()
      await atsPage.enterAPIKey(variables.apiKey)
      await atsPage.submitAPIKey()
      await atsPage.finishAndCloseMergeDialog()

      await expect(atsPage.syncStatusHeader).toBeVisible()

      // Sync status header should disappear after syncing is complete
      await expect(atsPage.syncStatusHeader).not.toBeVisible({
         timeout: 7000,
      })

      await atsPage.checkJobsExistInTable(variables.jobs)

      await atsPage.startApplicationTest()
      await atsPage.selectJobForApplicationTest(variables.jobs[0].name)
      await atsPage.completeApplicationTest()

      await expectText(
         atsPage.page,
         "Application was successful! You can now associate jobs to livestreams and start"
      )
   })

   test.describe("ATS functionality", () => {
      test.use({
         options: {
            completedGroup: true,
            createUser: true,
            atsGroupType: "NEEDS_APPLICATION_TEST",
         },
      })

      test("Application test is required to link job", async ({
         groupPage,
         group,
         user,
         interests,
      }) => {
         // const livestream = LivestreamSeed.random({
         //    interestsIds: [interests[0].id, interests[1].id],
         // })

         const jobs: LivestreamJobAssociation[] = [
            {
               groupId: group.id,
               integrationId: "testIntegrationId",
               jobId: variables.jobs[0].id,
               name: variables.jobs[0].name,
            },
         ]

         // open create draft dialog
         await groupPage.clickCreateNewLivestreamTop()

         await expectText(
            groupPage.page,
            `You need to complete the Application Test for testIntegrationName before you can associate Jobs to your Live Stream.`
         )
      })

      test("Can associate job to livestream", async ({
         groupPage,
         group,
         user,
         interests,
      }) => {
         const livestream = LivestreamSeed.random({
            interestsIds: [interests[0].id, interests[1].id],
            jobs: [
               {
                  groupId: group.id,
                  integrationId: "testIntegrationId",
                  jobId: variables.jobs[0].id,
                  name: variables.jobs[0].name,
               },
            ],
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
      })
   })
})

const variables = {
   apiKey: "088ec780160bea9d7d3b23dca4966889-3",
   jobs: [
      { name: "Job 1", description: "Job description 1", id: "1" },
      { name: "Job 2", description: "Job description 2", id: "2" },
      { name: "Job 3", description: "Job description 3", id: "3" },
      { name: "Job 4", description: "Job description 4", id: "4" },
      { name: "Job 5", description: "Job description 5", id: "5" },
   ],
}
