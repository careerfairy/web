import React from "react"
import MultiChipSelect from "./MultiChipSelect"
import { languageCodes } from "components/helperFunctions/streamFormFunctions"
import { useLivestreamFormValues } from "../../../useLivestreamFormValues"

const LanguageSelect = () => {
   const {
      values: { general },
   } = useLivestreamFormValues()

   const initialFormValue = languageCodes.find(
      (language) => language.code === general.language
   )

   return (
      <MultiChipSelect
         id="general.language"
         options={languageCodes}
         value={initialFormValue}
         keyOptionIndexer="code"
         textFieldProps={{
            label: "Choose a language",
            placeholder: "English",
            required: true,
         }}
      />
   )
}

export default LanguageSelect
