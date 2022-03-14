import React, { memo } from "react";
import { Button, Grow } from "@mui/material";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import HandRaiseIcon from "@mui/icons-material/PanToolOutlined";
import {
   CategoryContainerCentered,
   CategoryContainerContent,
} from "materialUI/GlobalContainers";
import {
   CategorySubtitle,
   ThemedPermanentMarker,
} from "materialUI/GlobalTitles";
import useTimeOut from "components/custom-hook/useTimeOut";
import { HandRaise, HandRaiseState } from "types/handraise";

const DELAY_IN_SECONDS = 5;

const HandRaiseRequested = memo(
   ({
      handRaiseState,
      handRaiseActive,
      requestHandRaise,
      unRequestHandRaise,
   }: Props) => {
      const { startCountDown, isCountingDown } = useTimeOut({
         delay: DELAY_IN_SECONDS * 1000,
      });
      const shouldRender = () =>
         Boolean(
            !(
               !handRaiseState ||
               handRaiseState.state !== HandRaiseState.requested
            )
         );

      const onClick = async () => {
         if (!handRaiseActive) return unRequestHandRaise();
         await requestHandRaise();
         startCountDown();
      };

      return (
         shouldRender() && (
            <Grow unmountOnExit in>
               <span>
                  <CategoryContainerCentered>
                     <CategoryContainerContent>
                        <ThemedPermanentMarker>
                           You raised your&nbsp;hand!
                        </ThemedPermanentMarker>
                        <CategorySubtitle>
                           Please wait to be invited to join by
                           the&nbsp;speaker.
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
                              color={handRaiseActive ? "primary" : "grey"}
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
               </span>
            </Grow>
         )
      );
   }
);

type Props = {
   handRaiseState: HandRaise;
   handRaiseActive?: boolean;
   requestHandRaise: () => Promise<void>;
   unRequestHandRaise: () => Promise<void>;
};

export default HandRaiseRequested;
