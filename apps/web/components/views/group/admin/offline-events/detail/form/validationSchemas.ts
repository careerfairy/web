import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { UniversityOption } from "@careerfairy/shared-lib/offline-events/offline-events"
import * as yup from "yup"

const REQUIRED_FIELD_MESSAGE = "This is a required field"

const getMinCharactersMessage = (fieldName: string, numCharacters: number) =>
   `The ${fieldName} needs to have at least ${numCharacters} characters`

const offlineEventFormGeneralTabSchema = yup.object().shape({
   title: yup
      .string()
      .required(REQUIRED_FIELD_MESSAGE)
      .min(10, getMinCharactersMessage("title", 10)),
   description: yup
      .string()
      .required(REQUIRED_FIELD_MESSAGE)
      .min(50, getMinCharactersMessage("description", 50)),
   city: yup
      .object()
      .shape({
         name: yup.string().required(),
         id: yup.string().required(),
      })
      .required(REQUIRED_FIELD_MESSAGE),
   street: yup.string().required(REQUIRED_FIELD_MESSAGE),
   targetAudience: yup.object().shape({
      universities: yup
         .array<UniversityOption>()
         .required()
         .min(1, "Please select at least one university"),
      levelOfStudies: yup
         .array<LevelOfStudy>()
         .required()
         .min(1, "Please select at least one level of study"),
      fieldOfStudies: yup
         .array<FieldOfStudy>()
         .required()
         .min(1, "Please select at least one field of study"),
   }),
   registrationUrl: yup
      .string()
      .url("Please enter a valid URL")
      .required(REQUIRED_FIELD_MESSAGE),
   startAt: yup.date().required(REQUIRED_FIELD_MESSAGE),
   backgroundImageUrl: yup.string().url("Please enter a valid URL").optional(),
   hidden: yup.bool().optional(),
})

const offlineEventFormValidationSchema = yup.object().shape({
   general: offlineEventFormGeneralTabSchema,
})

export { offlineEventFormGeneralTabSchema, offlineEventFormValidationSchema }
