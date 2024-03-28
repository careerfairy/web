import {
   PublicCustomJob,
   pickPublicDataFromCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Interest } from "@careerfairy/shared-lib/interests"
import { LivestreamEvent, Speaker } from "@careerfairy/shared-lib/livestreams"
import useGroupCustomJobs from "components/custom-hook/custom-job/useGroupCustomJobs"
import { useInterests } from "components/custom-hook/useCollection"
import { Form, Formik } from "formik"
import { FC } from "react"
import { TAB_VALUES } from "../navigation/LivestreamAdminDetailTopBarNavigation"
import {
   LivestreamFormGeneralTabValues,
   LivestreamFormSpeakersTabValues,
   LivestreamFormQuestionsTabValues,
   LivestreamFormJobsTabValues,
   LivestreamFormValues,
} from "./types"
import { livestreamFormValidationSchema } from "./validationSchemas"
import LivestreamFormGeneralStep from "./views/general"
import LivestreamFormSpeakersStep from "./views/speakers"
import LivestreamFormQuestionsStep from "./views/questions"
import LivestreamFormJobsStep from "./views/jobs"
import { sxStyles } from "@careerfairy/shared-ui"
import { CircularProgress, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupCreators from "components/custom-hook/creator/useGroupCreators"
import { Creator, CreatorRoles } from "@careerfairy/shared-lib/groups/creators"
import { LivestreamCreator } from "./views/questions/commons"

const styles = sxStyles({
   root: {
      padding: "24px",
   },
})

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
      id: speaker.email,
      groupId: null,
      documentType: "groupCreator",
      firstName: speaker.firstName,
      lastName: speaker.lastName,
      position: speaker.position,
      email: speaker.email,
      avatarUrl: speaker.avatar,
      createdAt: null,
      updatedAt: null,
      linkedInUrl: null,
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
   groupId: string
   tabValue: TAB_VALUES
}

const LivestreamCreationForm: FC<Props> = ({
   livestream,
   groupId,
   tabValue,
}) => {
   const { data: existingInterests } = useInterests()
   const initialSelectedCustomJobs = useGroupCustomJobs(groupId, {
      livestreamId: livestream?.id,
   })
   const { data: creators } = useGroupCreators(groupId)

   const formValues: LivestreamFormValues = livestream
      ? convertLivestreamObjectToForm({
           livestream,
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
         <Form>
            <Stack sx={styles.root} rowGap={2}>
               {tabValue == TAB_VALUES.GENERAL && <LivestreamFormGeneralStep />}
               {tabValue == TAB_VALUES.SPEAKERS && (
                  <SuspenseWithBoundary fallback={<CircularProgress />}>
                     <LivestreamFormSpeakersStep />
                  </SuspenseWithBoundary>
               )}
               {tabValue == TAB_VALUES.QUESTIONS && (
                  <LivestreamFormQuestionsStep />
               )}
               {tabValue == TAB_VALUES.JOBS && <LivestreamFormJobsStep />}
            </Stack>
         </Form>
      </Formik>
   )
}

export default LivestreamCreationForm
