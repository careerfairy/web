import { CompanyIcon } from "components/views/common/icons"
import { HomeIcon } from "components/views/common/icons/HomeIcon"
import { LevelsIcon } from "components/views/common/icons/LevelsIcon"
import { LiveStreamsIcon } from "components/views/common/icons/LiveStreamsIcon"
import { RecordingIcon } from "components/views/common/icons/RecordingIcon"
import { SparksIcon } from "components/views/common/icons/SparksIcon"
import { createContext, ReactNode, useContext, useMemo } from "react"
import useDialogStateHandler from "../../components/custom-hook/useDialogStateHandler"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import CreditsDialog from "../../components/views/credits-dialog/CreditsDialog"
import Footer from "../../components/views/footer/Footer"
import AdminGenericLayout from "../AdminGenericLayout"
import CreditsDialogLayout from "../CreditsDialogLayout"
import { INavLink } from "../types"
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
   navLinks: INavLink[]
   drawerOpen: boolean
}

const GenericDashboardContext = createContext<IGenericDashboardContext>({
   isPortalPage: false,
   handleOpenCreditsDialog: () => {},
   headerScrollThreshold: 10,
   headerFixed: false,
   navLinks: [],
   drawerOpen: false,
})

const NextLivestreamsPath: INavLink = {
   id: "next-live-streams",
   href: `/next-livestreams`,
   pathname: `/next-livestreams/[[...livestreamDialog]]`,
   title: "Live streams",
   Icon: LiveStreamsIcon,
}

const PastLivestreamsPath: INavLink = {
   id: "all-past-live-streams",
   href: `/past-livestreams`,
   pathname: `/past-livestreams/[[...livestreamDialog]]`,
   title: "Recordings",
   Icon: RecordingIcon,
}

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
}: Props) => {
   const isMobile = useIsMobile(989, { defaultMatches: true })

   const [
      creditsDialogOpen,
      handleOpenCreditsDialog,
      handleCloseCreditsDialog,
   ] = useDialogStateHandler()

   const navLinks = useMemo(() => {
      const links: INavLink[] = [
         {
            id: "home-page",
            href: `/portal`,
            pathname: `/portal/[[...livestreamDialog]]`,
            Icon: HomeIcon,
            title: "Home page",
            mobileTitle: "Home",
         },
         {
            id: "live-streams",
            title: "Live streams",
            mobileTitle: "Live streams",
            Icon: LiveStreamsIcon,
            href: `/next-livestreams`,
            pathname: `/next-livestreams/[[...livestreamDialog]]`,
            ...(isMobile
               ? {
                    childLinks: [NextLivestreamsPath, PastLivestreamsPath],
                 }
               : []),
         },
         {
            id: "sparks",
            href: `/sparks`,
            pathname: `/sparks/[sparkId]`,
            Icon: SparksIcon,
            title: "Sparks",
         },
         ...(!isMobile
            ? [
                 {
                    id: "past-live-streams",
                    title: "Recordings",
                    mobileTitle: "Recordings",
                    Icon: RecordingIcon,
                    href: `/past-livestreams`,
                    pathname: `/past-livestreams/[[...livestreamDialog]]`,
                 },
              ]
            : []),
         {
            id: "levels",
            href: `/levels`,
            pathname: `/levels`,
            Icon: LevelsIcon,
            title: "Levels",
         },
         {
            id: "company",
            href: `/companies`,
            pathname: `/companies`,
            Icon: CompanyIcon,
            title: "Companies",
         },
      ]

      return links
   }, [isMobile])

   const drawerOpen = !hideDrawer && !isMobile

   const value = useMemo<IGenericDashboardContext>(
      () => ({
         isPortalPage,
         handleOpenCreditsDialog,
         headerScrollThreshold,
         headerFixed: Boolean(headerFixed),
         headerType: headerType,
         navLinks,
         drawerOpen,
      }),
      [
         handleOpenCreditsDialog,
         headerScrollThreshold,
         isPortalPage,
         navLinks,
         headerFixed,
         headerType,
         drawerOpen,
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
