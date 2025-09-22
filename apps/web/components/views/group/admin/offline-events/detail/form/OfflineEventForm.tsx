import { sxStyles } from "@careerfairy/shared-ui"
import { Stack } from "@mui/material"
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

const getRootStylesForDesktop = (columnWidth: string) =>
   sxStyles({
      position: "relative",
      display: "grid",
      gridTemplateColumns: `auto ${columnWidth}`,
      columnGap: "0px",
      height: "calc(100vh - 100px)", // Fixed height for the entire form container
   })

const styles = sxStyles({
   rootMobile: {
      position: "relative",
   },
   tabs: {
      padding: "24px",
      height: "100%",
      overflowY: "auto",
   },
})

const OfflineEventForm = () => {
   const formContainerRef = useRef(null)
   const firebase = useFirebaseService()
   const isMobile = useIsMobile()
   const { tabValue, group, author } = useOfflineEventCreationContext()
   const { values } = useOfflineEventFormValues()
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
      return isMobile ? styles.rootMobile : getRootStylesForDesktop("39%")
   }, [isMobile])

   return (
      <Form ref={formContainerRef} style={rootStyles}>
         <Stack sx={styles.tabs} rowGap={2}>
            {tabValue === TAB_VALUES.GENERAL && <OfflineEventFormGeneralStep />}
         </Stack>
         <OfflineEventPreviewContextProvider
            offlineEvent={offlineEventToPreview}
         >
            <OfflineEventFormPreview />
         </OfflineEventPreviewContextProvider>
      </Form>
   )
}

export default OfflineEventForm
