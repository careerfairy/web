import React from "react";
import { Stack } from "@mui/material";
import DeviceSelect from "../DeviceSelect";

const VideoTab = ({
   devices,
   openModal,
   localStream,
   mediaControls,
   localMediaHandlers,
   displayableMediaStream,
}) => {
   return (
      <Stack spacing={2}>
         <DeviceSelect
            devices={devices}
            localStream={localStream}
            showSoundMeter={openModal}
            displayableMediaStream={displayableMediaStream}
            localMediaHandlers={localMediaHandlers}
            openModal={openModal}
            mediaControls={mediaControls}
            mediaDeviceType={"camera"}
            selectTitle={"Select Camera"}
         />
      </Stack>
   );
};

export default VideoTab;
