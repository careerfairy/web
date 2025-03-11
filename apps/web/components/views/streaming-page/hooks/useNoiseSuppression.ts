import {
   AIDenoiserProcessor,
   AIDenoiserProcessorLevel,
   AIDenoiserProcessorMode,
} from "agora-extension-ai-denoiser"
import { IMicrophoneAudioTrack } from "agora-rtc-react"
import { useCallback, useEffect, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import { agoraNoiseSuppression } from "../config/agora-extensions"

type UseNoiseSuppressionOptions = {
   enabled: boolean
   onError?: () => void
}

let processor: AIDenoiserProcessor | null = null

/**
 * Hook to manage noise suppression for a microphone audio track
 *
 * This hook provides functionality to enable or disable noise suppression
 * on a microphone audio track. It handles processor initialization
 * and maintains a single processor instance throughout the lifecycle.
 */
export const useNoiseSuppression = (
   audioTrack: IMicrophoneAudioTrack | null,
   options: UseNoiseSuppressionOptions
) => {
   const { enabled, onError } = options
   const [error, setError] = useState<Error | null>(null)

   const handleError = useCallback(
      (error: Error, message: string, shouldDisableProcessor = true) => {
         console.error(message, error)
         errorLogAndNotify(error, { message })

         setError(error)
         onError?.()

         if (shouldDisableProcessor && processor) {
            try {
               processor.disable()
            } catch (disableError) {
               console.error(
                  `Error disabling noise suppression processor: ${disableError}`
               )
            }
         }
      },
      [onError]
   )

   /**
    * Initialize the processor once
    *
    * This effect initializes the processor once and sets up event listeners.
    * It also handles processor overload and load errors.
    */
   useEffect(() => {
      if (!processor) {
         try {
            processor = agoraNoiseSuppression.createProcessor()

            // Handle processor overload (when processing is taking too long)
            const handleOverload = async (elapsedTimeInMs: number) => {
               console.warn(
                  "Noise suppression processor overload!",
                  elapsedTimeInMs
               )

               // First try to switch to a less demanding mode
               if (elapsedTimeInMs > 1000 && elapsedTimeInMs <= 2000) {
                  console.warn(
                     `Processing took too long (${elapsedTimeInMs}ms), switching to stationary mode`
                  )
                  try {
                     await processor?.setMode(
                        AIDenoiserProcessorMode.STATIONARY_NS
                     )
                  } catch (error) {
                     handleError(
                        error as Error,
                        "Failed to set stationary noise suppression mode"
                     )
                  }
               }

               // If it's extremely slow, disable it completely
               else if (elapsedTimeInMs > 2000) {
                  console.warn(
                     `Processing took too long (${elapsedTimeInMs}ms), disabling noise suppression`
                  )
                  handleError(
                     new Error(
                        "Failed to disable noise suppression after overload"
                     ),
                     "Failed to disable noise suppression after overload"
                  )
               }
            }

            // Handle load errors
            const handleLoadError = (error: Error) => {
               handleError(error, "Noise suppression processor load error")
            }

            processor.on("overload", handleOverload)
            processor.on("loaderror", handleLoadError)
         } catch (error) {
            handleError(
               error,
               "Failed to create noise suppression processor",
               false // Don't try to disable a processor that failed to create
            )
         }
      }

      // Cleanup only when component unmounts
      return () => {
         if (processor) {
            try {
               processor.disable()
            } catch (error) {
               console.error("Error disabling processor during cleanup:", error)
            }
         }
      }
   }, [handleError, onError])

   // Handle audio track and enabled state changes
   useEffect(() => {
      const setupAudioPipeline = async () => {
         if (!audioTrack || !processor || error) return

         try {
            // Ensure audio track is unpiped before setting up new pipeline
            try {
               audioTrack.unpipe()
            } catch (e) {
               // Ignore errors if the track wasn't piped
            }

            // Set up the audio pipeline
            audioTrack.pipe(processor).pipe(audioTrack.processorDestination)

            if (enabled) {
               await processor.setMode(AIDenoiserProcessorMode.NSNG)
               await processor.setLevel(AIDenoiserProcessorLevel.SOFT)
               await processor.enable()
            } else {
               await processor.disable()
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

      // Cleanup pipeline when audio track changes
      return () => {
         if (audioTrack) {
            try {
               audioTrack.unpipe()
            } catch (e) {
               // Ignore errors if the track wasn't piped
            }
         }
      }
   }, [enabled, audioTrack, error, handleError])

   return {
      isEnabled: Boolean(processor?.enabled),
      error,
      reset: () => setError(null),
   }
}
