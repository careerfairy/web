import { useFieldsOfStudy } from "../../custom-hook/useCollection"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import MultiListSelect from "../common/MultiListSelect"

type Props = {
   selectedItems: FieldOfStudy[]
   setFieldValue: (name, value) => void
}

const FieldsOfStudyMultiSelector = ({
   selectedItems,
   setFieldValue,
}: Props) => {
   const { isLoading, data: allFieldsOfStudy } = useFieldsOfStudy()

   if (isLoading) {
      return <div>Loading..</div>
   }

   return (
      <MultiListSelect
         inputName="targetFieldsOfStudy"
         selectedItems={selectedItems}
         setFieldValue={setFieldValue}
         allValues={allFieldsOfStudy}
         limit={5}
         isCheckbox={true}
         inputProps={{
            label: "Select Fields of Study",
            placeholder: "Select up to 5 Fields of Study",
         }}
         chipProps={{
            variant: "outlined",
         }}
         getValueFn={getValueFn}
      />
   )
}

const getValueFn = (value) => value

export default FieldsOfStudyMultiSelector
