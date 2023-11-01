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
         Boolean(
            !(!handRaiseState || handRaiseState.state !== HandRaiseState.denied)
         )
      return (
         shouldRender() && (
            <Grow unmountOnExit in>
               <span>
                  <CategoryContainerCentered>
                     <CategoryContainerContent>
                        <ThemedPermanentMarker>
                           Sorry we can&apos;t answer your question right now.
                        </ThemedPermanentMarker>
                        <Button
                           size="large"
                           startIcon={<ClearRoundedIcon />}
                           variant="contained"
                           color="grey"
                           onClick={() =>
                              updateHandRaiseRequest(HandRaiseState.unrequested)
                           }
                        >
                           Cancel
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
