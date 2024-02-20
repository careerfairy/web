import { Button, DialogActions } from "@mui/material"
import React from "react"
import { useSettingsMenu } from "./SettingsMenuContext"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   actions: {
      py: 1.5,
      px: 2,
      zIndex: 1,
      borderTop: (theme) => `1px solid ${theme.brand.black[300]}`,
   },
   actionsSticky: {
      position: "sticky",
      bottom: 0,
      backgroundColor: (theme) => theme.brand.white[200],
   },
   closeBtn: {
      color: "neutral.500",
   },
})
export const Actions = () => {
   const { handleSaveAndClose, handleClose, isMobile } = useSettingsMenu()

   return (
      <DialogActions sx={[styles.actions, isMobile && styles.actionsSticky]}>
         <Button
            sx={styles.closeBtn}
            variant="outlined"
            color="grey"
            onClick={handleClose}
         >
            Close
         </Button>
         <Button variant="contained" onClick={handleSaveAndClose}>
            Save and close
         </Button>
      </DialogActions>
   )
}
