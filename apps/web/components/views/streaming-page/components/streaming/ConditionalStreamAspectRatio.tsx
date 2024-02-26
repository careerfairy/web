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
   originalStreamAspectRatio: boolean
   track: ILocalVideoTrack | IRemoteVideoTrack
}

export const ConditionalStreamAspectRatio = ({
   children,
   originalStreamAspectRatio,
   track,
}: Props) => {
   const dimensions = useVideoTrackDimensions(
      originalStreamAspectRatio ? track : null
   )

   if (!originalStreamAspectRatio || !dimensions) {
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
