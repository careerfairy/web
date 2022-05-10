import React from "react"
import FooterV2 from "../components/views/footer/FooterV2"
import GeneralNavDrawer from "../components/views/navbar/GeneralNavDrawer"
import GenericHeader from "../components/views/header/GenericHeader"
import Page, {
   PageChildrenWrapper,
   PageContentWrapper,
} from "../components/views/common/Page"

interface Props {
   children: React.ReactNode
   fullScreen?: boolean
   backgroundColor?: string
   hideNavOnScroll?: boolean
}
const GeneralLayout = ({
   children,
   fullScreen,
   backgroundColor = undefined,
   hideNavOnScroll = false,
}: Props) => {
   return (
      <Page
         sx={{
            backgroundColor,
         }}
      >
         <GenericHeader hideNavOnScroll={hideNavOnScroll} position={"sticky"} />
         <PageContentWrapper>
            <GeneralNavDrawer />
            <PageChildrenWrapper>{children}</PageChildrenWrapper>
         </PageContentWrapper>
         <FooterV2 bottom={fullScreen} />
      </Page>
   )
}

export default GeneralLayout
