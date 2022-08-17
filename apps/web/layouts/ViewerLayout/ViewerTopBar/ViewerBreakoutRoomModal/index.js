import React, { useEffect, useMemo, useRef, useState } from "react"
import { alpha } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { useFirestoreConnect } from "react-redux-firebase"
import breakoutRoomsSelector from "../../../../components/selectors/breakoutRoomsSelector"
import { useRouter } from "next/router"
import {
   Box,
   Button,
   Chip,
   DialogActions,
   Drawer,
   IconButton,
   ListItem,
   ListItemText,
   Tooltip,
   Typography,
} from "@mui/material"
import PropTypes from "prop-types"
import * as actions from "store/actions"
import Zoom from "@stahl.luke/react-reveal/Zoom"
import { getBaseUrl } from "../../../../components/helperFunctions/HelperFunctions"
import { ThemedPermanentMarker } from "../../../../materialUI/GlobalTitles"
import clsx from "clsx"
import CloseIcon from "@mui/icons-material/Close"
import BackToMainRoomIcon from "@mui/icons-material/ArrowBackIos"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"

const useStyles = makeStyles((theme) => ({
   contentRoot: {
      // background: theme.palette.background.default
   },
   activeItem: {
      background: `${theme.palette.primary.main} !important`,
      color: `${theme.palette.common.white} !important`,
   },
   breakoutRoomItem: {
      boxShadow: theme.shadows[2],
      borderRadius: theme.shape.borderRadius,
      margin: theme.spacing(1, 0),
      background: theme.palette.background.paper,
      "&:hover": {
         background: theme.palette.background.default,
         color: theme.palette.primary.main,
      },
      textDecoration: "none !important",
   },
   selectedItem: {},
   glass: {
      backgroundColor: alpha(theme.palette.common.black, 0.4),
      backdropFilter: "blur(5px)",
   },
   title: {
      textAlign: "left",
      fontSize: theme.typography.h2.fontSize,
      width: "auto",
   },
   modalButton: {
      color: theme.palette.common.white,
   },
}))

const Content = ({
   breakoutRooms,
   fullyOpened,
   handleClose,
   handleBackToMainRoom,
   mobile,
}) => {
   const classes = useStyles()
   const {
      query: { livestreamId, breakoutRoomId },
   } = useRouter()

   const handleGoToRoom = async (roomId) => {
      handleClose()
      window.location.href = `${getBaseUrl()}/streaming/${livestreamId}/breakout-room/${roomId}/viewer`
   }

   const closeProps = () => ({
      className: classes.modalButton,
      onClick: handleClose,
   })

   return (
      <div className={classes.contentRoot}>
         <Box
            paddingY={1}
            paddingX={2}
            alignItems="center"
            justifyContent="space-between"
            display="flex"
         >
            <ThemedPermanentMarker className={classes.title}>
               Live Rooms
            </ThemedPermanentMarker>
            <Box flex={1} />
            {breakoutRoomId && (
               <div>
                  <Tooltip title={mobile ? "Back to main room" : ""}>
                     <Button
                        startIcon={<BackToMainRoomIcon />}
                        onClick={handleBackToMainRoom}
                        color="secondary"
                        variant="contained"
                     >
                        {mobile ? "Back" : "Back to main Room"}
                     </Button>
                  </Tooltip>
               </div>
            )}
            {mobile ? (
               <IconButton {...closeProps()} size="large">
                  <CloseIcon />
               </IconButton>
            ) : (
               <Button {...closeProps()}>Close</Button>
            )}
         </Box>
         <Box p={1}>
            <Zoom duration={250} opposite cascade when={Boolean(fullyOpened)}>
               <div>
                  {breakoutRooms.map((room) => {
                     const activeRoom = room.id === breakoutRoomId
                     return (
                        <ListItem
                           button={!activeRoom}
                           onClick={() => handleGoToRoom(room.id)}
                           data-testid={"breakout-room-banner-item"}
                           className={clsx(classes.breakoutRoomItem, {
                              [classes.activeItem]: activeRoom,
                           })}
                           classes={{ selected: classes.selectedItem }}
                           key={room.id}
                        >
                           <ListItemText
                              primary={room.title}
                              secondary={
                                 activeRoom
                                    ? "You are Here"
                                    : "Click to checkout"
                              }
                           />
                           <Chip color="primary" label="Live" />
                        </ListItem>
                     )
                  })}
               </div>
            </Zoom>
         </Box>
         <DialogActions></DialogActions>
      </div>
   )
}

Content.propTypes = { handleClose: PropTypes.any }

const BreakoutSnackAction = ({ handleClickConfirm, handleCloseSnackbar }) => {
   return (
      <React.Fragment>
         <Button
            variant="contained"
            color="primary"
            onClick={handleClickConfirm}
         >
            Checkout
         </Button>
         <Button component={Box} marginLeft={1} onClick={handleCloseSnackbar}>
            Dismiss
         </Button>
      </React.Fragment>
   )
}

const snackbarKey = "There are some breakout rooms active"
const ViewerBreakoutRoomModal = ({
   handleBackToMainRoom,
   mobile,
   localStorageAudienceDrawerKey,
}) => {
   let prevOpenRooms = useRef()

   const open = useSelector(
      (state) => state.stream.layout.viewerBreakoutRoomModalOpen
   )

   const classes = useStyles()
   const {
      query: { livestreamId, breakoutRoomId },
   } = useRouter()
   const dispatch = useDispatch()
   const [fullyOpened, setFullyOpened] = useState(false)
   const [breakoutRoomSettings, setBreakoutRoomSettings] = useState({})

   const { listenToBreakoutRoomSettings, getBreakoutRoomWithIds } =
      useFirebaseService()

   useEffect(() => {
      if (livestreamId) {
         const unsubscribe = listenToBreakoutRoomSettings(
            livestreamId,
            (settingsSnap) => {
               const newSettings = settingsSnap.data() || {}
               const newOpenRooms = newSettings.openRooms
               const newlyOpenedRooms = getNewlyOpenedRooms(
                  prevOpenRooms.current,
                  newOpenRooms
               )
               if (newOpenRooms?.length) {
                  handleBroadCastNewRoom(newlyOpenedRooms)
               }
               prevOpenRooms.current = newOpenRooms
               setBreakoutRoomSettings(newSettings)
            }
         )
         return () => unsubscribe()
      }
   }, [livestreamId])

   const query = useMemo(
      () =>
         livestreamId
            ? [
                 {
                    collection: "livestreams",
                    doc: livestreamId,
                    subcollections: [
                       {
                          collection: "breakoutRooms",
                       },
                    ],
                    storeAs: `Active BreakoutRooms of ${livestreamId}`,
                    where: ["hasStarted", "==", true],
                    limit: open ? undefined : 1,
                 },
              ]
            : [],
      [livestreamId, open]
   )

   useFirestoreConnect(query)
   const breakoutRooms = useSelector(
      (state) =>
         breakoutRoomsSelector(
            state.firestore.ordered[`Active BreakoutRooms of ${livestreamId}`]
         ),
      shallowEqual
   )

   useEffect(() => {
      return () => handleCloseSnackbar(snackbarKey)
   }, [])

   useEffect(() => {
      if (!open && breakoutRooms?.length && !hasDismissedSnackbar()) {
         dispatch(
            actions.enqueueSnackbar({
               message: snackbarKey,
               options: {
                  variant: "info",
                  key: snackbarKey,
                  persist: true,
                  preventDuplicate: true,
                  action: (
                     <BreakoutSnackAction
                        handleCloseSnackbar={() =>
                           handleCloseAction(snackbarKey)
                        }
                        handleClickConfirm={() =>
                           handleClickConfirmSnackbar(snackbarKey)
                        }
                     />
                  ),
                  anchorOrigin: {
                     vertical: hasSeenAudienceDrawer() ? "top" : "bottom",
                     horizontal: "center",
                  },
               },
            })
         )

         return () => handleCloseSnackbar(snackbarKey)
      }
   }, [Boolean(breakoutRooms?.length), livestreamId])

   const getNewlyOpenedRooms = (prevRooms, newRooms) => {
      if (!prevRooms) return []
      return newRooms?.filter((roomId) => !prevRooms.includes(roomId)) || []
   }

   const handleBroadCastNewRoom = async (newRooms) => {
      for (const roomId of newRooms) {
         const roomSnap = await getBreakoutRoomWithIds(livestreamId, roomId)
         if (roomSnap.exists) {
            const breakoutId = roomSnap.id
            const roomData = roomSnap.data()
            const roomName = roomData.title
            const roomLink = `${getBaseUrl()}/streaming/${livestreamId}/breakout-room/${roomId}/viewer`
            const message = (
               <Typography>
                  <b>{roomName}</b> is now open
               </Typography>
            )

            const handleGoToLink = () => {
               window.location.href = roomLink
            }
            const handleDismiss = () => {
               dispatch(actions.closeSnackbar(breakoutId))
            }
            dispatch(
               actions.enqueueSnackbar({
                  message: message,
                  options: {
                     variant: "info",
                     // anchorOrigin: {
                     //     vertical: "top",
                     //     // horizontal: "center"
                     // },
                     preventDuplicate: true,
                     key: breakoutId,
                     action: (
                        <React.Fragment>
                           <Button
                              variant="contained"
                              onClick={handleGoToLink}
                              style={{ marginRight: 5 }}
                              color="primary"
                           >
                              Join Now
                           </Button>
                           <Button onClick={handleDismiss}>Dismiss</Button>
                        </React.Fragment>
                     ),
                  },
               })
            )
         }
      }
   }

   const handleClickConfirmSnackbar = (key) => {
      handleDismissSnackbar()
      handleCloseSnackbar(key)
      handleOpen()
   }

   const hasSeenAudienceDrawer = () => {
      const key = localStorage.getItem(localStorageAudienceDrawerKey)
      return Boolean(JSON.parse(key))
   }

   const hasDismissedSnackbar = () => {
      const dismissedStream = localStorage.getItem("dismissedStream")
      return dismissedStream === livestreamId
   }
   const handleCloseAction = (key) => {
      handleDismissSnackbar()
      handleCloseSnackbar(key)
   }

   const handleDismissSnackbar = () => {
      localStorage.setItem("dismissedStream", `${livestreamId}`)
   }
   const handleCloseSnackbar = (key) => {
      dispatch(actions.closeSnackbar(key))
   }

   const handleClose = () => {
      setFullyOpened(false)
      onClose()
   }

   const handleEntered = () => {
      setFullyOpened(true)
   }

   const onClose = () => {
      dispatch(actions.closeViewerBreakoutModal())
   }

   const handleOpen = () => {
      dispatch(actions.openViewerBreakoutModal())
   }

   return (
      <Drawer
         anchor="top"
         open={open}
         PaperProps={{
            className: classes.glass,
         }}
         SlideProps={{
            onEntered: handleEntered,
         }}
         onClose={handleClose}
      >
         <Content
            fullyOpened={fullyOpened}
            mobile={mobile}
            handleBackToMainRoom={handleBackToMainRoom}
            breakoutRooms={breakoutRooms}
            handleClose={handleClose}
         />
      </Drawer>
   )
}

export default ViewerBreakoutRoomModal
