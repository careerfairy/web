import ClockIcon from "@mui/icons-material/AccessTime"
import DomainIcon from "@mui/icons-material/Domain"
import { LevelsIcon } from "components/views/common/icons/LevelsIcon"
import { createContext, ReactNode, useContext, useMemo } from "react"
import {
   Home as HomeIcon,
   Radio as LiveStreamsIcon,
   PlayCircle as SparksIcon,
} from "react-feather"
import { useAuth } from "../../HOCs/AuthProvider"
import useDialogStateHandler from "../../components/custom-hook/useDialogStateHandler"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import CreditsDialog from "../../components/views/credits-dialog/CreditsDialog"
import Footer from "../../components/views/footer/Footer"
import AdminGenericLayout from "../AdminGenericLayout"
import CreditsDialogLayout from "../CreditsDialogLayout"
import { INavLink } from "../types"
import DropdownNavigator from "./DropdownNavigator"
import GenericNavList from "./GenericNavList"
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
}

const GenericDashboardContext = createContext<IGenericDashboardContext>({
   isPortalPage: false,
   handleOpenCreditsDialog: () => {},
   headerScrollThreshold: 10,
   headerFixed: false,
   navLinks: [],
})

const MyRegistrationsPath: INavLink = {
   id: "my-registrations",
   href: `/next-livestreams/my-registrations`,
   pathname: `/next-livestreams/my-registrations/[[...livestreamDialog]]`,
   title: "My registrations",
}

const NextLivestreamsPath: INavLink = {
   id: "next-live-streams",
   href: `/next-livestreams`,
   pathname: `/next-livestreams/[[...livestreamDialog]]`,
   title: "Next live streams",
}

const PastLivestreamsPath: INavLink = {
   id: "all-past-live-streams",
   href: `/past-livestreams`,
   pathname: `/past-livestreams/[[...livestreamDialog]]`,
   title: "All past streams",
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

   const { isLoggedIn } = useAuth()

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
            childLinks: [
               NextLivestreamsPath,
               ...(isLoggedIn ? [MyRegistrationsPath] : []),
            ],
         },
         {
            id: "past-live-streams",
            title: "Past live streams",
            mobileTitle: "Past streams",
            Icon: ClockIcon,
            href: `/past-livestreams`,
            childLinks: [PastLivestreamsPath],
         },
         {
            id: "sparks",
            href: `/sparks`,
            pathname: `/sparks/[sparkId]`,
            Icon: SparksIcon,
            title: "Sparks",
         },
         {
            id: "company",
            href: `/companies`,
            pathname: `/companies`,
            Icon: DomainIcon,
            title: "Companies",
         },
         {
            id: "levels",
            href: `/levels`,
            pathname: `/levels`,
            Icon: LevelsIcon,
            title: "Levels",
         },
      ]

      return links
   }, [isLoggedIn])

   const value = useMemo<IGenericDashboardContext>(
      () => ({
         isPortalPage,
         handleOpenCreditsDialog,
         headerScrollThreshold,
         headerFixed: Boolean(headerFixed),
         headerType: headerType,
         navLinks,
      }),
      [
         handleOpenCreditsDialog,
         headerScrollThreshold,
         isPortalPage,
         navLinks,
         headerFixed,
         headerType,
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
               drawerOpen={!isMobile}
               dropdownNav={isMobile ? <DropdownNavigator /> : null}
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
