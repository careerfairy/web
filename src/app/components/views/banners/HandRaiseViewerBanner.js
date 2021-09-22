import React, { useEffect, useState } from "react";
import StreamBanner from "./StreamBanner";
import { Box, Button, Tooltip } from "@material-ui/core";
import HandRaiseIcon from "@material-ui/icons/PanToolOutlined";
import useHandRaiseState from "../../custom-hook/useHandRaiseState";
import { makeStyles } from "@material-ui/core/styles";
import StopStreamingIcon from "@material-ui/icons/Stop";

const useStyles = makeStyles((theme) => ({
   actionsWrapper: {
      "& > :last-child": {
         marginRight: theme.spacing(0),
      },
      "& > *": {
         marginRight: theme.spacing(0.5),
      },
   },
}));
const HandRaiseViewerBanner = () => {
   const classes = useStyles();
   const [handRaiseState, updateRequest] = useHandRaiseState();
   const [handRaiseActionData, setHandRaiseActionData] = useState({
      title: "Hand Raise is not active",
   });

   useEffect(() => {
      let newHandRaiseActionData;

      if (handRaiseState?.state === "unrequested") {
         newHandRaiseActionData = {
            title: "Connect with video and audio",
            buttons: [
               {
                  onClick: () => updateRequest("requested"),
                  buttonText: "Connect",
               },
            ],
         };
      } else if (handRaiseState?.state === "requested") {
         newHandRaiseActionData = {
            title:
               "Your connection request has been sent, please wait to be invited.",
            buttons: [
               {
                  onClick: () => updateRequest("unrequested"),
                  buttonText: "Cancel request",
                  variant: "text",
               },
            ],
         };
      } else if (handRaiseState?.state === "denied") {
         newHandRaiseActionData = {
            title: "Sorry we can't take your request right now.",
            buttons: [
               {
                  onClick: () => updateRequest("unrequested"),
                  buttonText: "Cancel",
               },
            ],
         };
      } else if (handRaiseState?.state === "connecting") {
         newHandRaiseActionData = {
            title: "Connecting",
         };
      } else if (handRaiseState?.state === "invited") {
         newHandRaiseActionData = {
            title: "Connecting to the stream",
            buttons: [
               {
                  onClick: () => updateRequest("unrequested"),
                  buttonText: "Cancel",
               },
            ],
         };
      } else if (handRaiseState?.state === "connected") {
         newHandRaiseActionData = {
            title: "You are connected",
            buttons: [
               {
                  onClick: () => updateRequest("unrequested"),
                  buttonText: "Stop streaming",
                  buttonIcon: <StopStreamingIcon />,
               },
            ],
         };
      } else {
         newHandRaiseActionData = {
            title: "Hand Raise is not active",
         };
      }

      setHandRaiseActionData(newHandRaiseActionData);
   }, [handRaiseState]);

   return (
      <StreamBanner
         severity={handRaiseState?.state === "connected" ? "success" : "info"}
         icon={<HandRaiseIcon />}
         title={handRaiseActionData.title}
         action={
            <Box className={classes.actionsWrapper}>
               {handRaiseActionData.buttons?.map(
                  ({ buttonText, onClick, variant, buttonIcon }) => (
                     <Tooltip key={buttonText} title={buttonText}>
                        <Button
                           onClick={onClick}
                           startIcon={buttonIcon}
                           variant={variant || "contained"}
                           color="primary"
                           size="small"
                        >
                           {buttonText}
                        </Button>
                     </Tooltip>
                  )
               )}
            </Box>
         }
      />
   );
};

export default HandRaiseViewerBanner;
