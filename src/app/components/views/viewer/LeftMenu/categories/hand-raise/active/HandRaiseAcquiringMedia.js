import React, { memo } from "react";
import {
   CategoryContainerCentered,
   CategoryContainerContent,
} from "../../../../../../../materialUI/GlobalContainers";
import {
   CategorySubtitle,
   ThemedPermanentMarker,
} from "../../../../../../../materialUI/GlobalTitles";

const HandRaiseAcquiringMedia = memo(({ handRaiseState }) => {
   const shouldRender = () =>
      Boolean(handRaiseState?.state === "acquire_media");

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
   );
});

export default HandRaiseAcquiringMedia;
