import { Box } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { useState } from "react"
import { RotateCcw as RestartIcon } from "react-feather"
import { restartModule } from "store/reducers/talentGuideReducer"
import { useIsRestartingModule } from "store/selectors/talentGuideSelectors"
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

export const RestartLevelButton = () => {
   const dispatch = useAppDispatch()
   const [showConfirmation, setShowConfirmation] = useState(false)
   const isLoading = useIsRestartingModule()

   return (
      <>
         {showConfirmation ? null : (
            <FloatingButton
               onClick={() => setShowConfirmation(true)}
               color="primary"
               variant="outlined"
               startIcon={<RestartIcon />}
            >
               Level neustarten
            </FloatingButton>
         )}

         <ConfirmationDialog
            open={showConfirmation}
            handleClose={() => setShowConfirmation(false)}
            title="Level neustarten?"
            description="Bist du dir sicher? Dein Fortschritt wird nicht gespeichert, aber du kannst jederzeit zurückkommen und den Level abschliessen."
            icon={<Box component={RestartIcon} sx={styles.icon} />}
            primaryAction={{
               text: "Neustarten",
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
               text: "Zurück",
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
