import { LivestreamLanguage } from "@careerfairy/shared-lib/livestreams"
import { UPCOMING_STREAM_THRESHOLD_MINUTES } from "@careerfairy/shared-lib/livestreams/constants"
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

const language: yup.SchemaOf<LivestreamLanguage> = yup.object().shape({
   code: yup.string().required(),
   name: yup.string().required(),
   shortName: yup.string().required(),
})

const livestreamFormGeneralTabSchema: yup.SchemaOf<LivestreamFormGeneralTabValues> =
   yup.object().shape({
      id: yup.string(),
      title: yup
         .string()
         .required(REQUIRED_FIELD_MESSAGE)
         .min(10, getMinCharactersMessage("title", 10)),
      hidden: yup.bool().notRequired(),
      isDraft: yup.bool().notRequired(),
      company: yup
         .string()
         .test(
            "is-undefined-or-empty",
            REQUIRED_FIELD_MESSAGE,
            (value) => value !== undefined && value !== ""
         )
         .test(
            "min-length-requirement",
            "Company name must have at least 3 characters",
            (value) => value === null || value?.length > 2
         )
         .notRequired(),
      companyLogoUrl: yup.string().notRequired(),
      backgroundImageUrl: yup
         .string()
         .required("Please provide a banner image"),
      startDate: yup
         .date()
         .nullable()
         .test("past-live-stream-check", null, function (value, context) {
            const {
               path,
               parent,
               createError,
               // @ts-ignore
               originalValue,
            } = context

            const wasPastLivestream =
               originalValue &&
               !parent.isDraft &&
               new Date(originalValue) <=
                  new Date(
                     Date.now() - 1000 * 60 * UPCOMING_STREAM_THRESHOLD_MINUTES
                  )

            if (wasPastLivestream) {
               return true
            } else if (value && new Date(value) <= new Date(Date.now())) {
               return createError({
                  path,
                  message: "Choose a date in the future",
               })
            }

            return true
         })
         .required(REQUIRED_FIELD_MESSAGE),
      duration: yup.number().nullable().required(REQUIRED_FIELD_MESSAGE),
      language: language.required(REQUIRED_FIELD_MESSAGE),
      summary: yup
         .string()
         .required(REQUIRED_FIELD_MESSAGE)
         .min(50, getMinCharactersMessage("Live stream summary", 50)),
      reasonsToJoin: yup
         .array()
         .min(3)
         .transform((value, originalValue) => {
            if (value || originalValue) {
               return [
                  value?.[0] || originalValue?.[0],
                  value?.[1] || originalValue?.[1],
                  value?.[2] || originalValue?.[2],
               ]
            }
            return [undefined, undefined, undefined]
         })
         .of(
            yup
               .string()
               .min(20, "Minimum of 20 characters")
               .required(REQUIRED_FIELD_MESSAGE)
         )
         .test("length-requirement", null, (value) => {
            return value.filter(Boolean).length > 0
         }),
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
      contentTopicsTagIds: yup
         .array()
         .of(groupOptionShape)
         .required()
         .min(1, getSelectAtLeastOneMessage("presented business function")),
      businessFunctionsTagIds: yup
         .array()
         .of(groupOptionShape)
         .required()
         .min(1, getSelectAtLeastOneMessage("live stream content topic")),
   })

const livestreamFormSpeakersTabValuesSchema = yup
   .array()
   .min(1, "Add at least one speaker")
   .test(
      "any-legacy-speaker-without-required-fields",
      "Add the missing fields of highlighted speakers",
      (value) => {
         const speakersWithMissingFields = value?.filter(
            (item) => Boolean(item.email) === false
         )
         return speakersWithMissingFields?.length === 0
      }
   )

const livestreamFormSpeakersTabSchema = yup.object().shape({
   values: livestreamFormSpeakersTabValuesSchema,
})

const livestreamFormQuestionsTabSchema = yup.object().shape({
   registrationQuestions: yup.object().shape({
      values: yup.mixed(),
      options: yup.mixed(),
   }),
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
   jobType: yup.string().nullable(),
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
