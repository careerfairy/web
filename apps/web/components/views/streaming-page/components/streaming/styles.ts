import { sxStyles } from "types/commonTypes"

export const styles = sxStyles({
   videoTrack: {
      "& > div": {
         backgroundColor: (theme) => theme.brand.white[500] + " !important",
         overflow: "hidden",
      },
   },
   videoContain: {
      "& .agora_video_player": {
         objectFit: "contain !important",
      },
   },
})
