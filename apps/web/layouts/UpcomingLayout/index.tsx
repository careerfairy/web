import React, { createContext, useContext, useMemo } from "react"
import { useTheme } from "@mui/material/styles"
import TopBar from "./TopBar"
import FooterV2 from "../../components/views/footer/FooterV2"
import GeneralNavDrawer from "../../components/views/navbar/GeneralNavDrawer"
import Page, {
   PageChildrenWrapper,
   PageContentWrapper,
} from "../../components/views/common/Page"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import CreditsDialog from "components/views/credits-dialog/CreditsDialog"

type IUpcomingLayoutContext = {
   handleOpenCreditsDialog: () => void
}

const UpcomingLayoutContext = createContext<IUpcomingLayoutContext>({
   handleOpenCreditsDialog: () => {},
})

const UpcomingLayout = ({ children, viewRef = undefined }) => {
   const theme = useTheme()

   const [
      creditsDialogOpen,
      handleOpenCreditsDialog,
      handleCloseCreditsDialog,
   ] = useDialogStateHandler()

   const value = useMemo(() => {
      return {
         handleOpenCreditsDialog,
      }
   }, [handleOpenCreditsDialog])

   return (
      <UpcomingLayoutContext.Provider value={value}>
         <Page viewRef={viewRef}>
            <TopBar />
            <PageContentWrapper>
               <GeneralNavDrawer />
               <PageChildrenWrapper>{children}</PageChildrenWrapper>
            </PageContentWrapper>
            <FooterV2 background={theme.palette.common.white} />
            <CreditsDialog
               onClose={handleCloseCreditsDialog}
               open={creditsDialogOpen}
            />
         </Page>
      </UpcomingLayoutContext.Provider>
   )
}

export const useUpcomingLayout = () => {
   const context = useContext(UpcomingLayoutContext)
   if (context === undefined) {
      throw new Error(
         "useUpcomingLayout must be used within a UpcomingLayoutContextProvider"
      )
   }
   return context
}

export default UpcomingLayout
