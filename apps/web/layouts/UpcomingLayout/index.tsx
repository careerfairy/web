import React from "react"
import { useTheme } from "@mui/material/styles"
import TopBar from "./TopBar"
import Footer from "../../components/views/footer/Footer"
import GeneralNavDrawer from "../../components/views/navbar/GeneralNavDrawer"
import Page, {
   PageChildrenWrapper,
   PageContentWrapper,
} from "../../components/views/common/Page"
import CreditsDialogLayout from "../CreditsDialogLayout"

const UpcomingLayout = ({ children, viewRef = undefined }) => {
   const theme = useTheme()

   return (
      <CreditsDialogLayout>
         <Page viewRef={viewRef}>
            <TopBar />
            <PageContentWrapper>
               <GeneralNavDrawer />
               <PageChildrenWrapper>{children}</PageChildrenWrapper>
            </PageContentWrapper>
            <Footer background={theme.palette.common.white} />
         </Page>
      </CreditsDialogLayout>
   )
}

export default UpcomingLayout
