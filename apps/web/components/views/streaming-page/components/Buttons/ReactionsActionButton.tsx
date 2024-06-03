import { EmoteType } from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   CircularProgress,
   Fade,
   buttonBaseClasses,
   speedDialActionClasses,
   speedDialClasses,
   speedDialIconClasses,
} from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import {
   BrandedSpeedDial,
   BrandedSpeedDialAction,
} from "components/views/common/BrandedSpeedDial"
import { ReactionsIcon } from "components/views/common/icons"
import { forwardRef, useEffect, useRef, useState } from "react"
import { X } from "react-feather"
import { useClickAway } from "react-use"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { useSendEmote } from "../../context/rtm/hooks/useSendEmote"
import {
   ClapEmote,
   ConfusedEmote,
   HeartEmote,
   LikeEmote,
} from "../emotes/icons"

const styles = sxStyles({
   root: {
      position: "relative",
   },
   speedDial: {
      [`& .${speedDialIconClasses.root}`]: {
         display: "flex",
         justifyContent: "center",
         alignItems: "center",
      },
      [`& .${speedDialIconClasses.icon}`]: {
         fontSize: 24,
         width: {
            xs: 24,
            tablet: 28,
         },
         height: {
            xs: 24,
            tablet: 28,
         },
      },
      [`& .${speedDialActionClasses.fab}`]: {
         [`&:hover, &:focus`]: {
            transform: "rotate(-10deg) scale(1.05)",
            transition: (theme) =>
               theme.transitions.create(["transform", "scale"]),
         },
      },
      [`& .${buttonBaseClasses.root}`]: {
         width: {
            xs: "30px !important",
            tablet: "44px !important",
         },
         height: {
            xs: "30px !important",
            tablet: "44px !important",
         },
      },
   },
   closeIcon: {
      p: 0.4,
      strokeWidth: 2.5,
   },
   speedDialDisabled: {
      [`& .${speedDialClasses.fab}`]: {
         color: "#A8AEAD !important",
      },
   },
   progress: {
      inset: 0,
      position: "absolute",
      color: "primary.main",
      width: "100% !important",
      height: "100% !important",
      "& svg": {
         width: "100%",
         height: "100%",
      },
   },
})

const DELAY = 2500 // 2.5 seconds
const TICK_RATE = 100 // 100 ms per tick
const INTERVAL = 100 / (DELAY / TICK_RATE) // Progress increment per tick

export const ReactionsActionButton = forwardRef<HTMLDivElement>((_, ref) => {
   const { userData } = useAuth()
   const [open, setOpen] = useState(false)
   const [iconsDisabled, setIconsDisabled] = useState(false)
   const [progress, setProgress] = useState(0)
   const { agoraUserId, livestreamId } = useStreamingContext()
   const streamIsMobile = useStreamIsMobile()
   const dispatch = useAppDispatch()

   const reactionsRef = useRef(null)

   const { trigger: sendEmote } = useSendEmote(livestreamId, agoraUserId)

   useClickAway(reactionsRef, () => {
      if (open) {
         setOpen(false)
      }
   })

   useEffect(() => {
      if (iconsDisabled) {
         setProgress(0)
         const timer = setInterval(() => {
            setProgress((prevProgress) => {
               const newProgress = prevProgress + INTERVAL
               return newProgress >= 100 ? 100 : newProgress
            })
         }, TICK_RATE)
         const timeout = setTimeout(() => {
            setIconsDisabled(false)
            clearInterval(timer)
         }, DELAY)
         return () => {
            clearTimeout(timeout)
            clearInterval(timer)
         }
      }
   }, [iconsDisabled])

   const handleOpen = () => setOpen(true)
   const handleClose = () => setOpen(false)

   const handleSendEmote = (emoteType: EmoteType) => {
      sendEmote({ emoteType })
      if (userData?.isAdmin) return // Do not disable and close the buttons for admins
      handleClose()
      setIconsDisabled(true)
      setProgress(0)
   }

   const ACTIONS: BrandedSpeedDialAction[] = [
      {
         node: <ClapEmote size={streamIsMobile ? 35 : undefined} />,
         tooltip: "Applause",
         onClick: () => {
            handleSendEmote(EmoteType.CLAPPING)
         },
      },
      {
         node: <HeartEmote size={streamIsMobile ? 35 : undefined} />,
         tooltip: "Love",
         onClick: () => {
            handleSendEmote(EmoteType.HEART)
         },
      },
      {
         node: <LikeEmote size={streamIsMobile ? 35 : undefined} />,
         tooltip: "Like",
         onClick: () => {
            handleSendEmote(EmoteType.LIKE)
         },
      },
      {
         node: <ConfusedEmote size={streamIsMobile ? 35 : undefined} />,
         tooltip: "Confused",
         onClick: () => {
            handleSendEmote(EmoteType.CONFUSED)
         },
      },
   ]

   return (
      <Box
         ref={ref}
         sx={[styles.root, iconsDisabled && styles.speedDialDisabled]}
         component="span"
      >
         <BrandedSpeedDial
            actions={ACTIONS}
            open={iconsDisabled === false && open}
            onOpen={handleOpen}
            onClose={handleClose}
            disabled={iconsDisabled}
            speedDialIcon={<ReactionsIcon />}
            speedDialOpenIcon={<Box sx={styles.closeIcon} component={X} />}
            ref={reactionsRef}
            speedDialSx={styles.speedDial}
         />
         <Fade timeout={500} in={iconsDisabled} mountOnEnter unmountOnExit>
            <CircularProgress
               sx={styles.progress}
               variant="determinate"
               thickness={3}
               value={progress}
            />
         </Fade>
      </Box>
   )
})

ReactionsActionButton.displayName = "ReactionsActionButton"
