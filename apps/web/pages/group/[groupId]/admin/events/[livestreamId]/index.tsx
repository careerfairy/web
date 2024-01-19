import { Formik } from "formik"
import { useRouter } from "next/router"
import {
   LivestreamFormGeneralTabValues,
   LivestreamFormJobsTabValues,
   LivestreamFormValues,
   LivestreamFormQuestionsTabValues,
   LivestreamFormSpeakersTabValues,
} from "./form/types"
import LivestreamFetchWrapper from "./LivestreamFetchWrapper"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { LivestreamButtonActions } from "components/views/admin/livestream/LivestreamButtonActions"
import { Tab, Tabs } from "@mui/material"
import { useState } from "react"
import LivestreamFormJobsStep from "./form/views/jobs"
import LivestreamFormQuestionsStep from "./form/views/questions"
import LivestreamFormSpeakersStep from "./form/views/speakers"
import LivestreamFormGeneralStep from "./form/views/general"

const formGeneralTabValues: LivestreamFormGeneralTabValues = {
   title: "",
   hidden: false,
   company: "",
   companyId: "",
   companyLogoUrl: "",
   backgroundImageUrl: "",
   startDate: null,
   duration: null,
   language: {
      code: "",
      name: "",
      shortName: "",
   },
   summary: "",
   reasonsToJoin: [],
   categoriesId: [],
   targetCountries: [],
   targetUniversities: [],
   targetFieldsOfStudy: [],
   targetLevelsOfStudy: [],
}

const formSpeakersTabValues: LivestreamFormSpeakersTabValues = {
   speakers: [],
}

const formQuestionsTabValues: LivestreamFormQuestionsTabValues = {
   registrationQuestions: {},
   feedbackQuestions: [],
}

const formJobsTabValues: LivestreamFormJobsTabValues = {
   jobs: [],
}

const formInitialValues: LivestreamFormValues = {
   ...formGeneralTabValues,
   ...formSpeakersTabValues,
   ...formQuestionsTabValues,
   ...formJobsTabValues,
}

const convertLivestreamObjectToForm = (
   livestream: LivestreamEvent
): LivestreamFormValues => {
   return Object.keys(formInitialValues).reduce(
      (acc, key) =>
         key in livestream ? { ...acc, [key]: livestream[key] } : acc,
      formInitialValues
   )
}

enum TAB_VALUES {
   GENERAL,
   SPEAKERS,
   QUESTIONS,
   JOBS,
}

const LivestreamAdminDetailsPage = () => {
   const {
      query: { groupId, livestreamId },
   } = useRouter()

   const [tabValue, setTabValue] = useState(TAB_VALUES.GENERAL)
   const handleTabChange = (_, newValue) => {
      setTabValue(newValue)
   }

   return (
      <GroupDashboardLayout
         titleComponent={"Live stream Details"}
         groupId={groupId as string}
         topBarCta={<LivestreamButtonActions />} // TODO to be implemented properly in CF-527
      >
         <DashboardHead title="CareerFairy | Editing Live Stream of " />
         <h1>{livestreamId}</h1>
         <h2>{groupId}</h2>
         <LivestreamFetchWrapper livestreamId={livestreamId as string}>
            {(livestream) => {
               const formValues: LivestreamFormValues = livestream
                  ? convertLivestreamObjectToForm(livestream)
                  : formInitialValues

               return (
                  <>
                     <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="Livestream Creation Form Tabs"
                     >
                        <Tab label="General" value={TAB_VALUES.GENERAL} />
                        <Tab label="Speakers" value={TAB_VALUES.SPEAKERS} />
                        <Tab label="Questions" value={TAB_VALUES.QUESTIONS} />
                        <Tab label="Jobs" value={TAB_VALUES.JOBS} />
                     </Tabs>
                     <Formik<LivestreamFormValues>
                        initialValues={formValues}
                        onSubmit={undefined}
                     >
                        <>
                           {tabValue == TAB_VALUES.GENERAL && (
                              <LivestreamFormGeneralStep
                                 values={formGeneralTabValues}
                              />
                           )}
                           {tabValue == TAB_VALUES.SPEAKERS && (
                              <LivestreamFormSpeakersStep
                                 values={formSpeakersTabValues}
                              />
                           )}
                           {tabValue == TAB_VALUES.QUESTIONS && (
                              <LivestreamFormQuestionsStep
                                 values={formQuestionsTabValues}
                              />
                           )}
                           {tabValue == TAB_VALUES.JOBS && (
                              <LivestreamFormJobsStep
                                 values={formJobsTabValues}
                              />
                           )}
                        </>
                     </Formik>
                  </>
               )
            }}
         </LivestreamFetchWrapper>
      </GroupDashboardLayout>
   )
}

export default LivestreamAdminDetailsPage
