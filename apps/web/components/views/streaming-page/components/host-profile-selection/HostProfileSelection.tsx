import { Box } from "@mui/material"
import FramerBox from "components/views/common/FramerBox"
import { AnimatePresence, Variants } from "framer-motion"
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
      minHeight: "100dvh",
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
               <AnimatePresence mode="popLayout">
                  {activeView === ProfileSelectEnum.SELECT_SPEAKER && (
                     <ViewFramerBox key={ProfileSelectEnum.SELECT_SPEAKER}>
                        <SelectSpeakerView />
                     </ViewFramerBox>
                  )}
                  {activeView === ProfileSelectEnum.CREATE_SPEAKER && (
                     <ViewFramerBox key={ProfileSelectEnum.CREATE_SPEAKER}>
                        <CreateSpeakerView />
                     </ViewFramerBox>
                  )}
                  {activeView === ProfileSelectEnum.EDIT_SPEAKER && (
                     <ViewFramerBox key={ProfileSelectEnum.EDIT_SPEAKER}>
                        <EditSpeakerView />
                     </ViewFramerBox>
                  )}
                  {activeView === ProfileSelectEnum.JOIN_WITH_SPEAKER && (
                     <ViewFramerBox key={ProfileSelectEnum.JOIN_WITH_SPEAKER}>
                        <JoinWithSpeakerView />
                     </ViewFramerBox>
                  )}
               </AnimatePresence>
            </Box>
         )}
      </ProfileSelectProvider>
   )
}

const DISTANCE = 100

const sliderVariants: Variants = {
   incoming: (direction: number) => ({
      x: direction * DISTANCE,
      opacity: 0,
   }),
   active: { x: 0, opacity: 1 },
   exit: (direction: number) => ({
      x: -direction * DISTANCE,
      opacity: 0,
   }),
}

type ViewFramerBoxProps = {
   children: ReactNode
}

const ViewFramerBox = forwardRef<HTMLDivElement, ViewFramerBoxProps>(
   ({ children }, ref) => {
      const { direction } = useHostProfileSelection()

      return (
         <FramerBox
            ref={ref}
            sx={styles.view}
            custom={direction}
            variants={sliderVariants}
            initial="incoming"
            animate="active"
            exit="exit"
         >
            {children}
         </FramerBox>
      )
   }
)

ViewFramerBox.displayName = "ViewFramerBox"
