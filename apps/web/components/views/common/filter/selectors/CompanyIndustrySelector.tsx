import MultiCheckboxSelect from "../MultiCheckboxSelect"
import {
   CompanyIndustryValues,
   RelevantCompanyIndustryValues,
} from "../../../../../constants/forms"
import {
   formatToOptionArray,
   multiListSelectMapValueFn,
} from "../../../signup/utils"
import MultiListSelect from "../../MultiListSelect"
import React, { useCallback } from "react"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import { useRouter } from "next/router"

type Props = {
   handleChange: (name: string, selectedOptions: OptionGroup[]) => void
}

const CompanyIndustrySelector = ({ handleChange }: Props) => {
   const { query } = useRouter()

   const getSelectedCompanyIndustry = useCallback(() => {
      const queryIndustries = query.companyIndustries as string
      let selectedIndustries = []

      if (queryIndustries) {
         selectedIndustries = formatToOptionArray(
            queryIndustries.split(","),
            CompanyIndustryValues
         )
      }
      return selectedIndustries
   }, [query.companyIndustries])

   return (
      <>
         <MultiCheckboxSelect
            inputName={"companyIndustries"}
            selectedItems={getSelectedCompanyIndustry()}
            allValues={RelevantCompanyIndustryValues}
            setFieldValue={handleChange}
            getValueFn={multiListSelectMapValueFn}
         />

         <MultiListSelect
            inputName={"companyIndustries"}
            isCheckbox
            selectedItems={getSelectedCompanyIndustry()}
            allValues={CompanyIndustryValues}
            setFieldValue={handleChange}
            inputProps={{
               placeholder: "Look for other company industries",
            }}
            getValueFn={multiListSelectMapValueFn}
            chipProps={{
               color: "primary",
            }}
         />
      </>
   )
}

export default CompanyIndustrySelector
