import { Stack } from "@mui/material"
import { Form } from "formik"
import { useRef } from "react"
import { useOfflineEventCreationContext } from "../OfflineEventCreationContext"
import { TAB_VALUES } from "./types"
import { useAutoSave } from "./useAutoSave"
import { OfflineEventFormGeneralStep } from "./views/general"

const OfflineEventForm = () => {
   const formContainerRef = useRef(null)
   const { tabValue } = useOfflineEventCreationContext()

   // Initialize autosave functionality
   useAutoSave()

   return (
      <Form ref={formContainerRef}>
         <Stack
            direction={"row"}
            gap={0}
            style={{ display: "flex", flexDirection: "row", minWidth: "100%" }}
         >
            <Stack p={"24px"} rowGap={2} flex={2}>
               {tabValue === TAB_VALUES.GENERAL && (
                  <OfflineEventFormGeneralStep />
               )}
            </Stack>

            {/* TODO: Preview */}
         </Stack>
      </Form>
   )
}

export default OfflineEventForm
