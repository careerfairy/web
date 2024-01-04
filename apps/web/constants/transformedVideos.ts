import { imageKitLoader } from "@careerfairy/shared-lib/utils/video"
import { sparksTutorialVideoUrl } from "./videos"

export const sparksTutorialVideoUrlImageKit = imageKitLoader({
   src: sparksTutorialVideoUrl,
   width: 1280,
   height: 720,
   quality: 80,
   maxSizeCrop: true,
})
