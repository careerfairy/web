import React, { memo } from "react";
import { Button, Grow } from "@mui/material";
import {
   CategoryContainerCentered,
   CategoryContainerContent,
} from "../../../../../../../materialUI/GlobalContainers";
import {
   CategorySubtitle,
   ThemedPermanentMarker,
} from "../../../../../../../materialUI/GlobalTitles";
import useTimeOut from "../../../../../../custom-hook/useTimeOut";

const DELAY_IN_SECONDS = 5;

const HandRaiseAcquiringMedia = memo(
   ({
      handRaiseState,
      handRaiseActive,
      requestHandRaise,
      unRequestHandRaise,
   }) => {
      const { startCountDown, isCountingDown } = useTimeOut({
         delay: DELAY_IN_SECONDS * 1000,
      });
      const shouldRender = () =>
         Boolean(handRaiseState?.state === "acquire_media");

      const onClick = () => {
         unRequestHandRaise();
      };

      return (
         shouldRender() && (
            <Grow unmountOnExit in>
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
            </Grow>
         )
      );
   }
);

export default HandRaiseAcquiringMedia;
