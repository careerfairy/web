import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { StudyBackground } from "@careerfairy/shared-lib/users"
import * as Yup from "yup"

export const baseStudyBackgroundShape = {
   id: Yup.string(),
   universityCountryCode: Yup.string().required("School country is required"),
   universityId: Yup.string().required("School is required"),
   levelOfStudy: Yup.object({
      name: Yup.string().required(),
      id: Yup.string().required(),
   })
      .nullable()
      .required("Level of study is required"),
   fieldOfStudy: Yup.object({
      name: Yup.string().required(),
      id: Yup.string().required(),
   })
      .nullable()
      .required("Field of study is required"),
   startedAt: Yup.date().nullable(),
   endedAt: Yup.date()
      .nullable()
      .test(
         "is-after-startedAt",
         "End date must be after start date",
         function (endedAt) {
            const { startedAt } = this.parent
            // Check if both dates are provided before validating
            return !startedAt || !endedAt || endedAt > startedAt
         }
      )
      .typeError("Please enter a valid end date"),
}

export const CreateStudyBackgroundSchema = Yup.object(baseStudyBackgroundShape)

export type CreateStudyBackgroundSchemaType = Yup.InferType<
   typeof CreateStudyBackgroundSchema
>

export type StudyBackgroundFormValues = {
   id?: string
   universityCountryCode: string
   universityId: string
   fieldOfStudy: FieldOfStudy
   levelOfStudy: LevelOfStudy
   startedAt?: Date
   endedAt?: Date
}

export const getInitialStudyBackgroundValues = (
   studyBackground?: StudyBackground
): StudyBackgroundFormValues => {
   return {
      id: studyBackground?.id || "",
      universityCountryCode: studyBackground?.universityCountryCode || "",
      universityId: studyBackground?.universityId || "",
      fieldOfStudy: studyBackground?.fieldOfStudy || {
         id: "",
         name: "",
      },
      levelOfStudy: studyBackground?.levelOfStudy || {
         id: "",
         name: "",
      },
      startedAt: studyBackground?.startedAt?.toDate() || null,
      endedAt: studyBackground?.endedAt?.toDate() || null,
   }
}
