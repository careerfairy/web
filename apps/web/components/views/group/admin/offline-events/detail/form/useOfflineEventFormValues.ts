import { useFormikContext } from "formik"
import { OfflineEventFormValues } from "./types"

export const useOfflineEventFormValues = () => {
   const { values, validateForm, errors, isValid, dirty } =
      useFormikContext<OfflineEventFormValues>()

   return {
      values,
      validateForm,
      errors,
      isValid,
      dirty,
   }
}
