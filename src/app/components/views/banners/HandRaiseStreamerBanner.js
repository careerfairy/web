import React, { useState } from "react";
import StreamBanner from "./StreamBanner";
import { Button, Tooltip } from "@material-ui/core";
import { useFirebase } from "../../../context/firebase";
import useStreamRef from "../../custom-hook/useStreamRef";
import HandRaiseIcon from "@material-ui/icons/PanToolOutlined";

const HandRaiseStreamerBanner = () => {
   const [buttonMessage] = useState("Deactivate Hand Raise");
   const { setHandRaiseMode } = useFirebase();
   const streamRef = useStreamRef();

   const deactivateHandRaise = () => {
      return setHandRaiseMode(streamRef, false);
   };

   return (
      <StreamBanner
         severity="info"
         icon={<HandRaiseIcon />}
         title={`Hand Raise is Active`}
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
