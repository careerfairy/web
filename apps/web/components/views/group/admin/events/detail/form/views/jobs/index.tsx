import { Form } from "formik"
import { CircularProgress, Stack } from "@mui/material"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import { useGroup } from "layouts/GroupDashboardLayout"
import FormSectionHeader from "../../FormSectionHeader"
import { sxStyles } from "types/commonTypes"
import AtsJobForm from "./atsJobs"
import CustomJobForm from "./customJobs/CustomJobForm"
import { SuspenseWithBoundary } from "components/ErrorBoundary"

const styles = sxStyles({
   root: {
      padding: "24px",
   },
})

const LivestreamFormJobsStep = () => {
   const featureFlags = useFeatureFlags()
   const { group } = useGroup()

   const hasAtsIntegration =
      featureFlags.atsAdminPageFlag || group.atsAdminPageFlag

   return (
      <Form>
         <Stack sx={styles.root} rowGap={2}>
            <FormSectionHeader
               title={"Job openings"}
               subtitle={
                  "Create or select up to 5 job openings that you want to share with the talent community!"
               }
            />
            <SuspenseWithBoundary fallback={<CircularProgress />}>
               {hasAtsIntegration ? (
                  <AtsJobForm />
               ) : (
                  <CustomJobForm fieldId="jobs.customJobs" />
               )}
            </SuspenseWithBoundary>
         </Stack>
      </Form>
   )
}

export default LivestreamFormJobsStep
