import React, { memo } from "react";
import { Button, Grow } from "@mui/material";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import HandRaiseIcon from "@mui/icons-material/PanToolOutlined";
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

const HandRaiseRequested = memo(({
   handRaiseState,
   handRaiseActive,
   requestHandRaise,
   unRequestHandRaise,
}) => {
   const { startCountDown, isCountingDown } = useTimeOut({
      delay: DELAY_IN_SECONDS * 1000,
   });
   const shouldRender = () =>
      Boolean(!(!handRaiseState || handRaiseState.state !== "requested"));

   const onClick = () => {
      if (!handRaiseActive) return unRequestHandRaise();
      requestHandRaise();
      startCountDown();
   };

   return (
      shouldRender() && (
         <Grow unmountOnExit in>
            <CategoryContainerCentered>
               <CategoryContainerContent>
                  <ThemedPermanentMarker>
                     You raised your&nbsp;hand!
                  </ThemedPermanentMarker>
                  <CategorySubtitle>
                     Please wait to be invited to join by the&nbsp;speaker.
                  </CategorySubtitle>
                  {
                     <Button
                        size="large"
                        disabled={isCountingDown}
                        startIcon={
                           handRaiseActive ? (
                              <HandRaiseIcon />
                           ) : (
                              <ClearRoundedIcon />
                           )
                        }
                        variant="contained"
                        color={handRaiseActive && "primary"}
                        children={
                           isCountingDown
                              ? `disabled for ${DELAY_IN_SECONDS} seconds`
                              : handRaiseActive
                              ? "Raise again"
                              : "Cancel"
                        }
                        onClick={onClick}
                     />
                  }
               </CategoryContainerContent>
            </CategoryContainerCentered>
         </Grow>
      )
   );
});

export default HandRaiseRequested;
