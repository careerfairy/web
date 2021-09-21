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
   audioSource,
   updateAudioSource,
   videoSource,
   updateVideoSource,
   audioLevel,
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
               updateAudioSource={updateAudioSource}
               updateVideoSource={updateVideoSource}
               videoSource={videoSource}
               displayableMediaStream={displayableMediaStream}
               audioLevel={audioLevel}
               audioSource={audioSource}
            />
         </DialogContent>
         <DialogActions>
            <Button onClick={close}>Close</Button>
         </DialogActions>
      </GlassDialog>
   );
}

export default SettingsModal;
