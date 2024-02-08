import React from "react"
import { useFormikContext } from "formik"
import MultiChipSelect from "./MultiChipSelect"
import { LivestreamFormValues } from "../../../types"
import { languageCodes } from "components/helperFunctions/streamFormFunctions"

const LanguageSelect = () => {
   const {
      values: { general },
   } = useFormikContext<LivestreamFormValues>()

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
