import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import DialogBody from "components/views/admin/company-plans/plan-confirmation-dialog/DialogBody"
import { Clock } from "react-feather"
import { usePlanConfirmationDialog } from "./CompanyPlanConfirmationDialog"

const ConfirmSparksTrialView = () => {
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
                  onClick={() => startPlanAndGoToSuccess(GroupPlanTypes.Trial)}
               >
                  Proceed
               </DialogBody.ActionButton>
            </>
         }
         icon={<Clock />}
         title="Sparks trial"
         content={`You're about to upgrade ${groupToManage?.universityName} to the Sparks trial. This upgrade is permanent and cannot be reversed. Want to proceed?`}
      />
   )
}

export default ConfirmSparksTrialView
