import { sxStyles } from "@careerfairy/shared-ui"
import { CircularProgress, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { Form } from "formik"
import { useLivestreamCreationContext } from "../LivestreamCreationContext"
import { TAB_VALUES } from "./commons"
import LivestreamFormGeneralStep from "./views/general"
import LivestreamFormJobsStep from "./views/jobs"
import LivestreamFormQuestionsStep from "./views/questions"
import LivestreamFormSpeakersStep from "./views/speakers"

const styles = sxStyles({
   root: {
      padding: "24px",
   },
})

const LivestreamForm = () => {
   const { tabValue } = useLivestreamCreationContext()

   return (
      <Form>
         <Stack sx={styles.root} rowGap={2}>
            {tabValue === TAB_VALUES.GENERAL && <LivestreamFormGeneralStep />}
            {tabValue == TAB_VALUES.SPEAKERS && (
               <SuspenseWithBoundary fallback={<CircularProgress />}>
                  <LivestreamFormSpeakersStep />
               </SuspenseWithBoundary>
            )}
            {tabValue === TAB_VALUES.QUESTIONS && (
               <LivestreamFormQuestionsStep />
            )}
            {tabValue === TAB_VALUES.JOBS && <LivestreamFormJobsStep />}
         </Stack>
      </Form>
   )
}

export default LivestreamForm
