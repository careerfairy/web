import React, { FC } from "react"
import { Box, Button, IconButton, Dialog, DialogContent } from "@mui/material"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline"
import ReactPlayer, { Config } from "react-player"
import { sxStyles } from "types/commonTypes"
import { sparksTutorialVideoUrl } from "constants/videos"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import { imageKitLoader } from "@careerfairy/shared-lib/utils/video"

const sparksTutorialVideoUrlImageKit: string = imageKitLoader({
   src: sparksTutorialVideoUrl,
   width: 1280,
   height: 720,
   quality: 80,
   maxSizeCrop: true,
})

const styles = sxStyles({
   btnWatchNow: {
      color: "#8E8E8E",
      textTransform: "none",
   },
   btnCloseTutorialDialog: {
      position: "absolute",
      top: 0,
      right: 0,
      zIndex: 2,
      mt: 1,
      mr: 1,
      p: 0,
      color: "white",
      "& svg": {
         width: 27.83,
         height: 27.83,
      },
   },
   iconCloseTutorialDialog: {
      borderRadius: "8px",
      marginRight: "0 !important",
   },
   mobileTutorialVideoWrapper: {
      position: "fixed",
      zIndex: 9999,
      backgroundColor: "white",
      width: "100vw",
      height: "100vh",
      top: 0,
   },
   overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "10%",
      background:
         "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.2) 0.1%, rgba(0, 0, 0, 0) 100%)",
      pointerEvents: "none", // allows interaction with elements behind the overlay
      zIndex: 1,
   },
   playerStyles: {
      position: "relative",
      display: "flex",
   },
   dialogPaperProps: {
      width: "156.25vh", // this value was calculated based on the 16/9 aspect ratio, 9/16 = 56.25
      backgroundColor: "transparent",
   },
   aspectRatioWrapper: {
      position: "relative",
      paddingTop: "56.25%",
   },
   aspectRatioInner: {
      position: "absolute",
      top: 0,
      left: 0,
   },
})

type TutorialVideoProps = {
   videoUrl: string
   width?: string
   height?: string
}

const playerConfig: Config = {
   file: { attributes: { controlsList: "nodownload" } },
}

const TutorialVideo: FC<TutorialVideoProps> = ({
   videoUrl,
   width = "100%",
   height = "100%",
}) => {
   return (
      <ReactPlayer
         alt="Sparks video tutorial"
         config={playerConfig}
         url={videoUrl}
         style={styles.playerStyles} // fixes the margin bottom and the overlay issue, respectively
         width={width}
         height={height}
         playing
         playsinline
         controls
      />
   )
}

const TutorialVideoCloseIcon: FC<{ handleClose: () => void }> = ({
   handleClose,
}) => {
   return (
      <IconButton
         sx={styles.btnCloseTutorialDialog}
         aria-label="close-sparks-tutorial-video"
         onClick={handleClose}
      >
         <CloseRoundedIcon color="inherit" />
      </IconButton>
   )
}

const GradientOverlay = () => {
   return <Box sx={styles.overlay} />
}

const AspectRatioWrapper = ({ children }) => {
   return (
      <Box sx={styles.aspectRatioWrapper}>
         <Box sx={styles.aspectRatioInner}>{children}</Box>
      </Box>
   )
}

type TutorialVideoDialogProps = {
   isDialogOpen: boolean
   handleDialogClose: () => void
   videoUrl: string
}

const TutorialVideoDialog: FC<TutorialVideoDialogProps> = ({
   isDialogOpen,
   handleDialogClose,
   videoUrl,
}) => {
   return (
      <Dialog
         open={isDialogOpen}
         onClose={handleDialogClose}
         maxWidth="lg"
         PaperProps={{ sx: styles.dialogPaperProps }}
      >
         <DialogContent sx={{ p: 0 }}>
            <AspectRatioWrapper>
               <GradientOverlay />
               <TutorialVideoCloseIcon handleClose={handleDialogClose} />
               <TutorialVideo videoUrl={videoUrl} />
            </AspectRatioWrapper>
         </DialogContent>
      </Dialog>
   )
}

const WatchTutorialButton: FC = () => {
   const isMobile = useIsMobile()
   const isWeb = !isMobile

   const [
      isTutorialDialogOpen,
      handleTutorialDialogOpen,
      handleTutorialDialogClose,
   ] = useDialogStateHandler()
   const [
      isTutorialMobileOpen,
      handleTutorialMobileOpen,
      handleTutorialMobileClose,
   ] = useDialogStateHandler()

   return (
      <>
         <Button
            sx={styles.btnWatchNow}
            color="secondary"
            variant="text"
            size="small"
            startIcon={<PlayCircleOutlineIcon />}
            onClick={
               isMobile ? handleTutorialMobileOpen : handleTutorialDialogOpen
            }
         >
            Watch Sparks tutorial
         </Button>
         {isWeb && (
            <TutorialVideoDialog
               isDialogOpen={isTutorialDialogOpen}
               handleDialogClose={handleTutorialDialogClose}
               videoUrl={sparksTutorialVideoUrlImageKit}
            />
         )}
         {isMobile && isTutorialMobileOpen && (
            <Box sx={styles.mobileTutorialVideoWrapper}>
               <GradientOverlay />
               <TutorialVideoCloseIcon
                  handleClose={handleTutorialMobileClose}
               />
               <TutorialVideo videoUrl={sparksTutorialVideoUrlImageKit} />
            </Box>
         )}
      </>
   )
}

export default WatchTutorialButton
