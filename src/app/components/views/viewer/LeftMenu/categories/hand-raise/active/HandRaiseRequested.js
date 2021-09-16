import React, { memo } from "react";
import { Button, Grow } from "@material-ui/core";
import ClearRoundedIcon from "@material-ui/icons/ClearRounded";
import HandRaiseIcon from "@material-ui/icons/PanToolOutlined";
import {
   CategoryContainerCentered,
   CategoryContainerContent,
} from "../../../../../../../materialUI/GlobalContainers";
import {
   CategorySubtitle,
   ThemedPermanentMarker,
} from "../../../../../../../materialUI/GlobalTitles";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";
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
   const dispatch = useDispatch();
   const shouldRender = () =>
      Boolean(!(!handRaiseState || handRaiseState.state !== "requested"));

   const onClick = () => {
      if (!handRaiseActive) return unRequestHandRaise();
      requestHandRaise();
      startCountDown();
      const message = "Your hand raised has been resent!";
      dispatch(
         actions.enqueueSnackbar({
            message,
            options: {
               preventDuplicate: true,
               key: message,
               variant: "info",
            },
         })
      );
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
