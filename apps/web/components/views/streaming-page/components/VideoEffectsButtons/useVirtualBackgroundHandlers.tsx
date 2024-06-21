import { IVirtualBackgroundProcessor } from "agora-extension-virtual-background"
import { ICameraVideoTrack } from "agora-rtc-react"
import { useAppDispatch } from "components/custom-hook/store"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { getBaseUrl, sleep } from "components/helperFunctions/HelperFunctions"
import { agoraVirtualBackgroundExtension } from "data/agora/AgoraService"
import { useCallback } from "react"
import { setVirtualBackgroundMode } from "store/reducers/streamingAppReducer"
import useSWRMutation from "swr/mutation"
import { errorLogAndNotify } from "util/CommonUtil"
import { VirtualBackgroundMode } from "../../types"

/**
 * Singleton instance of the Processor
 */
let processor: IVirtualBackgroundProcessor

/**
 * Applies a video processor transformation to the local stream video track
 *
 * This hook provides the necessary actions to apply the background effects
 * @param cameraVideoTrack
 */
export const useVirtualBackgroundHandlers = (
   cameraVideoTrack: ICameraVideoTrack
) => {
   const { errorNotification } = useSnackbarNotifications()
   const dispatch = useAppDispatch()

   /**
    * Pipes the video processor into the current video track
    */
   const getProcessorInstance = useCallback(async () => {
      if (!processor && cameraVideoTrack) {
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
               processor?.unpipe()
               cameraVideoTrack?.unpipe()
               await processor?.disable()
               dispatch(setVirtualBackgroundMode(VirtualBackgroundMode.OFF))
            }
         } catch (e) {
            // do not persist the processor in case of an error
            processor = null

            errorLogAndNotify(e, {
               message:
                  "Failed to get the processor instance for the virtual background",
            })
            throw e
         }
      }

      // Inject the extension into the video processing pipeline in the SDK
      if (cameraVideoTrack) {
         cameraVideoTrack
            .pipe(processor)
            .pipe(cameraVideoTrack.processorDestination)
      }

      return processor
   }, [errorNotification, cameraVideoTrack, dispatch])

   /**
    * Blur the user's actual background
    */
   const backgroundBlurringMutation = useSWRMutation(
      "setVirtualBackgroundMode",
      async () => {
         if (!cameraVideoTrack) return

         const processor = await getProcessorInstance()

         processor.setOptions({ type: "blur", blurDegree: 1 })

         await processor.enable()

         /**
          * There is a delay between enabling the processor and the effect being visually applied
          * I couldn't find any event / flag that would indicate the effect apply was complete
          * So to improve the UX, let's display the loading state a bit
          */
         await sleep(1500)
         dispatch(setVirtualBackgroundMode(VirtualBackgroundMode.BLUR))
      },
      {
         onError: (e) => {
            errorNotification(e, "Failed to blur the background", {
               message: "Failed to blur the background",
            })
         },
      }
   )

   const backgroundImageMutation = useSWRMutation(
      "setVirtualBackgroundMode",
      async (_, options: { arg: { imageUrl: string } }) => {
         if (!cameraVideoTrack) return

         const processor = await getProcessorInstance()

         const imgElement = document.createElement("img")
         imgElement.crossOrigin = "Anonymous" // required for cross-origin urls
         imgElement.src = options.arg.imageUrl

         return new Promise((resolve, reject) => {
            imgElement.onload = async () => {
               try {
                  processor.setOptions({ type: "img", source: imgElement })
                  await processor.enable()

                  /**
                   * There is a delay between enabling the processor and the effect being visually applied
                   * I couldn't find any event / flag that would indicate the effect apply was complete
                   * So to improve the UX, let's display the loading state a bit
                   */
                  await sleep(1500)
                  dispatch(
                     setVirtualBackgroundMode(VirtualBackgroundMode.IMAGE)
                  )
                  resolve(void 0)
               } catch (e) {
                  imgElement?.remove() // remove elem from DOM
                  reject(e)
               }
            }
            imgElement.onerror = () => {
               reject("Failed to load image")
            }
         })
      },
      {
         onError: (e) => {
            errorNotification(e, "Failed to set the background image", {
               message: "Failed to set the background image",
            })
         },
      }
   )

   const clearBackgroundEffectsMutation = useSWRMutation(
      "setVirtualBackgroundMode",
      async () => {
         const processor = await getProcessorInstance()
         processor?.unpipe()
         cameraVideoTrack?.unpipe()
         await processor?.disable()
         dispatch(setVirtualBackgroundMode(VirtualBackgroundMode.OFF))
      },
      {
         onError: (e) => {
            errorNotification(e, "Failed to clear the background effects", {
               message: "Failed to clear the background effects",
            })
         },
      }
   )

   const checkCompatibility = useCallback(
      () => agoraVirtualBackgroundExtension.checkCompatibility(),
      []
   )

   return {
      backgroundBlurringMutation,
      backgroundImageMutation,
      clearBackgroundEffectsMutation,
      checkCompatibility,
   }
}
