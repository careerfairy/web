import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { StudyBackground } from "@careerfairy/shared-lib/users"
import { useCallback, useMemo } from "react"

export type StudyBackgroundFormValues = {
   id?: string
   universityCountryCode: string
   universityId: string
   fieldOfStudy: FieldOfStudy
   levelOfStudy: LevelOfStudy
   startedAt?: Date
   endedAt?: Date
}

type UseStudyBackgroundFormSubmit = {
   handleSubmit: (
      values: StudyBackgroundFormValues,
      formMethods: {
         setFieldError: (
            field: keyof StudyBackgroundFormValues,
            message: string
         ) => void
      }
   ) => Promise<void>
}

/**
 * A hook to return a callback for submitting the user study background form. This callback handles the creation or update of a study background.
 * @returns {object} An object containing the following properties:
 * - `handleSubmit`: The callback to be passed to Formik's onSubmit prop.
 */
const useStudyBackgroundFormSubmit = (
   userId: string,
   onSubmitted?: (studyBackground: StudyBackground) => void
): UseStudyBackgroundFormSubmit => {
   const handleSubmit = useCallback<
      UseStudyBackgroundFormSubmit["handleSubmit"]
   >(
      async (values, { setFieldError }) => {
         console.log("🚀 ~ setFieldError:", setFieldError)
         console.log("🚀 ~ values:", values, userId, onSubmitted)
         // TODO: Update or create actual data
      },
      [userId, onSubmitted]
   )

   return useMemo<UseStudyBackgroundFormSubmit>(
      () => ({
         handleSubmit,
      }),
      [handleSubmit]
   )
}

export default useStudyBackgroundFormSubmit
