import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { UniversityOption } from "@careerfairy/shared-lib/offline-events/offline-events"
import { AddressAutofillFeatureSuggestion } from "@mapbox/search-js-core"

export type OfflineEventFormGeneralTabValues = {
   title: string
   description: string
   street: AddressAutofillFeatureSuggestion
   targetAudience: {
      universities: UniversityOption[]
      levelOfStudies: LevelOfStudy[]
      fieldOfStudies: FieldOfStudy[]
   }
   registrationUrl: string
   startAt: Date
   backgroundImageUrl: string
   hidden: boolean
}

export type OfflineEventFormValues = {
   general: OfflineEventFormGeneralTabValues
}

export const TAB_VALUES = {
   GENERAL: "general",
} as const

export type TAB_VALUES = (typeof TAB_VALUES)[keyof typeof TAB_VALUES]
