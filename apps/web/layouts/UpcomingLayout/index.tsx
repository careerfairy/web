import React from "react"
import { useTheme } from "@mui/material/styles"
import TopBar from "./TopBar"
import FooterV2 from "../../components/views/footer/FooterV2"
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
            <FooterV2 background={theme.palette.common.white} />
         </Page>
      </CreditsDialogLayout>
   )
}

export default UpcomingLayout
