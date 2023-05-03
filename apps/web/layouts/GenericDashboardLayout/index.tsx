import NavBar from "./NavBar"
import AdminGenericLayout from "../AdminGenericLayout"
import TopBar from "./TopBar"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import GenericNavList from "./GenericNavList"
import { createContext, useContext, useMemo } from "react"
import FooterV2 from "../../components/views/footer/FooterV2"
import CreditsDialog from "../../components/views/credits-dialog/CreditsDialog"
import useDialogStateHandler from "../../components/custom-hook/useDialogStateHandler"

type IGenericDashboardContext = {
   isPortalPage: boolean
   handleOpenCreditsDialog: () => void
   topBarFixed: boolean
   // The number of pixels the user has to scroll before the header is hidden. Default is 10
   headerScrollThreshold: number
}

const GenericDashboardContext = createContext<IGenericDashboardContext>({
   isPortalPage: false,
   handleOpenCreditsDialog: () => {},
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

   const [
      creditsDialogOpen,
      handleOpenCreditsDialog,
      handleCloseCreditsDialog,
   ] = useDialogStateHandler()

   // TODO: Needs to be updated after the new banner.
   //  Banner will be prominent on the Portal page so no need to validate if there's any recordings
   const value = useMemo<IGenericDashboardContext>(
      () => ({
         isPortalPage,
         handleOpenCreditsDialog,
         headerScrollThreshold,
         topBarFixed: Boolean(topBarFixed),
      }),
      [
         handleOpenCreditsDialog,
         headerScrollThreshold,
         isPortalPage,
         topBarFixed,
      ]
   )

   return (
      <GenericDashboardContext.Provider value={value}>
         <AdminGenericLayout
            bgColor={bgColor || "#F7F8FC"}
            headerContent={
               <TopBar
                  handleOpenCreditsDialog={handleOpenCreditsDialog}
                  title={pageDisplayName}
               />
            }
            drawerContent={<NavBar />}
            bottomNavContent={<GenericNavList />}
            drawerOpen={!isMobile}
         >
            {children}
            <FooterV2 background={bgColor || "#F7F8FC"} />
            <CreditsDialog
               onClose={handleCloseCreditsDialog}
               open={creditsDialogOpen}
            />
         </AdminGenericLayout>
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
