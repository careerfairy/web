import JobsSeed from "@careerfairy/seed-data/jobs"
import LivestreamSeed from "@careerfairy/seed-data/livestreams"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamsAdminPage } from "tests/e2e/page-object-models/admin/LivestreamsAdminPage"
import { setupLivestreamData } from "tests/e2e/setupData"
import { groupAdminFixture as test } from "../../fixtures"

test.describe("Group Admin Livestreams", () => {
   // Only run those tests on chromium
   test.skip(({ browserName }) => browserName !== "chromium")

   test("Create a draft livestream from the main page", async ({
      groupPage,
   }) => {
      await setupLivestreamData()

      // Some required fields will be missing
      const livestream = LivestreamSeed.randomDraft({})

      // create draft
      await groupPage.clickCreateNewLivestreamTop()
      await groupPage.fillLivestreamForm(livestream)

      // assert draft is visible in the new table structure
      const livestreamsPage = await groupPage.goToLivestreams()
      await livestreamsPage.filterByStatus("Draft")
      await livestreamsPage.assertEventIsVisible(livestream.title)
   })

   /**
    * This test runs various edits on a single live stream event, creating a draft first with missing fields,
    * then updating the draft filling the missing fields and lastly doing another update after its published
    * changing only the title.
    *
    * Beware as the new live stream form auto saves and the data is already filled for existing streams, and for the selectable chips,
    * namely (contentTopicsTagIds, businessFunctionsTagIds, fieldOfStudyIds and levelOfStudyIds) to prevent them from being cleared
    * when filling the form for the 2nd time (editing a previously created form) they can be set as
    * null in the override fields, thus impeding the form from updating those values.
    *
    * If the form would update those values it would result in clicking them again, deselecting the values which might not
    * be intended.
    */
   test("Publish a draft livestream and edit its title", async ({
      groupPage,
      fieldOfStudyIds,
      levelOfStudyIds,
   }) => {
      await setupLivestreamData()

      const livestreamToPublish: LivestreamEvent = LivestreamSeed.random({
         levelOfStudyIds: levelOfStudyIds.slice(0, 1).map((f) => f.id),
         fieldOfStudyIds: fieldOfStudyIds.slice(0, 3).map((l) => l.id),
         isDraft: true,
      })

      // create draft - with missing required fields
      await groupPage.clickCreateNewLivestreamTop()
      await groupPage.fillLivestreamForm(livestreamToPublish, true)

      const livestreamsPage = new LivestreamsAdminPage(groupPage)

      // Assert promoted livestream dialog is visible right after publishing
      await livestreamsPage.waitForPromoteDialog()
      await livestreamsPage.assertPromoteDialogCopyLinkWorks()
      await livestreamsPage.closePromoteDialog()

      // Publish draft
      await livestreamsPage.filterByStatus("Published")

      // Click on the specific event to navigate to the edit page
      await livestreamsPage.clickEventToEditByTitle(livestreamToPublish.title)

      await groupPage.page.reload()

      // edit livestream title
      const title = "Livestream New Title"

      // Fill form and publish after auto save
      await groupPage.fillLivestreamForm({ title })

      // new title should be visible
      await groupPage.goToLivestreams()
      await groupPage.assertTextIsVisible(title)
   })

   // TODO: different tests for ats and not ats

   test("Create a draft live stream with job openings - No ATS", async ({
      groupPage,
      customJobs,
   }) => {
      await setupLivestreamData()

      const jobs = customJobs.slice(0, 2) // only select some
      const livestreamJobAssociations = JobsSeed.getJobAssociations(jobs)

      const livestream = LivestreamSeed.randomDraft({
         jobs: livestreamJobAssociations,
         speakers: [],
      })

      await groupPage.clickCreateNewLivestreamTop()
      await groupPage.fillLivestreamForm(livestream)

      // Finish editing the draft
      const livestreamsPage = await groupPage.goToLivestreams()

      // Re edit to check custom jobs
      await livestreamsPage.filterByStatus("Draft")
      // Click on the specific event to navigate to the edit page
      await livestreamsPage.clickEventToEditByTitle(livestream.title)

      const addedJobLinks = jobs.map((job) => job.postingUrl)
      await groupPage.assertJobIsAttachedToStream(addedJobLinks)
   })

   test("View and download questions from published livestream", async ({
      groupPage,
      group,
   }) => {
      const userQuestions = [
         "What is the interview process like?",
         "What is the company culture like?",
         "Are there any specific skills you look for in candidates?",
      ]

      // Setup livestream with user questions
      const { livestream } = await setupLivestreamData(group, {
         livestreamType: "create",
         userQuestions,
      })

      const livestreamsPage = await groupPage.goToLivestreams()

      await livestreamsPage.searchEvents(livestream.title)

      await livestreamsPage.assertEventIsVisible(livestream.title)

      await livestreamsPage.hoverOverEventRow(livestream.title)

      await livestreamsPage.clickActionButton("questions")

      await livestreamsPage.waitForQuestionsDialog()

      for (const question of userQuestions) {
         await livestreamsPage.livestreamQuestionsDialog
            .getByText(question)
            .waitFor({ state: "visible" })
      }

      await livestreamsPage.downloadQuestions()

      await livestreamsPage.closeQuestionsDialog()

      // Verify dialog is closed
      await livestreamsPage.livestreamQuestionsDialog.waitFor({
         state: "hidden",
      })
   })
})
