import { TagsLookup } from "@careerfairy/shared-lib/constants/tags"
import {
   PublicCustomJob,
   pickPublicDataFromCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group, GroupQuestion } from "@careerfairy/shared-lib/groups"
import { Creator, CreatorRoles } from "@careerfairy/shared-lib/groups/creators"
import { LivestreamEvent, Speaker } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { CircularProgress } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useGroupCreators from "components/custom-hook/creator/useGroupCreators"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import { Formik } from "formik"
import { ReactNode } from "react"
import { useGroupQuestions } from "../useGroupQuestions"
import { getFieldsOfStudyWithoutOtherOption } from "./commons"
import {
   LivestreamFormGeneralTabValues,
   LivestreamFormJobsTabValues,
   LivestreamFormQuestionsTabValues,
   LivestreamFormSpeaker,
   LivestreamFormSpeakersTabValues,
   LivestreamFormValues,
} from "./types"
import { livestreamFormValidationSchema } from "./validationSchemas"
import { FeedbackQuestionFormValues } from "./views/questions/commons"
import { useFeedbackQuestions } from "./views/questions/useFeedbackQuestions"

const formGeneralTabInitialValues: LivestreamFormGeneralTabValues = {
   title: "",
   hidden: false,
   company: "",
   companyLogoUrl: "",
   backgroundImageUrl: "",
   startDate: null,
   duration: null,
   language: null,
   summary: "",
   reasonsToJoin: [],
   businessFunctionsTagIds: [],
   contentTopicsTagIds: [],
   targetCountries: [],
   targetUniversities: [],
   targetFieldsOfStudy: [],
   targetLevelsOfStudy: [],
   groupIds: [],
}

const formSpeakersTabInitialValues: LivestreamFormSpeakersTabValues = {
   values: [],
   options: [],
   creatorsIds: [],
}

const formQuestionsTabInitialValues: LivestreamFormQuestionsTabValues = {
   registrationQuestions: {
      values: [],
      options: [],
   },
   feedbackQuestions: [],
   hosts: [],
}

const formJobsTabInitialValues: LivestreamFormJobsTabValues = {
   jobs: [],
   customJobs: [],
}

const formInitialValues: LivestreamFormValues = {
   general: { ...formGeneralTabInitialValues },
   speakers: { ...formSpeakersTabInitialValues },
   questions: { ...formQuestionsTabInitialValues },
   jobs: { ...formJobsTabInitialValues },
}

const mapSpeakerToCreator = (speaker: Speaker): Creator => {
   return {
      id: speaker.id,
      groupId: speaker.groupId,
      documentType: "groupCreator",
      firstName: speaker.firstName || null,
      lastName: speaker.lastName || null,
      position: speaker.position || null,
      email: speaker.email || null,
      avatarUrl: speaker.avatar || null,
      createdAt: null,
      updatedAt: null,
      linkedInUrl: speaker.linkedInUrl || "",
      story: speaker.background || null,
      roles: speaker.roles || [CreatorRoles.Speaker],
   }
}

const unionCreatorsAndSpeakers = (
   creators: Creator[],
   speakers: Speaker[]
): LivestreamFormSpeaker[] => {
   const extendedCreators = creators.map((creator) => {
      return {
         ...creator,
         isCreator: true,
      }
   })

   const mergedArray = [
      ...extendedCreators,
      ...speakers.map(mapSpeakerToCreator),
   ]

   const uniqueMap = new Map<string, Creator>()

   mergedArray.forEach((item) => {
      const key = item.id
      if (!uniqueMap.has(key)) {
         uniqueMap.set(key, item)
      }
   })

   return Array.from(uniqueMap.values())
}

const buildRegistrationQuestions = (
   groupQuestionsMap: LivestreamEvent["groupQuestionsMap"],
   isAdmin: boolean,
   group: { groupId: string }
): LivestreamFormQuestionsTabValues["registrationQuestions"]["values"] => {
   if (!isAdmin && !groupQuestionsMap[group.groupId]) {
      return []
   }

   const filteredGroupQuestionsMap = isAdmin
      ? groupQuestionsMap
      : { [group.groupId]: groupQuestionsMap[group.groupId] }

   return Object.keys(filteredGroupQuestionsMap || {}).flatMap((groupId) => {
      const livestreamQuestionMap = filteredGroupQuestionsMap[groupId]
      const questions = Object.values(livestreamQuestionMap?.questions)?.map(
         (question) => {
            const { groupId, groupName, universityCode } = livestreamQuestionMap
            return {
               groupId,
               groupName,
               universityCode,
               ...question,
            }
         }
      )

      return questions
   })
}

const buildRegistrationQuestionOptions = (
   groupQuestions: GroupQuestion[],
   group: Group
): LivestreamFormQuestionsTabValues["registrationQuestions"]["options"] => {
   return groupQuestions.map((question) => ({
      ...question,
      groupId: group.id,
      groupName: group.universityName,
      universityCode: group.universityCode,
   }))
}

type ConvertLivestreamObjectToFormArgs = {
   livestream: LivestreamEvent
   group: Group
   groupQuestions: GroupQuestion[]
   feedbackQuestions: FeedbackQuestionFormValues[]
   customJobs: PublicCustomJob[]
   creators: Creator[]
   userData: UserData
}

const convertLivestreamObjectToForm = ({
   livestream,
   group,
   groupQuestions,
   feedbackQuestions,
   customJobs,
   creators,
   userData,
}: ConvertLivestreamObjectToFormArgs): LivestreamFormValues => {
   const valuesReducer = <T,>(values: T) =>
      Object.keys(values).reduce(
         (acc, key) =>
            key in livestream ? { ...acc, [key]: livestream[key] } : acc,
         values
      )

   // Addressing edge cases one by one
   const general: LivestreamFormGeneralTabValues = valuesReducer(
      formGeneralTabInitialValues
   )

   if (general.companyLogoUrl === "") {
      general.companyLogoUrl = group?.universityCode
         ? formGeneralTabInitialValues.companyLogoUrl
         : group?.logoUrl || formGeneralTabInitialValues.companyLogoUrl
   }

   if (general.backgroundImageUrl === "") {
      general.backgroundImageUrl = group?.universityCode
         ? formGeneralTabInitialValues.backgroundImageUrl
         : group?.bannerImageUrl ||
           formGeneralTabInitialValues.backgroundImageUrl
   }

   general.language =
      livestream.language || formGeneralTabInitialValues.language

   // This field was originally named "start" and it's now "startDate"
   general.startDate =
      livestream.start.toDate() || formGeneralTabInitialValues.startDate

   general.isDraft = livestream.isDraft

   // This is to ensure backwards compatibility
   // Previously was a single field (i.e. a single string) and now it's an array of strings
   if (livestream.reasonsToJoinLivestream) {
      if (
         !livestream.reasonsToJoinLivestream_v2 ||
         livestream.reasonsToJoinLivestream_v2?.length === 0
      ) {
         general.reasonsToJoin = [
            livestream.reasonsToJoinLivestream,
            undefined,
            undefined,
         ]
      } else {
         general.reasonsToJoin =
            livestream.reasonsToJoinLivestream_v2 ||
            formGeneralTabInitialValues.reasonsToJoin
      }
   } else {
      general.reasonsToJoin =
         livestream.reasonsToJoinLivestream_v2 ||
         formGeneralTabInitialValues.reasonsToJoin
   }

   general.targetFieldsOfStudy = getFieldsOfStudyWithoutOtherOption(
      general.targetFieldsOfStudy
   )

   general.businessFunctionsTagIds = (
      livestream.businessFunctionsTagIds ||
      formGeneralTabInitialValues.businessFunctionsTagIds
   ).map((id) => {
      return TagsLookup[id]
   })
   general.contentTopicsTagIds = (
      livestream.contentTopicsTagIds ||
      formGeneralTabInitialValues.contentTopicsTagIds
   ).map((id) => {
      return TagsLookup[id]
   })
   // This is to ensure backwards compatibility
   const filteredSpeakers = livestream.speakers.filter(
      (speaker) => speaker.firstName && speaker.lastName
   )

   const mappedSpeakers = filteredSpeakers.map(mapSpeakerToCreator)

   return {
      general: general,
      speakers: {
         values: livestream.speakers ? mappedSpeakers : [],
         options: unionCreatorsAndSpeakers(creators, filteredSpeakers),
         creatorsIds: livestream.creatorsIds,
      },
      questions: {
         registrationQuestions: {
            values: buildRegistrationQuestions(
               livestream.groupQuestionsMap,
               userData.isAdmin,
               group
            ),
            options: buildRegistrationQuestionOptions(groupQuestions, group),
         },
         feedbackQuestions:
            feedbackQuestions ||
            formQuestionsTabInitialValues.feedbackQuestions,
         hosts: formQuestionsTabInitialValues.hosts,
      },
      jobs: {
         jobs: livestream.jobs || formJobsTabInitialValues.jobs,
         customJobs: customJobs.map(pickPublicDataFromCustomJob),
      } as LivestreamFormJobsTabValues,
   }
}

type Props = {
   livestream: LivestreamEvent
   group: Group
   children: ReactNode
}

const LivestreamFormikProvider = ({ livestream, group, children }: Props) => {
   const { userData } = useAuth()
   const { data: creators } = useGroupCreators(group?.id)
   const { groupQuestions, questionsLoaded } = useGroupQuestions(group?.id)
   const { feedbackQuestions } = useFeedbackQuestions(
      livestream.id,
      livestream.isDraft ? "draftLivestreams" : "livestreams"
   )
   const initialSelectedCustomJobs = useGroupCustomJobs(group?.id, {
      livestreamId: livestream?.id,
      includePermanentlyExpired: true,
   })

   const formValues: LivestreamFormValues = livestream
      ? convertLivestreamObjectToForm({
           livestream,
           group,
           groupQuestions,
           feedbackQuestions,
           customJobs: initialSelectedCustomJobs,
           creators,
           userData,
        })
      : formInitialValues

   if (!questionsLoaded) {
      return <CircularProgress />
   }

   return (
      <Formik<LivestreamFormValues>
         initialValues={formValues}
         onSubmit={undefined}
         validationSchema={livestreamFormValidationSchema}
      >
         {children}
      </Formik>
   )
}

export default LivestreamFormikProvider
