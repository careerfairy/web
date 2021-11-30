import React, { memo } from "react";
import ClearRoundedIcon from "@material-ui/icons/ClearRounded";
import { Button, Grow } from "@material-ui/core";
import {
   CategoryContainerCentered,
   CategoryContainerContent,
} from "../../../../../../../materialUI/GlobalContainers";
import { ThemedPermanentMarker } from "../../../../../../../materialUI/GlobalTitles";

const HandRaiseRequested = memo(({ handRaiseState, updateHandRaiseRequest }) => {
   const shouldRender = () =>
      Boolean(
         !(!handRaiseState || handRaiseState.state !== "denied")
      );
   return (
      shouldRender() && (
         <Grow unmountOnExit in>
            <CategoryContainerCentered>
               <CategoryContainerContent>
                  <ThemedPermanentMarker>
                     Sorry we can't answer your question right now.
                  </ThemedPermanentMarker>
                  <Button
                     size="large"
                     startIcon={<ClearRoundedIcon />}
                     variant="contained"
                     children="Cancel"
                     onClick={() => updateHandRaiseRequest("unrequested")}
                  />
               </CategoryContainerContent>
            </CategoryContainerCentered>
         </Grow>
      )
   );
});

export default HandRaiseRequested;
