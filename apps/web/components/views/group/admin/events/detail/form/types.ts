import { PublicCustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { Group, GroupOption } from "@careerfairy/shared-lib/groups"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import {
   LivestreamEvent,
   LivestreamLanguage,
} from "@careerfairy/shared-lib/livestreams"
import {
   FeedbackQuestionFormValues,
   RegistrationQuestionFormValues,
} from "./views/questions/commons"

export type LivestreamFormSpeaker = Creator & {
   isCreator?: boolean
}

export type LivestreamFormGeneralTabValues = {
   title: string
   hidden: boolean
   company?: string
   companyLogoUrl?: string
   backgroundImageUrl: string
   startDate: Date
   duration: number
   language: LivestreamLanguage
   summary: string
   reasonsToJoin: string[]
   businessFunctionsTagIds: GroupOption[]
   contentTopicsTagIds: GroupOption[]
   targetCountries: GroupOption[]
   targetUniversities: GroupOption[]
   targetFieldsOfStudy: FieldOfStudy[]
   targetLevelsOfStudy: LevelOfStudy[]
   groupIds: string[]
   isDraft?: boolean
}

export type LivestreamFormSpeakersTabValues = {
   values: Creator[]
   options: LivestreamFormSpeaker[]
   creatorsIds: Creator["id"][]
}

export type LivestreamFormQuestionsTabValues = {
   registrationQuestions: {
      values: RegistrationQuestionFormValues[]
      options: RegistrationQuestionFormValues[]
   }
   feedbackQuestions: FeedbackQuestionFormValues[]
   hosts: Group[]
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
