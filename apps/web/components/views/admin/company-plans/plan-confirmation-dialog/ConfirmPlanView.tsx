import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import DialogBody from "components/views/admin/company-plans/plan-confirmation-dialog/DialogBody"
import { usePlanConfirmationDialog } from "./CompanyPlanConfirmationDialog"
import { PLAN_CONSTANTS } from "@careerfairy/shared-lib/groups/planConstants"
import { ReactNode } from "react"

type ConfirmPlanProps = {
   plan: GroupPlanType
   icon: ReactNode
}

const planTitlesDictionary: Record<GroupPlanType, string> = {
   trial: PLAN_CONSTANTS[GroupPlanTypes.Trial].name.concat(" plan"),
   tier1: PLAN_CONSTANTS[GroupPlanTypes.Tier1].name.concat(" plan"),
   tier2: PLAN_CONSTANTS[GroupPlanTypes.Tier2].name.concat(" plan"),
   tier3: PLAN_CONSTANTS[GroupPlanTypes.Tier3].name.concat(" plan"),
}

const ConfirmPlanView = ({ plan, icon }: ConfirmPlanProps) => {
   const { handleClose, isMutating, groupToManage, startPlanAndGoToSuccess } =
      usePlanConfirmationDialog()

   const planContentDescription = getPlanDescriptionContent(
      groupToManage?.universityName,
      plan
   )
   const planTitle = planTitlesDictionary[plan]

   return (
      <DialogBody
         handleClose={handleClose}
         actions={
            <>
               <DialogBody.SecondaryButton />
               <DialogBody.ActionButton
                  buttonType="primary"
                  loading={isMutating}
                  onClick={() => startPlanAndGoToSuccess(plan)}
               >
                  Proceed
               </DialogBody.ActionButton>
            </>
         }
         icon={icon}
         title={planTitle}
         content={planContentDescription}
      />
   )
}

const getPlanDescriptionContent = (groupName: string, plan: GroupPlanType) => {
   " "
   const planName =
      plan == GroupPlanTypes.Trial ? "Sparks trial" : planTitlesDictionary[plan]

   return `You're about to upgrade ${groupName} to the ${planName}. This upgrade is permanent and cannot be reversed. Want to proceed?`
}

export default ConfirmPlanView
