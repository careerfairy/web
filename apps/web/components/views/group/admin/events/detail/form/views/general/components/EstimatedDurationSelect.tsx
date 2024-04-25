import MultiChipSelect from "./MultiChipSelect"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"
import { ESTIMATED_DURATIONS } from "../../../commons"

const EstimatedDurationSelect = () => {
   const {
      values: { general },
   } = useLivestreamFormValues()

   const initialFormValue = ESTIMATED_DURATIONS.find(
      (duration) => duration.minutes === general.duration
   )

   return (
      <MultiChipSelect
         id="general.duration"
         options={ESTIMATED_DURATIONS}
         value={initialFormValue}
         keyOptionIndexer="minutes"
         textFieldProps={{
            label: "Estimated duration",
            placeholder: "1 hour",
            required: true,
         }}
      />
   )
}

export default EstimatedDurationSelect
