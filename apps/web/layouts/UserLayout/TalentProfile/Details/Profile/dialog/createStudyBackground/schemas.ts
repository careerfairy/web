import * as Yup from "yup"

export const studyBackgroundSchema = Yup.object({
   id: Yup.string().required(),
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
})

export interface StudyBackgroundFormValues
   extends Yup.InferType<typeof studyBackgroundSchema> {}

// export type JobFormValues = {
//     id: string
//     groupId: string
//     basicInfo: BasicInfoValues
//     additionalInfo: AdditionalInfoValues
//     livestreamIds: string[]
//     sparkIds: string[]
//  }
