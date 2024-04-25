import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import {
   EventRating,
   LivestreamEvent,
   LivestreamGroupQuestion,
} from "@careerfairy/shared-lib/livestreams"
import { GroupOption } from "@careerfairy/shared-lib/groups"
import { LivestreamCreator } from "./views/questions/commons"
import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"

export type LivestreamFormGeneralTabValues = {
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
   values: LivestreamCreator[]
   options: LivestreamCreator[]
}

export type LivestreamFormQuestionsTabValues = {
   registrationQuestions: LivestreamGroupQuestion[]
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
