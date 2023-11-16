import React from "react"
import { SidePanelView } from "./SidePanelView"
import { PollIcon } from "components/icons"

export const PollsPanel = () => {
   return (
      <SidePanelView id="polls-panel" title="Polls" icon={<PollIcon />}>
         content
      </SidePanelView>
   )
}
