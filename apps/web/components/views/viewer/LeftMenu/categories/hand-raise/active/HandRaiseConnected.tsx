import React, { memo } from "react"
import ClearRoundedIcon from "@mui/icons-material/ClearRounded"
import { Button, Grow } from "@mui/material"
import {
   CategoryContainerCentered,
   CategoryContainerContent,
} from "materialUI/GlobalContainers"
import { ThemedPermanentMarker } from "materialUI/GlobalTitles"
import { HandRaise, HandRaiseState } from "types/handraise"

const HandRaiseRequested = memo(
   ({ handRaiseState, updateHandRaiseRequest }: Props) => {
      const shouldRender = () =>
         Boolean(handRaiseState?.state === HandRaiseState.connected)
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
                           onClick={() =>
                              updateHandRaiseRequest(HandRaiseState.unrequested)
                           }
                        >
                           Stop Streaming
                        </Button>
                     </CategoryContainerContent>
                  </CategoryContainerCentered>
               </span>
            </Grow>
         )
      )
   }
)

HandRaiseRequested.displayName = "HandRaiseRequested"

type Props = {
   handRaiseState: HandRaise
   updateHandRaiseRequest: (state: HandRaiseState) => Promise<void>
}

export default HandRaiseRequested
