import { Form, Formik } from "formik"
import { useState } from "react"
import { Box, Stack } from "@mui/material"
import { useRouter } from "next/router"
import { sxStyles } from "@careerfairy/shared-ui"
import { Interest } from "@careerfairy/shared-lib/interests"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import { useInterests } from "components/custom-hook/useCollection"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import {
   LivestreamFormGeneralTabValues,
   LivestreamFormJobsTabValues,
   LivestreamFormValues,
   LivestreamFormQuestionsTabValues,
   LivestreamFormSpeakersTabValues,
} from "../../../../../../components/views/group/admin/events/detail/form/types"
import { LivestreamButtonActions } from "components/views/admin/livestream/LivestreamButtonActions"
import LivestreamFormJobsStep from "../../../../../../components/views/group/admin/events/detail/form/views/jobs"
import LivestreamAdminDetailTopBarNavigation, {
   TAB_VALUES,
} from "../../../../../../components/views/group/admin/events/detail/navigation/LivestreamAdminDetailTopBarNavigation"
import LivestreamFetchWrapper from "../../../../../../components/views/group/admin/events/detail/LivestreamFetchWrapper"
import LivestreamFormSpeakersStep from "../../../../../../components/views/group/admin/events/detail/form/views/speakers"
import LivestreamFormGeneralStep from "../../../../../../components/views/group/admin/events/detail/form/views/general/general"
import { livestreamFormValidationSchema } from "../../../../../../components/views/group/admin/events/detail/form/validationSchemas"
import LivestreamFormQuestionsStep from "../../../../../../components/views/group/admin/events/detail/form/views/questions/questions"
import LivestreamAdminDetailBottomBarNavigation from "../../../../../../components/views/group/admin/events/detail/navigation/LivestreamAdminDetailBottomBarNavigation"

const styles = sxStyles({
   root: {
      padding: "24px",
   },
})

const formGeneralTabInitialValues: LivestreamFormGeneralTabValues = {
   title: "",
   hidden: false,
   company: "",
   companyId: "",
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
}

const formInitialValues: LivestreamFormValues = {
   general: { ...formGeneralTabInitialValues },
   speakers: { ...formSpeakersTabInitialValues },
   questions: { ...formQuestionsTabInitialValues },
   jobs: { ...formJobsTabInitialValues },
}

const convertLivestreamObjectToForm = (
   livestream: LivestreamEvent,
   existingInterests: Interest[]
): LivestreamFormValues => {
   const valuesReducer = (values) =>
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

   const questions: LivestreamFormQuestionsTabValues = {
      registrationQuestions: [],
      feedbackQuestions: [],
   }

   return {
      general: general,
      speakers: valuesReducer(formSpeakersTabInitialValues),
      questions: questions,
      jobs: valuesReducer(formJobsTabInitialValues),
   }
}

const LivestreamAdminDetailsPage = () => {
   const {
      query: { groupId, livestreamId },
   } = useRouter()
   const { data: existingInterests } = useInterests()
   const [tabValue, setTabValue] = useState(TAB_VALUES.GENERAL)
   const handleTabChange = (_, newValue) => {
      setTabValue(newValue)
   }

   return (
      <GroupDashboardLayout
         titleComponent={"Live stream Details"}
         groupId={groupId as string}
         topBarCta={<LivestreamButtonActions />} // TODO to be implemented properly in CF-527
         topBarNavigation={
            <LivestreamAdminDetailTopBarNavigation
               tabValue={tabValue}
               tabOnChange={handleTabChange}
            />
         }
         bottomBarNavigation={
            <LivestreamAdminDetailBottomBarNavigation
               currentTab={tabValue}
               changeTab={setTabValue}
            />
         }
         backgroundColor="#FDFDFD"
      >
         <DashboardHead title="CareerFairy | Editing Live Stream of " />
         <LivestreamFetchWrapper livestreamId={livestreamId as string}>
            {(livestream) => {
               const formValues: LivestreamFormValues = livestream
                  ? convertLivestreamObjectToForm(livestream, existingInterests)
                  : formInitialValues

               return (
                  <Box>
                     <Formik<LivestreamFormValues>
                        initialValues={formValues}
                        onSubmit={undefined}
                        validationSchema={livestreamFormValidationSchema}
                     >
                        <Form>
                           <Stack sx={styles.root} rowGap={2}>
                              {tabValue == TAB_VALUES.GENERAL && (
                                 <LivestreamFormGeneralStep />
                              )}
                              {tabValue == TAB_VALUES.SPEAKERS && (
                                 <LivestreamFormSpeakersStep
                                    values={formSpeakersTabInitialValues}
                                 />
                              )}
                              {tabValue == TAB_VALUES.QUESTIONS && (
                                 <LivestreamFormQuestionsStep />
                              )}
                              {tabValue == TAB_VALUES.JOBS && (
                                 <LivestreamFormJobsStep
                                    values={formJobsTabInitialValues}
                                 />
                              )}
                           </Stack>
                        </Form>
                     </Formik>
                  </Box>
               )
            }}
         </LivestreamFetchWrapper>
      </GroupDashboardLayout>
   )
}

export default LivestreamAdminDetailsPage
