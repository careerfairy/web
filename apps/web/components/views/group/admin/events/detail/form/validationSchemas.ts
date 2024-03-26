import CreateCreatorSchema from "components/views/sparks/forms/schemas/CreateCreatorSchema"
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
      id: yup.string(),
      title: yup
         .string()
         .required(REQUIRED_FIELD_MESSAGE)
         .min(10, getMinCharactersMessage("title", 10)),
      hidden: yup.bool().notRequired(),
      company: yup.string().notRequired(),
      companyLogoUrl: yup.string().notRequired(),
      backgroundImageUrl: yup
         .string()
         .required("Please provide a banner image"),
      startDate: yup
         .date()
         .nullable()
         .min(new Date(), "Choose a date in the future")
         .required(REQUIRED_FIELD_MESSAGE),
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
      groupIds: yup.array().of(yup.string()),
   })

const livestreamFormSpeakersTabValuesSchema = yup
   .array()
   .of(CreateCreatorSchema)
   .min(1)

const livestreamFormSpeakersTabSchema = yup.object().shape({
   values: livestreamFormSpeakersTabValuesSchema,
   options: yup.object().nullable(),
})

const livestreamFormQuestionsTabSchema = yup.object().shape({
   registrationQuestions: yup.mixed(),
   feedbackQuestions: yup.mixed(),
})

const atsJobShape = yup.object().shape({
   groupId: yup.string().required(),
   integrationId: yup.string().required(),
   jobId: yup.string().required(),
   name: yup.string().required(),
})

const customJobShape = yup.object().shape({
   id: yup.string().required(),
   groupId: yup.string().required(),
   title: yup.string().required(),
   description: yup.string().required(),
   jobType: yup.string().required(),
   postingUrl: yup.string().required(),
   deleted: yup.bool(),
})

const livestreamFormJobsTabSchema = yup.object().shape({
   jobs: yup.array().of(atsJobShape),
   customJobs: yup.array().of(customJobShape),
})

const livestreamFormValidationSchema = yup.object().shape({
   general: livestreamFormGeneralTabSchema,
   speakers: livestreamFormSpeakersTabSchema,
   questions: livestreamFormQuestionsTabSchema,
   jobs: livestreamFormJobsTabSchema,
})

export {
   livestreamFormGeneralTabSchema,
   livestreamFormJobsTabSchema,
   livestreamFormQuestionsTabSchema,
   livestreamFormSpeakersTabSchema,
   livestreamFormValidationSchema,
}
