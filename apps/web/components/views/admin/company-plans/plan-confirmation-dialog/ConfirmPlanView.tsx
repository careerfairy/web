import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import DialogBody from "components/views/admin/company-plans/plan-confirmation-dialog/DialogBody"
import { Clock } from "react-feather"
import { usePlanConfirmationDialog } from "./CompanyPlanConfirmationDialog"
import { PLAN_CONSTANTS } from "@careerfairy/shared-lib/groups/planConstants"

type ConfirmPlanProps = {
   plan: GroupPlanType
}

const planTitlesDictionary: Record<GroupPlanType, string> = {
   trial: PLAN_CONSTANTS[GroupPlanTypes.Tier1].name.concat(" plan"),
   tier1: PLAN_CONSTANTS[GroupPlanTypes.Tier1].name.concat(" plan"),
   tier2: PLAN_CONSTANTS[GroupPlanTypes.Tier1].name.concat(" plan"),
   tier3: PLAN_CONSTANTS[GroupPlanTypes.Tier1].name.concat(" plan"),
}

const ConfirmPlanView = ({ plan }: ConfirmPlanProps) => {
   console.log("🚀 ~ ConfirmPlanView ~ plan:", plan)
   const { handleClose, isMutating, groupToManage, startPlanAndGoToSuccess } =
      usePlanConfirmationDialog()

   const planContentDescription = getPlanDescriptionContent(
      groupToManage?.universityName,
      plan
   )
   return (
      <DialogBody
         handleClose={handleClose}
         actions={
            <>
               <DialogBody.SecondaryButton />
               <DialogBody.ActionButton
                  buttonType="primary"
                  loading={isMutating}
                  onClick={() => startPlanAndGoToSuccess(GroupPlanTypes.Tier1)}
               >
                  Proceed
               </DialogBody.ActionButton>
            </>
         }
         icon={<Clock />}
         title={planTitlesDictionary[plan]}
         content={planContentDescription}
      />
   )
}

const getPlanDescriptionContent = (groupName: string, plan: GroupPlanType) => {
   switch (plan) {
      case "trial": {
         return `You're about to upgrade ${groupName} to the Sparks trial. This upgrade is permanent and cannot be reversed. Want to proceed?`
      }
      case "tier1": {
         return `You're about to upgrade ${groupName} to the Essential plan. This upgrade is permanent and cannot be reversed. Want to proceed?`
      }
      case "tier2": {
         return `You're about to upgrade ${groupName} to the Advanced plan. This upgrade is permanent and cannot be reversed. Want to proceed?`
      }
      case "tier3": {
         return `You're about to upgrade ${groupName} to the Premium plan. This upgrade is permanent and cannot be reversed. Want to proceed?`
      }
   }
}

export default ConfirmPlanView
