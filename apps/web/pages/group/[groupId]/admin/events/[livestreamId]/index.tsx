import { Formik } from "formik"
import { useRouter } from "next/router"
import {
   LivestreamFormGeneralTabValues,
   LivestreamFormJobsTabValues,
   LivestreamFormValues,
   LivestreamFormQuestionsTabValues,
   LivestreamFormSpeakersTabValues,
} from "../../../../../../components/views/group/admin/events/form/types"
import LivestreamFetchWrapper from "../../../../../../components/views/group/admin/events/LivestreamFetchWrapper"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { LivestreamButtonActions } from "components/views/admin/livestream/LivestreamButtonActions"
import LivestreamFormJobsStep from "../../../../../../components/views/group/admin/events/form/views/jobs"
import LivestreamFormQuestionsStep from "../../../../../../components/views/group/admin/events/form/views/questions"
import LivestreamFormSpeakersStep from "../../../../../../components/views/group/admin/events/form/views/speakers"
import LivestreamFormGeneralStep from "../../../../../../components/views/group/admin/events/form/views/general"
import { livestreamFormValidationSchema } from "../../../../../../components/views/group/admin/events/form/validationSchemas"
import { useState } from "react"
import LivestreamAdminDetailTopBarNavigation, {
   TAB_VALUES,
} from "./navigation/LivestreamAdminDetailTopBarNavigation"
import LivestreamAdminDetailBottomBarNavigation from "./navigation/LivestreamAdminDetailBottomBarNavigation"

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
      >
         <DashboardHead title="CareerFairy | Editing Live Stream of " />
         <LivestreamFetchWrapper livestreamId={livestreamId as string}>
            {(livestream) => {
               const formValues: LivestreamFormValues = livestream
                  ? convertLivestreamObjectToForm(livestream)
                  : formInitialValues

               return (
                  <>
                     <Formik<LivestreamFormValues>
                        initialValues={formValues}
                        onSubmit={undefined}
                        validationSchema={livestreamFormValidationSchema}
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
