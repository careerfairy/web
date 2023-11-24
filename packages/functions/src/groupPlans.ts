import functions = require("firebase-functions")
import { SchemaOf, mixed, object, string } from "yup"

import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"

import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import { dataValidation } from "./middlewares/validations"
import { groupRepo } from "./api/repositories"

const setgroupPlanSchema: SchemaOf<StartPlanData> = object().shape({
   planType: mixed().oneOf(Object.values(GroupPlanTypes)).required(),
   groupId: string().required(),
})

export const startPlan = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation(setgroupPlanSchema),
      async (data: StartPlanData, context) => {
         try {
            return groupRepo.startPlan(data.groupId, data.planType)
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
