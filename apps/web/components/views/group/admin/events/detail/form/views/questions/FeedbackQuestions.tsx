import useIsMobile from "components/custom-hook/useIsMobile"
import FeedbackQuestionsDesktop from "./components/FeedbackQuestionsDesktop"
import FeedbackQuestionsMobile from "./components/FeedbackQuestionsMobile"

const FeedbackQuestions = () => {
   const isMobile = useIsMobile()

   return isMobile ? <FeedbackQuestionsMobile /> : <FeedbackQuestionsDesktop />
}

export default FeedbackQuestions
