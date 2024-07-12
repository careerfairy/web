import { ICameraVideoTrack } from "agora-rtc-react"
import { VideoEncoderConfigurationPreset } from "agora-rtc-sdk-ng"
import { getVideoEncoderPreset } from "context/agora/RTCProvider"
import { useRouter } from "next/router"
import { useCallback, useEffect, useRef } from "react"
import { useIsSpotlightMode } from "store/selectors/streamingAppSelectors"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * Optimizes local camera stream quality based on spotlight mode and high quality flag.
 * Sets quality to 180p with delay if spotlight mode is active, otherwise uses default preset (480p_9)
 *
 * @param {ICameraVideoTrack | null} localCameraTrack - The local camera video track.
 * @param {boolean} tracksPublished - Flag indicating if the tracks are published.
 */
export const useOptimisedLocalStream = (
   localCameraTrack: ICameraVideoTrack | null,
   tracksPublished: boolean
) => {
   const isSpotlightMode = useIsSpotlightMode()

   const {
      query: { withHighQuality },
   } = useRouter()

   const currentVideoPresetRef = useRef<VideoEncoderConfigurationPreset>(
      getVideoEncoderPreset(withHighQuality)
   )

   const setVideoQuality = useCallback(
      async (quality: string) => {
         if (!localCameraTrack || !tracksPublished) return
         try {
            if (currentVideoPresetRef.current !== quality) {
               await localCameraTrack.setEncoderConfiguration(quality)
               currentVideoPresetRef.current = quality
            }
         } catch (e) {
            errorLogAndNotify(e, {
               message: "Error in setting video quality",
               targetQuality: quality,
               currentQuality: currentVideoPresetRef.current,
            })
         }
      },
      [localCameraTrack, tracksPublished]
   )

   useEffect(() => {
      const defaultQuality = getVideoEncoderPreset(withHighQuality)
      if (isSpotlightMode) {
         /**
          * Do not switch the resolutions right away because there is an odd effect
          * when this happens, instead delay it a little bit
          */
         const makeStreamHighQualityTimeout = setTimeout(() => {
            void setVideoQuality("180p")
         }, 1000)

         return () => clearTimeout(makeStreamHighQualityTimeout)
      } else {
         void setVideoQuality(defaultQuality)
      }
   }, [isSpotlightMode, setVideoQuality, withHighQuality])
}
