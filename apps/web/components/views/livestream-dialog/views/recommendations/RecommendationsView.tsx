import { Box, styled } from "@mui/material"
import { useUserIsCompanyTargeted } from "components/custom-hook/group/useUserIsCompanyTargeted"
import useLivestreamCompanyHostSWR from "components/custom-hook/live-stream/useLivestreamCompanyHostSWR"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useEffect, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { useLiveStreamDialog } from "../.."
import CoffeeChatsDialog from "../../../coffee-chats/CoffeeChatsDialog"
import {
   SlideLeftTransition,
   SlideUpTransition,
} from "../../../common/transitions"
import BaseDialogView from "../../BaseDialogView"
import { DesktopView } from "./DesktopView"
import { MobileView } from "./MobileView"

const styles = sxStyles({
   root: {
      padding: [0, "!important"],
      height: "100%",
      width: "100%",
   },
})

const Layout = styled(Box)({
   minHeight: "100%",
   position: "relative",
   display: "flex",
   flexDirection: "column",
})

const RecommendationsView = () => {
   const isMobile = useIsMobile()

   return (
      <BaseDialogView
         sx={styles.root}
         mainContent={
            <Layout>
               {isMobile ? <MobileView /> : <DesktopView />}
               <SuspenseWithBoundary fallback={null}>
                  <CoffeeChatsAfterRegister />
               </SuspenseWithBoundary>
            </Layout>
         }
      />
   )
}

export default RecommendationsView

const CoffeeChatsAfterRegister = () => {
   const { livestreamPresenter, showingSuccessAnimation } =
      useLiveStreamDialog()
   const isMobile = useIsMobile()
   const flags = useFeatureFlags()

   const { data: hostCompany } = useLivestreamCompanyHostSWR(
      livestreamPresenter.id
   )

   const hasCoffeeChats = Boolean(hostCompany?.hasCoffeeChats)
   const isInCoffeeChatsAudience = useUserIsCompanyTargeted(hostCompany)

   const [isOpen, setIsOpen] = useState(false)
   const [hasTriggered, setHasTriggered] = useState(false)

   useEffect(() => {
      if (
         !showingSuccessAnimation &&
         hasCoffeeChats &&
         isInCoffeeChatsAudience &&
         flags?.coffeeChatsFlag &&
         !hasTriggered
      ) {
         setIsOpen(true)
         setHasTriggered(true)
      }
   }, [
      showingSuccessAnimation,
      hasCoffeeChats,
      isInCoffeeChatsAudience,
      flags?.coffeeChatsFlag,
      hasTriggered,
   ])

   if (!isOpen) return null

   return (
      <CoffeeChatsDialog
         open={isOpen}
         onClose={() => setIsOpen(false)}
         bookChatLink="https://tally.so/r/mKqrbD"
         companyName={
            hostCompany?.universityName || livestreamPresenter?.company
         }
         TransitionComponent={
            isMobile ? SlideLeftTransition : SlideUpTransition
         }
      />
   )
}
