import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { CompanySizesCodes } from "@careerfairy/shared-lib/constants/forms"
import { useRouter } from "next/router"
import { useCallback, useMemo } from "react"
import {
   formatToOptionArray,
   multiListSelectMapValueFn,
} from "../../../signup/utils"
import MultiCheckboxSelect from "../MultiCheckboxSelect"

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
            queryCompanySize.split(",").map(decodeURIComponent),
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
         useStyledCheckbox
      />
   )
}

export default CompanySizeSelector
