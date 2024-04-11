import React from "react"
import { SidePanelView } from "./SidePanelView"
import { PollIcon } from "components/views/common/icons"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { HostPollsView } from "../polls/HostPollsView"
import { ViewerPollsView } from "../polls/ViewerPollsView"
import { useScroll } from "components/custom-hook/utils/useScrollToBottom"

const styles = sxStyles({
   root: {
      p: 1.5,
   },
   viewerRoot: {
      p: 0,
   },
})

export const PollsPanel = () => {
   const { isHost } = useStreamingContext()

   const { scrollToTop, ref } = useScroll()

   return (
      <SidePanelView
         contentWrapperStyles={[styles.root, !isHost && styles.viewerRoot]}
         id="polls-panel"
         title="Polls"
         icon={<PollIcon />}
         contentRef={ref}
      >
         {isHost ? (
            <HostPollsView scrollToTop={scrollToTop} />
         ) : (
            <ViewerPollsView />
         )}
      </SidePanelView>
   )
}
