import { languageCodes } from "components/helperFunctions/streamFormFunctions"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"
import MultiChipSelect from "./MultiChipSelect"

const LanguageSelect = () => {
   const {
      values: { general },
   } = useLivestreamFormValues()

   return (
      <MultiChipSelect
         id="general.language"
         options={languageCodes}
         value={general.language}
         textFieldProps={{
            label: "Choose a language",
            placeholder: "English",
            required: true,
         }}
         isOptionEqualToValue={(option, value) => {
            if (!value) return false
            return option.code === value.code
         }}
      />
   )
}

export default LanguageSelect
