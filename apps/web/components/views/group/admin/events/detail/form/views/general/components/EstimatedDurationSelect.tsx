import { useFormikContext } from "formik"
import MultiChipSelect from "./MultiChipSelect"
import { LivestreamFormValues } from "../../../types"

const ESTIMATED_DURATIONS = [
   { minutes: 15, name: "15 minutes" },
   { minutes: 30, name: "30 minutes" },
   { minutes: 45, name: "45 minutes" },
   {
      minutes: 60,
      name: "1 hour",
   },
   { minutes: 75, name: "1 hour 15 minutes" },
   { minutes: 90, name: "1 hour 30 minutes" },
   { minutes: 105, name: "1 hour 45 minutes" },
   {
      minutes: 120,
      name: "2 hours",
   },
   { minutes: 135, name: "2 hours 15 minutes" },
   { minutes: 150, name: "2 hours 30 minutes" },
   { minutes: 165, name: "2 hours 45 minutes" },
   {
      minutes: 180,
      name: "3 hours",
   },
]

const EstimatedDurationSelect = () => {
   const {
      values: { general },
   } = useFormikContext<LivestreamFormValues>()

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
