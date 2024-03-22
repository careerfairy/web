import {
  PublicCustomJob,
  pickPublicDataFromCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups"
import { Creator, CreatorRoles } from "@careerfairy/shared-lib/groups/creators"
import { Interest } from "@careerfairy/shared-lib/interests"
import { LivestreamEvent, Speaker } from "@careerfairy/shared-lib/livestreams"
import useGroupCreators from "components/custom-hook/creator/useGroupCreators"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import { useInterests } from "components/custom-hook/useCollection"
import { Formik } from "formik"
import { FC, ReactNode } from "react"
import {
  LivestreamFormGeneralTabValues,
  LivestreamFormJobsTabValues,
  LivestreamFormQuestionsTabValues,
  LivestreamFormSpeakersTabValues,
  LivestreamFormValues,
} from "./types"
import { livestreamFormValidationSchema } from "./validationSchemas"
import { LivestreamCreator } from "./views/questions/commons"

const formGeneralTabInitialValues: LivestreamFormGeneralTabValues = {
   title: "",
   hidden: false,
   company: "",
   companyLogoUrl: "",
   backgroundImageUrl: "",
   startDate: null,
   duration: null,
   language: "",
   summary: "",
   reasonsToJoin: [],
   categories: [],
   targetCountries: [],
   targetUniversities: [],
   targetFieldsOfStudy: [],
   targetLevelsOfStudy: [],
   groupIds: [],
}

const formSpeakersTabInitialValues: LivestreamFormSpeakersTabValues = {
   values: [],
   options: [],
}

const formQuestionsTabInitialValues: LivestreamFormQuestionsTabValues = {
   registrationQuestions: [],
   feedbackQuestions: [],
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

type ConvertLivestreamObjectToFormArgs = {
   livestream: LivestreamEvent
   group: Group
   existingInterests: Interest[]
   customJobs: PublicCustomJob[]
   creators: Creator[]
}

/*
 * The email is the id only in the client-side
 * This is to ensure backwards compatibility
 * Old speaker object id's format is UID
 * while Creators objects ids' are firestore default format
 */
function mapCreatorToLivestreamCreator(creator: Creator): LivestreamCreator {
   return {
      ...creator,
      originalId: creator.id,
      id: creator.email,
   }
}

/*
 * The email is the id only in the client-side
 * This is to ensure backwards compatibility
 * Old speaker object id's format is UID
 * while Creators objects ids' are firestore default format
 */
function mapSpeakerToCreator(speaker: Speaker): LivestreamCreator {
   return {
      originalId: speaker.id,
      id: speaker.id,
      groupId: null,
      documentType: "groupCreator",
      firstName: speaker.firstName,
      lastName: speaker.lastName,
      position: speaker.position,
      email: speaker.email,
      avatarUrl: speaker.avatar,
      createdAt: null,
      updatedAt: null,
      linkedInUrl: "",
      story: speaker.background,
      roles: [CreatorRoles.Speaker],
   }
}

function unionCreatorsAndSpeakers(
   creators: LivestreamCreator[],
   speakers: Speaker[]
): LivestreamCreator[] {
   const mergedArray = [...creators, ...speakers.map(mapSpeakerToCreator)]

   const uniqueMap = new Map<string, LivestreamCreator>()

   mergedArray.forEach((item) => {
      const key = item.id || item.email
      if (!uniqueMap.has(key)) {
         uniqueMap.set(key, item)
      }
   })

   return Array.from(uniqueMap.values())
}

const convertLivestreamObjectToForm = ({
   livestream,
   group,
   existingInterests,
   customJobs,
   creators,
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

   // Handle univesrity edge case
   general.company = group?.universityCode
      ? formGeneralTabInitialValues.company
      : group?.universityName || formGeneralTabInitialValues.company

   general.companyLogoUrl = group?.universityCode
      ? formGeneralTabInitialValues.companyLogoUrl
      : group?.logoUrl || formGeneralTabInitialValues.companyLogoUrl

   general.backgroundImageUrl = group?.universityCode
      ? formGeneralTabInitialValues.backgroundImageUrl
      : group?.bannerImageUrl || formGeneralTabInitialValues.backgroundImageUrl

   // Simple name remapping s
   general.categories = existingInterests.filter((interest) =>
      livestream.interestsIds.includes(interest.id)
   )

   general.language =
      livestream.language?.code || formGeneralTabInitialValues.language

   // This field was originally named "start" and it's now "startDate"
   general.startDate =
      livestream.start.toDate() || formGeneralTabInitialValues.startDate

   // This is to ensure backwards compatibility
   // Previously was a single field (i.e. a single string) and now it's an array of strings
   general.reasonsToJoin = livestream.reasonsToJoinLivestream
      ? [livestream.reasonsToJoinLivestream, undefined, undefined]
      : livestream.reasonsToJoinLivestream_v2

   return {
      general: general,
      speakers: {
         values: livestream.speakers.map(mapSpeakerToCreator),
         options: unionCreatorsAndSpeakers(
            creators.map(mapCreatorToLivestreamCreator),
            livestream.speakers
         ),
      },
      questions: valuesReducer(formQuestionsTabInitialValues),
      jobs: {
         jobs: livestream.jobs,
         customJobs: customJobs.map(pickPublicDataFromCustomJob),
      } as LivestreamFormJobsTabValues,
   }
}

type Props = {
   livestream: LivestreamEvent
   group: Group
   children: ReactNode
}

const LivestreamFormikProvider: FC<Props> = ({
   livestream,
   group,
   children,
}) => {
   const { data: existingInterests } = useInterests()
   const initialSelectedCustomJobs = useGroupCustomJobs(group?.id, {
      livestreamId: livestream?.id,
   })
   const { data: creators } = useGroupCreators(group?.id)

   const formValues: LivestreamFormValues = livestream
      ? convertLivestreamObjectToForm({
           livestream,
           group,
           existingInterests,
           customJobs: initialSelectedCustomJobs,
           creators,
        })
      : formInitialValues

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
