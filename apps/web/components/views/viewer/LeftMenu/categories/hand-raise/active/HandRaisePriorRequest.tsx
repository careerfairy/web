import React, { memo } from "react"
import PanToolOutlinedIcon from "@mui/icons-material/PanToolOutlined"
import { Button, Grow } from "@mui/material"
import {
   CategoryContainerCentered,
   CategoryContainerContent,
} from "materialUI/GlobalContainers"
import {
   CategorySubtitle,
   ThemedPermanentMarker,
} from "materialUI/GlobalTitles"
import { HandRaise, HandRaiseState } from "types/handraise"

const HandRaisePriorRequest = memo(
   ({ handRaiseState, updateHandRaiseRequest }: Props) => {
      const shouldRender = () =>
         Boolean(
            !(
               handRaiseState &&
               handRaiseState.state !== HandRaiseState.unrequested
            )
         )
      return (
         shouldRender() && (
            <Grow unmountOnExit in>
               <span>
                  <span>
                     <CategoryContainerCentered>
                        <CategoryContainerContent>
                           <div className="animated bounce infinite slow">
                              <PanToolOutlinedIcon
                                 color="primary"
                                 style={{ fontSize: 40 }}
                              />
                           </div>
                           <ThemedPermanentMarker>
                              Raise your hand and join the stream!
                           </ThemedPermanentMarker>
                           <CategorySubtitle>
                              By raising your hand, you can request to join the
                              stream with your computer&apos;s audio and video
                              and ask your questions face-to-face.
                           </CategorySubtitle>
                           <Button
                              variant="contained"
                              size="large"
                              startIcon={
                                 <PanToolOutlinedIcon fontSize="large" />
                              }
                              onClick={() =>
                                 updateHandRaiseRequest(
                                    HandRaiseState.acquire_media
                                 )
                              }
                              color="primary"
                           >
                              Raise my hand
                           </Button>
                        </CategoryContainerContent>
                     </CategoryContainerCentered>
                  </span>
               </span>
            </Grow>
         )
      )
   }
)

HandRaisePriorRequest.displayName = "HandRaisePriorRequest"

type Props = {
   handRaiseState: HandRaise
   updateHandRaiseRequest: (state: HandRaiseState) => Promise<void>
}
export default HandRaisePriorRequest
