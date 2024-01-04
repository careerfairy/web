import functions = require("firebase-functions")
import { SchemaOf, mixed, object, string } from "yup"

import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"

import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import { dataValidation, userShouldBeCFAdmin } from "./middlewares/validations"
import { groupRepo } from "./api/repositories"

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
