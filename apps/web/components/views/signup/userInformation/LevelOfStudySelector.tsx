import React, { useCallback, useMemo, useState } from "react"
import { useLevelsOfStudy } from "../../../custom-hook/useCollection"
import { FormikHandlers, FormikHelpers } from "formik"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import SingleListSelect from "../../common/SingleListSelect"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { userRepo } from "../../../../data/RepositoryInstances"

interface Props {
   setFieldValue?: FormikHelpers<any>["setFieldValue"]
   handleBlur?: FormikHandlers["handleBlur"]
   value: FieldOfStudy
   className?: string
   error?: any
   onSelectItem?: (selectedOption: FieldOfStudy) => void
   loading?: boolean
   disabled?: boolean
}
export const LevelOfStudySelector = ({
   setFieldValue,
   value,
   className,
   error,
   handleBlur,
   onSelectItem,
   loading,
   disabled,
}: Props) => {
   const { data: fieldsOfStudy } = useLevelsOfStudy()

   const getValueFn = useCallback((option: FieldOfStudy) => option, [])

   const multiSelectInputProps = useMemo(
      () => ({
         label: "Select your level of study",
         placeholder: "Select from the following list",
         className,
         helperText: error,
         error: !!error,
      }),
      [className, error]
   )

   return (
      <SingleListSelect
         onSelectItem={onSelectItem}
         inputName={"levelOfStudy"}
         handleBlur={handleBlur}
         inputProps={multiSelectInputProps}
         getValueFn={getValueFn}
         selectedItem={value}
         options={fieldsOfStudy}
         setFieldValue={setFieldValue}
         disabled={disabled}
         loading={loading}
      />
   )
}

export const LevelOfStudyUpdater = () => {
   const { userData } = useAuth()
   const [loading, setLoading] = useState(false)
   const onSelectItem = useCallback(
      async (selectedOption: FieldOfStudy) => {
         if (selectedOption) {
            try {
               setLoading(true)
               await userRepo.updateLevelOfStudy(
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
      <LevelOfStudySelector
         onSelectItem={onSelectItem}
         value={userData.levelOfStudy}
         loading={loading}
      />
   )
}
