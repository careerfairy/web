import { Button, Stack, Typography } from "@mui/material"
import DialogBody from "components/views/admin/company-plans/plan-confirmation-dialog/DialogBody"
import BasicSparkIcon from "components/views/common/icons/BasicSparkIcon"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { Clock } from "react-feather"
import { sxStyles } from "types/commonTypes"
import {
   PlanConfirmationDialogKeys,
   usePlanConfirmationDialog,
   usePlanConfirmationDialogStepper,
} from "./CompanyPlanConfirmationDialog"

const styles = sxStyles({
   icon: {},
   caption: {
      fontSize: "1.28571rem",
      fontWeight: 600,
      color: "#5C5C6A",
   },
   header: {
      fontWeight: 700,
      textAlign: "center",
      mb: 5,
      fontSize: "2.2857142857rem",
   },
   btn: {
      borderRadius: 2,
      border: `1px solid #EEEEEE !important`,
      color: "#5C5C6A",
      bgcolor: "#FAFAFE",
      textTransform: "none",
      "& svg": {
         fontSize: 20,
         width: 20,
         height: 20,
         color: "inherit !important",
      },
   },
})

const SelectPlanView = () => {
   const { groupToManage, handleClose } = usePlanConfirmationDialog()
   const { goToStep } = usePlanConfirmationDialogStepper()
   return (
      <>
         <DialogBody.CloseIconButton onClick={handleClose} />
         <Stack spacing={5} p={3.5}>
            <Typography sx={styles.header} component="h3">
               Choose a plan for
            </Typography>
            <Stack alignItems="center" spacing={1.5}>
               <CircularLogo
                  src={groupToManage.getCompanyLogoUrl()}
                  size={64}
                  alt={groupToManage.universityName}
               />
               <Typography sx={styles.caption} component="h3">
                  {groupToManage.universityName}
               </Typography>
            </Stack>
            <Stack spacing={1.5}>
               <Button
                  startIcon={<Clock />}
                  sx={styles.btn}
                  variant="outlined"
                  color="grey"
                  fullWidth
                  onClick={() =>
                     goToStep(PlanConfirmationDialogKeys.ConfirmSparksTrial)
                  }
               >
                  Trial plan
               </Button>
               <Button
                  startIcon={<BasicSparkIcon />}
                  color="grey"
                  sx={styles.btn}
                  variant="outlined"
                  fullWidth
                  onClick={() =>
                     goToStep(PlanConfirmationDialogKeys.ConfirmSparksPlan)
                  }
               >
                  Sparks plan
               </Button>
            </Stack>
         </Stack>
      </>
   )
}

export default SelectPlanView
