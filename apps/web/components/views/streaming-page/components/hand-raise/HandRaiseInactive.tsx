import { LoadingButton } from "@mui/lab"
import { Stack, Typography } from "@mui/material"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { useToggleHandRaise } from "components/custom-hook/streaming/hand-raise/useToggleHandRaise"
import { HandRaiseIcon } from "components/views/common/icons"
import { forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"

const styles = sxStyles({
   root: {
      px: 1.5,
   },
   icon: {
      width: 71,
      height: 71,
      opacity: 0.5,
      color: "primary.main",
   },
   title: {
      fontWeight: 700,
      color: "primary.main",
      textAlign: "center",
   },
   description: {
      textAlign: "center",
      color: "neutral.800",
   },
})

export const HandRaiseInactive = forwardRef<HTMLDivElement>((_, ref) => {
   const streamIsMobile = useStreamIsMobile()
   const streamIsLandscape = useStreamIsLandscape()

   const { livestreamId, streamerAuthToken } = useStreamingContext()
   const { trigger: toggleHandRaise, isMutating } = useToggleHandRaise(
      livestreamId,
      streamerAuthToken
   )

   return (
      <Stack
         ref={ref}
         pt={streamIsLandscape ? 2 : streamIsMobile ? 6.875 : 3.75}
         alignItems="center"
         sx={styles.root}
         spacing={streamIsLandscape ? 2 : 3}
      >
         <Stack
            spacing={streamIsLandscape ? 1 : 1.5}
            alignItems="center"
            justifyContent="center"
            maxWidth={streamIsLandscape ? 500 : 303}
         >
            <HandRaiseIcon sx={styles.icon} />
            <Typography variant="mobileBrandedH1" sx={styles.title}>
               Hand raise is not&nbsp;active
            </Typography>
            <Typography variant="medium" sx={styles.description}>
               Engage with talent directly! By activating the hand raise feature
               talent will be able to join your stream with audio and video to
               ask you their own questions.
            </Typography>
         </Stack>
         <LoadingButton
            onClick={toggleHandRaise}
            loading={isMutating}
            variant="contained"
            fullWidth={!streamIsMobile}
         >
            Activate hand raise
         </LoadingButton>
      </Stack>
   )
})

HandRaiseInactive.displayName = "HandRaiseInactive"
