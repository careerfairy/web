import { UpdateCreatorData } from "@careerfairy/shared-lib/groups/creators"
import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import {
   EventRating,
   LivestreamEvent,
   LivestreamGroupQuestionsMap,
} from "@careerfairy/shared-lib/livestreams"

export type LivestreamFormGeneralTabValues = {
   title: string
   hidden: boolean
   company?: string
   companyId?: string
   companyLogoUrl?: string
   backgroundImageUrl: string
   startDate: Date
   duration: number
   language: {
      code: string
      name: string
      shortName: string
   }
   summary: string
   reasonsToJoin: string[]
   categoriesId: string[]
   targetCountries: string[]
   targetUniversities: string[]
   targetFieldsOfStudy: FieldOfStudy[]
   targetLevelsOfStudy: LevelOfStudy[]
}

export type LivestreamFormSpeakersTabValues = {
   speakers: Partial<UpdateCreatorData>[]
}

export type LivestreamFormQuestionsTabValues = {
   registrationQuestions: LivestreamGroupQuestionsMap
   feedbackQuestions: EventRating[]
}

export type LivestreamFormJobsTabValues = {
   jobs: LivestreamEvent["jobs"]
}

export type LivestreamFormValues = LivestreamFormGeneralTabValues &
   LivestreamFormSpeakersTabValues &
   LivestreamFormQuestionsTabValues &
   LivestreamFormJobsTabValues
