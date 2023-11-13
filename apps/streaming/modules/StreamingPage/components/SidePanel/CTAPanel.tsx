import React from "react"
import { SidePanelView } from "./SidePanelView"
import { Link2 } from "react-feather"

export const CTAPanel = () => {
   return (
      <SidePanelView id="cta-panel" title="Call To Actions" icon={<Link2 />}>
         content
      </SidePanelView>
   )
}
