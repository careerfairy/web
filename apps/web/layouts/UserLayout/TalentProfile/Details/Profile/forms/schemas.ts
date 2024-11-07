import { StudyBackground } from "@careerfairy/shared-lib/users"
import * as Yup from "yup"
import { StudyBackgroundFormValues } from "./hooks/useStudyBackgroundFormSubmit"

export const baseStudyBackgroundShape = {
   id: Yup.string(),
   universityCountryCode: Yup.string().required("School country is required"),
   universityId: Yup.string().required("School is required"),
   levelOfStudy: Yup.object({
      name: Yup.string().required(),
      id: Yup.string().required(),
   }).required("Level of study is required"),
   fieldOfStudy: Yup.object({
      name: Yup.string().required(),
      id: Yup.string().required(),
   }).required("Field of study is required"),
   startedAt: Yup.date().nullable(),
   endedAt: Yup.date().nullable(),
}

export const CreateStudyBackgroundSchema = Yup.object(baseStudyBackgroundShape)

export type CreateStudyBackgroundSchemaType = Yup.InferType<
   typeof CreateStudyBackgroundSchema
>

export const getInitialStudyBackgroundValues = (
   studyBackground?: StudyBackground
): StudyBackgroundFormValues => {
   return {
      id: studyBackground?.id || "",
      universityCountryCode: studyBackground?.universityCountryCode || "",
      universityId: studyBackground?.universityId || "",
      fieldOfStudy: studyBackground?.fieldOfStudy || null,
      levelOfStudy: studyBackground?.levelOfStudy || null,
      startedAt: studyBackground?.startedAt?.toDate() || null,
      endedAt: studyBackground?.endedAt?.toDate() || null,
   }
}
