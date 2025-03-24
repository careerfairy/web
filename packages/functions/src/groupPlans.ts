import functions = require("firebase-functions")
import { SchemaOf, mixed, object, string } from "yup"

import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"

import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import { RuntimeOptions } from "firebase-functions"
import { groupRepo, notificationService } from "./api/repositories"
import { dataValidation, userShouldBeCFAdmin } from "./middlewares/validations"
import { validateGroupSparks } from "./util/sparks"

/**
 * functions runtime settings
 */
const runtimeSettings: RuntimeOptions = {
   memory: "256MB",
}

const setGroupPlanSchema: SchemaOf<StartPlanData> = object().shape({
   planType: mixed().oneOf(Object.values(GroupPlanTypes)).required(),
   groupId: string().required(),
})

export const startPlan = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation(setGroupPlanSchema),
      userShouldBeCFAdmin(),
      async (data: StartPlanData, context) => {
         try {
            const group = await groupRepo.getGroupById(data.groupId)

            await groupRepo.startPlan(data.groupId, data.planType)

            functions.logger.info(
               `Successfully set group plan for group ${data.groupId} to ${data.planType}`
            )

            if (data.planType === GroupPlanTypes.Trial) {
               functions.logger.info("Sending out trial welcome emails")

               await groupRepo.sendTrialWelcomeEmail(
                  data.groupId,
                  group.universityName,
                  notificationService
               )
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
 * Check all groups with expiring plans and update Sparks data accordingly
 */
export const checkExpiredPlans = functions
   .region(config.region)
   .runWith(runtimeSettings)
   .pubsub.schedule("0 6 * * *") // everyday at 06:00 am
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      functions.logger.info("Starting execution of checkExpiredPlans")

      await updateExpiredGroupPlans()
   })

export const manualCheckExpiredPlans = functions
   .region(config.region)
   .runWith(runtimeSettings)
   .https.onRequest(async (req, res) => {
      functions.logger.info("Starting execution of manualCheckExpiredPlans")

      if (req.method !== "POST") {
         res.status(400).send("Only GET requests are allowed")
         return
      }
      await updateExpiredGroupPlans()

      res.status(200).send("Check expired plans complete!")
   })

async function updateExpiredGroupPlans() {
   const types = [
      GroupPlanTypes.Trial,
      GroupPlanTypes.Tier1,
      GroupPlanTypes.Tier2,
      GroupPlanTypes.Tier3,
   ]

   try {
      const expiringGroups = await groupRepo.getAllGroupsWithAPlanExpiring(
         types,
         0,
         functions.logger
      )

      const groups = expiringGroups.filter(
         (group) =>
            // Only want those whose have publicSparks = true or undefined values, those with false are already correct
            group.publicSparks !== false
      )
      // validateGroupSparks does the actual check and update if plan is already expired
      const updatePromises = groups.map(validateGroupSparks)

      await Promise.all(updatePromises)

      functions.logger.info(
         "Executed validateGroupSparks for the following groups:  ",
         groups.map((g) => g.groupId)
      )
   } catch (error) {
      logAndThrow(
         "Error while executing validateGroupSparks for groups with expiring plans",
         {
            error,
         }
      )
   }
}

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
         const groups = await groupRepo.getAllGroupsWithAPlan()

         const filteredGroups = groups.filter((group) => {
            const groupPresenter = GroupPresenter.createFromDocument(group)

            return groupPresenter.isTrialPlanContentCreationInCriticalState()
         })

         functions.logger.info(
            `There are ${filteredGroups.length} groups that are near to the end of their Sparks trial plan creation period and haven't met the publishing criteria yet`
         )

         filteredGroups.forEach((group) => {
            void groupRepo.sendTrialPlanCreationPeriodInCriticalStateReminder(
               group,
               notificationService
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
