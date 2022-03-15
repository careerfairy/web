import React, { memo } from "react"
import { Button, Grow } from "@mui/material"
import ClearRoundedIcon from "@mui/icons-material/ClearRounded"
import {
   CategoryContainerCentered,
   CategoryContainerContent,
} from "materialUI/GlobalContainers"
import { ThemedPermanentMarker } from "materialUI/GlobalTitles"
import { HandRaise, HandRaiseState } from "types/handraise"

const HandRaiseRequested = memo(
   ({ handRaiseState, updateHandRaiseRequest }: Props) => {
      const shouldRender = () =>
         Boolean(
            !(
               !handRaiseState ||
               (handRaiseState.state !== HandRaiseState.connecting &&
                  handRaiseState.state !== HandRaiseState.invited)
            )
         )
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
                           onClick={() =>
                              updateHandRaiseRequest(HandRaiseState.unrequested)
                           }
                        />
                     </CategoryContainerContent>
                  </CategoryContainerCentered>
               </span>
            </Grow>
         )
      )
   }
)

type Props = {
   handRaiseState: HandRaise
   updateHandRaiseRequest: (state: HandRaiseState) => Promise<void>
}

export default HandRaiseRequested
