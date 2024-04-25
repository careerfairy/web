import { QaIcon } from "components/views/common/icons"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { QuestionInput } from "../questions/QuestionInput"
import { QuestionsView } from "../questions/QuestionsView"
import { SidePanelView } from "./SidePanelView"

const styles = sxStyles({
   root: {
      p: 1.5,
   },
})

export const QAndAPanel = () => {
   const { isHost } = useStreamingContext()
   return (
      <SidePanelView
         id="qanda-panel"
         title="Questions and Answers"
         icon={<QaIcon />}
         contentWrapperStyles={styles.root}
         bottomContent={isHost ? null : <QuestionInput />}
      >
         <QuestionsView />
      </SidePanelView>
   )
}
