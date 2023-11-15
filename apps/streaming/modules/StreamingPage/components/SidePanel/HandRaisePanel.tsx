import React from "react"
import { SidePanelView } from "./SidePanelView"

import { HandRaiseIcon } from "components/icons"

export const HandRaisePanel = () => {
   return (
      <SidePanelView
         id="hand-raise-panel"
         title="Hand raise"
         icon={<HandRaiseIcon />}
      >
         content
      </SidePanelView>
   )
}
