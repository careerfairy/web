import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import { FormikHelpers } from "formik"
import { useCallback, useMemo, useState } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { userRepo } from "../../../../data/RepositoryInstances"
import { useFieldsOfStudy } from "../../../custom-hook/useCollection"
import SingleListSelect from "../../common/SingleListSelect"

interface Props {
   setFieldValue?: FormikHelpers<FieldOfStudy>["setFieldValue"]
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
