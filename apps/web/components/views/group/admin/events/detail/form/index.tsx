import {
   PublicCustomJob,
   pickPublicDataFromCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Interest } from "@careerfairy/shared-lib/interests"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
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
import { Stack } from "@mui/material"

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
   speakers: [],
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
}

const convertLivestreamObjectToForm = ({
   livestream,
   existingInterests,
   customJobs,
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
      speakers: valuesReducer(formSpeakersTabInitialValues),
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

   const formValues: LivestreamFormValues = livestream
      ? convertLivestreamObjectToForm({
           livestream,
           existingInterests,
           customJobs: initialSelectedCustomJobs,
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
                  <LivestreamFormSpeakersStep
                     values={formSpeakersTabInitialValues}
                  />
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
