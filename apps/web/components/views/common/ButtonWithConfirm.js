import React, { Fragment, useMemo, useState } from "react"
import {
   Button,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Tooltip,
} from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import { GlassDialog } from "materialUI/GlobalModals"

function ButtonWithConfirm({
   color,
   disabled,
   buttonAction,
   buttonLabel,
   hasStarted,
   confirmDescription,
   tooltipTitle,
   ...rest
}) {
   const [modalOpen, setModalOpen] = useState(false)

   const memorisedState = useMemo(
      () => ({
         // This ensures that at the context of which the button was clicked
         // stays the same even if the stream hasStarted status changes
         // which avoids the random toggles
         performConfirmAction: () => {
            buttonAction()
            setModalOpen(false)
         },
         confirmDescription,
      }),
      [modalOpen]
   )

   const { mobile, startIcon } = rest

   return (
      <Fragment>
         <Tooltip title={tooltipTitle}>
            <span>
               <Button
                  style={{ background: color, boxShadow: "none" }}
                  color="primary"
                  variant="contained"
                  startIcon={mobile ? null : startIcon}
                  onClick={() => setModalOpen(true)}
                  disabled={disabled}
               >
                  {mobile ? startIcon : buttonLabel}
               </Button>
            </span>
         </Tooltip>
         <GlassDialog open={modalOpen} onClose={() => setModalOpen(false)}>
            <DialogTitle>Just making sure</DialogTitle>
            <DialogContent>
               <DialogContentText>
                  {memorisedState.confirmDescription}
               </DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button color="grey" onClick={() => setModalOpen(false)}>
                  Cancel
               </Button>
               <Button
                  startIcon={<CheckIcon />}
                  variant="contained"
                  color="primary"
                  onClick={memorisedState.performConfirmAction}
               >
                  Confirm
               </Button>
            </DialogActions>
         </GlassDialog>
      </Fragment>
   )
}

export default ButtonWithConfirm
