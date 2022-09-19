import { useDispatch } from "react-redux"
import { RTCError } from "../../types/streaming"
import * as actions from "../../store/actions"
import { useCallback, useMemo } from "react"
import { errorLogAndNotify } from "../../util/CommonUtil"

const useAgoraError = () => {
   const dispatch = useDispatch()
   const handleRtcError = useCallback(
      (error: RTCError, additionalMetadata?: object) => {
         errorLogAndNotify(error, {
            description: `RTC Error: ${error.message}`,
            ...additionalMetadata,
         })
         dispatch(actions.setAgoraRtcError(error))
      },
      [dispatch]
   )
   const handleDeviceError = useCallback(
      (error: RTCError, deviceType: "microphone" | "camera") => {
         errorLogAndNotify(error, {
            description: `${deviceType.toUpperCase()} Device Error: ${
               error.message
            }`,
         })
         dispatch(actions.handleSetDeviceError(error, "microphone"))
         dispatch(actions.setAgoraRtcError(error))
      },
      [dispatch]
   )

   const handleScreenShareDeniedError = useCallback(
      (error: RTCError) => {
         errorLogAndNotify(error, {
            description: `Screen Share Denied Error: ${error.message}`,
         })
         dispatch(actions.handleScreenShareDeniedError(error))
      },
      [dispatch]
   )

   const handleClearRtcError = useCallback(() => {
      dispatch(actions.clearAgoraRtcError())
   }, [dispatch])

   return useMemo(
      () => ({
         handleRtcError,
         handleClearRtcError,
         handleDeviceError,
         handleScreenShareDeniedError,
      }),
      [
         handleRtcError,
         handleClearRtcError,
         handleDeviceError,
         handleScreenShareDeniedError,
      ]
   )
}

export default useAgoraError
