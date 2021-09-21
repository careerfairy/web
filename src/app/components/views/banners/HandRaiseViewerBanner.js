import React, { useEffect, useState } from "react";
import StreamBanner from "./StreamBanner";
import { Box, Button, Tooltip } from "@material-ui/core";
import HandRaiseIcon from "@material-ui/icons/PanToolOutlined";
import useHandRaiseState from "../../custom-hook/useHandRaiseState";
import { makeStyles } from "@material-ui/core/styles";

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

      if (handRaiseState.state === "unrequested") {
         newHandRaiseActionData = {
            title: "Raise my hand",
            buttons: [
               {
                  onClick: () => updateRequest("requested"),
                  buttonText: "Raise my hand",
               },
            ],
         };
      } else if (handRaiseState.state === "requested") {
         newHandRaiseActionData = {
            title: "You raised your hand!",
            buttons: [
               // {
               //    onClick: () => updateRequest("requested"),
               //    buttonText: "Raise again",
               // },
               {
                  onClick: () => updateRequest("unrequested"),
                  buttonText: "Cancel request",
                  variant: "text"
               },
            ],
         };
      } else if (handRaiseState.state === "denied") {
         newHandRaiseActionData = {
            title: "Sorry we can't answer your question right now.",
            buttons: [
               {
                  onClick: () => updateRequest("unrequested"),
                  buttonText: "Cancel",
               },
            ],
         };
      } else if (handRaiseState.state === "connecting") {
         newHandRaiseActionData = {
            title: "Connecting",
         };
      } else if (handRaiseState.state === "invited") {
         newHandRaiseActionData = {
            title: "Connecting to the stream",
            buttons: [
               {
                  onClick: () => updateRequest("unrequested"),
                  buttonText: "Cancel",
               },
            ],
         };
      } else if (handRaiseState.state === "connected") {
         newHandRaiseActionData = {
            title: "You are connected",
            buttons: [
               {
                  onClick: () => updateRequest("unrequested"),
                  buttonText: "Stop streaming",
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
         severity="success"
         icon={<HandRaiseIcon />}
         title={handRaiseActionData.title}
         action={
            <Box className={classes.actionsWrapper}>
               {handRaiseActionData.buttons?.map(
                  ({ buttonText, onClick, variant }) => (
                     <Tooltip key={buttonText} title={buttonText}>
                        <Button
                           onClick={onClick}
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
