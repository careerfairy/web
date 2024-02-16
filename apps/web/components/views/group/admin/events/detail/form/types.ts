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
import { GroupOption } from "@careerfairy/shared-lib/groups"

export type LivestreamFormGeneralTabValues = {
   title: string
   hidden: boolean
   company?: string
   companyId?: string
   companyLogoUrl?: string
   backgroundImageUrl: string
   startDate: Date
   duration: number
   language: string
   summary: string
   reasonsToJoin: string[]
   categories: GroupOption[]
   targetCountries: GroupOption[]
   targetUniversities: GroupOption[]
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

export type LivestreamFormValues = {
   general: LivestreamFormGeneralTabValues
   speakers: LivestreamFormSpeakersTabValues
   questions: LivestreamFormQuestionsTabValues
   jobs: LivestreamFormJobsTabValues
}
