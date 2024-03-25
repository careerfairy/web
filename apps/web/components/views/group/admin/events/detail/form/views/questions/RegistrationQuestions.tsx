import { useGroup } from "layouts/GroupDashboardLayout"
import { useLivestreamCreationContext } from "../../../LivestreamCreationContext"
import { useLivestreamFormValues } from "../../useLivestreamFormValues"
import MultiChipSelect from "../general/components/MultiChipSelect"

const RegistrationQuestions = () => {
   const {
      values: { questions },
   } = useLivestreamFormValues()
   const { isCohostedEvent } = useLivestreamCreationContext()

   const { groupQuestions } = useGroup()

   if (!isCohostedEvent) {
      return (
         <MultiChipSelect
            id="questions.registrationQuestions"
            options={groupQuestions}
            value={questions.registrationQuestions ?? []}
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

   return (
      <>
         <MultiChipSelect
            id="questions.registrationQuestions"
            options={groupQuestions}
            value={questions.registrationQuestions ?? []}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "Live Stream Hosts",
               placeholder: "Add some hosts to your live stream",
            }}
         />
         <MultiChipSelect
            id="questions.registrationQuestions"
            options={groupQuestions}
            value={questions.registrationQuestions ?? []}
            multiple
            disableCloseOnSelect
            textFieldProps={{
               label: "Questions for live stream registration",
               placeholder:
                  "Add some questions you'd like to ask on live stream registration",
            }}
         />
      </>
   )
}

export default RegistrationQuestions
