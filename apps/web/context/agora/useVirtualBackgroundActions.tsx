import { LocalStream } from "../../types/streaming"
import { useCallback, useEffect } from "react"
import { agoraVirtualBackgroundExtension } from "../../data/agora/AgoraService"
import { IVirtualBackgroundProcessor } from "agora-extension-virtual-background"
import useSnackbarNotifications from "../../components/custom-hook/useSnackbarNotifications"
import { useDispatch } from "react-redux"
import {
   setVideoBlurEnabled,
   setVideoBlurStart,
   setVideoEffectsOff,
} from "../../store/actions/streamActions"

/**
 * Singleton instance of the Processor
 * null -> it's not piped in the video track
 */
let processor: IVirtualBackgroundProcessor

/**
 * Applies a video processor transformation to the local stream video track
 * @param localStream
 */
const useVirtualBackgroundActions = (localStream: LocalStream) => {
   const { errorNotification } = useSnackbarNotifications()
   const dispatch = useDispatch()

   /**
    * Pipes the video processor into the current video track
    */
   const getProcessorInstance = useCallback(async () => {
      if (!processor && localStream.videoTrack) {
         processor = agoraVirtualBackgroundExtension.createProcessor()

         // Initialize the extension and pass in the URL of the Wasm file
         // fixme: check why the wasm url doesn't need to be set
         await processor.init(null)

         // When the system performance cannot meet the processing requirements, the SDK triggers onoverload
         processor.onoverload = async () => {
            errorNotification(
               "Virtual Background Processor Overload",
               "Disabled Background Effects due to slow device"
            )
            await processor.disable()
         }
      }

      // Inject the extension into the video processing pipeline in the SDK
      if (
         localStream.videoTrack &&
         !(localStream.videoTrack as any).processor
      ) {
         localStream.videoTrack
            .pipe(processor)
            .pipe(localStream.videoTrack.processorDestination)
      }

      return processor
   }, [errorNotification, localStream.videoTrack])

   /**
    * Blur the user's actual background
    */
   const setBackgroundBlurring = useCallback(async () => {
      if (!localStream.videoTrack) return

      try {
         dispatch(setVideoBlurStart())
         let processor = await getProcessorInstance()

         processor.setOptions({ type: "blur", blurDegree: 1 })

         await processor.enable()

         /**
          * There is a delay between enabling the processor and the effect being visually applied
          * I couldn't find any event / flag that would indicate the effect apply was complete
          * So to improve the UX, let's display the loading state a bit
          */
         setTimeout(() => {
            dispatch(setVideoBlurEnabled())
         }, 1500)
      } catch (e) {
         errorNotification(e, "Failed to set Background Blur")
         dispatch(setVideoEffectsOff())
      }
   }, [
      dispatch,
      errorNotification,
      getProcessorInstance,
      localStream.videoTrack,
   ])

   const clearBackgroundEffects = useCallback(async () => {
      if (!localStream.videoTrack) return

      try {
         let processor = await getProcessorInstance()

         await processor.disable()
         dispatch(setVideoEffectsOff())
      } catch (e) {
         errorNotification(e, "Failed to clear the background effects")
      }
   }, [
      dispatch,
      errorNotification,
      getProcessorInstance,
      localStream.videoTrack,
   ])

   const checkCompatibility = useCallback(() => {
      return agoraVirtualBackgroundExtension.checkCompatibility()
   }, [])

   // todo: test when videotrack goes null after being enabled

   return {
      setBackgroundBlurring,
      clearBackgroundEffects,
      checkCompatibility,
   }
}

export default useVirtualBackgroundActions
