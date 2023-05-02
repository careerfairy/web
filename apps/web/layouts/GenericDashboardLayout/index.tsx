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
   isOverPortalBanner: boolean
   isPortalPage: boolean
   hasRecordings: boolean
   handleOpenCreditsDialog: () => void
}

const GenericDashboardContext = createContext<IGenericDashboardContext>({
   isOverPortalBanner: false,
   isPortalPage: false,
   hasRecordings: false,
   handleOpenCreditsDialog: () => {},
})

type Props = {
   children: JSX.Element
   pageDisplayName: string
   bgColor?: string
   hasRecordings?: boolean
   isPortalPage?: boolean
   isOverPortalBanner?: boolean
}

const GenericDashboardLayout = ({
   children,
   pageDisplayName,
   bgColor,
   hasRecordings,
   isPortalPage,
   isOverPortalBanner,
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
         isOverPortalBanner,
         isPortalPage,
         hasRecordings,
         handleOpenCreditsDialog,
      }),
      [handleOpenCreditsDialog, hasRecordings, isOverPortalBanner, isPortalPage]
   )

   return (
      <GenericDashboardContext.Provider value={value}>
         <AdminGenericLayout
            bgColor={bgColor || "#F7F8FC"}
            headerContent={<TopBar title={pageDisplayName} />}
            drawerContent={<NavBar />}
            bottomNavContent={<GenericNavList />}
            drawerOpen={!isMobile}
         >
            {children}
            <FooterV2 background={bgColor || "#F7F8FC"} />
            {creditsDialogOpen ? (
               <CreditsDialog
                  onClose={handleCloseCreditsDialog}
                  open={creditsDialogOpen}
               />
            ) : null}
         </AdminGenericLayout>
      </GenericDashboardContext.Provider>
   )
}

export const useGenericDashboard = () => useContext(GenericDashboardContext)

export default GenericDashboardLayout
