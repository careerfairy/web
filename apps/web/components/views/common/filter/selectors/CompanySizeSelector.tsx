import MultiCheckboxSelect from "../MultiCheckboxSelect"
import { CompanySizesCodes } from "../../../../../constants/forms"
import {
   formatToOptionArray,
   multiListSelectMapValueFn,
} from "../../../signup/utils"
import React, { useCallback, useMemo } from "react"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import { useRouter } from "next/router"

type Props = {
   handleChange: (name: string, selectedOptions: OptionGroup[]) => void
}

const CompanySizeSelector = ({ handleChange }: Props) => {
   const { query } = useRouter()

   const mappedCompanySizesCodes = useMemo(
      (): OptionGroup[] =>
         CompanySizesCodes.map((size) => ({ id: size.id, name: size.label })),
      []
   )

   const getSelectedCompanySize = useCallback((): OptionGroup[] => {
      const queryCompanySize = query.companySizes as string
      let selectedSize = []

      if (queryCompanySize) {
         selectedSize = formatToOptionArray(
            queryCompanySize.split(","),
            mappedCompanySizesCodes
         )
      }
      return selectedSize
   }, [mappedCompanySizesCodes, query.companySizes])

   return (
      <MultiCheckboxSelect
         inputName={"companySizes"}
         selectedItems={getSelectedCompanySize()}
         allValues={mappedCompanySizesCodes}
         setFieldValue={handleChange}
         getValueFn={multiListSelectMapValueFn}
      />
   )
}

export default CompanySizeSelector
