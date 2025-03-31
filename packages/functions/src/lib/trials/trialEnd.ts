import { GroupPlanType } from "@careerfairy/shared-lib/groups"

type EnfOfTrialTemplate = {
   user_name: string
   company_sparks_link: string
   groupId: string
   planType: GroupPlanType
   groupName: string
}
export type SparksEndOfTrialTag = "sparks-end-of-trial"
export type SparksEndOfTrialTemplateModel = EnfOfTrialTemplate
