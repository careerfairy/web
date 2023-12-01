import { LoadingButton } from "@mui/lab"
import { DialogActions } from "@mui/material"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import { useAuth } from "HOCs/AuthProvider"
import useSparksB2BOnboardingCompletion from "./useSparksB2BOnboardingCompletion"

const SparksOnboardingDialog = () => {
   const { userData } = useAuth()

   const onboardingCompleted = Boolean(userData.hasCompletedSparksB2BOnboarding)

   const { trigger: completeOnboarding, isMutating } =
      useSparksB2BOnboardingCompletion(userData.id)

   return (
      <Dialog open={!onboardingCompleted}>
         <DialogTitle>Sparks Onboarding</DialogTitle>
         <DialogActions>
            <LoadingButton
               loading={isMutating}
               variant="contained"
               onClick={completeOnboarding}
            >
               Simulate onboarding completion
            </LoadingButton>
         </DialogActions>
      </Dialog>
   )
}

export default SparksOnboardingDialog
