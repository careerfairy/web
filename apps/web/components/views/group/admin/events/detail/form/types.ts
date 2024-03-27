import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { GroupOption, GroupQuestion } from "@careerfairy/shared-lib/groups"
import {
   EventRating,
   LivestreamEvent,
   LivestreamGroupQuestions,
} from "@careerfairy/shared-lib/livestreams"
import { LivestreamCreator } from "./views/questions/commons"

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

export type RegistrationQuestion = Omit<LivestreamGroupQuestions, "questions"> &
   GroupQuestion

export type LivestreamFormQuestionsTabValues = {
   registrationQuestions: RegistrationQuestion[]
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
