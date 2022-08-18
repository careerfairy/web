import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import { memo } from "react"
import { useFieldsOfStudy } from "../../../custom-hook/useCollection"
import MultiListSelect from "../../common/MultiListSelect"

export type Props = {
   setFieldValue: (name, value) => void
   value: string[]
   inputName: string
}

const allOption = { id: "select-all", name: "Any Field Of Study" }

const FieldsOfStudySelector = ({ value, setFieldValue, inputName }: Props) => {
   const { isLoading, data: allFieldsOfStudy } = useFieldsOfStudy()

   if (isLoading) {
      return <div>Loading..</div>
   }

   return (
      <MultiListSelect
         inputName={inputName}
         selectedItems={value.length === 0 ? [allOption] : value}
         setFieldValue={setFieldValue}
         allValues={allFieldsOfStudy}
         isCheckbox={true}
         inputProps={inputProps}
         getValueFn={getValueFn}
         selectAllOption={{
            value: allOption,
            returnValue: [],
            selectValueType: "ReturnValue",
         }}
      />
   )
}
const inputProps = {
   label: "By Fields of Study",
   placeholder: "Select Fields of Study",
}
const getValueFn = (value: FieldOfStudy) => value.id

export default memo(FieldsOfStudySelector)
