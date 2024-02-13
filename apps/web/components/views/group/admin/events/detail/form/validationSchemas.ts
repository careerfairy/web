import * as yup from "yup"
import { LivestreamFormGeneralTabValues } from "./types"

const REQUIRED_FIELD_MESSAGE = "This is a required field"

const getMinCharactersMessage = (fieldName: string, numCharacters: number) =>
   `The ${fieldName} needs to have at least ${numCharacters} characters`

const getSelectAtLeastOneMessage = (fieldName: string) =>
   `Please select at least one ${fieldName}`

const groupOptionShape = yup.object().shape({
   id: yup.string().required(),
   name: yup.string().required(),
})

const livestreamFormGeneralTabSchema: yup.SchemaOf<LivestreamFormGeneralTabValues> =
   yup.object().shape({
      title: yup
         .string()
         .required(REQUIRED_FIELD_MESSAGE)
         .min(10, getMinCharactersMessage("title", 10)),
      hidden: yup.bool().notRequired(),
      company: yup.string().notRequired(),
      companyId: yup.string().notRequired(),
      companyLogoUrl: yup.string().notRequired(),
      backgroundImageUrl: yup
         .string()
         .required("Please provide a banner image"),
      startDate: yup.date().required(),
      duration: yup.number().nullable().required(REQUIRED_FIELD_MESSAGE),
      language: yup.string().required(REQUIRED_FIELD_MESSAGE),
      summary: yup
         .string()
         .required(REQUIRED_FIELD_MESSAGE)
         .min(50, getMinCharactersMessage("Live stream summary", 50)),
      reasonsToJoin: yup
         .array()
         .of(
            yup
               .string()
               .required(REQUIRED_FIELD_MESSAGE)
               .min(20, "Minimum of 20 characters")
         )
         .required(),
      categories: yup
         .array()
         .of(groupOptionShape)
         .required()
         .min(1, getSelectAtLeastOneMessage("category")),
      targetCountries: yup.array().of(groupOptionShape),
      targetUniversities: yup.array().of(groupOptionShape),
      targetFieldsOfStudy: yup
         .array()
         .of(groupOptionShape)
         .required()
         .min(1, getSelectAtLeastOneMessage("field of study")),
      targetLevelsOfStudy: yup
         .array()
         .of(groupOptionShape)
         .required()
         .min(1, getSelectAtLeastOneMessage("level of study")),
   })

const livestreamFormSpeakersTabSchema = yup.object().shape({
   dummyFieldSpeakers: yup.string().required("Required"),
})

const livestreamFormQuestionsTabSchema = yup.object().shape({
   dummyFieldQuestions: yup.string().required("Required"),
})

const livestreamFormJobsTabSchema = yup.object().shape({
   dummyFieldJobs: yup.string().required("Required"),
})

const livestreamFormValidationSchema = yup.object().shape({
   general: livestreamFormGeneralTabSchema,
   speakers: livestreamFormSpeakersTabSchema,
   questions: livestreamFormQuestionsTabSchema,
   jobs: livestreamFormJobsTabSchema,
})

export {
   livestreamFormGeneralTabSchema,
   livestreamFormSpeakersTabSchema,
   livestreamFormQuestionsTabSchema,
   livestreamFormJobsTabSchema,
   livestreamFormValidationSchema,
}
