import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Stack } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import { Form } from "formik"
import { useMemo, useRef } from "react"
import { useLivestreamCreationContext } from "../LivestreamCreationContext"
import { TAB_VALUES } from "./commons"
import LivestreamFormGeneralStep from "./views/general"
import LivestreamFormJobsStep from "./views/jobs"
import PreviewDesktop from "./views/preview/PreviewDesktop"
import PreviewDialog from "./views/preview/PreviewDialog"
import PreviewMobile from "./views/preview/PreviewMobile"
import usePreviewScale from "./views/preview/usePreviewScale"
import LivestreamFormQuestionsStep from "./views/questions"
import LivestreamFormSpeakersStep from "./views/speakers"

const PREVIEW_HEIGHT = "calc(100vh - 226px)"

const getRootStylesForDesktop = (columnWidth: string) =>
   sxStyles({
      position: "relative",
      display: "grid",
      gridTemplateColumns: `auto ${columnWidth}`,
      columnGap: "24px",
   })

const styles = sxStyles({
   rootMobile: {
      position: "relative",
   },
   tabs: {
      padding: "24px",
   },
   previewContainer: {
      position: "relative",
      marginTop: "10px !important",
      height: PREVIEW_HEIGHT,
   },
   preview: {
      position: "fixed",
      // 226px is the height of the top bar + bottom bar + 10px of container's margin top
      height: PREVIEW_HEIGHT,
      width: "100%",
      overflowY: "scroll",
      backgroundColor: "#F7F8FC",
      borderTopLeftRadius: "12px",
   },
})

const LivestreamForm = () => {
   const formContainerRef = useRef(null)
   const isMobile = useIsMobile()
   const { tabValue } = useLivestreamCreationContext()
   const { scale, previewWidth } = usePreviewScale(formContainerRef)
   const [
      isPreviewDialogOpen,
      handlePreviewDialogOpen,
      handlePreviewDialogClose,
   ] = useDialogStateHandler()

   const rootStyles = useMemo(() => {
      return isMobile
         ? styles.rootMobile
         : getRootStylesForDesktop(previewWidth)
   }, [isMobile, previewWidth])

   return (
      <Form ref={formContainerRef} style={rootStyles}>
         <Stack sx={styles.tabs} rowGap={2}>
            {tabValue === TAB_VALUES.GENERAL && <LivestreamFormGeneralStep />}
            {tabValue == TAB_VALUES.SPEAKERS && <LivestreamFormSpeakersStep />}
            {tabValue === TAB_VALUES.QUESTIONS && (
               <LivestreamFormQuestionsStep />
            )}
            {tabValue === TAB_VALUES.JOBS && <LivestreamFormJobsStep />}
         </Stack>
         {isMobile ? (
            <PreviewMobile handleOnClick={handlePreviewDialogOpen} />
         ) : (
            <Box sx={styles.previewContainer}>
               <Box sx={styles.preview}>
                  <PreviewDesktop
                     scale={scale}
                     handleDialogOpen={handlePreviewDialogOpen}
                  />
               </Box>
            </Box>
         )}
         <PreviewDialog
            isOpen={isPreviewDialogOpen}
            handleClose={handlePreviewDialogClose}
         />
      </Form>
   )
}

export default LivestreamForm
