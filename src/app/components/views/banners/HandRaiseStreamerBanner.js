import React, { useState } from "react";
import StreamBanner from "./StreamBanner";
import { Button, Tooltip } from "@mui/material";
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext";
import useStreamRef from "../../custom-hook/useStreamRef";
import HandRaiseIcon from "@mui/icons-material/PanToolOutlined";

const HandRaiseStreamerBanner = () => {
   const [buttonMessage] = useState("Deactivate Hand Raise");
   const { setHandRaiseMode } = useFirebaseService();
   const streamRef = useStreamRef();

   const deactivateHandRaise = () => {
      return setHandRaiseMode(streamRef, false);
   };

   return (
      <StreamBanner
         severity="info"
         icon={<HandRaiseIcon color="primary" />}
         title={`Hand Raise is Active`}
         subTitle={"Your audience can now request to join via audio and video."}
         action={
            <Tooltip title={buttonMessage}>
               <Button
                  onClick={deactivateHandRaise}
                  variant="text"
                  color="primary"
                  size="small"
               >
                  {buttonMessage}
               </Button>
            </Tooltip>
         }
      />
   );
};

export default HandRaiseStreamerBanner;
