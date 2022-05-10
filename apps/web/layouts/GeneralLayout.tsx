import React from "react"
import FooterV2 from "../components/views/footer/FooterV2"
import GeneralNavDrawer from "../components/views/navbar/GeneralNavDrawer"
import GenericHeader from "../components/views/header/GenericHeader"
import Page, {
   PageChildrenWrapper,
   PageContentWrapper,
} from "../components/views/common/Page"
import { useTheme } from "@mui/material/styles"
import { useMediaQuery } from "@mui/material"
import { desktopProp } from "../constants/pages"

interface Props {
   children: React.ReactNode
   fullScreen?: boolean
   backgroundColor?: string
   hideNavOnScroll?: boolean
   persistent?: boolean
}
const GeneralLayout = ({
   children,
   fullScreen,
   backgroundColor = undefined,
   hideNavOnScroll = false,
   persistent = false,
}: Props) => {
   const theme = useTheme()

   const isDesktop = useMediaQuery(theme.breakpoints.up(desktopProp), {
      // noSsr: true,
   })

   return (
      <Page
         sx={{
            backgroundColor,
         }}
      >
         <GenericHeader hideNavOnScroll={hideNavOnScroll} position={"sticky"} />
         <PageContentWrapper>
            <GeneralNavDrawer isPersistent={isDesktop && persistent} />
            <PageChildrenWrapper>
               {children}
               <FooterV2 bottom={fullScreen} />
            </PageChildrenWrapper>
         </PageContentWrapper>
      </Page>
   )
}

export default GeneralLayout
