import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { LoadingButton } from "@mui/lab"
import { Button, ButtonProps } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   sparksMemberBtn: {
      backgroundColor: "#F6F6FA !important",
      color: "#CACACA !important",
   },
})

type Props = {
   presenter: GroupPresenter
   onClick: ButtonProps["onClick"]
}

const ActionButton = ({ presenter, onClick }: Props) => {
   const isTier1 = presenter.plan?.type === GroupPlanTypes.Tier1
   const isTrial = presenter.plan?.type === GroupPlanTypes.Trial

   if (presenter.hasPlan()) {
      if (isTrial) {
         return (
            <LoadingButton onClick={onClick} variant="contained" fullWidth>
               Upgrade to full Sparks
            </LoadingButton>
         )
      }

      if (isTier1) {
         return (
            <Button
               sx={styles.sparksMemberBtn}
               disabled
               variant="contained"
               fullWidth
            >
               Sparks member
            </Button>
         )
      }
   }

   return (
      <LoadingButton onClick={onClick} variant="contained" fullWidth>
         Choose a plan
      </LoadingButton>
   )
}

export default ActionButton
