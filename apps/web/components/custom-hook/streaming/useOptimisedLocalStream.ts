// import { ICameraVideoTrack } from "agora-rtc-react"
// import { VideoEncoderConfigurationPreset } from "agora-rtc-sdk-ng"
// import { useCallback, useState } from "react"
// import { errorLogAndNotify } from "util/CommonUtil"

// export const useOptimisedLocalStream = (
//    localCameraTrack: ICameraVideoTrack | null,
//    tracksPublished: boolean
// ) => {
//    const [currentVideoPreset, setCurrentVideoPreset] =
//       useState<VideoEncoderConfigurationPreset>(
//          getVideoEncoderPreset(withHighQuality)
//       )
//    const setVideoQuality = useCallback(
//       async (quality) => {
//          if (!localCameraTrack) return
//          try {
//             if (tracksPublished && currentVideoPreset !== quality) {
//                await localCameraTrack?.setEncoderConfiguration("122")
//                setCurrentVideoPreset(quality)
//             }
//          } catch (e) {
//             errorLogAndNotify(e, {
//                message: "Error in setting video quality",
//                quality,
//             })
//          }
//       },
//       [localCameraTrack, tracksPublished]
//    )
// }
