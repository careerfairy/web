import React, { FC, memo, useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import { RootState } from "store"
import { ConnectionState } from "agora-rtc-sdk-ng"
import ConnectionStateModal from "./ModalViews/ConnectionStateModal"
import DebugModal from "./ModalViews/DebugModal"
import UidConflict from "./ModalViews/UidConflict"
import { rtcMessages } from "types/streaming"
import { AlertProps } from "@mui/material/Alert/Alert"
import ScreenShareDeniedModal from "./ModalViews/ScreenShareDeniedModal"
import { animateProfileIcon } from "../../../../../store/actions/streamActions"
import { ANIMATE_PROFILE_ICON_AFTER_MS } from "../../../../../constants/streams"
import { rtcConnectionStateSelector } from "../../../../../store/selectors/streamSelectors"
import { useRTM } from "../../../../../context/agora/RTMProvider"

interface Props {}

const AgoraStateHandler: FC<Props> = () => {
   const dispatch = useDispatch()

   const [view, setView] = useState(null)
   const agoraRtcConnectionStatus = useSelector(rtcConnectionStateSelector)
   const agoraRtcError = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcError
   })

   const { rtmStatus } = useRTM()

   const sendRTCSateToast = useCallback(
      (
         rtcStatus: ConnectionState,
         variant: AlertProps["severity"],
         persist?: boolean
      ) => {
         dispatch(
            actions.enqueueSnackbar({
               message: rtcMessages[rtcStatus],
               options: {
                  variant: variant,
                  preventDuplicate: true,
                  key: rtcStatus,
                  persist: Boolean(persist),
                  autoHideDuration: 1500,
               },
            })
         )
      },
      [dispatch]
   )

   const showConnectionStateModal = useCallback(
      () => setView(() => <ConnectionStateModal />),
      []
   )

   const showDebugModal = useCallback(() => setView(() => <DebugModal />), [])

   const showUidConflictModal = useCallback(
      () => setView(() => <UidConflict />),
      []
   )

   const sendConnectedToast = useCallback(() => {
      sendRTCSateToast("CONNECTED", "success")
   }, [sendRTCSateToast])

   const closeToast = useCallback(
      (key: ConnectionState) => {
         dispatch(actions.closeSnackbar(key))
      },
      [dispatch]
   )

   useEffect(() => {
      ;(function handleStatus() {
         const { prevState, curState, reason } = agoraRtcConnectionStatus

         if (reason === "LEAVE") return
         switch (curState) {
            case "CONNECTED":
               closeToast(prevState)
               sendConnectedToast()
               setView(null)

               setTimeout(() => {
                  void dispatch(animateProfileIcon())
               }, ANIMATE_PROFILE_ICON_AFTER_MS)
               break
            case "RECONNECTING":
               if (prevState === "CONNECTED") {
                  showConnectionStateModal()
               }
               break
            case "CONNECTING":
               showConnectionStateModal()
               break
            case "DISCONNECTED":
               if (reason === "NETWORK_ERROR") {
                  return showConnectionStateModal()
               }
               if (prevState === "CONNECTING") return
               if (reason === "UID_BANNED") {
                  return showUidConflictModal()
               }
               showConnectionStateModal()
               break
            case "DISCONNECTING":
               setView(null)
               break
            default:
               setView(null)
               break
         }

         return () => {
            closeToast(curState)
            setView(null)
         }
      })()
   }, [
      agoraRtcConnectionStatus,
      closeToast,
      dispatch,
      sendConnectedToast,
      showConnectionStateModal,
      showUidConflictModal,
   ])

   useEffect(() => {
      ;(function handleError() {
         switch (agoraRtcError?.code) {
            case "FAILED_TO_SUBSCRIBE_WITH_PROXY":
               showDebugModal()
               break
            case "FAILED_TO_SUBSCRIBE_WITHOUT_PROXY":
               showDebugModal()
               break
            case "UID_CONFLICT":
               showUidConflictModal()
               break
            default:
               return null
         }
      })()
   }, [agoraRtcError?.code, showDebugModal, showUidConflictModal])

   useEffect(() => {
      ;(function handleStatus() {
         switch (rtmStatus?.connectionState) {
            case "ABORTED":
               if (rtmStatus?.reason === "REMOTE_LOGIN") {
                  console.log("REMOTE_LOGIN OPENING CONFLICT MODAL")
                  showUidConflictModal()
               }
               break
            default:
               return null
         }
      })()
   }, [rtmStatus, showUidConflictModal])

   return (
      <>
         {view || null}
         {<ScreenShareDeniedModal />}
      </>
   )
}

export default memo(AgoraStateHandler)
