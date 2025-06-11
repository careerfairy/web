import { createContext, ReactNode, useContext, useMemo } from "react"
import useDialogStateHandler from "../../components/custom-hook/useDialogStateHandler"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import CreditsDialog from "../../components/views/credits-dialog/CreditsDialog"
import Footer from "../../components/views/footer/Footer"
import AdminGenericLayout from "../AdminGenericLayout"
import CreditsDialogLayout from "../CreditsDialogLayout"
import TabsNavigator from "./DropdownNavigator"
import { GenericNavList } from "./GenericNavList"
import NavBar from "./NavBar"
import TopBar from "./TopBar"

type IGenericDashboardContext = {
   isPortalPage: boolean
   handleOpenCreditsDialog: () => void
   // The number of pixels the user has to scroll before the header is hidden. Default is 10
   headerScrollThreshold: number
   headerFixed?: boolean
   headerType?: "sticky" | "fixed"
   drawerOpen: boolean
   isMobile: boolean
   blurHeaderOnScroll?: boolean
}

const GenericDashboardContext = createContext<IGenericDashboardContext>({
   isPortalPage: false,
   handleOpenCreditsDialog: () => {},
   headerScrollThreshold: 10,
   headerFixed: false,
   drawerOpen: false,
   isMobile: false,
   blurHeaderOnScroll: false,
})

type Props = {
   children: ReactNode
   pageDisplayName?: string
   bgColor?: string
   isPortalPage?: boolean
   headerFixed?: boolean
   headerType?: "sticky" | "fixed"
   // The number of pixels the user has to scroll before the header is hidden
   headerScrollThreshold?: number
   /**
    * If true, the footer will be hidden
    */
   hideFooter?: boolean
   /**
    * If true, the left drawer will be hidden
    */
   hideDrawer?: boolean
   /**
    * The width of the header. Default is 100%
    */
   headerWidth?: string
   /**
    * If true, the bottom nav will be hidden
    */
   hideBottomNav?: boolean
   /**
    * If true, the bottom nav will be dark
    */
   isBottomNavDark?: boolean
   /**
    * If true, the header will be hidden
    */
   hideHeader?: boolean
   /**
    * If true, the header will be transparent but have a blur effect on scroll
    */
   blurHeaderOnScroll?: boolean
}

const GenericDashboardLayout = ({
   children,
   pageDisplayName,
   bgColor,
   isPortalPage,
   headerFixed,
   headerType = "sticky",
   headerScrollThreshold = 65,
   hideFooter,
   hideDrawer,
   headerWidth = "100%",
   hideBottomNav,
   isBottomNavDark = false,
   hideHeader,
   blurHeaderOnScroll,
}: Props) => {
   const isMobile = useIsMobile(989, { defaultMatches: true })

   const [
      creditsDialogOpen,
      handleOpenCreditsDialog,
      handleCloseCreditsDialog,
   ] = useDialogStateHandler()

   const drawerOpen = !hideDrawer && !isMobile

   const value = useMemo<IGenericDashboardContext>(
      () => ({
         isPortalPage,
         handleOpenCreditsDialog,
         headerScrollThreshold,
         headerFixed: Boolean(headerFixed),
         headerType: headerType,
         drawerOpen,
         isMobile,
         blurHeaderOnScroll: Boolean(blurHeaderOnScroll),
      }),
      [
         handleOpenCreditsDialog,
         headerScrollThreshold,
         isPortalPage,
         headerFixed,
         headerType,
         drawerOpen,
         isMobile,
         blurHeaderOnScroll,
      ]
   )

   return (
      <GenericDashboardContext.Provider value={value}>
         <CreditsDialogLayout>
            <AdminGenericLayout
               bgColor={bgColor || "#F7F8FC"}
               hideHeader={hideHeader}
               headerContent={
                  hideHeader ? null : <TopBar title={pageDisplayName} />
               }
               drawerContent={<NavBar />}
               hideDrawer={hideDrawer}
               bottomNavContent={
                  hideBottomNav ? null : (
                     <GenericNavList isDark={isBottomNavDark} />
                  )
               }
               drawerOpen={drawerOpen}
               dropdownNav={isMobile ? <TabsNavigator /> : null}
               headerWidth={headerWidth}
            >
               {children}
               {hideFooter ? null : (
                  <Footer background={bgColor || "#F7F8FC"} />
               )}
               <CreditsDialog
                  onClose={handleCloseCreditsDialog}
                  open={creditsDialogOpen}
               />
            </AdminGenericLayout>
         </CreditsDialogLayout>
      </GenericDashboardContext.Provider>
   )
}

export const useGenericDashboard = () => {
   const context = useContext(GenericDashboardContext)
   if (context === undefined) {
      throw new Error(
         "useGenericDashboard must be used within a GenericDashboardContextProvider"
      )
   }
   return context
}

export default GenericDashboardLayout
