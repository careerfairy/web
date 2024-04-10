import React from "react"
import { SidePanelView } from "./SidePanelView"
import { PollIcon } from "components/views/common/icons"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { HostPollsView } from "../polls/HostPollsView"
import { ViewerPollsView } from "../polls/ViewerPollsView"

const styles = sxStyles({
   root: {
      p: 1.5,
   },
})

export const PollsPanel = () => {
   const { isHost } = useStreamingContext()

   return (
      <SidePanelView
         contentWrapperStyles={styles.root}
         id="polls-panel"
         title="Polls"
         icon={<PollIcon />}
      >
         {isHost ? <HostPollsView /> : <ViewerPollsView />}
      </SidePanelView>
   )
}
