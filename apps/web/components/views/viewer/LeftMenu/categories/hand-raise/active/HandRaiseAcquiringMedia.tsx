import { HandRaise } from "@careerfairy/shared-lib/src/livestreams/hand-raise"
import {
   CategoryContainerCentered,
   CategoryContainerContent,
} from "materialUI/GlobalContainers"
import {
   CategorySubtitle,
   ThemedPermanentMarker,
} from "materialUI/GlobalTitles"
import { memo } from "react"

const HandRaiseAcquiringMedia = memo(({ handRaiseState }: Props) => {
   const shouldRender = () => Boolean(handRaiseState?.state === "acquire_media")

   return (
      shouldRender() && (
         <CategoryContainerCentered>
            <CategoryContainerContent>
               <ThemedPermanentMarker>
                  Activate your camera/mic!
               </ThemedPermanentMarker>
               <CategorySubtitle>
                  Make sure to activate your camera and/or microphone
               </CategorySubtitle>
            </CategoryContainerContent>
         </CategoryContainerCentered>
      )
   )
})

HandRaiseAcquiringMedia.displayName = "HandRaiseAcquiringMedia"

type Props = {
   handRaiseState: HandRaise
}
export default HandRaiseAcquiringMedia
