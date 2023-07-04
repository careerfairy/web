import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { BrowserContext, expect } from "@playwright/test"
import { groupAdminFixture as test } from "../../fixtures"
import { GroupDashboardPage } from "../../page-object-models/GroupDashboardPage"
import LivestreamDialogPage from "../../page-object-models/LivestreamDialogPage"
import { setupLivestreamData } from "../../setupData"

const testWithPrivacyPolicyActive = test.extend({
   options: async ({}, use) => {
      await use({
         createUser: true,
         atsGroupType: "COMPLETE",
         privacyPolicy: true,
      })
   },
})

test.describe("Group Analytics", () => {
   test("Main analytics are visible and update when user registers", async ({
      groupPage,
      group,
      context,
   }) => {
      const { livestream } = await setupLivestreamData(group)

      await Promise.all([
         verifyAnalyticsCard(groupPage, "Total registrations", "0"),
         verifyAnalyticsCard(groupPage, "Talent reached", "0"),
      ])

      const livestreamDialogPage = await setupLivestreamDialogPage(
         context,
         livestream
      )

      await completeRegistration(livestreamDialogPage, true)

      await Promise.all([
         verifyAnalyticsCard(groupPage, "Total registrations", "1"),
         verifyAnalyticsCard(groupPage, "Talent reached", "1"),
      ])
   })

   testWithPrivacyPolicyActive(
      "Talent pool analytics are visible and update when user registers",
      async ({ groupPage, group, context, user }) => {
         const { livestream } = await setupLivestreamData(group)

         await groupPage.goToAnalyticsPage()
         await groupPage.goToTalentPoolAnalyticsPage()

         // Expect the table of talents to be empty
         await expect(
            groupPage.page.getByText(
               "Create a live stream to allow young talent to join your talent pool."
            )
         ).toBeVisible()

         const livestreamDialogPage = await setupLivestreamDialogPage(
            context,
            livestream
         )

         await completeRegistration(livestreamDialogPage, true, true)

         await groupPage.assertUserIsInAnalyticsTable(user)
      }
   )

   testWithPrivacyPolicyActive(
      "Live stream analytics update when user registers to live stream",
      async ({ groupPage, group, context, user }) => {
         const { livestream } = await setupLivestreamData(group)

         await groupPage.goToAnalyticsPage()
         await groupPage.goToLivestreamAnalyticsPage()

         const livestreamDialogPage = await setupLivestreamDialogPage(
            context,
            livestream
         )

         await completeRegistration(livestreamDialogPage, true, true)

         // Reload the page to make the live stream analytics fetch(swr) the newly created live stream
         await groupPage.page.reload()

         await verifyAnalyticsCard(groupPage, "Registrations", "1", true)

         await groupPage.assertUserIsInAnalyticsTable(user)
      }
   )

   test("Can see feedback questions from live stream", async ({
      groupPage,
      group,
   }) => {
      const userQuestions = [
         "What is the interview process like?",
         "What is the company culture like?",
         "Are there any specific skills you look for in candidates?",
      ]

      const feedbackQuestions = [
         "Are you happy with the content of the live stream?",
         "Are you happy with the quality of the live stream?",
      ]

      const { livestream } = await setupLivestreamData(group, {
         livestreamType: "createPast",
         userQuestions,
         feedbackQuestions,
      })

      await groupPage.goToAnalyticsPage()
      const feedbackPage = await groupPage.goToFeedbackAnalyticsPage()

      await feedbackPage.openFeedbackCard(livestream.title)

      // Check the feedback dialog for each question
      for (const question of userQuestions) {
         await expect(feedbackPage.page.getByText(question)).toBeVisible()
      }

      // Check the feedback dialog for each feedback question
      for (const rating of feedbackQuestions) {
         await expect(feedbackPage.page.getByText(rating)).toBeVisible()
      }
   })
})

/**
 * Opens the livestream dialog page in a new tab
 **/
async function setupLivestreamDialogPage(
   context: BrowserContext,
   livestream: LivestreamEvent
) {
   const livestreamDialogPage = new LivestreamDialogPage(
      await context.newPage(),
      livestream
   )
   await livestreamDialogPage.page.goto("/portal")
   await livestreamDialogPage.openDialog(false)
   return livestreamDialogPage
}

async function verifyAnalyticsCard(
   groupPage: GroupDashboardPage,
   title: string,
   value: string,
   simpleCard: boolean = false
) {
   await groupPage.waitForAnalyticsCardVisible({
      simpleCard,
      fields: {
         title,
         value,
      },
   })
}

/**
 * Helper that goes through the registration process for a livestream
 * */
async function completeRegistration(
   livestreamDialogPage: LivestreamDialogPage,
   joinTalentPool: boolean,
   groupConsentRequired: boolean = false
) {
   await livestreamDialogPage.completeSuccessfulRegistration({
      joinTalentPool,
      groupConsentRequired,
   })
}
