import functions = require("firebase-functions")
import { SchemaOf, mixed, object, string } from "yup"

import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"

import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import { dataValidation, userShouldBeCFAdmin } from "./middlewares/validations"
import { groupRepo } from "./api/repositories"
import { client } from "./api/postmark"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"

const setgroupPlanSchema: SchemaOf<StartPlanData> = object().shape({
   planType: mixed().oneOf(Object.values(GroupPlanTypes)).required(),
   groupId: string().required(),
})

export const startPlan = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation(setgroupPlanSchema),
      userShouldBeCFAdmin(),
      async (data: StartPlanData, context) => {
         try {
            await groupRepo.startPlan(data.groupId, data.planType)

            functions.logger.info(
               `Successfully set group plan for group ${data.groupId} to ${data.planType}`
            )

            if (data.planType === GroupPlanTypes.Trial) {
               functions.logger.info("Sending out trial welcome emails")

               await groupRepo.sendTrialWelcomeEmail(data.groupId, client)
            }
         } catch (error) {
            logAndThrow("Error in setting group plan", {
               data,
               error,
               context,
            })
         }
      }
   )
)

/**
 * Every day at 9 AM, notify all the groups that are near to the end of their Sparks trial plan creation period and haven't met the publishing criteria yet
 */
export const sendReminderToNearEndSparksTrialPlanCreationPeriod = functions
   .region(config.region)
   .runWith({
      // when sending large batches, this function can take a while to finish
      timeoutSeconds: 300,
   })
   .pubsub.schedule("0 9 * * *")
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      try {
         // get all the groups on sparks trial plan
         const groups = await groupRepo.getAllGroupsOnSparksTrialPlan()

         const filteredGroups = groups.filter((group) => {
            const groupPresenter = GroupPresenter.createFromDocument(group)

            return groupPresenter.trialPlanContentCreationCriticalState()
         })

         functions.logger.info(
            `There are ${filteredGroups.length} groups that are near to the end of their Sparks trial plan creation period and haven't met the publishing criteria yet`
         )

         filteredGroups.forEach((group) => {
            void groupRepo.sendTrialPlanCreationPeriodNearToEndReminder(
               group,
               client
            )
         })
      } catch (error) {
         logAndThrow(
            "Error in sending trial plan creation period near to end reminder",
            {
               error,
            }
         )
      }
   })
