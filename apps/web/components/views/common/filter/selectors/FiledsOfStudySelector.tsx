import MultiCheckboxSelect from "../MultiCheckboxSelect"
import {
   formatToOptionArray,
   multiListSelectMapValueFn,
} from "../../../signup/utils"
import React, { useCallback, useMemo } from "react"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import { useRouter } from "next/router"
import MultiListSelect from "../../MultiListSelect"
import { useFieldsOfStudy } from "../../../../custom-hook/useCollection"

type Props = {
   handleChange: (name: string, selectedOptions: OptionGroup[]) => void
}

const relevantFieldsOfStudyIds = [
   "business_administration_economics",
   "computer_science",
   "mechanical_engineering",
   "finance",
   "life_sciences",
   "physics",
   "electrical_engineering",
   "law",
   "sociology",
   "journalism_media_studies_and_communication",
   "medicine",
   "mathematics",
]

const FieldsOfStudySelector = ({ handleChange }: Props) => {
   const { query } = useRouter()
   const { data: fieldsOfStudy } = useFieldsOfStudy()

   const getSelectedFieldOfStudy = useCallback(() => {
      const queryFieldOfStudies = query.fieldsOfStudy as string
      let selectedFieldOfStudies = []

      if (queryFieldOfStudies) {
         selectedFieldOfStudies = formatToOptionArray(
            queryFieldOfStudies.split(","),
            fieldsOfStudy
         )
      }
      return selectedFieldOfStudies
   }, [fieldsOfStudy, query.fieldsOfStudy])

   const relevantFieldsOfStudy = useMemo(
      () =>
         fieldsOfStudy.filter((field) =>
            relevantFieldsOfStudyIds.some((id) => id === field.id)
         ),
      [fieldsOfStudy]
   )

   return (
      <>
         <MultiCheckboxSelect
            inputName={"fieldsOfStudy"}
            selectedItems={getSelectedFieldOfStudy()}
            allValues={relevantFieldsOfStudy}
            setFieldValue={handleChange}
            getValueFn={multiListSelectMapValueFn}
         />

         <MultiListSelect
            inputName={"fieldsOfStudy"}
            isCheckbox
            selectedItems={getSelectedFieldOfStudy()}
            allValues={fieldsOfStudy}
            setFieldValue={handleChange}
            inputProps={{
               placeholder: "Look for other fields of study",
               sx: { mt: 2 },
            }}
            getValueFn={multiListSelectMapValueFn}
            chipProps={{
               color: "primary",
            }}
         />
      </>
   )
}

export default FieldsOfStudySelector
