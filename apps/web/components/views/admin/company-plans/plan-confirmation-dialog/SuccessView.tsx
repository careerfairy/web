import DialogBody from "components/views/admin/company-plans/plan-confirmation-dialog/DialogBody"
import ConfettiIcon from "components/views/common/icons/ConfettiIcon"
import { usePlanConfirmationDialog } from "./CompanyPlanConfirmationDialog"
import { GroupPlanType } from "@careerfairy/shared-lib/groups"
import { PLAN_CONSTANTS } from "@careerfairy/shared-lib/groups/planConstants"
import DateUtil from "util/DateUtil"

const SuccessView = () => {
   const { handleClose, isMutating, groupToManage, updatedGroupPlanType } =
      usePlanConfirmationDialog()

   return (
      <DialogBody
         handleClose={handleClose}
         actions={
            <DialogBody.ActionButton
               buttonType="primary"
               loading={isMutating}
               onClick={handleClose}
            >
               Done
            </DialogBody.ActionButton>
         }
         icon={<ConfettiIcon />}
         title="Plan active!"
         content={`${
            groupToManage?.universityName
         }  plan is now active and will last until ${getExpirationDate(
            updatedGroupPlanType
         )}`}
      />
   )
}

/**
 * This function calculates the expiration date of a plan based on its type.
 * It uses the PLAN_CONSTANTS to find the duration of the plan in milliseconds,
 * then adds this duration to the current date and time.
 * The resulting date is then formatted as a string.
 *
 * @param {GroupPlanType} groupPlanType - The type of the plan.
 * @returns {string} - The expiration date of the plan, formatted as a string.
 */
const getExpirationDate = (groupPlanType: GroupPlanType) => {
   const duration =
      PLAN_CONSTANTS[groupPlanType]?.sparks.PLAN_DURATION_MILLISECONDS || 0

   return DateUtil.formatDateToString(new Date(Date.now() + duration))
}

export default SuccessView
