import React from "react"
import Footer from "../components/views/footer/Footer"
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
   viewRef?: React.RefObject<HTMLDivElement>
}

const GeneralLayout = ({
   children,
   fullScreen,
   backgroundColor = undefined,
   hideNavOnScroll = false,
   persistent = false,
   headerEndContent,
   viewRef,
}: Props) => {
   const isDesktop = useIsDesktop()

   return (
      <Page
         sx={{
            backgroundColor,
         }}
         viewRef={viewRef}
      >
         <GenericHeader
            hideNavOnScroll={hideNavOnScroll}
            position={"sticky"}
            endContent={headerEndContent}
         />
         <PageContentWrapper>
            <GeneralNavDrawer isPersistent={isDesktop ? persistent : null} />
            <PageChildrenWrapper>
               {children}
               <Footer bottom={fullScreen} />
            </PageChildrenWrapper>
         </PageContentWrapper>
      </Page>
   )
}

export default GeneralLayout
