import React from "react";
import {
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { GlassDialog } from "../../../../../materialUI/GlobalModals";
import DeviceSelectMenu from "../../sharedComponents/DeviceSelectMenu";

function SettingsModal({
   open,
   close,
   smallScreen,
   devices,
   displayableMediaStream,
   mediaControls,
   localStream,
}) {
   return (
      <GlassDialog fullScreen={smallScreen} fullWidth maxWidth="sm" open={open}>
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
               showSoundMeter={open}
               updateAudioSource={mediaControls.updateAudioSource}
               updateVideoSource={mediaControls.updateVideoSource}
               videoSource={mediaControls.videoSource}
               localStream={localStream}
               displayableMediaStream={displayableMediaStream}
               audioSource={mediaControls.audioSource}
            />
         </DialogContent>
         <DialogActions>
            <Button onClick={close}>Close</Button>
         </DialogActions>
      </GlassDialog>
   );
}

export default SettingsModal;
