import React from "react"
import { SidePanelView } from "./SidePanelView"
import { QaIcon } from "components/icons"

export const QAndAPanel = () => {
   return (
      <SidePanelView id="qanda-panel" title="Q&A" icon={<QaIcon />}>
         content
      </SidePanelView>
   )
}
