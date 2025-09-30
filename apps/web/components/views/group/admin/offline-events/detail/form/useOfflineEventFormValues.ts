import { useFormikContext } from "formik"
import { OfflineEventFormValues } from "./types"

export const useOfflineEventFormValues = () => {
   const { values, validateForm, errors, isValid } =
      useFormikContext<OfflineEventFormValues>()

   return {
      values,
      validateForm,
      errors,
      isValid,
   }
}
