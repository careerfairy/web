import {
   HandRaise,
   HandRaiseState,
} from "@careerfairy/shared-lib/src/livestreams/hand-raise"
import ClearRoundedIcon from "@mui/icons-material/ClearRounded"
import { Button, Grow } from "@mui/material"
import {
   CategoryContainerCentered,
   CategoryContainerContent,
} from "materialUI/GlobalContainers"
import { ThemedPermanentMarker } from "materialUI/GlobalTitles"
import { memo } from "react"

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
