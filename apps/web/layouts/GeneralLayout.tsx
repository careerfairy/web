import React from "react"
import FooterV2 from "../components/views/footer/FooterV2"
import GeneralNavDrawer from "../components/views/navbar/GeneralNavDrawer"
import GenericHeader from "../components/views/header/GenericHeader"
import Page, {
   PageChildrenWrapper,
   PageContentWrapper,
} from "../components/views/common/Page"
import useIsDesktop from "../components/custom-hook/useIsDesktop"

interface Props {
   children: React.ReactNode
   fullScreen?: boolean
   backgroundColor?: string
   hideNavOnScroll?: boolean
   persistent?: boolean
   headerEndContent?: React.ReactNode
}

const GeneralLayout = ({
   children,
   fullScreen,
   backgroundColor = undefined,
   hideNavOnScroll = false,
   persistent = false,
   headerEndContent,
}: Props) => {
   const isDesktop = useIsDesktop()

   return (
      <Page
         sx={{
            backgroundColor,
         }}
      >
         <GenericHeader
            hideNavOnScroll={hideNavOnScroll}
            position={"sticky"}
            endContent={headerEndContent}
         />
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
