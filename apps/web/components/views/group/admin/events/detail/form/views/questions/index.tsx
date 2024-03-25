import FormSectionHeader from "../../FormSectionHeader"
import FeedbackQuestions from "./FeedbackQuestions"
import RegistrationQuestions from "./RegistrationQuestions"

const LivestreamFormQuestionsStep = () => {
   return (
      <>
         <FormSectionHeader
            title="Registration Questions"
            subtitle="Add questions that you want participants to reply during your live stream registration"
         />
         <RegistrationQuestions />

         <FormSectionHeader
            title="Feedback Questions"
            subtitle="These questions will be asked during the live stream to the audience"
            divider
         />
         <FeedbackQuestions />
      </>
   )
}

export default LivestreamFormQuestionsStep
