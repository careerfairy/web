import * as Yup from "yup"

export const baseStudyBackgroundShape = {
   id: Yup.string(),
   school: Yup.string().required("School is required"),
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
