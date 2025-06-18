import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import {
   LivestreamEvent,
   LivestreamGroupQuestions,
   LivestreamGroupQuestionsMap,
   Speaker,
} from "@careerfairy/shared-lib/livestreams"
import { livestreamTriGrams } from "@careerfairy/shared-lib/utils/search"
import FirebaseService from "data/firebase/FirebaseService"
import { Timestamp } from "firebase/firestore"
import { get, has, isArray, isEqual, omit, set } from "lodash"
import { LivestreamFormQuestionsTabValues, LivestreamFormValues } from "./types"

export enum TAB_VALUES {
   GENERAL,
   SPEAKERS,
   QUESTIONS,
   JOBS,
}

export const MAX_TAB_VALUE = TAB_VALUES.JOBS

export const ESTIMATED_DURATIONS = [
   { minutes: 5, name: "5 minutes" },
   { minutes: 10, name: "10 minutes" },
   { minutes: 15, name: "15 minutes" },
   { minutes: 20, name: "20 minutes" },
   { minutes: 25, name: "25 minutes" },
   { minutes: 30, name: "30 minutes" },
   { minutes: 35, name: "35 minutes" },
   { minutes: 40, name: "40 minutes" },
   { minutes: 45, name: "45 minutes" },
   { minutes: 50, name: "50 minutes" },
   { minutes: 55, name: "55 minutes" },
   { minutes: 60, name: "1 hour" },
   { minutes: 65, name: "1 hour 5 minutes" },
   { minutes: 70, name: "1 hour 10 minutes" },
   { minutes: 75, name: "1 hour 15 minutes" },
   { minutes: 80, name: "1 hour 20 minutes" },
   { minutes: 85, name: "1 hour 25 minutes" },
   { minutes: 90, name: "1 hour 30 minutes" },
   { minutes: 95, name: "1 hour 35 minutes" },
   { minutes: 100, name: "1 hour 40 minutes" },
   { minutes: 105, name: "1 hour 45 minutes" },
   { minutes: 110, name: "1 hour 50 minutes" },
   { minutes: 115, name: "1 hour 55 minutes" },
   { minutes: 120, name: "2 hours" },
   { minutes: 125, name: "2 hours 5 minutes" },
   { minutes: 130, name: "2 hours 10 minutes" },
   { minutes: 135, name: "2 hours 15 minutes" },
   { minutes: 140, name: "2 hours 20 minutes" },
   { minutes: 145, name: "2 hours 25 minutes" },
   { minutes: 150, name: "2 hours 30 minutes" },
   { minutes: 155, name: "2 hours 35 minutes" },
   { minutes: 160, name: "2 hours 40 minutes" },
   { minutes: 165, name: "2 hours 45 minutes" },
   { minutes: 170, name: "2 hours 50 minutes" },
   { minutes: 175, name: "2 hours 55 minutes" },
   { minutes: 180, name: "3 hours" },
]

export const SELECT_ALL_ID = "select-all"
const OTHER_OPTION_ID = "other"

export const hashToColor = (id: string) => {
   if (!id) return

   let hash = 0
   for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash)
   }

   let color = "#"
   for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff
      color += ("00" + value.toString(16)).substr(-2)
   }

   return color
}

export const removeFieldOfStudyFromOptions = (
   allFieldsOfStudy: FieldOfStudy[],
   fieldOfStudyIdToRemove: FieldOfStudy["id"]
) => {
   return allFieldsOfStudy.filter(
      (field) => field.id !== fieldOfStudyIdToRemove
   )
}

export const getFieldsOfStudyWithoutOtherOption = (
   allFieldsOfStudy: FieldOfStudy[]
) => {
   return removeFieldOfStudyFromOptions(allFieldsOfStudy, OTHER_OPTION_ID)
}

const mapCreatorToSpeaker = (creator: Creator): Speaker => {
   return {
      id: creator.id,
      avatar: creator.avatarUrl,
      background: creator.story,
      firstName: creator.firstName,
      lastName: creator.lastName,
      position: creator.position,
      linkedInUrl: creator.linkedInUrl,
      roles: creator.roles,
      groupId: creator.groupId,
   }
}

const mapRegistrationQuestionsToGroupQuestionsMap = (
   registrationQuestions: LivestreamFormQuestionsTabValues["registrationQuestions"]["values"]
): Partial<LivestreamGroupQuestionsMap> => {
   const result: Partial<LivestreamGroupQuestionsMap> =
      registrationQuestions?.reduce((accumulator, currentQuestion) => {
         const groupQuestions: LivestreamGroupQuestions["questions"] =
            registrationQuestions
               .filter(
                  (question) => question.groupId === currentQuestion.groupId
               )
               .reduce((acc, question) => {
                  return {
                     ...acc,
                     [question.id]: omit(question, [
                        "groupId",
                        "groupName",
                        "universityCode",
                     ]),
                  }
               }, {})

         const universityCode = currentQuestion.universityCode
            ? { universityCode: currentQuestion.universityCode }
            : {}

         return {
            ...accumulator,
            [currentQuestion.groupId]: {
               groupId: currentQuestion.groupId,
               groupName: currentQuestion.groupName,
               ...universityCode,
               questions: groupQuestions,
            },
         }
      }, {})

   return result
}

const formValuesLivestreamEventPropertyMap = [
   ["general.title", "title"],
   ["general.hidden", "hidden"],
   ["general.company", "company"],
   ["general.companyLogoUrl", "companyLogoUrl"],
   ["general.backgroundImageUrl", "backgroundImageUrl"],
   ["general.summary", "summary"],
   ["general.startDate", "start"],
   ["general.duration", "duration"],
   ["general.language", "language"],
   ["general.reasonsToJoin", "reasonsToJoinLivestream_v2"],
   ["general.businessFunctionsTagIds", "businessFunctionsTagIds"],
   ["general.contentTopicsTagIds", "contentTopicsTagIds"],
   ["general.targetCountries", "targetCountries"],
   ["general.targetUniversities", "targetUniversities"],
   ["general.targetFieldsOfStudy", "targetFieldsOfStudy"],
   ["general.targetLevelsOfStudy", "targetLevelsOfStudy"],
   ["general.groupIds", "groupIds"],
   ["questions.registrationQuestions.values", "groupQuestionsMap"],
   ["jobs.jobs", "jobs"],
] as const

export const mapFormValuesToLivestreamObject = (
   formValues: Partial<LivestreamFormValues>,
   allFieldsOfStudy: FieldOfStudy[],
   firebaseService: FirebaseService
): Partial<LivestreamEvent> => {
   const result: Partial<LivestreamEvent> = {}

   formValuesLivestreamEventPropertyMap.forEach((mappingRule) => {
      const [fromProperty, toProperty] = mappingRule

      if (has(formValues, fromProperty)) {
         const value = get(formValues, fromProperty)
         // Sanitize values, as for various reasons arrays containing undefined can appear
         // which happens for required field which do not meet the necessary length for example
         let sanitizedValue = value
         if (isArray(value)) {
            sanitizedValue = (value as any[]).filter(Boolean)
         }

         set(result, toProperty, sanitizedValue)
      }
   })

   const mappedBusinessFunctionsTagIds =
      formValues.general.businessFunctionsTagIds?.map((tag) => tag.id) || []
   const mappedContentTopicsTagIds =
      formValues.general.contentTopicsTagIds?.map((tag) => tag.id) || []

   const creatorsIds = formValues.speakers.options
      .filter((option) => option.isCreator)
      .filter((creator) => {
         return formValues.speakers.values?.some(
            (speaker) => speaker.id === creator.id
         )
      })
      .map((creator) => creator.id)

   const mappedSpeakers = formValues.speakers.values?.map(mapCreatorToSpeaker)

   const mappedRegistrationQuestions =
      mapRegistrationQuestionsToGroupQuestionsMap(
         formValues.questions.registrationQuestions.values
      )

   if (creatorsIds.length > 0) {
      result.creatorsIds = creatorsIds
   }

   if (mappedSpeakers?.length > 0) {
      result.speakers = mappedSpeakers
   }

   if (mappedSpeakers?.length > 0) {
      result.speakers = mappedSpeakers
   }

   if (mappedSpeakers?.length > 0) {
      result.speakers = mappedSpeakers
   }

   if (mappedBusinessFunctionsTagIds.length > 0) {
      result.businessFunctionsTagIds = mappedBusinessFunctionsTagIds
   }

   if (mappedContentTopicsTagIds.length > 0) {
      result.contentTopicsTagIds = mappedContentTopicsTagIds
   }

   if (Object.keys(mappedRegistrationQuestions).length > 0) {
      result.groupQuestionsMap =
         mappedRegistrationQuestions as LivestreamGroupQuestionsMap
   }

   if (
      formValues.questions.hosts.length > 1 &&
      !isEqual(
         formValues.questions.hosts.map((host) => host.groupId).sort(),
         formValues.general.groupIds.sort()
      )
   ) {
      const otherHosts = formValues.questions.hosts
         .filter((host) => host.groupId !== formValues.general.groupIds[0])
         .map((host) => host.groupId)

      result.groupIds = [formValues.general.groupIds[0], ...otherHosts]
   }

   if (formValues.general.title) {
      result.triGrams = livestreamTriGrams(result.title, result.company)
   }

   if (formValues.jobs.customJobs || formValues.jobs.jobs) {
      result.hasJobs =
         formValues.jobs?.customJobs?.length > 0 ||
         formValues.jobs?.jobs?.length > 0
   }

   result.lastUpdated =
      firebaseService.getServerTimestamp() as unknown as Timestamp

   if (
      formValues.general.targetFieldsOfStudy &&
      (formValues.general.targetFieldsOfStudy.length == 1 ||
         formValues.general.targetFieldsOfStudy[0].id === SELECT_ALL_ID)
   ) {
      result.targetFieldsOfStudy = allFieldsOfStudy
   }

   return result
}
