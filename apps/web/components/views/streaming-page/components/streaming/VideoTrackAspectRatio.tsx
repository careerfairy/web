import { ILocalVideoTrack, IRemoteVideoTrack } from "agora-rtc-react"
import { useVideoTrackDimensions } from "components/custom-hook/streaming/useVideoTrackDimensions"
import AspectRatio from "components/views/common/AspectRatio"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   childStyles: {
      position: "absolute",
      top: "initial",
      left: "50%",
      transform: "translateX(-50%)",
   },
})

type Props = {
   children: ReactNode
   /**
    * The video track to infer the aspect ratio from,
    * if not provided, no aspect ratio will be applied
    */
   track?: ILocalVideoTrack | IRemoteVideoTrack
}

export const VideoTrackAspectRatio = ({ children, track }: Props) => {
   const dimensions = useVideoTrackDimensions(track)

   if (!track || !dimensions) {
      return <>{children}</>
   }

   return (
      <AspectRatio
         aspectRatio={`${dimensions?.width}:${dimensions?.height}`}
         childProps={{
            sx: styles.childStyles,
         }}
      >
         {children}
      </AspectRatio>
   )
}
