import { useLivestreamCreationContext } from "../../../LivestreamCreationContext"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import MultiChipSelect from "../general/components/MultiChipSelect"
import RegistrationQuestionsListForCFAdmin from "./RegistrationQuestionsListCFAdmin"

const RegistrationQuestions = () => {
   const {
      values: { questions },
   } = useLivestreamFormValues()
   const { isCFAdmin } = useLivestreamCreationContext()

   if (!isCFAdmin) {
      return (
         <MultiChipSelect
            id="questions.registrationQuestions.values"
            options={questions.registrationQuestions.options}
            value={questions.registrationQuestions.values ?? []}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "Questions for live stream registration",
               placeholder:
                  "Add some questions you'd like to ask on event registration",
            }}
         />
      )
   }

   return <RegistrationQuestionsListForCFAdmin />
}

export default RegistrationQuestions
