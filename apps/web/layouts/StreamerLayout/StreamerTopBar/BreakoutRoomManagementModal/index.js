import React, { memo, useMemo } from "react"
import PropTypes from "prop-types"
import {
   Button,
   CircularProgress,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Slide,
} from "@mui/material"
import { useCurrentStream } from "../../../../context/stream/StreamContext"
import { useRouter } from "next/router"
import { isEmpty, isLoaded, useFirestoreConnect } from "react-redux-firebase"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import CreateBreakoutRoomsView from "./CreateBreakoutRoomsView"
import ManageBreakoutRoomsView from "./ManageBreakoutRoomsView"
import { GlassDialog } from "materialUI/GlobalModals"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"
import breakoutRoomsSelector from "../../../../components/selectors/breakoutRoomsSelector"
import * as actions from "store/actions"
import { streamerBreakoutRoomModalOpen } from "../../../../store/selectors/streamSelectors"

const Content = ({ handleClose, leaveAgoraRoom }) => {
   const {
      query: { livestreamId },
   } = useRouter()
   const { isMainStreamer } = useCurrentStream()

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
                    storeAs: `breakoutRooms of ${livestreamId}`,
                 },
              ]
            : [],
      [livestreamId]
   )

   useFirestoreConnect(query)
   const breakoutRooms = useSelector(
      (state) =>
         breakoutRoomsSelector(
            state.firestore.ordered[`breakoutRooms of ${livestreamId}`]
         ),
      shallowEqual
   )

   if (!isLoaded(breakoutRooms)) {
      return (
         <React.Fragment>
            <DialogContent
               style={{
                  minHeight: "40vh",
                  display: "grid",
                  placeItems: "center",
               }}
            >
               <CircularProgress />
            </DialogContent>
         </React.Fragment>
      )
   }

   if (isEmpty(breakoutRooms)) {
      if (!isMainStreamer) {
         return (
            <React.Fragment>
               <DialogTitle>Manage Breakout Rooms</DialogTitle>
               <DialogContent dividers>
                  <DialogContentText>
                     Please wait for the main streamer/host to create breakout
                     rooms
                  </DialogContentText>
               </DialogContent>
               <DialogActions>
                  <Button onClick={handleClose}>Close</Button>
               </DialogActions>
            </React.Fragment>
         )
      }
      return <CreateBreakoutRoomsView handleClose={handleClose} />
   }

   return (
      <ManageBreakoutRoomsView
         leaveAgoraRoom={leaveAgoraRoom}
         handleClose={handleClose}
         breakoutRooms={breakoutRooms}
      />
   )
}
const BreakoutRoomManagementModal = ({ leaveAgoraRoom }) => {
   const open = useSelector(streamerBreakoutRoomModalOpen)
   const theme = useTheme()
   const dispatch = useDispatch()
   const mobile = useMediaQuery(theme.breakpoints.down("md"))

   const onClose = () => {
      dispatch(actions.closeStreamerBreakoutModal())
   }
   const handleClose = () => {
      onClose()
   }

   return (
      <GlassDialog
         TransitionComponent={Slide}
         fullScreen={mobile}
         maxWidth="md"
         fullWidth
         open={open}
         onClose={handleClose}
      >
         <Content leaveAgoraRoom={leaveAgoraRoom} handleClose={handleClose} />
      </GlassDialog>
   )
}

BreakoutRoomManagementModal.propTypes = {
   onClose: PropTypes.func,
   open: PropTypes.bool,
}

export default memo(BreakoutRoomManagementModal)
