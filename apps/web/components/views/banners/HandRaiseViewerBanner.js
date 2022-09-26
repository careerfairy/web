import React, { useEffect, useState } from "react"
import StreamBanner from "./StreamBanner"
import { Box, Button, Tooltip } from "@mui/material"
import HandRaiseIcon from "@mui/icons-material/PanToolOutlined"
import useHandRaiseState from "../../custom-hook/useHandRaiseState"
import { darken } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import StopStreamingIcon from "@mui/icons-material/Stop"
import { useCurrentStream } from "../../../context/stream/StreamContext"

const useStyles = makeStyles((theme) => ({
   actionsWrapper: {
      "& > :last-child": {
         marginRight: theme.spacing(0),
      },
      "& > *": {
         marginRight: theme.spacing(0.5),
      },
   },
   redButton: {
      background: theme.palette.error.main,
      "&:hover": {
         background: darken(theme.palette.error.main, 0.2),
      },
   },
}))
const HandRaiseViewerBanner = () => {
   const classes = useStyles()
   const { streamerId } = useCurrentStream()
   const [handRaiseState, updateRequest] = useHandRaiseState(streamerId)
   const [handRaiseActionData, setHandRaiseActionData] = useState({
      title: "Hand Raise is not active",
   })

   useEffect(() => {
      let newHandRaiseActionData

      if (handRaiseState?.state === "unrequested" || !handRaiseState) {
         newHandRaiseActionData = {
            title: "Hand Raise",
            subTitle: "Join the stream with your camera and microphone.",
            buttons: [
               {
                  onClick: () => updateRequest("acquire_media"),
                  buttonText: "Join now",
               },
            ],
         }
      } else if (handRaiseState?.state === "requested") {
         newHandRaiseActionData = {
            title: "Hand Raise",
            subTitle:
               "Your connection request has been sent, please wait to be invited.",
            buttons: [
               {
                  onClick: () => updateRequest("unrequested"),
                  buttonText: "Cancel request",
                  variant: "text",
                  color: "grey",
               },
            ],
         }
      } else if (handRaiseState?.state === "denied") {
         newHandRaiseActionData = {
            title: "Hand Raise",
            subTitle: "Sorry we can't take your request right now.",
            buttons: [
               {
                  onClick: () => updateRequest("unrequested"),
                  buttonText: "Cancel",
                  color: "grey",
               },
            ],
         }
      } else if (handRaiseState?.state === "connecting") {
         newHandRaiseActionData = {
            title: "Hand Raise",
            subTitle: "Connecting",
         }
      } else if (handRaiseState?.state === "invited") {
         newHandRaiseActionData = {
            title: "Hand Raise",
            subTitle: "Connecting to the stream",
            buttons: [
               {
                  onClick: () => updateRequest("unrequested"),
                  buttonText: "Cancel",
                  color: "grey",
               },
            ],
         }
      } else if (handRaiseState?.state === "connected") {
         newHandRaiseActionData = {
            title: "You are connected",
            buttons: [
               {
                  onClick: () => updateRequest("unrequested"),
                  buttonText: "Leave hand raise",
                  buttonIcon: <StopStreamingIcon />,
                  buttonClassName: classes.redButton,
               },
            ],
         }
      } else {
         newHandRaiseActionData = {
            title: "Hand Raise is not active",
         }
      }

      setHandRaiseActionData(newHandRaiseActionData)
   }, [handRaiseState])

   return (
      <StreamBanner
         severity={"success"}
         icon={<HandRaiseIcon />}
         title={handRaiseActionData.title}
         subTitle={handRaiseActionData.subTitle}
         action={
            <Box className={classes.actionsWrapper}>
               {handRaiseActionData.buttons?.map(
                  ({
                     buttonText,
                     onClick,
                     variant,
                     buttonIcon,
                     buttonClassName,
                  }) => (
                     <Tooltip key={buttonText} title={buttonText}>
                        <Button
                           onClick={onClick}
                           startIcon={buttonIcon}
                           className={buttonClassName}
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
   )
}

export default HandRaiseViewerBanner
