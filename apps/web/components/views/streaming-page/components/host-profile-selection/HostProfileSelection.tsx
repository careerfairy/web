import { Box } from "@mui/material"
import FramerBox from "components/views/common/FramerBox"
import { AnimatePresence } from "framer-motion"
import { ReactNode, forwardRef } from "react"
import { useSpeakerId, useUserUid } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import {
   ProfileSelectEnum,
   ProfileSelectProvider,
   useHostProfileSelection,
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
      alignItems: "center",
      position: "relative",
      bgcolor: "#F7F8FC",
      overflowX: "hidden",
   },
   view: {
      width: "100%",
      flex: 1,
      display: "grid",
      placeItems: "center",
   },
})

type Props = {
   children: ReactNode
   isHost: boolean
}

export const HostProfileSelection = ({ children, isHost }: Props) => {
   const speakerId = useSpeakerId()
   const userUid = useUserUid()

   if (!speakerId && !userUid && isHost) {
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
               <AnimatePresence mode="wait">
                  {activeView === ProfileSelectEnum.SELECT_SPEAKER && (
                     <ViewFramerBox
                        key={ProfileSelectEnum.SELECT_SPEAKER}
                        activeView={activeView}
                        viewComponent={<SelectSpeakerView />}
                     />
                  )}
                  {activeView === ProfileSelectEnum.CREATE_SPEAKER && (
                     <ViewFramerBox
                        key={ProfileSelectEnum.CREATE_SPEAKER}
                        activeView={activeView}
                        viewComponent={<CreateSpeakerView />}
                     />
                  )}
                  {activeView === ProfileSelectEnum.EDIT_SPEAKER && (
                     <ViewFramerBox
                        key={ProfileSelectEnum.EDIT_SPEAKER}
                        activeView={activeView}
                        viewComponent={<EditSpeakerView />}
                     />
                  )}
                  {activeView === ProfileSelectEnum.JOIN_WITH_SPEAKER && (
                     <ViewFramerBox
                        key={ProfileSelectEnum.JOIN_WITH_SPEAKER}
                        activeView={activeView}
                        viewComponent={<JoinWithSpeakerView />}
                     />
                  )}
               </AnimatePresence>
            </Box>
         )}
      </ProfileSelectProvider>
   )
}

type ViewFramerBoxProps = {
   activeView: ProfileSelectEnum
   viewComponent: ReactNode
}

const getDirection = (
   prevActiveView: ProfileSelectEnum,
   activeView: ProfileSelectEnum
) => {
   return activeView > prevActiveView ? 1 : -1
}

const ViewFramerBox = forwardRef<HTMLDivElement, ViewFramerBoxProps>(
   ({ activeView, viewComponent }, ref) => {
      const { prevActiveView } = useHostProfileSelection()
      const direction = getDirection(prevActiveView, activeView)

      return (
         <FramerBox
            ref={ref}
            sx={styles.view}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
         >
            {viewComponent}
         </FramerBox>
      )
   }
)

ViewFramerBox.displayName = "ViewFramerBox"
