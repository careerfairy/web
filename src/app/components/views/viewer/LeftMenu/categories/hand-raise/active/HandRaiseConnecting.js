import React, { memo } from "react";
import { Button, Grow } from "@mui/material";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import {
   CategoryContainerCentered,
   CategoryContainerContent,
} from "../../../../../../../materialUI/GlobalContainers";
import { ThemedPermanentMarker } from "../../../../../../../materialUI/GlobalTitles";

const HandRaiseRequested = memo(
   ({ handRaiseState, updateHandRaiseRequest }) => {
      const shouldRender = () =>
         Boolean(
            !(
               !handRaiseState ||
               (handRaiseState.state !== "connecting" &&
                  handRaiseState.state !== "invited")
            )
         );
      return (
         shouldRender() && (
            <Grow unmountOnExit in>
               <span>
                  <CategoryContainerCentered>
                     <CategoryContainerContent>
                        <ThemedPermanentMarker>
                           Connecting to the stream...
                        </ThemedPermanentMarker>
                        <Button
                           size="large"
                           startIcon={<ClearRoundedIcon />}
                           variant="contained"
                           color="grey"
                           children="Cancel"
                           onClick={() => updateHandRaiseRequest("unrequested")}
                        />
                     </CategoryContainerContent>
                  </CategoryContainerCentered>
               </span>
            </Grow>
         )
      );
   }
);

export default HandRaiseRequested;
