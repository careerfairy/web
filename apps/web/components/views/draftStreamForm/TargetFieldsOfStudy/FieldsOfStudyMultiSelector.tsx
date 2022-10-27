import { useFieldsOfStudy } from "../../../custom-hook/useCollection"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import MultiListSelect from "../../common/MultiListSelect"
import { memo } from "react"

export type FieldsOfStudyMultiSelectorProps = {
   selectedItems: FieldOfStudy[]
   setFieldValue: (name, value) => void
}

const allOption = { id: "select-all", name: "Any Field Of Study" }

const FieldsOfStudyMultiSelector = ({
   selectedItems,
   setFieldValue,
}: FieldsOfStudyMultiSelectorProps) => {
   const { isLoading, data: allFieldsOfStudy } = useFieldsOfStudy()

   if (isLoading) {
      return <div>Loading..</div>
   }

   return (
      <MultiListSelect
         inputName="targetFieldsOfStudy"
         selectedItems={
            selectedItems.length === 0 ? [allOption] : selectedItems
         }
         setFieldValue={setFieldValue}
         allValues={allFieldsOfStudy}
         isCheckbox={true}
         inputProps={{
            label: "By Fields of Study",
            placeholder: "Select Fields of Study",
         }}
         chipProps={{
            variant: "contained",
            color: "secondary",
         }}
         getValueFn={getValueFn}
         selectAllOption={{
            value: allOption,
            returnValue: [],
            selectValueType: "ReturnValue",
         }}
         checkboxColor="secondary"
      />
   )
}

const getValueFn = (value) => value

export default memo(FieldsOfStudyMultiSelector)
