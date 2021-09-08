import React from "react";
import StreamBanner from "./StreamBanner";
import useStreamToken from "../../custom-hook/useStreamToken";
import { useCurrentStream } from "../../../context/stream/StreamContext";
import { Button, Tooltip } from "@material-ui/core";

const BreakoutRoomBanner = () => {

   const links = useStreamToken({ forStreamType: "mainLivestream" });
   const {
      isStreamer,
      isMainStreamer,
      currentLivestream: { title },
   } = useCurrentStream();

   const handleBackToMainRoom = () => {
      window.location.href = isMainStreamer
         ? links.mainStreamerLink
         : isStreamer
         ? links.joiningStreamerLink
         : links.viewerLink;
   };

   return (
      <StreamBanner
         severity="info"
         title={`ROOM: ${title}`}
         action={
            <Tooltip title="Back to main room">
               <Button
                  onClick={handleBackToMainRoom}
                  variant="contained"
                  color="primary"
                  size="small"
               >
                  Back
               </Button>
            </Tooltip>
         }
      />
   );
};

export default BreakoutRoomBanner;
