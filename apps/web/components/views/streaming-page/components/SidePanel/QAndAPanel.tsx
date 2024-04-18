import React from "react"
import { SidePanelView } from "./SidePanelView"
import { QaIcon } from "components/views/common/icons"
import { QuestionsView } from "../questions/QuestionsView"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      p: 1.5,
   },
})

export const QAndAPanel = () => {
   return (
      <SidePanelView
         id="qanda-panel"
         title="Questions and Answers"
         icon={<QaIcon />}
         contentWrapperStyles={styles.root}
      >
         <QuestionsView />
      </SidePanelView>
   )
}
