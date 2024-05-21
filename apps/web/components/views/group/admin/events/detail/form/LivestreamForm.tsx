import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Stack } from "@mui/material"
import { Form } from "formik"
import { useMemo, useRef } from "react"
import { useLivestreamCreationContext } from "../LivestreamCreationContext"
import { TAB_VALUES } from "./commons"
import LivestreamFormGeneralStep from "./views/general"
import LivestreamFormJobsStep from "./views/jobs"
import Preview from "./views/preview/Preview"
import usePreviewScale from "./views/preview/usePreviewScale"
import LivestreamFormQuestionsStep from "./views/questions"
import LivestreamFormSpeakersStep from "./views/speakers"

const getStyles = (columnWidth: string) =>
   sxStyles({
      root: {
         position: "relative",
         display: "grid",
         gridTemplateColumns: `auto ${columnWidth}`,
         columnGap: "24px",
      },
      tabs: {
         padding: "24px",
      },
      previewContainer: {
         position: "relative",
         marginTop: "10px !important",
         height: "calc(100vh - 226px)",
      },
      preview: {
         position: "fixed",
         // 226px is the height of the top bar + bottom bar + 10px of container's margin top
         height: "calc(100vh - 226px)",
         width: "100%",
         overflowY: "scroll",
         backgroundColor: "#F7F8FC",
         borderTopLeftRadius: "12px",
      },
   })

const LivestreamForm = () => {
   const formContainerRef = useRef(null)
   const { tabValue } = useLivestreamCreationContext()
   const { scale, previewWidth } = usePreviewScale(formContainerRef)

   const styles = useMemo(() => getStyles(previewWidth), [previewWidth])

   return (
      <Form ref={formContainerRef} style={styles.root}>
         <Stack sx={styles.tabs} rowGap={2}>
            {tabValue === TAB_VALUES.GENERAL && <LivestreamFormGeneralStep />}
            {tabValue == TAB_VALUES.SPEAKERS && <LivestreamFormSpeakersStep />}
            {tabValue === TAB_VALUES.QUESTIONS && (
               <LivestreamFormQuestionsStep />
            )}
            {tabValue === TAB_VALUES.JOBS && <LivestreamFormJobsStep />}
         </Stack>
         <Box sx={styles.previewContainer}>
            <Box sx={styles.preview}>
               <Preview scale={scale} />
            </Box>
         </Box>
      </Form>
   )
}

export default LivestreamForm
