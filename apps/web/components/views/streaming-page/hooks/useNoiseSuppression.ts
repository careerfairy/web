import {
   AIDenoiserProcessor,
   AIDenoiserProcessorLevel,
   AIDenoiserProcessorMode,
} from "agora-extension-ai-denoiser"
import { IMicrophoneAudioTrack } from "agora-rtc-react"
import { useEffect, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import { agoraNoiseSuppression } from "../config/agoraExtensions"

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
   enabled: boolean
) => {
   const [isError, setIsError] = useState(false)

   // Initialize the processor once
   useEffect(() => {
      if (!processor) {
         try {
            processor = agoraNoiseSuppression.createProcessor()
            // Set up event listeners
            const handleOverload = async (elapsedTimeInMs: number) => {
               console.warn(
                  "Noise suppression processor overload!",
                  elapsedTimeInMs
               )

               if (elapsedTimeInMs > 1000) {
                  console.warn(
                     `Took too long to load (took ${elapsedTimeInMs}ms), setting noise suppression mode to stationary`
                  )
                  try {
                     await processor?.setMode(
                        AIDenoiserProcessorMode.STATIONARY_NS
                     )
                  } catch (error) {
                     console.warn("Failed to set stationary mode:", error)
                     await processor?.disable()
                     setIsError(true)
                  }
               }

               if (elapsedTimeInMs > 2000) {
                  console.warn(
                     `Took too long to load (took ${elapsedTimeInMs}ms), disabling noise suppression`
                  )
                  await processor?.disable()
                  setIsError(true)
               }
            }

            const handleLoadError = (error: Error) => {
               errorLogAndNotify(error, {
                  message: "Noise suppression processor load error",
               })
               setIsError(true)
            }

            processor.on("overload", handleOverload)
            processor.on("loaderror", handleLoadError)
         } catch (error) {
            console.error(
               "Failed to create noise suppression processor:",
               error
            )
            setIsError(true)
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
   }, [])

   // Handle audio track and enabled state changes
   useEffect(() => {
      const setupAudioPipeline = async () => {
         if (!audioTrack || !processor || isError) return

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

            setIsError(false)
         } catch (error) {
            errorLogAndNotify(error, {
               message: enabled
                  ? "Failed to enable noise suppression"
                  : "Failed to disable noise suppression",
            })
            setIsError(true)
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
   }, [enabled, audioTrack, isError])

   return {
      isEnabled: Boolean(processor?.enabled),
      isError,
      reset: () => setIsError(false),
   }
}
