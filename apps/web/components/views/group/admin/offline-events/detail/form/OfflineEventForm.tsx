import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { Form } from "formik"
import { useMemo, useRef } from "react"
import { useOfflineEventCreationContext } from "../OfflineEventCreationContext"
import { convertFormValuesToOfflineEventObject } from "./OfflineEventFormikProvider"
import { TAB_VALUES } from "./types"
import { useAutoSave } from "./useAutoSave"
import { useOfflineEventFormValues } from "./useOfflineEventFormValues"
import { OfflineEventFormGeneralStep } from "./views/general"
import OfflineEventFormPreview from "./views/preview/OfflineEventFormPreview"
import { OfflineEventPreviewContextProvider } from "./views/preview/OfflineEventPreviewContext"
import useOfflineEventPreviewScale from "./views/preview/useOfflineEventPreviewScale"

const getRootStylesForDesktop = (columnWidth: string) =>
   sxStyles({
      position: "relative",
      display: "grid",
      gridTemplateColumns: `auto ${columnWidth}`,
      columnGap: "0px",
      overflowX: "hidden",
   })

const styles = sxStyles({
   rootMobile: {
      position: "relative",
   },
   tabs: {
      padding: "24px",
   },
})

const OfflineEventForm = () => {
   const formContainerRef = useRef(null)
   const firebase = useFirebaseService()
   const isMobile = useIsMobile()
   const { tabValue, group, author } = useOfflineEventCreationContext()
   const { values } = useOfflineEventFormValues()
   const { scale, previewWidth } = useOfflineEventPreviewScale(formContainerRef)
   const offlineEventToPreview = useMemo(() => {
      return convertFormValuesToOfflineEventObject(
         values,
         group,
         author,
         firebase
      )
   }, [author, firebase, group, values])
   // Initialize autosave functionality
   useAutoSave()

   const rootStyles = useMemo(() => {
      return isMobile
         ? styles.rootMobile
         : getRootStylesForDesktop(previewWidth || "39%")
   }, [isMobile, previewWidth])

   return (
      <Box sx={{ overflow: "auto", maxHeight: "calc(100vh - 76px)" }}>
         <Form ref={formContainerRef} style={rootStyles}>
            <Stack sx={styles.tabs} rowGap={2}>
               {tabValue === TAB_VALUES.GENERAL && (
                  <OfflineEventFormGeneralStep />
               )}
            </Stack>
            <OfflineEventPreviewContextProvider
               offlineEvent={offlineEventToPreview}
            >
               <OfflineEventFormPreview scale={scale} />
            </OfflineEventPreviewContextProvider>
         </Form>
      </Box>
   )
}

export default OfflineEventForm
