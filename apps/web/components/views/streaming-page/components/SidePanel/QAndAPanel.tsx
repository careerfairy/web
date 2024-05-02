import { useScroll } from "components/custom-hook/utils/useScroll"
import { QaIcon } from "components/views/common/icons"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { QuestionInput } from "../questions/QuestionInput"
import { QuestionsView } from "../questions/QuestionsView"
import { SidePanelView } from "./SidePanelView"

const styles = sxStyles({
   root: {
      p: 0,
   },
})

export const QAndAPanel = () => {
   const { isHost } = useStreamingContext()
   const { scrollToTop, ref } = useScroll()

   return (
      <SidePanelView
         id="qanda-panel"
         title="Questions and Answers"
         icon={<QaIcon />}
         contentWrapperStyles={styles.root}
         bottomContent={isHost ? null : <QuestionInput />}
         contentRef={ref}
      >
         <QuestionsView scrollToTop={scrollToTop} containerRef={ref} />
      </SidePanelView>
   )
}
