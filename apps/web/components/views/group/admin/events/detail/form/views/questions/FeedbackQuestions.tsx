import { useState } from "react"
import useIsMobile from "components/custom-hook/useIsMobile"
import FeedbackQuestionsMobile from "./components/FeedbackQuestionsMobile"
import FeedbackQuestionsDesktop from "./components/FeedbackQuestionsDesktop"

const dummyFeedbackQuestions = [
   {
      title: "How happy are you with the content shared by us?",
      type: "Star rating",
      appearAfter: 30,
   },
   {
      title: "Help us to improve: How can they make the experience more useful to you and other students?",
      type: "Written review",
      appearAfter: 40,
   },
]

const newDummyFeedbackQuestion = {
   title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
   type: new Date().toString(),
   appearAfter: 40,
}

const FeedbackQuestions = () => {
   const isMobile = useIsMobile()
   const [feedbackQuestions, setFeedbackQuestions] = useState(
      dummyFeedbackQuestions
   )

   if (isMobile) {
      return (
         <FeedbackQuestionsMobile
            questions={feedbackQuestions}
            handleAddQuestionClick={() => {
               // this is for testing purposes only
               setFeedbackQuestions([
                  ...feedbackQuestions,
                  newDummyFeedbackQuestion,
               ])
            }}
         />
      )
   }

   return <FeedbackQuestionsDesktop questions={feedbackQuestions} />
}

export default FeedbackQuestions
