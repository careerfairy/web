import React, { useEffect, useState } from "react"
import { GlassDialog } from "materialUI/GlobalModals"
import {
   Button,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Slide,
   Typography,
} from "@mui/material"
import { useCurrentStream } from "context/stream/StreamContext"
import { useAuth } from "HOCs/AuthProvider"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "store"
import useHandRaiseState from "components/custom-hook/useHandRaiseState"
import { HandRaiseState } from "types/handraise"
import * as actions from "store/actions"
import { useRouter } from "next/router"

const styles = {
   title: {
      fontFamily: "Permanent Marker",
      fontSize: "2rem",
      color: (theme) => theme.palette.primary.main,
   },
   contentText: {
      marginBottom: 0,
   },
} as const

const Content = ({ handleClose, requestHandRaise }: ContentProps) => {
   return (
      <React.Fragment>
         <DialogTitle>
            <Typography sx={styles.title} align="center">
               Hand Raise
            </Typography>
         </DialogTitle>
         <DialogContent dividers>
            <DialogContentText sx={styles.contentText}>
               The hosts would like for you to see and hear you, would you like
               to request to <b>join with audio and video</b>?
            </DialogContentText>
         </DialogContent>
         <DialogActions>
            <Button children="No Thanks" onClick={handleClose} />
            <Button
               variant="contained"
               children="Request to Join with video and audio"
               color="primary"
               onClick={requestHandRaise}
            />
         </DialogActions>
      </React.Fragment>
   )
}
const HandRaisePromptDialog = () => {
   const {
      query: { isRecordingWindow },
   } = useRouter()
   const [open, setOpen] = useState(false)
   const { currentLivestream, isMobile } = useCurrentStream()
   const dispatch = useDispatch()
   const spyModeEnabled = useSelector(
      (state: RootState) => state.stream.streaming.spyModeEnabled
   )
   const primaryClientJoined = useSelector(
      (state: RootState) => state.stream.agoraState.primaryClientJoined
   )
   const [handRaiseState, updateHandRaiseRequest] = useHandRaiseState()

   const { userData } = useAuth()
   useEffect(() => {
      const canSeeLivestream = Boolean(
         currentLivestream?.hasStarted || (userData?.isAdmin && spyModeEnabled)
      )
      const hasNotRaisedHandYet = Boolean(
         handRaiseState === undefined &&
            currentLivestream?.handRaiseActive &&
            !isMobile
      )
      setOpen(
         !isRecordingWindow &&
            hasNotRaisedHandYet &&
            canSeeLivestream &&
            primaryClientJoined
      )
   }, [
      currentLivestream?.handRaiseActive,
      currentLivestream?.hasStarted,
      handRaiseState,
      isMobile,
      userData?.isAdmin,
      spyModeEnabled,
      primaryClientJoined,
      isRecordingWindow,
   ])
   const handleClose = () => {
      setOpen(false)
   }

   const requestHandRaise = async () => {
      try {
         await updateHandRaiseRequest(HandRaiseState.acquire_media)
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
   }

   return (
      <GlassDialog TransitionComponent={Slide} open={open}>
         <Content
            handleClose={handleClose}
            requestHandRaise={requestHandRaise}
         />
      </GlassDialog>
   )
}

type ContentProps = {
   handleClose: () => any
   requestHandRaise: () => Promise<void>
}

export default HandRaisePromptDialog
