import { FC } from "react"
import FeedbackQuestions from "./FeedbackQuestions"
import FormSectionHeader from "../../FormSectionHeader"
import MultiChipSelect from "../general/components/MultiChipSelect"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import { LivestreamGroupQuestion } from "@careerfairy/shared-lib/livestreams"

type LivestreamFormJobsStepProps = {
   registrationQuestionsOptions: LivestreamGroupQuestion[]
}

const LivestreamFormJobsStep: FC<LivestreamFormJobsStepProps> = ({
   registrationQuestionsOptions,
}) => {
   const {
      values: { questions },
   } = useLivestreamFormValues()

   return (
      <>
         <FormSectionHeader
            title="Registration Questions"
            subtitle="Add questions that you want participants to reply during your live stream registration"
         />
         <MultiChipSelect
            id="questions.registrationQuestions"
            options={registrationQuestionsOptions}
            value={questions.registrationQuestions ?? []}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "Questions for live stream registration",
               placeholder:
                  "Add some questions you'd like to ask on event registration",
            }}
         />
         <FormSectionHeader
            title="Feedback Questions"
            subtitle="These questions will be asked during the live stream to the audience"
            divider
         />
         <FeedbackQuestions />
      </>
   )
}

export default LivestreamFormJobsStep
