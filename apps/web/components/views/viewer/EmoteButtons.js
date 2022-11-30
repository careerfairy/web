import React, { memo, useCallback, useEffect, useState } from "react"
import { Box, CircularProgress, ClickAwayListener, Fab } from "@mui/material"
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined"
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined"
import { alpha } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { amber, deepOrange, grey, red } from "@mui/material/colors"
import ClappingSVG from "../../util/CustomSVGs"
import { useCurrentStream } from "../../../context/stream/StreamContext"
import { useAuth } from "../../../HOCs/AuthProvider"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { TEST_EMAIL } from "../streaming/LeftMenu/categories/chat/EmotesModal/utils"
import { dataLayerEvent } from "../../../util/analyticsUtils"

const useStyles = makeStyles((theme) => ({
   image: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "28px",
   },
   miniLike: {
      width: "50px !important",
      height: "50px !important",
      backgroundColor: red["A400"],
      color: "white",
      "&:disabled": {
         backgroundColor: alpha(red["A400"], 0.5),
         color: "white",
      },
      "&:hover": {
         backgroundColor: red["A700"],
      },
   },
   miniClap: {
      width: "50px !important",
      height: "50px !important",
      backgroundColor: deepOrange[400],
      color: "white",
      "&:disabled": {
         backgroundColor: alpha(deepOrange[400], 0.5),
         color: "white",
      },
      "&:hover": {
         backgroundColor: deepOrange[700],
      },
   },
   miniHeart: {
      width: "50px !important",
      height: "50px !important",
      backgroundColor: amber[400],
      color: "white",
      "&:disabled": {
         backgroundColor: alpha(amber[400], 0.5),
         color: "white",
      },
      "&:hover": {
         backgroundColor: amber[600],
      },
   },
   miniButtons: {
      "& > *": {
         margin: "0.2rem",
      },
      transition: "transform 0.7s",
      transitionTimingFunction: theme.transitions.easeOut,
      "@media(min-width: 768px)": {
         display: "flex",
         alignItems: "center",
         justifyContent: "flex-end",
         transform: "translate(-90px, 0)", // prevent the icons from being overlapped by the chat box when shrunk
      },
      "@media(max-width: 768px)": {
         flexDirection: "column",
         display: "flex",
         justifyContent: "center",
         alignItems: "center",
      },
   },
   cardHovered: {
      "@media(min-width: 768px)": {
         transform: "translate(0, -70px) scale3d(1.7, 1.7, 1.7)",
         "-moz-transform": "translate(0, -70px) scale3d(1.7, 1.7, 1.7)",
         "-o-transform": "translate(0, -70px) scale3d(1.7, 1.7, 1.7)",
         "-webkit-transform": "translate(0, -70px) scale3d(1.7, 1.7, 1.7)",
      },
      "@media(max-width: 768px)": {
         transform: "translate(-50px, 0) scale3d(1.7, 1.7, 1.7)",
         "-moz-transform": "translate(-50px, 0) scale3d(1.7, 1.7, 1.7)",
         "-o-transform": "translate(-50px, 0) scale3d(1.7, 1.7, 1.7)",
         "-webkit-transform": "translate(-50px, 0) scale3d(1.7, 1.7, 1.7)",
      },
   },
   actionArea: {
      display: ({ handRaiseActive }) => (handRaiseActive ? "none" : "flex"),
      "@media(min-width: 768px)": {
         position: "absolute",
         width: "50%",
         bottom: 5,
         left: "50%",
         transform: "translateX(-50%)",
         zIndex: 150,
         height: 120,
         display: "flex",
         flexDirection: "column",
         alignItems: "center",
         justifyContent: "flex-end",
      },
      "@media(max-width: 768px)": {
         position: "absolute",
         right: 15,
         top: "50%",
         transform: "translateY(-50%)",
         zIndex: 150,
         width: 100,
         display: "flex",
         justifyContent: "flex-end",
         alignItems: "center",
      },
   },
   root: {
      position: "relative",
      minHeight: "100vh",
      height: "100%",
      width: "100%",
      touchAction: "manipulation",
   },
   wrapper: {
      position: "relative",
   },
   fabProgress: {
      color: alpha(grey[500], 0.5),
      position: "absolute",
      zIndex: 1,
      top: 0,
      left: 0,
      height: "50px !important",
      width: "50px !important",
   },
}))
const delay = 3000 //3 seconds
const smoothness = 2
const EmoteButtons = ({ createEmote }) => {
   const firebase = useFirebaseService()

   const {
      currentLivestream: { id: livestreamId },
   } = useCurrentStream()
   const { authenticatedUser, userData } = useAuth()
   const classes = useStyles({ handRaiseActive: false })
   const SPEED = isNaN(smoothness) ? 2 : smoothness
   const DELAY = isNaN(delay) ? 3000 : delay
   const INTERVAL = 10 / SPEED
   const TICK_RATE = DELAY / (INTERVAL * SPEED) / SPEED
   const [open, setOpen] = React.useState(true)
   const [delayHandler, setDelayHandler] = useState(null)
   const [iconsDisabled, setIconsDisabled] = useState(false)
   const [progress, setProgress] = useState(INTERVAL)

   useEffect(() => {
      if (iconsDisabled) {
         setProgress(INTERVAL)
         const timer = setInterval(() => {
            setProgress((prevProgress) =>
               prevProgress >= 100 ? INTERVAL : prevProgress + INTERVAL
            )
         }, TICK_RATE)
         const timeout = setTimeout(() => {
            enableIcons()
         }, DELAY)
         return () => {
            clearTimeout(timeout)
            clearInterval(timer)
         }
      }
   }, [iconsDisabled])

   const handleOpen = useCallback(() => {
      setOpen(true)
   }, [])

   const handleClose = useCallback(() => {
      setOpen(false)
   }, [])

   const handleMouseEnter = useCallback(
      (event) => {
         clearTimeout(delayHandler)
         handleOpen()
      },
      [delayHandler]
   )

   const handleMouseLeave = useCallback(() => {
      setDelayHandler(
         setTimeout(() => {
            handleClose()
         }, DELAY)
      )
   }, [delayHandler])

   const handleClap = useCallback(() => {
      postIcon("clapping")
      dataLayerEvent("livestream_viewer_reaction_clap")
   }, [iconsDisabled, livestreamId, authenticatedUser, createEmote])

   const handleLike = useCallback(() => {
      postIcon("like")
      dataLayerEvent("livestream_viewer_reaction_like")
   }, [iconsDisabled, livestreamId, authenticatedUser, createEmote])
   const handleHeart = useCallback(() => {
      postIcon("heart")
      dataLayerEvent("livestream_viewer_reaction_heart")
   }, [iconsDisabled, livestreamId, authenticatedUser, createEmote])

   const postIcon = (iconName) => {
      if (!iconsDisabled) {
         createEmote(iconName)
         if (!userData || !userData.isClapAdmin) {
            setIconsDisabled(true)
         }
         firebase
            .postIcon(
               livestreamId,
               iconName,
               authenticatedUser.email || TEST_EMAIL
            )
            .catch(console.error)
      }
   }
   const enableIcons = useCallback(() => {
      setIconsDisabled(false)
   }, [])

   return (
      <ClickAwayListener onClickAway={handleClose}>
         <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={classes.actionArea}
         >
            <Box
               className={
                  open
                     ? `${classes.miniButtons} ${classes.cardHovered}`
                     : classes.miniButtons
               }
            >
               <div className={classes.wrapper}>
                  <Fab
                     disabled={iconsDisabled}
                     onClick={handleLike}
                     className={classes.miniLike}
                     aria-label="like"
                  >
                     <ThumbUpAltOutlinedIcon fontSize="medium" />
                  </Fab>
                  {iconsDisabled && (
                     <CircularProgress
                        variant="determinate"
                        value={progress}
                        className={classes.fabProgress}
                     />
                  )}
               </div>
               <div className={classes.wrapper}>
                  <Fab
                     disabled={iconsDisabled}
                     onClick={handleClap}
                     className={classes.miniClap}
                     aria-label="clap"
                  >
                     <ClappingSVG
                        style={{ width: 21, height: 21 }}
                        fontSize="medium"
                     />
                  </Fab>
                  {iconsDisabled && (
                     <CircularProgress
                        variant="determinate"
                        value={progress}
                        className={classes.fabProgress}
                     />
                  )}
               </div>
               <div className={classes.wrapper}>
                  <Fab
                     disabled={iconsDisabled}
                     onClick={handleHeart}
                     className={classes.miniHeart}
                     aria-label="heart"
                  >
                     <FavoriteBorderOutlinedIcon fontSize="medium" />
                  </Fab>
                  {iconsDisabled && (
                     <CircularProgress
                        variant="determinate"
                        value={progress}
                        className={classes.fabProgress}
                     />
                  )}
               </div>
            </Box>
         </div>
      </ClickAwayListener>
   )
}

export default memo(EmoteButtons)
