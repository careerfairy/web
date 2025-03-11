import {
   AIDenoiserExtension,
   AIDenoiserProcessor,
   AIDenoiserProcessorLevel,
   AIDenoiserProcessorMode,
} from "agora-extension-ai-denoiser"
import { IMicrophoneAudioTrack } from "agora-rtc-react"
import AgoraRTC from "agora-rtc-sdk-ng"
import { getBaseUrl } from "components/helperFunctions/HelperFunctions"
import { useCallback, useEffect, useRef, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"

type UseNoiseSuppressionOptions = {
   enabled: boolean
   onError?: () => void
}

/**
 * Hook to manage noise suppression for a microphone audio track
 *
 * This hook provides functionality to enable or disable noise suppression
 * on a microphone audio track. It handles extension initialization, processor creation,
 * and maintains appropriate state throughout the component lifecycle.
 */
export const useNoiseSuppression = (
   audioTrack: IMicrophoneAudioTrack | null,
   options: UseNoiseSuppressionOptions
) => {
   const { enabled, onError } = options

   const [error, setError] = useState<Error | null>(null)
   const [isActive, setIsActive] = useState(false)
   const [isCompatible, setIsCompatible] = useState(true)

   const extensionRef = useRef<AIDenoiserExtension | null>(null)
   const processorRef = useRef<AIDenoiserProcessor | null>(null)

   const handleError = useCallback(
      (error: Error, message: string) => {
         errorLogAndNotify(error, { message })
         setError(error)
         onError?.()
      },
      [onError]
   )

   /**
    * Initialize the extension and processor only once
    */
   useEffect(() => {
      const initializeExtension = async () => {
         try {
            // Create the extension if it doesn't exist
            if (!extensionRef.current) {
               extensionRef.current = new AIDenoiserExtension({
                  assetsPath: `${getBaseUrl()}/wasms/denoiser/external`,
               })

               // Register the extension with AgoraRTC
               AgoraRTC.registerExtensions([extensionRef.current])

               // Check compatibility
               if (!extensionRef.current.checkCompatibility()) {
                  console.error(
                     "This device does not support AI Noise Suppression"
                  )
                  setIsCompatible(false)
                  return
               }
            }

            // Create the processor if it doesn't exist and is compatible
            if (!processorRef.current && isCompatible) {
               processorRef.current = extensionRef.current.createProcessor()

               // Set up event listeners for processor
               processorRef.current.on(
                  "overload",
                  async (elapsedTimeInMs: number) => {
                     console.warn(
                        `Noise suppression processor overload: ${elapsedTimeInMs}ms`
                     )

                     // If it's been more than 2 seconds, disable the processor
                     if (elapsedTimeInMs > 2000) {
                        console.warn(
                           `Noise suppression took too long to process: ${elapsedTimeInMs}ms, disabling`
                        )

                        handleError(
                           new Error("Noise suppression processor overload"),
                           "Noise suppression processor overload"
                        )
                        await processorRef.current?.disable()
                        setIsActive(false)
                     } else if (elapsedTimeInMs > 1000) {
                        // If processing is taking too long, switch to less demanding mode
                        try {
                           await processorRef.current?.setMode(
                              AIDenoiserProcessorMode.STATIONARY_NS
                           )
                        } catch (error) {
                           handleError(
                              error as Error,
                              "Failed to set noise suppression mode after overload"
                           )
                        }
                     }
                  }
               )

               processorRef.current.on("loaderror", (error: Error) => {
                  handleError(error, "Noise suppression processor load error")
                  setIsCompatible(false)
                  setIsActive(false)
                  if (processorRef.current) {
                     processorRef.current.disable()
                  }
               })
            }
         } catch (error) {
            handleError(
               error as Error,
               "Failed to initialize AI Noise Suppression"
            )
         }
      }

      void initializeExtension()

      // Clean up when component unmounts
      return () => {
         if (processorRef.current) {
            try {
               processorRef.current.disable()
            } catch (error) {
               console.error("Error disabling processor during cleanup:", error)
            }
         }
      }
   }, [handleError, isCompatible])

   // Handle audio track and enabled state changes
   useEffect(() => {
      const setupAudioPipeline = async () => {
         if (!audioTrack || !processorRef.current || error || !isCompatible)
            return

         try {
            // Clean up any existing pipeline
            try {
               audioTrack.unpipe()
            } catch (e) {
               // Ignore errors if the track wasn't piped
            }

            // Set up the audio pipeline
            audioTrack
               .pipe(processorRef.current)
               .pipe(audioTrack.processorDestination)

            if (enabled) {
               await processorRef.current.setMode(AIDenoiserProcessorMode.NSNG)
               await processorRef.current.setLevel(
                  AIDenoiserProcessorLevel.SOFT
               )
               await processorRef.current.enable()
               setIsActive(true)
            } else {
               await processorRef.current.disable()
               setIsActive(false)
            }

            setError(null)
         } catch (error) {
            handleError(
               error as Error,
               enabled
                  ? "Failed to enable noise suppression"
                  : "Failed to disable noise suppression"
            )
         }
      }

      setupAudioPipeline()

      // Clean up pipeline when audio track changes
      return () => {
         if (audioTrack) {
            try {
               audioTrack.unpipe()
            } catch (e) {
               // Ignore errors if the track wasn't piped
            }
         }
      }
   }, [enabled, audioTrack, error, handleError, isCompatible])

   // Functions to change noise reduction mode and level
   const changeNoiseReductionMode = useCallback(
      (mode: AIDenoiserProcessorMode) => {
         if (!isCompatible) return

         try {
            processorRef.current?.setMode(mode)
         } catch (error) {
            handleError(error as Error, "Failed to change noise reduction mode")
         }
      },
      [handleError, isCompatible]
   )

   const changeNoiseReductionLevel = useCallback(
      (level: AIDenoiserProcessorLevel) => {
         if (!isCompatible) return

         try {
            processorRef.current?.setLevel(level)
         } catch (error) {
            handleError(
               error as Error,
               "Failed to change noise reduction level"
            )
         }
      },
      [handleError, isCompatible]
   )

   return {
      isActive,
      isCompatible,
      error,
      reset: () => setError(null),
      changeNoiseReductionMode,
      changeNoiseReductionLevel,
   }
}
