import React from "react"
import { SidePanelView } from "./SidePanelView"
import { PollIcon } from "components/views/common/icons"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { HostPollsView } from "../polls/HostPollsView"
import { ViewerPollsView } from "../polls/ViewerPollsView"

const styles = sxStyles({
   contentWrapperViewer: {
      px: 2,
      py: 1.5,
   },
   contentWrapperHost: {
      p: 1.5,
   },
})

export const PollsPanel = () => {
   const { isHost } = useStreamingContext()

   return (
      <SidePanelView
         contentWrapperStyles={
            isHost ? styles.contentWrapperHost : styles.contentWrapperViewer
         }
         id="polls-panel"
         title="Polls"
         icon={<PollIcon />}
      >
         {isHost ? <HostPollsView /> : <ViewerPollsView />}
      </SidePanelView>
   )
}
