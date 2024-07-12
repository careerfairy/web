import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { languageOptionCodes } from "@careerfairy/shared-lib/constants/forms"
import { useRouter } from "next/router"
import { useCallback } from "react"
import {
   formatToOptionArray,
   multiListSelectMapValueFn,
} from "../../../signup/utils"
import MultiCheckboxSelect from "../MultiCheckboxSelect"

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
         useStyledCheckbox
      />
   )
}

export default LanguageSelector
