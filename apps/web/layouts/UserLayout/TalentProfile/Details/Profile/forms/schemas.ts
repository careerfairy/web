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
   // TODO-WG: Check if better to use just ID
   // levelOfStudy: Yup.string().required("Level of study is required"),
   // fieldOfStudy: Yup.string().required("Field of study is required"),
   levelOfStudy: Yup.object({
      name: Yup.string().required(),
      id: Yup.string().required(),
   })
      .nullable()
      .required("Level of study is required"),
   fieldOfStudy: Yup.object({
      name: Yup.string().required(),
      // .required("Field of study is required"),
      id: Yup.string().required(),
      // .required("Field of study is required"),
   })
      .nullable()
      .required("Field of study is required"),
   startedAt: Yup.date().nullable(),
   endedAt: Yup.date().nullable(),
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
   // TODO-WG: Check if better to use just ID
   // fieldOfStudy: string
   // levelOfStudy: string
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
