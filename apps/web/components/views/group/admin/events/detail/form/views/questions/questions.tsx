import FeedbackQuestions from "./FeedbackQuestions"
import FormSectionHeader from "../../FormSectionHeader"
import MultiChipSelect from "../general/components/MultiChipSelect"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"

const LivestreamFormJobsStep = () => {
   const {
      values: { questions },
   } = useLivestreamFormValues()
   console.log(questions)
   const options = [
      ...Object.values(
         Object.values(questions.registrationQuestions)[0].questions
      ),
   ]
   console.log(options)
   console.log([...Object.values(options)])
   return (
      <>
         <FormSectionHeader
            title="Registration Questions"
            subtitle="Add questions that you want participants to reply during your live stream registration"
         />
         <MultiChipSelect
            id="questions.registrationQuestions"
            options={options}
            value={[]}
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
