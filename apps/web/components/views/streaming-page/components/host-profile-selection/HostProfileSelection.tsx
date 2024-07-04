import FramerBox from "components/views/common/FramerBox"
import { AnimatePresence } from "framer-motion"
import { ReactNode } from "react"
import { useSpeakerId, useUserUid } from "store/selectors/streamingAppSelectors"
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
      alignItems: "center",
      position: "relative",
      bgcolor: "#F7F8FC",
   },
   view: {
      my: "auto",
      flex: 1,
      display: "grid",
      placeItems: {
         xs: "start",
         sm: "center",
      },
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
            <FramerBox sx={styles.root}>
               <SpeakerSelectHeader />
               <AnimatePresence mode="wait">
                  <ViewFramerBox
                     activeView={activeView}
                     viewEnum={ProfileSelectEnum.SELECT_SPEAKER}
                     viewComponent={<SelectSpeakerView />}
                  />
                  <ViewFramerBox
                     activeView={activeView}
                     viewEnum={ProfileSelectEnum.CREATE_SPEAKER}
                     viewComponent={<CreateSpeakerView />}
                  />
                  <ViewFramerBox
                     activeView={activeView}
                     viewEnum={ProfileSelectEnum.EDIT_SPEAKER}
                     viewComponent={<EditSpeakerView />}
                  />
                  <ViewFramerBox
                     activeView={activeView}
                     viewEnum={ProfileSelectEnum.JOIN_WITH_SPEAKER}
                     viewComponent={<JoinWithSpeakerView />}
                  />
               </AnimatePresence>
            </FramerBox>
         )}
      </ProfileSelectProvider>
   )
}

type ViewFramerBoxProps = {
   activeView: ProfileSelectEnum
   viewEnum: ProfileSelectEnum
   viewComponent: ReactNode
}

const ViewFramerBox = ({
   activeView,
   viewEnum,
   viewComponent,
}: ViewFramerBoxProps) => {
   return (
      activeView === viewEnum && (
         <FramerBox
            key={viewEnum}
            sx={styles.view}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
         >
            {viewComponent}
         </FramerBox>
      )
   )
}
