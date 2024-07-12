import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import {
   CompanyCountryValues,
   RelevantCompanyCountryValues,
} from "@careerfairy/shared-lib/constants/forms"
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
const CompanyCountrySelector = ({ handleChange }: Props) => {
   const { query } = useRouter()

   const getSelectedCompanyCountry = useCallback((): OptionGroup[] => {
      const queryCompanyCountry = query.companyCountries as string
      let selectedCountry = []

      if (queryCompanyCountry) {
         selectedCountry = formatToOptionArray(
            queryCompanyCountry.split(",").map(decodeURIComponent),
            CompanyCountryValues
         )
      }
      return selectedCountry
   }, [query.companyCountries])

   return (
      <MultiCheckboxSelect
         inputName={"companyCountries"}
         selectedItems={getSelectedCompanyCountry()}
         allValues={RelevantCompanyCountryValues}
         setFieldValue={handleChange}
         getValueFn={multiListSelectMapValueFn}
         useStyledCheckbox
      />
   )
}

export default CompanyCountrySelector
