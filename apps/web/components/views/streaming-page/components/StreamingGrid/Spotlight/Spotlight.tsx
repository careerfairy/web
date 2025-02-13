import { LivestreamModes } from "@careerfairy/shared-lib/livestreams"
import MuteIcon from "@mui/icons-material/VolumeOff"
import UnmuteIcon from "@mui/icons-material/VolumeUp"
import {
   Box,
   Button,
   IconButton,
   Slide,
   Stack,
   Typography,
} from "@mui/material"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import FramerBox from "components/views/common/FramerBox"
import BrandedSwipeableDrawer from "components/views/common/inputs/BrandedSwipeableDrawer"
import { useStreamingContext } from "components/views/streaming-page/context"
import { AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import { useState } from "react"
import { Maximize, Minimize } from "react-feather"
import { useLocalStorage } from "react-use"
import {
   useIsSpotlightMode,
   useLivestreamMode,
} from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { UserStream } from "../../../types"
import { SpotlightProvider, useSpotlight } from "./SpotlightProvider"
import { SpotlightPDF } from "./pdf/SpotlightPDF"
import { SpotlightStream } from "./stream/SpotlightStream"
import { SpotlightVideo } from "./video/SpotlightVideo"

const DotLottiePlayer = dynamic(
   () =>
      import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
   { ssr: false }
)

const ICON_SIZE = 90

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      borderRadius: "10px",
      justifyContent: "center",
      alignItems: "center",
   },
   framerBox: {
      position: "relative",
   },
   framerBoxDefault: {
      width: "100%",
      height: "100%",
   },
   fullScreenStyles: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 9999,
      overflow: "hidden",
      borderRadius: 0,
   },
   fullScreenPortraitStyles: {
      position: "fixed",
      top: "50%",
      left: "50%",
      width: "100dvh",
      height: "100dvw",
      transform: "translate(-50%, -50%) rotate(90deg)",
   },
   overlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "100%",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "flex-end",
      borderRadius: "10px",
      visibility: "hidden",
      background:
         "linear-gradient(rgba(0, 0, 0, 0.00) 66.67%, rgba(0, 0, 0, 0.50) 100%)",
   },
   overlayVisible: {
      visibility: "visible",
   },
   overlayFullScreen: {
      borderRadius: 0,
      background:
         "linear-gradient(0deg, rgba(0, 0, 0, 0.50) 1.76%, rgba(0, 0, 0, 0.00) 18.19%)",
   },
   controlsButton: {
      color: "white",
   },
   drawerContent: {
      m: 2.5,
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
   },
})

const Content = {
   [LivestreamModes.DESKTOP]: <SpotlightStream />,
   [LivestreamModes.PRESENTATION]: <SpotlightPDF />,
   [LivestreamModes.VIDEO]: <SpotlightVideo />,
} as const

type Props = {
   stream: UserStream
}

export const Spotlight = ({ stream }: Props) => {
   const isLandscape = useStreamIsLandscape()
   const isMobile = useStreamIsMobile()
   const isSpotlightMode = useIsSpotlightMode()
   const livestreamMode = useLivestreamMode()
   const { isHost } = useStreamingContext()

   const [isFullScreen, setIsFullScreen] = useState(false)
   const [showOverlay, setShowOverlay] = useState(false)
   const [hasSeenFullscreenPrompt, setHasSeenFullscreenPrompt] =
      useLocalStorage("hasSeenFullscreenPrompt", false)

   const toggleShowControls = () => {
      setShowOverlay((isOverlay) => !isOverlay)
   }

   const handleFullscreenClick = (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent overlay toggle
      setIsFullScreen(!isFullScreen)
   }

   if (!Content[livestreamMode]) return null

   return (
      <>
         <AnimatePresence>
            <Slide
               in={isSpotlightMode}
               direction={isLandscape ? "right" : "up"}
               unmountOnExit
            >
               <Box style={styles.root}>
                  <FramerBox
                     sx={styles.framerBox}
                     onClick={toggleShowControls}
                     initial={false}
                     animate={{
                        ...(!isFullScreen && styles.framerBoxDefault), // prevent from using fixed values
                        ...(isFullScreen && styles.fullScreenStyles),
                        ...(isFullScreen &&
                           !isLandscape &&
                           styles.fullScreenPortraitStyles),
                     }}
                     layout
                  >
                     <SpotlightProvider stream={stream}>
                        {Content[livestreamMode]}
                        {!isHost && (
                           <Overlay
                              isFullScreen={isFullScreen}
                              handleFullscreenClick={handleFullscreenClick}
                              showOverlay={showOverlay}
                           />
                        )}
                     </SpotlightProvider>
                  </FramerBox>
               </Box>
            </Slide>
         </AnimatePresence>
         <PresentationPrompt
            open={Boolean(isMobile) && !isHost && !hasSeenFullscreenPrompt}
            handleClose={() => setHasSeenFullscreenPrompt(true)}
         />
      </>
   )
}

const Overlay = ({ isFullScreen, handleFullscreenClick, showOverlay }) => {
   const { isMuted, handleToggleMute, showMute } = useSpotlight()
   const isMobile = useStreamIsMobile()

   if (!isMobile && !showMute) return null

   return (
      <FramerBox
         sx={{
            ...styles.overlay,
            ...(isFullScreen && styles.overlayFullScreen),
            ...(showOverlay && styles.overlayVisible),
         }}
         animate={{
            opacity: showOverlay ? 1 : 0,
         }}
      >
         <Stack spacing={1} direction={"row"}>
            {Boolean(showMute) && (
               <IconButton
                  onClick={(e) => {
                     e.stopPropagation()
                     handleToggleMute()
                  }}
                  sx={styles.controlsButton}
               >
                  {isMuted ? (
                     <MuteIcon sx={{ height: "24px", width: "24px" }} />
                  ) : (
                     <UnmuteIcon sx={{ height: "24px", width: "24px" }} />
                  )}
               </IconButton>
            )}
            {Boolean(isMobile) && (
               <IconButton
                  onClick={handleFullscreenClick}
                  sx={styles.controlsButton}
               >
                  {isFullScreen ? <Minimize /> : <Maximize />}
               </IconButton>
            )}
         </Stack>
      </FramerBox>
   )
}

const PresentationPrompt = ({ open, handleClose }) => {
   return (
      <BrandedSwipeableDrawer
         open={open}
         anchor="bottom"
         onOpen={() => {}}
         onClose={handleClose}
         disableEnforceFocus
      >
         <Stack sx={styles.drawerContent}>
            <DotLottiePlayer
               src="https://lottie.host/34421851-937b-48a7-84bd-3c4e99350217/rCvwWuT7YN.lottie"
               autoplay
               loop
               style={{
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                  marginBottom: 2,
               }}
            />
            <Typography variant="brandedH3" fontWeight={600} mb={1.5}>
               The streamer is now presenting
            </Typography>
            <Typography variant="brandedBody" mb={3}>
               Click on the presentation to have the option to make it full
               screen!
            </Typography>
            <Button fullWidth variant="contained" onClick={handleClose}>
               Got it!
            </Button>
         </Stack>
      </BrandedSwipeableDrawer>
   )
}
