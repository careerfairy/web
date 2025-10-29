/* eslint-disable no-empty-pattern */
import GroupSeed from "@careerfairy/seed-data/groups"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/livestreams"
import { expect } from "@playwright/test"
import { groupAdminFixture as test } from "../../fixtures"
import { expectText } from "../../utils/assertions"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const testWithATSThatNeedsApplicationTest = test.extend({
   options: async ({}, use: any) => {
      await use({
         createUser: true,
         atsGroupType: "NEEDS_APPLICATION_TEST",
      })
   },
} as any).skip

test.describe("ATS Integration", () => {
   test.skip("Can successfully link account & test application", async ({
      groupPage,
      browserName,
   }) => {
      const atsPage = await groupPage.goToATSPage()
      test.skip(
         browserName !== "chromium",
         "This test can only run once because of merge pop-up dialog, let's run it on chromium for now"
      )

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

      await groupPage.page.close()
   })
})

testWithATSThatNeedsApplicationTest(
   "Application test is required to link job",
   async ({ groupPage, group }) => {
      const jobs = [
         generateJobAssociation(
            group.id,
            variables.jobs[0].id,
            variables.jobs[0].name
         ),
      ]
      // open create draft dialog
      await groupPage.clickCreateNewLivestreamTop()

      await expectText(
         groupPage.page,
         `You need to complete the Application Test for testIntegrationName before you can associate Jobs to your Live Stream.`
      )

      // Make sure the application test is completed
      await GroupSeed.completeCandidateTest(group)

      // User should be able to select jobs now
      await groupPage.selectJobs(jobs)
   }
)

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

const generateJobAssociation = (
   groupId: string,
   jobId: string,
   name: string
): LivestreamJobAssociation => {
   return {
      integrationId: "testIntegrationId",
      groupId,
      jobId,
      name,
   }
}
