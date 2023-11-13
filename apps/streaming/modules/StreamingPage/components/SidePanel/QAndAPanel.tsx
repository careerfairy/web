import React from "react"
import { SidePanelView } from "./SidePanelView"
import { QaIcon } from "components/icons"

export const QAndAPanel = () => {
   return (
      <SidePanelView
         id="qanda-panel"
         title="Questions and Answers"
         icon={<QaIcon />}
      >
         content
      </SidePanelView>
   )
}
