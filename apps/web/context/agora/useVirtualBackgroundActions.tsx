import { LocalStream } from "../../types/streaming"
import { useCallback } from "react"
import { agoraVirtualBackgroundExtension } from "../../data/agora/AgoraService"
import { IVirtualBackgroundProcessor } from "agora-extension-virtual-background"
import useSnackbarNotifications from "../../components/custom-hook/useSnackbarNotifications"
import { useDispatch } from "react-redux"
import {
   setVideoBackgroundImage,
   setVideoBackgroundImageEnabled,
   setVideoBlurEnabled,
   setVideoBlurStart,
   setVideoEffectsErrored,
   setVideoEffectsOff,
} from "../../store/actions/streamActions"
import { getBaseUrl } from "../../components/helperFunctions/HelperFunctions"

/**
 * Singleton instance of the Processor
 */
let processor: IVirtualBackgroundProcessor

/**
 * Applies a video processor transformation to the local stream video track
 *
 * This hook provides the necessary actions to apply the background effects
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

         try {
            // Initialize the extension and pass in the URL of the Wasm file
            await processor.init(`${getBaseUrl()}/wasms/agora-wasm.wasm`)

            // When the system performance cannot meet the processing requirements, the SDK triggers onoverload
            processor.onoverload = async () => {
               errorNotification(
                  "Virtual Background Processor Overload",
                  "Disabled Background Effects due to slow device"
               )
               await processor.disable()
            }
         } catch (e) {
            // do not persist the processor in case of an error
            processor = null

            dispatch(setVideoEffectsErrored())
            throw e
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
   }, [dispatch, errorNotification, localStream.videoTrack])

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

   const setBackgroundImage = useCallback(
      async (imageUrl) => {
         if (!localStream.videoTrack) return

         dispatch(setVideoBackgroundImage(imageUrl))

         const imgElement = document.createElement("img")
         imgElement.crossOrigin = "Anonymous" // required for cross-origin urls
         imgElement.src = imageUrl
         imgElement.onload = async () => {
            try {
               const processor = await getProcessorInstance()

               processor.setOptions({ type: "img", source: imgElement })
               await processor.enable()

               /**
                * There is a delay between enabling the processor and the effect being visually applied
                * I couldn't find any event / flag that would indicate the effect apply was complete
                * So to improve the UX, let's display the loading state a bit
                */
               setTimeout(() => {
                  dispatch(setVideoBackgroundImageEnabled())
               }, 1500)
            } catch (e) {
               errorNotification(e, "Failed to set Background Image")
               dispatch(setVideoEffectsOff())
               imgElement?.remove() // remove elem from DOM
            }
         }
      },
      [
         dispatch,
         errorNotification,
         getProcessorInstance,
         localStream.videoTrack,
      ]
   )

   const clearBackgroundEffects = useCallback(async () => {
      if (!localStream.videoTrack) return

      try {
         let processor = await getProcessorInstance()

         await processor.disable()
      } catch (e) {
         errorNotification(e, "Failed to clear the background effects")
      } finally {
         dispatch(setVideoEffectsOff())
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

   return {
      setBackgroundBlurring,
      clearBackgroundEffects,
      setBackgroundImage,
      checkCompatibility,
   }
}

export default useVirtualBackgroundActions
