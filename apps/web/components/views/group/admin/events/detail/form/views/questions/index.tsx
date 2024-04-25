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
            subtitle="During the live stream, these feedback questions will be automatically asked to the attendees. This feedback will help you gauge the content of your stream. Use these questions as they are, or modify them, or ask your own personalised questions."
            divider
         />
         <FeedbackQuestions />
      </>
   )
}

export default LivestreamFormQuestionsStep
