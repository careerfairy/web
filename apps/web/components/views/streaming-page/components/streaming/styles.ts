import { sxStyles } from "types/commonTypes"

export const styles = sxStyles({
   videoTrack: {
      borderRadius: "inherit",
      "& > div": {
         borderRadius: "inherit",
         backgroundColor: (theme) => theme.brand.white[500] + " !important",
         overflow: "hidden",
         "& .agora_video_player": {
            borderRadius: "inherit",
         },
      },
   },
   videoContain: {
      "& .agora_video_player": {
         objectFit: "contain !important",
      },
   },
})
