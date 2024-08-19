import { Box } from "@mui/material"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { useRouter } from "next/router"
import { AlertTriangle } from "react-feather"
import { useIsConnectedOnDifferentBrowser } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   inFront: {
      zIndex: (theme) => theme.zIndex.modal + 1,
   },
})

export const SessionConflictModal = () => {
   const IsConnectedOnDifferentBrowser = useIsConnectedOnDifferentBrowser()

   const { reload: handleReload } = useRouter()

   if (!IsConnectedOnDifferentBrowser) return null

   return (
      <ConfirmationDialog
         title="Session conflict detected"
         description="It looks like you're logged in from another browser or device."
         open={IsConnectedOnDifferentBrowser}
         icon={<Box component={AlertTriangle} color="warning.main" />}
         primaryAction={{
            callback: handleReload,
            text: "Click here to force connection",
            color: "primary",
            variant: "contained",
         }}
         sx={styles.inFront}
      />
   )
}
