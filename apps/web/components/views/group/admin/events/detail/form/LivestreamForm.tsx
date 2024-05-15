import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Stack } from "@mui/material"
import { Form } from "formik"
import { useLivestreamCreationContext } from "../LivestreamCreationContext"
import { TAB_VALUES } from "./commons"
import LivestreamFormGeneralStep from "./views/general"
import LivestreamFormJobsStep from "./views/jobs"
import Preview from "./views/preview/Preview"
import LivestreamFormQuestionsStep from "./views/questions"
import LivestreamFormSpeakersStep from "./views/speakers"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "row",
      columnGap: "24px",
   },
   tabs: {
      flexBasis: "61%",
      padding: "24px",
   },
   preview: {
      flexBasis: "39%",
      marginTop: "10px",
      backgroundColor: "#F7F8FC",
      borderTopLeftRadius: "12px",
   },
})

const LivestreamForm = () => {
   const { tabValue } = useLivestreamCreationContext()

   return (
      <Form style={styles.root}>
         <Stack sx={styles.tabs} rowGap={2}>
            {tabValue === TAB_VALUES.GENERAL && <LivestreamFormGeneralStep />}
            {tabValue == TAB_VALUES.SPEAKERS && <LivestreamFormSpeakersStep />}
            {tabValue === TAB_VALUES.QUESTIONS && (
               <LivestreamFormQuestionsStep />
            )}
            {tabValue === TAB_VALUES.JOBS && <LivestreamFormJobsStep />}
         </Stack>
         <Box sx={styles.preview}>
            <Preview />
         </Box>
      </Form>
   )
}

export default LivestreamForm
