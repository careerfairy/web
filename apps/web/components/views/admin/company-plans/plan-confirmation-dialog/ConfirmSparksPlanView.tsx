import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import DialogBody from "components/views/admin/company-plans/plan-confirmation-dialog/DialogBody"
import BasicSparkIcon from "components/views/common/icons/BasicSparkIcon"
import { usePlanConfirmationDialog } from "./CompanyPlanConfirmationDialog"

const ConfirmSparksPlanView = () => {
   const { handleClose, isMutating, groupToManage, startPlanAndGoToSuccess } =
      usePlanConfirmationDialog()

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
         icon={<BasicSparkIcon />}
         title={
            groupToManage.hasPlan() ? "Upgrade to Sparks plan" : "Sparks plan"
         }
         content={`You're about to upgrade ${groupToManage?.universityName} to the Sparks plan. This upgrade is permanent and cannot be reversed. Want to proceed?`}
      />
   )
}

export default ConfirmSparksPlanView
