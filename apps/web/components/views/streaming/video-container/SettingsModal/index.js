import React from "react"
import {
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
} from "@mui/material"
import SettingsIcon from "@mui/icons-material/Settings"
import { GlassDialog } from "../../../../../materialUI/GlobalModals"
import DeviceSelectMenu from "../../sharedComponents/DeviceSelectMenu"

function SettingsModal({
   close,
   smallScreen,
   devices,
   displayableMediaStream,
   mediaControls,
   localStream,
   localMediaHandlers,
   deviceInitializers,
}) {
   return (
      <GlassDialog fullScreen={smallScreen} fullWidth maxWidth="sm" open>
         <DialogTitle>
            <div style={{ color: "lightgrey" }}>
               <SettingsIcon
                  style={{ verticalAlign: "middle", marginRight: "10px" }}
               />
               <span style={{ verticalAlign: "middle", marginRight: "10px" }}>
                  Settings
               </span>
            </div>
         </DialogTitle>
         <DialogContent dividers>
            <DeviceSelectMenu
               devices={devices}
               openModal={open}
               localStream={localStream}
               mediaControls={mediaControls}
               displayableMediaStream={displayableMediaStream}
               localMediaHandlers={localMediaHandlers}
               deviceInitializers={deviceInitializers}
            />
         </DialogContent>
         <DialogActions>
            <Button onClick={close}>Close</Button>
         </DialogActions>
      </GlassDialog>
   )
}

export default SettingsModal
