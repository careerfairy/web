import { Box, CircularProgress, Fade, speedDialClasses } from "@mui/material"
import {
   BrandedSpeedDial,
   BrandedSpeedDialAction,
} from "components/views/common/BrandedSpeedDial"
import { ReactionsIcon } from "components/views/common/icons"
import { EmoteType } from "context/agora/RTMContext"
import { forwardRef, useEffect, useRef, useState } from "react"
import { X } from "react-feather"
import { useClickAway } from "react-use"
import { sxStyles } from "types/commonTypes"
import { dataLayerEvent } from "util/analyticsUtils"
import { useSendEmote } from "../../context/rtm/hooks/useSendEmote"
import { ClapEmote, ConfusedEmote, HeartEmote, LikeEmote } from "../emotes"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

const styles = sxStyles({
   root: {
      position: "relative",
      [`& .${speedDialClasses.fab}`]: {
         transition: (theme) => theme.transitions.create("color"),
      },
   },
   closeIcon: {
      p: 0.4,
      strokeWidth: 2.5,
   },
   disabled: {
      pointerEvents: "none",
      zIndex: 1,
      [`& .${speedDialClasses.fab}`]: {
         color: "#A8AEAD !important",
      },
   },
   iconDisabled: {
      color: "#A8AEAD !important",
   },
   progress: {
      color: "primary.main",
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      left: 0.5,
      top: 1,
      "& svg": {
         width: "100%",
         height: "100%",
      },
   },
})

const DELAY = 2500 // 2.5 seconds
const TICK_RATE = 100 // 100 ms per tick
const INTERVAL = 100 / (DELAY / TICK_RATE) // Progress increment per tick

export const ReactionsActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const [open, setOpen] = useState(false)
   const [iconsDisabled, setIconsDisabled] = useState(false)
   const [progress, setProgress] = useState(INTERVAL)

   const reactionsRef = useRef(null)

   const { trigger: sendEmote } = useSendEmote()

   useClickAway(reactionsRef, () => {
      if (open) {
         setOpen(false)
      }
   })

   useEffect(() => {
      if (iconsDisabled) {
         setProgress(0)
         const timer = setInterval(() => {
            setProgress((prevProgress) =>
               prevProgress >= 100 ? 100 : prevProgress + INTERVAL
            )
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
      setIconsDisabled(true)
      setProgress(0)
      handleClose()
   }

   const ACTIONS: BrandedSpeedDialAction[] = [
      {
         node: <ClapEmote />,
         tooltip: "Applause",
         onClick: () => {
            handleSendEmote("clapping")
            dataLayerEvent("livestream_viewer_reaction_clap")
         },
      },
      {
         node: <HeartEmote />,
         tooltip: "Love",
         onClick: () => {
            handleSendEmote("heart")
            dataLayerEvent("livestream_viewer_reaction_heart")
         },
      },
      {
         node: <LikeEmote />,
         tooltip: "Like",
         onClick: () => {
            handleSendEmote("like")
            dataLayerEvent("livestream_viewer_reaction_like")
         },
      },
      {
         node: <ConfusedEmote />,
         tooltip: "Confused",
         onClick: () => {
            handleSendEmote("confused")
            dataLayerEvent("livestream_viewer_reaction_confused")
         },
      },
   ]

   return (
      <ActionBarButtonStyled ref={ref} {...props}>
         <Box
            sx={[styles.root, iconsDisabled && styles.disabled]}
            component="span"
         >
            <BrandedSpeedDial
               actions={ACTIONS}
               open={open}
               onOpen={handleOpen}
               onClose={handleClose}
               disabled={iconsDisabled}
               speedDialIcon={
                  <ReactionsIcon sx={[iconsDisabled && styles.iconDisabled]} />
               }
               speedDialOpenIcon={<Box sx={styles.closeIcon} component={X} />}
               ref={reactionsRef}
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
      </ActionBarButtonStyled>
   )
})

ReactionsActionButton.displayName = "ReactionsActionButton"
