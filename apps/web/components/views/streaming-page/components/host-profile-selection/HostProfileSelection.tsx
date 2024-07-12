import { Box, Container } from "@mui/material"
import { ReactNode } from "react"
import { useSpeakerId } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import {
   ProfileSelectEnum,
   ProfileSelectProvider,
} from "./HostProfileSelectionProvider"
import { SpeakerSelectHeader } from "./SpeakerSelectHeader"
import { CreateSpeakerView } from "./views/CreateSpeakerView"
import { EditSpeakerView } from "./views/EditSpeakerView"
import { JoinWithSpeakerView } from "./views/JoinWithSpeakerView"
import { SelectSpeakerView } from "./views/SelectSpeakerView"

const styles = sxStyles({
   root: {
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      pb: 4.5,
      bgcolor: "#F7F8FC",
   },
   contentContainer: {
      alignItems: "center",
   },
})

type Props = {
   children: ReactNode
   isHost: boolean
}

export const HostProfileSelection = ({ children, isHost }: Props) => {
   const speakerId = useSpeakerId()

   if (!speakerId && isHost) {
      return <Content />
   }

   return <>{children}</>
}

const Content = () => {
   return (
      <ProfileSelectProvider>
         {(activeView) => (
            <Box sx={styles.root}>
               <SpeakerSelectHeader />
               <Container>
                  {activeView === ProfileSelectEnum.SELECT_SPEAKER && (
                     <SelectSpeakerView />
                  )}
                  {activeView === ProfileSelectEnum.CREATE_SPEAKER && (
                     <CreateSpeakerView />
                  )}
                  {activeView === ProfileSelectEnum.EDIT_SPEAKER && (
                     <EditSpeakerView />
                  )}
                  {activeView === ProfileSelectEnum.JOIN_WITH_SPEAKER && (
                     <JoinWithSpeakerView />
                  )}
               </Container>
            </Box>
         )}
      </ProfileSelectProvider>
   )
}
