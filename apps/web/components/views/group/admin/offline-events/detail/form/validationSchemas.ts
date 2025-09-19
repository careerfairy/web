import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { UniversityOption } from "@careerfairy/shared-lib/offline-events/offline-events"
import { AddressAutofillFeatureSuggestion } from "@mapbox/search-js-core"
import { DateTime } from "luxon"
import * as yup from "yup"

const REQUIRED_FIELD_MESSAGE = "This is a required field"

const getMinCharactersMessage = (fieldName: string, numCharacters: number) =>
   `The ${fieldName} needs to have at least ${numCharacters} characters`

// MapBoxLocationData schema
const mapBoxLocationDataSchema = yup.object().shape({
   geometry: yup
      .object()
      .shape({
         type: yup.string().oneOf(["Point"]).required(),
         coordinates: yup
            .array()
            .of(yup.number().required())
            .length(2)
            .required(),
      })
      .required(),
   properties: yup
      .object()
      .shape({
         feature_name: yup.string().required(),
         description: yup.string().required(),
         mapbox_id: yup.string().required(),
         language: yup.string().required(),
         address: yup.string().optional(),
         full_address: yup.string().optional(),
         address_line1: yup.string().optional(),
         address_line2: yup.string().optional(),
         address_line3: yup.string().optional(),
         address_level1: yup.string().optional(),
         address_level2: yup.string().optional(),
         address_level3: yup.string().optional(),
         country: yup.string().optional(),
         country_code: yup.string().optional(),
         postcode: yup.string().optional(),
         metadata: yup
            .object()
            .shape({
               iso_3166_1: yup.string().required(),
            })
            .required(),
         place_name: yup.string().optional(),
         place_type: yup.array().of(yup.string()).required(),
         maki: yup.string().optional(),
         action: yup
            .object()
            .shape({
               id: yup.string().optional(),
            })
            .required(),
         _source: yup.string().optional(),
      })
      .required(),
   type: yup.string().oneOf(["Feature"]).required(),
   id: yup.string().optional(),
   bbox: yup.array().of(yup.number()).optional(),
}) as yup.SchemaOf<AddressAutofillFeatureSuggestion>

const offlineEventFormGeneralTabSchema = yup.object().shape({
   title: yup
      .string()
      .required(REQUIRED_FIELD_MESSAGE)
      .min(10, getMinCharactersMessage("title", 10)),
   description: yup
      .string()
      .required(REQUIRED_FIELD_MESSAGE)
      .min(50, getMinCharactersMessage("description", 50)),
   street: mapBoxLocationDataSchema
      .required("Please select an address")
      .nullable(),
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
   startAt: yup
      .date()
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
