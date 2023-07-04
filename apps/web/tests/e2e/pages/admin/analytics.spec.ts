import LivestreamSeed, {
   createLivestreamGroupQuestions,
} from "@careerfairy/seed-data/livestreams"
import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { BrowserContext, expect } from "@playwright/test"
import { groupAdminFixture as test } from "../../fixtures"
import { GroupDashboardPage } from "../../page-object-models/GroupDashboardPage"
import LivestreamDialogPage from "../../page-object-models/LivestreamDialogPage"

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
      const { livestream } = await setupData(group)

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
         const { livestream } = await setupData(group)

         await groupPage.goToAnalyticsPage()
         await groupPage.goToTalentPoolAnalyticsPage()

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
         const { livestream } = await setupData(group)

         await groupPage.goToAnalyticsPage()
         await groupPage.goToLivestreamAnalyticsPage()

         const livestreamDialogPage = await setupLivestreamDialogPage(
            context,
            livestream
         )

         await completeRegistration(livestreamDialogPage, true, true)

         // Reload the page to make the live stream analytics fetch the newly created live stream
         await groupPage.page.reload()

         await verifyAnalyticsCard(groupPage, "Registrations", "1", true)

         await groupPage.assertUserIsInAnalyticsTable(user)
      }
   )

   test("Can see feedback questions from live stream", async ({
      groupPage,
      group,
   }) => {
      const questions = [
         "What is the interview process like?",
         "What is the company culture like?",
         "Are there any specific skills you look for in candidates?",
      ]

      const feedbackQuestions = [
         "Are you happy with the content of the live stream?",
         "Are you happy with the quality of the live stream?",
      ]

      const { livestream } = await setupData(group, {
         livestreamType: "createPast",
         questions,
         feedbackQuestions,
      })

      await groupPage.goToAnalyticsPage()
      const feedbackPage = await groupPage.goToFeedbackAnalyticsPage()

      await feedbackPage.openFeedbackCard(livestream.title)

      // Check the feedback dialog for each question
      for (const question of questions) {
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

async function setupData(
   group: Group,
   options: {
      livestreamType?: "create" | "createPast" | "createLive"
      questions?: string[]
      feedbackQuestions?: string[]
   } = {
      livestreamType: "create",
      questions: [],
      feedbackQuestions: [],
   }
) {
   const groupQuestions = createLivestreamGroupQuestions(group.id)

   const livestream = await LivestreamSeed[options.livestreamType]({
      groupIds: [group.id],
      groupQuestionsMap: {
         [group.id]: groupQuestions,
      },
   })

   if (options.questions.length) {
      await LivestreamSeed.addQuestionsToLivestream(
         livestream.id,
         options.questions
      )
   }

   if (options.feedbackQuestions.length) {
      await LivestreamSeed.addFeedbackQuestionsToLivestream(
         livestream.id,
         options.feedbackQuestions
      )
   }

   return { livestream }
}

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
