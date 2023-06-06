import MultiCheckboxSelect from "../MultiCheckboxSelect"
import { languageOptionCodes } from "../../../../../constants/forms"
import {
   formatToOptionArray,
   multiListSelectMapValueFn,
} from "../../../signup/utils"
import React, { useCallback } from "react"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import { useRouter } from "next/router"

type Props = {
   handleChange: (name: string, selectedOptions: OptionGroup[]) => void
}

const LanguageSelector = ({ handleChange }: Props) => {
   const { query } = useRouter()

   const getSelectedLanguages = useCallback(() => {
      const queryLanguages = query.languages as string
      let selectedLanguages = []

      if (queryLanguages) {
         selectedLanguages = formatToOptionArray(
            queryLanguages.split(","),
            languageOptionCodes
         )
      }
      return selectedLanguages
   }, [query.languages])

   return (
      <MultiCheckboxSelect
         inputName={"languages"}
         selectedItems={getSelectedLanguages()}
         allValues={languageOptionCodes}
         setFieldValue={handleChange}
         getValueFn={multiListSelectMapValueFn}
      />
   )
}

export default LanguageSelector
