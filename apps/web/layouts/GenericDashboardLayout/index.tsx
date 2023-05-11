import NavBar from "./NavBar"
import AdminGenericLayout from "../AdminGenericLayout"
import TopBar from "./TopBar"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import GenericNavList from "./GenericNavList"
import { createContext, useContext, useMemo } from "react"
import FooterV2 from "../../components/views/footer/FooterV2"
import CreditsDialogLayout from "../CreditsDialogLayout"

type IGenericDashboardContext = {
   isPortalPage: boolean
   topBarFixed: boolean
   // The number of pixels the user has to scroll before the header is hidden. Default is 10
   headerScrollThreshold: number
}

const GenericDashboardContext = createContext<IGenericDashboardContext>({
   isPortalPage: false,
   topBarFixed: false,
   headerScrollThreshold: 10,
})

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

   // TODO: Needs to be updated after the new banner.
   //  Banner will be prominent on the Portal page so no need to validate if there's any recordings
   const value = useMemo<IGenericDashboardContext>(
      () => ({
         isPortalPage,
         headerScrollThreshold,
         topBarFixed: Boolean(topBarFixed),
      }),
      [headerScrollThreshold, isPortalPage, topBarFixed]
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
            >
               {children}
               <FooterV2 background={bgColor || "#F7F8FC"} />
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
