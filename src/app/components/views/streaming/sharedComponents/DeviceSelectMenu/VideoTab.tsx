import React from "react";
import { Stack } from "@mui/material";
import DeviceSelect, { DeviceSelectProps } from "../DeviceSelect";

interface VideoTabProps extends DeviceSelectProps {}
const VideoTab = (props: VideoTabProps) => {
   return (
      <Stack spacing={2}>
         <DeviceSelect {...props} />
      </Stack>
   );
};

export default VideoTab;
