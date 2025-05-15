import { Typography } from "@mui/material"
import BaseDialogView, { MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"

export const AskPhoneNumberViewSkeleton = () => {
   const { handleStartSuccessAnimation } = useLiveStreamDialog()

   return (
      <BaseDialogView
         mainContent={
            <MainContent
               onBackClick={handleStartSuccessAnimation}
               onBackPosition="top-left"
            >
               <Typography>Loading...</Typography>
            </MainContent>
         }
      />
   )
}
