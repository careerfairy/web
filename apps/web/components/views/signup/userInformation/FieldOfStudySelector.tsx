import React, { useCallback, useMemo, useState } from "react"
import { useFieldsOfStudy } from "../../../custom-hook/useCollection"
import { FormikHandlers, FormikHelpers } from "formik"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import SingleListSelect from "../../common/SingleListSelect"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { userRepo } from "../../../../data/RepositoryInstances"

interface Props {
   setFieldValue?: FormikHelpers<FieldOfStudy>["setFieldValue"]
   handleBlur?: FormikHandlers["handleBlur"]
   value: FieldOfStudy
   className?: string
   error?: any
   onSelectItem?: (selectedOption: FieldOfStudy) => void
   loading?: boolean
   disabled?: boolean
}
export const FieldOfStudySelector = ({
   setFieldValue,
   value,
   className,
   error,
   handleBlur,
   onSelectItem,
   loading,
   disabled,
}: Props) => {
   const { data: fieldsOfStudy } = useFieldsOfStudy()

   const getValueFn = useCallback((option: FieldOfStudy) => option, [])

   const multiSelectInputProps = useMemo(
      () => ({
         label: "Select your field of study",
         placeholder: "Select from the following list",
         className,
         error,
      }),
      [className, error]
   )
   return (
      <SingleListSelect
         inputName={"fieldOfStudy"}
         handleBlur={handleBlur}
         inputProps={multiSelectInputProps}
         getValueFn={getValueFn}
         selectedItem={value}
         options={fieldsOfStudy}
         setFieldValue={setFieldValue}
         onSelectItem={onSelectItem}
         disabled={disabled}
         loading={loading}
      />
   )
}

export const FieldOfStudyUpdater = () => {
   const { userData } = useAuth()
   const [loading, setLoading] = useState(false)

   const onSelectItem = useCallback(
      async (selectedOption: FieldOfStudy) => {
         if (selectedOption) {
            try {
               setLoading(true)
               await userRepo.updateFieldOfStudy(
                  userData.userEmail,
                  selectedOption
               )
            } catch (e) {
               console.error(e)
            }
            setLoading(false)
         }
      },
      [userData.userEmail]
   )

   return (
      <FieldOfStudySelector
         onSelectItem={onSelectItem}
         loading={loading}
         value={userData.fieldOfStudy}
      />
   )
}
