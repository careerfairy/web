import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import DialogBody from "components/views/admin/company-plans/plan-confirmation-dialog/DialogBody"
import BasicSparkIcon from "components/views/common/icons/BasicSparkIcon"
import {
   PlanConfirmationDialogKeys,
   usePlanConfirmationDialog,
   usePlanConfirmationDialogStepper,
} from "./CompanyPlanConfirmationDialog"

const ConfirmUpgradeToSparksView = () => {
   const { handleClose, isMutating, startPlan } = usePlanConfirmationDialog()

   const { goToStep } = usePlanConfirmationDialogStepper()

   return (
      <DialogBody
         handleClose={handleClose}
         actions={
            <>
               <DialogBody.ActionButton
                  onClick={handleClose}
                  buttonType="secondary"
                  loading={isMutating}
               >
                  Cancel
               </DialogBody.ActionButton>
               <DialogBody.ActionButton
                  buttonType="primary"
                  loading={isMutating}
                  onClick={() =>
                     startPlan(GroupPlanTypes.Tier1).then(() =>
                        goToStep(PlanConfirmationDialogKeys.Success)
                     )
                  }
               >
                  Proceed
               </DialogBody.ActionButton>
            </>
         }
         icon={<BasicSparkIcon />}
         title="Upgrade to Sparks plan"
         content="You're about to upgrade ASUS Robotics & AI Center to the Sparks plan. This upgrade is permanent and cannot be reversed. Want to proceed?"
      />
   )
}

export default ConfirmUpgradeToSparksView
