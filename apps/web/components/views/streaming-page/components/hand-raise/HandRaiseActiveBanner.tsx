import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import { Box, Collapse, Typography } from "@mui/material"
import { useUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUserHandRaiseState"
import { ReactNode } from "react"
import { useStreamHandRaiseActive } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"

const styles = sxStyles({
   root: {
      borderRadius: "4px",
      width: "100%",
      background: "linear-gradient(90.55deg, #00D2AA -9.83%, #12EEC4 100.07%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 0.532,
   },
   text: {
      color: "white",
      fontSize: "13px",
      fontWeight: 400,
      lineHeight: "150%",
      letterSpacing: "-0.143px",
      textAlign: "center",
      "& b": {
         fontWeight: 600,
      },
   },
})

export const HandRaiseActiveBanner = () => {
   const { isHost, agoraUserId, livestreamId } = useStreamingContext()
   const handRaiseActive = useStreamHandRaiseActive()

   const { userHandRaiseIsActive: userHandRaiseActive, handRaise } =
      useUserHandRaiseState(livestreamId, agoraUserId)

   if (isHost) {
      return (
         <Banner in={handRaiseActive}>
            <b>Hand raise active:</b> Your audience can now request to join via
            audio and video.
         </Banner>
      )
   }

   return (
      <Banner in={userHandRaiseActive}>
         <b>Hand raise active:</b> {handRaiseSubtitles[handRaise?.state]}
      </Banner>
   )
}

type BannerProps = {
   children: ReactNode
   in: boolean
}

const Banner = ({ children, in: inProp }: BannerProps) => {
   return (
      <Collapse in={inProp} unmountOnExit>
         <Box sx={styles.root}>
            <Typography sx={styles.text}>{children}</Typography>
         </Box>
      </Collapse>
   )
}

const handRaiseSubtitles = {
   [HandRaiseState.acquire_media]:
      "Join the stream with your camera and microphone.",
   [HandRaiseState.requested]:
      "Your connection request has been sent, please wait to be invited.",
   [HandRaiseState.denied]: "Sorry we can't take your request right now.",
   [HandRaiseState.connecting]: "Connecting",
   [HandRaiseState.invited]: "Connecting to the stream",
   [HandRaiseState.connected]: "You are connected",
   [HandRaiseState.unrequested]: "Hand Raise is not active",
}
