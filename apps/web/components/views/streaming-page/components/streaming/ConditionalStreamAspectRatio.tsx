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
   useStreamAspectRatio: boolean
   track: ILocalVideoTrack | IRemoteVideoTrack
}

export const ConditionalStreamAspectRatio = ({
   children,
   useStreamAspectRatio,
   track,
}: Props) => {
   const dimensions = useVideoTrackDimensions(
      useStreamAspectRatio ? track : null
   )

   if (!useStreamAspectRatio) {
      return <>{children}</>
   }

   return (
      <AspectRatio
         aspectRatio={
            dimensions ? `${dimensions?.width}:${dimensions?.height}` : "16:9"
         }
         childProps={{
            sx: styles.childStyles,
         }}
      >
         {children}
      </AspectRatio>
   )
}
