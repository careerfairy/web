import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { UniversityOption } from "@careerfairy/shared-lib/offline-events/offline-events"
import { DateTime } from "luxon"
import * as yup from "yup"

const REQUIRED_FIELD_MESSAGE = "This is a required field"

const getMinCharactersMessage = (fieldName: string, numCharacters: number) =>
   `The ${fieldName} needs to have at least ${numCharacters} characters`

// MapBoxLocationData schema - updated to match OfflineEventAddress type
const mapBoxAddressDataSchema = yup.object().shape({
   fullAddress: yup.string().nullable(),
   city: yup.string().nullable(),
   state: yup.string().nullable(),
   stateCode: yup.string().nullable(),
   country: yup.string().nullable(),
   countryCode: yup.string().nullable(),
   postcode: yup.string().nullable(),
   placeName: yup.string().nullable(),
   street: yup.string().nullable(),
   streetNumber: yup.string().nullable(),
   address_level1: yup.string().nullable(),
   address_level2: yup.string().nullable(),
   geoPoint: yup
      .object()
      .shape({
         latitude: yup.number().nullable(),
         longitude: yup.number().nullable(),
      })
      .nullable(),
   geoHash: yup.string().nullable(),
})

const offlineEventFormGeneralTabSchema = yup.object().shape({
   title: yup
      .string()
      .required(REQUIRED_FIELD_MESSAGE)
      .min(10, getMinCharactersMessage("title", 10)),
   description: yup
      .string()
      .required(REQUIRED_FIELD_MESSAGE)
      .min(50, getMinCharactersMessage("description", 50)),
   address: mapBoxAddressDataSchema
      .required("Please select an address")
      .nullable(),
   targetAudience: yup.object().shape({
      universities: yup.array<UniversityOption>().optional(),
      levelOfStudies: yup.array<LevelOfStudy>().optional(),
      fieldOfStudies: yup.array<FieldOfStudy>().optional(),
   }),
   registrationUrl: yup
      .string()
      .url("Please enter a valid URL")
      .required(REQUIRED_FIELD_MESSAGE),
   startAt: yup
      .date()
      .nullable()
      .min(
         DateTime.now().plus({ hour: 1 }).toJSDate(),
         "Please select a date in the future (+1 hour)"
      )
      .required(REQUIRED_FIELD_MESSAGE),
   backgroundImageUrl: yup.string().url("Please enter a valid URL").optional(),
   hidden: yup.bool().optional(),
})

const offlineEventFormValidationSchema = yup.object().shape({
   general: offlineEventFormGeneralTabSchema,
})

export { offlineEventFormGeneralTabSchema, offlineEventFormValidationSchema }
