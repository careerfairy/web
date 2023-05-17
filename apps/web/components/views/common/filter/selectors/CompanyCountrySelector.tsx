import {
   CompanyCountryValues,
   RelevantCompanyCountryValues,
} from "../../../../../constants/forms"
import {
   formatToOptionArray,
   multiListSelectMapValueFn,
} from "../../../signup/utils"
import MultiCheckboxSelect from "../../MultiCheckboxSelect"
import React, { useCallback } from "react"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import { useRouter } from "next/router"

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
            queryCompanyCountry.split(","),
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
      />
   )
}

export default CompanyCountrySelector
