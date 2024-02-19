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
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"

export type LivestreamFormGeneralTabValues = {
   id: string
   title: string
   hidden: boolean
   company?: string
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
   groupIds: string[]
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
   customJobs: PublicCustomJob[]
}

export type LivestreamFormValues = {
   general: LivestreamFormGeneralTabValues
   speakers: LivestreamFormSpeakersTabValues
   questions: LivestreamFormQuestionsTabValues
   jobs: LivestreamFormJobsTabValues
}
