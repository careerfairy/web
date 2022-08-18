import { useLevelsOfStudy } from "../../../custom-hook/useCollection"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import MultiListSelect from "../../common/MultiListSelect"
import { memo } from "react"

export type LevelsOfStudyQuerySelector = {
   selectedItems: FieldOfStudy[]
   setFieldValue: (name, value) => void
}

const allOption = { id: "select-all", name: "Any Level of Study" }

const LevelsOfStudyQuerySelector = ({
   selectedItems,
   setFieldValue,
}: LevelsOfStudyQuerySelector) => {
   const { isLoading, data: allLevelsOfStudy } = useLevelsOfStudy()

   if (isLoading) {
      return <div>Loading..</div>
   }

   return (
      <MultiListSelect
         inputName="targetLevelsOfStudy"
         selectedItems={
            selectedItems.length === 0 ? [allOption] : selectedItems
         }
         setFieldValue={setFieldValue}
         allValues={allLevelsOfStudy}
         isCheckbox={true}
         inputProps={{
            label: "By Levels of Study",
            placeholder: "Select Levels of Study",
         }}
         chipProps={{
            variant: "outlined",
         }}
         getValueFn={getValueFn}
         selectAllOption={{
            value: allOption,
            returnValue: [],
            selectValueType: "ReturnValue",
         }}
      />
   )
}

const getValueFn = (value) => value

export default memo(LevelsOfStudyQuerySelector)
