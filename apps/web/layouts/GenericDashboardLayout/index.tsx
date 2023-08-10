import NavBar from "./NavBar"
import AdminGenericLayout from "../AdminGenericLayout"
import TopBar from "./TopBar"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import GenericNavList from "./GenericNavList"
import { createContext, useContext, useMemo } from "react"
import Footer from "../../components/views/footer/Footer"
import CreditsDialogLayout from "../CreditsDialogLayout"
import DropdownNavigator from "./DropdownNavigator"
import { INavLink } from "../types"
import {
   Home as HomeIcon,
   Radio as LiveStreamsIcon,
   PlayCircle as SparksIcon,
} from "react-feather"
import ClockIcon from "@mui/icons-material/AccessTime"
import DomainIcon from "@mui/icons-material/Domain"
import { useAuth } from "../../HOCs/AuthProvider"
import useDialogStateHandler from "../../components/custom-hook/useDialogStateHandler"
import CreditsDialog from "../../components/views/credits-dialog/CreditsDialog"

type IGenericDashboardContext = {
   isPortalPage: boolean
   handleOpenCreditsDialog: () => void
   topBarFixed: boolean
   // The number of pixels the user has to scroll before the header is hidden. Default is 10
   headerScrollThreshold: number
   navLinks: INavLink[]
}

const GenericDashboardContext = createContext<IGenericDashboardContext>({
   isPortalPage: false,
   handleOpenCreditsDialog: () => {},
   topBarFixed: false,
   headerScrollThreshold: 10,
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
const UnlockedContentPath: INavLink = {
   id: "unlocked-content",
   href: `/past-livestreams/unlocked-content`,
   pathname: `/past-livestreams/unlocked-content/[[...livestreamDialog]]`,
   title: "Unlocked content",
}

const PastLivestreamsPath: INavLink = {
   id: "all-past-live-streams",
   href: `/past-livestreams`,
   pathname: `/past-livestreams/[[...livestreamDialog]]`,
   title: "All past streams",
}

type Props = {
   children: JSX.Element
   pageDisplayName: string
   bgColor?: string
   isPortalPage?: boolean
   topBarFixed?: boolean
   // The number of pixels the user has to scroll before the header is hidden
   headerScrollThreshold?: number
}

const GenericDashboardLayout = ({
   children,
   pageDisplayName,
   bgColor,
   isPortalPage,
   topBarFixed,
   headerScrollThreshold = 10,
}: Props) => {
   const isMobile = useIsMobile()
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
            childLinks: [
               PastLivestreamsPath,
               ...(isLoggedIn ? [UnlockedContentPath] : []),
            ],
         },
         {
            id: "sparks",
            href: `/sparks`,
            pathname: `/sparks`,
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
      ]

      return links
   }, [isLoggedIn])

   const value = useMemo<IGenericDashboardContext>(
      () => ({
         isPortalPage,
         handleOpenCreditsDialog,
         headerScrollThreshold,
         topBarFixed: Boolean(topBarFixed),
         navLinks,
      }),
      [
         handleOpenCreditsDialog,
         headerScrollThreshold,
         isPortalPage,
         navLinks,
         topBarFixed,
      ]
   )

   return (
      <GenericDashboardContext.Provider value={value}>
         <CreditsDialogLayout>
            <AdminGenericLayout
               bgColor={bgColor || "#F7F8FC"}
               headerContent={<TopBar title={pageDisplayName} />}
               drawerContent={<NavBar />}
               bottomNavContent={<GenericNavList />}
               drawerOpen={!isMobile}
               dropdownNav={isMobile ? <DropdownNavigator /> : null}
            >
               {children}
               <Footer background={bgColor || "#F7F8FC"} />
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
