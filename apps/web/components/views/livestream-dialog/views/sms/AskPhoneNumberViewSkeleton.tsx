import { Typography } from "@mui/material"
import BaseDialogView, { MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"

export const AskPhoneNumberViewSkeleton = () => {
   const { goToView } = useLiveStreamDialog()

   return (
      <BaseDialogView
         mainContent={
            <MainContent
               onBackClick={() => goToView("recommendations")}
               onBackPosition="top-left"
            >
               <Typography>Loading...</Typography>
            </MainContent>
         }
      />
   )
}
