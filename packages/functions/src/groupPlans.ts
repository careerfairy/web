import functions = require("firebase-functions")
import { SchemaOf, mixed, object, string } from "yup"

import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"

import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import { dataValidation, userShouldBeCFAdmin } from "./middlewares/validations"
import { groupRepo } from "./api/repositories"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { client } from "./api/postmark"

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
               const admins = await groupRepo.getGroupAdmins(data.groupId)

               const emails = admins?.map(({ email, firstName, groupId }) => ({
                  TemplateId: Number(
                     process.env.POSTMARK_TEMPLATE_SPARKS_TRIAL_WELCOME
                  ),
                  From: "CareerFairy <noreply@careerfairy.io>",
                  To: email,
                  TemplateModel: {
                     user_name: firstName,
                     company_sparks_link: addUtmTagsToLink({
                        link: `https://www.careerfairy.io/group/${groupId}/admin/sparks`,
                        campaign: "sparks",
                        content: "trial_welcome",
                     }),
                  },
               }))

               client.sendEmailBatchWithTemplates(emails).then(
                  (responses) => {
                     responses.forEach(() =>
                        functions.logger.log(
                           "Successfully sent batch sparks trial welcome email"
                        )
                     )
                  },
                  (error) => {
                     functions.logger.error(
                        "Error sending sparks trial welcome email:" + error
                     )
                  }
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
