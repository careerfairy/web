import React from "react";
import {
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import { GlassDialog } from "../../../../../materialUI/GlobalModals";
import DeviceSelectMenu from "../../sharedComponents/DeviceSelectMenu";

function SettingsModal({
   open,
   close,
   smallScreen,
   devices,
   displayableMediaStream,
   mediaControls,
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
               updateAudioSource={mediaControls.updateAudioSource}
               updateVideoSource={mediaControls.updateVideoSource}
               videoSource={mediaControls.videoSource}
               displayableMediaStream={displayableMediaStream}
               audioLevel={mediaControls.audioLevel}
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
