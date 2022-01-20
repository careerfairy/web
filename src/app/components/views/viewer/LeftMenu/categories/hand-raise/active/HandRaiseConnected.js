import React, { memo } from "react";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { Button, Grow } from "@mui/material";
import {
   CategoryContainerCentered,
   CategoryContainerContent,
} from "../../../../../../../materialUI/GlobalContainers";
import { ThemedPermanentMarker } from "../../../../../../../materialUI/GlobalTitles";

const HandRaiseRequested = memo(
   ({ handRaiseState, updateHandRaiseRequest }) => {
      const shouldRender = () =>
         Boolean(!(!handRaiseState || handRaiseState.state !== "connected"));
      return (
         shouldRender() && (
            <Grow unmountOnExit in>
               <span>
                  <CategoryContainerCentered>
                     <CategoryContainerContent>
                        <ThemedPermanentMarker align="center">
                           You are live!
                        </ThemedPermanentMarker>
                        <Button
                           size="large"
                           startIcon={<ClearRoundedIcon />}
                           variant="contained"
                           children="Stop Streaming"
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
