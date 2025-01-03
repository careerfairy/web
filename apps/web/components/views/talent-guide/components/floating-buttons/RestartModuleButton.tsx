import { Box } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { useState } from "react"
import { RotateCcw as RestartIcon } from "react-feather"
import { restartModule } from "store/reducers/talentGuideReducer"
import { useIsLoadingTalentGuide } from "store/selectors/talentGuideSelectors"
import { sxStyles } from "types/commonTypes"
import { FloatingButton } from "./FloatingButton"

const ICON_SIZE = 48

const styles = sxStyles({
   icon: {
      height: `${ICON_SIZE}px !important`,
      width: `${ICON_SIZE}px !important`,
      fontSize: `${ICON_SIZE}px !important`,
      color: "primary.main",
   },
})

export const RestartModuleButton = () => {
   const dispatch = useAppDispatch()
   const [showConfirmation, setShowConfirmation] = useState(false)
   const isLoading = useIsLoadingTalentGuide()

   return (
      <>
         {showConfirmation ? null : (
            <FloatingButton
               onClick={() => setShowConfirmation(true)}
               color="primary"
               variant="outlined"
               startIcon={<RestartIcon />}
            >
               Restart module
            </FloatingButton>
         )}

         <ConfirmationDialog
            open={showConfirmation}
            handleClose={() => setShowConfirmation(false)}
            title="Restart module now?"
            description="Are you sure you want to restart this module? Your progress will be reset, but you can always come back to complete it again."
            icon={<Box component={RestartIcon} sx={styles.icon} />}
            primaryAction={{
               text: "Restart",
               callback: () => {
                  dispatch(restartModule())
                  setShowConfirmation(false)
               },
               color: "primary",
               variant: "contained",
               fullWidth: true,
               loading: isLoading,
            }}
            secondaryAction={{
               text: "Cancel",
               callback: () => setShowConfirmation(false),
               color: "grey",
               variant: "outlined",
               fullWidth: true,
               disabled: isLoading,
            }}
            mobileButtonsHorizontal
         />
      </>
   )
}
